import type { BlazeFaceModel, NormalizedFace } from '@tensorflow-models/blazeface';
import { FaceBox, Landmarks, Pt } from '../domain/models';
import { faceWeight, pickPrimaryFace } from '../domain/crop';
import { DetectRequest, VisionRequest, VisionResponse, WorkerScope } from './protocol';

const scope = self as unknown as WorkerScope;

const IOU_MERGE = 0.35;
const TILE_SPAN = 0.6;
const TILE_STEP = 0.4;

interface Found {
  box: FaceBox;
  marks: Landmarks | null;
}

let model: BlazeFaceModel | null = null;
let loading: Promise<BlazeFaceModel | null> | null = null;
let backend = 'none';

function reply(message: VisionResponse): void {
  scope.postMessage(message);
}

async function initModel(): Promise<BlazeFaceModel | null> {
  if (model) return model;
  if (loading) return loading;

  loading = (async () => {
    try {
      const tf = await import('@tensorflow/tfjs-core');
      await import('@tensorflow/tfjs-converter');
      const wasm = await import('@tensorflow/tfjs-backend-wasm');
      wasm.setWasmPaths(new URL('wasm/', self.location.href).toString());
      await tf.setBackend('wasm');
      await tf.ready();
      backend = tf.getBackend();

      const blazeface = await import('@tensorflow-models/blazeface');
      model = await blazeface.load({ maxFaces: 12, scoreThreshold: 0.5 });
      return model;
    } catch {
      backend = 'unavailable';
      return null;
    }
  })();

  return loading;
}

function toPt(value: unknown): Pt {
  const pair = value as number[];
  return { x: pair[0], y: pair[1] };
}

function toLandmarks(face: NormalizedFace): Landmarks | null {
  const raw = face.landmarks as number[][] | undefined;
  if (!raw || raw.length < 6) return null;
  return {
    rightEye: toPt(raw[0]),
    leftEye: toPt(raw[1]),
    nose: toPt(raw[2]),
    mouth: toPt(raw[3]),
    rightEar: toPt(raw[4]),
    leftEar: toPt(raw[5]),
  };
}

function toBox(face: NormalizedFace): FaceBox {
  const start = face.topLeft as number[];
  const end = face.bottomRight as number[];
  const probability = Array.isArray(face.probability)
    ? (face.probability as number[])[0]
    : ((face.probability as unknown as number) ?? 0.9);
  return {
    x: start[0],
    y: start[1],
    w: Math.max(1, end[0] - start[0]),
    h: Math.max(1, end[1] - start[1]),
    score: probability,
  };
}

function shift(marks: Landmarks | null, dx: number, dy: number): Landmarks | null {
  if (!marks) return null;
  const move = (p: Pt): Pt => ({ x: p.x + dx, y: p.y + dy });
  return {
    rightEye: move(marks.rightEye),
    leftEye: move(marks.leftEye),
    nose: move(marks.nose),
    mouth: move(marks.mouth),
    rightEar: move(marks.rightEar),
    leftEar: move(marks.leftEar),
  };
}

function intersectionOverUnion(a: FaceBox, b: FaceBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const overlap = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (overlap <= 0) return 0;
  return overlap / (a.w * a.h + b.w * b.h - overlap);
}

function dedupe(found: Found[]): Found[] {
  const kept: Found[] = [];
  for (const candidate of [...found].sort((p, q) => faceWeight(q.box) - faceWeight(p.box))) {
    if (kept.some((k) => intersectionOverUnion(k.box, candidate.box) > IOU_MERGE)) continue;
    kept.push(candidate);
  }
  return kept;
}

async function runTile(
  net: BlazeFaceModel,
  bitmap: ImageBitmap,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): Promise<Found[]> {
  const width = Math.max(1, Math.round(sw));
  const height = Math.max(1, Math.round(sh));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);

  const raw = await net.estimateFaces(canvas as unknown as HTMLCanvasElement, false);
  return raw.map((face) => {
    const box = toBox(face);
    return {
      box: { ...box, x: box.x + sx, y: box.y + sy },
      marks: shift(toLandmarks(face), sx, sy),
    };
  });
}

function tilesFor(width: number, height: number): [number, number, number, number][] {
  const tw = width * TILE_SPAN;
  const th = height * TILE_SPAN;
  const dx = width * TILE_STEP;
  const dy = height * TILE_STEP;
  return [
    [0, 0, tw, height],
    [dx, 0, tw, height],
    [0, 0, width, th],
    [0, dy, width, th],
  ];
}

async function detect(request: DetectRequest): Promise<void> {
  const bitmap = request.bitmap;
  try {
    const net = await initModel();
    if (!net) {
      reply({
        kind: 'detected',
        id: request.id,
        faces: [],
        landmarks: [],
        chosen: -1,
        ambiguous: false,
        degraded: true,
      });
      return;
    }

    let found = await runTile(net, bitmap, 0, 0, bitmap.width, bitmap.height);

    if (found.length < 2) {
      for (const [sx, sy, sw, sh] of tilesFor(bitmap.width, bitmap.height)) {
        found = found.concat(await runTile(net, bitmap, sx, sy, sw, sh));
      }
    }

    const ordered = dedupe(found).sort((a, b) => a.box.x - b.box.x);
    const boxes = ordered.map((entry) => entry.box);
    const picked = pickPrimaryFace(boxes);

    reply({
      kind: 'detected',
      id: request.id,
      faces: boxes,
      landmarks: ordered.map((entry) => entry.marks),
      chosen: picked.index,
      ambiguous: picked.ambiguous,
      degraded: false,
    });
  } catch (error) {
    reply({
      kind: 'error',
      id: request.id,
      message: error instanceof Error ? error.message : 'detection failed',
    });
  } finally {
    bitmap.close();
  }
}

scope.addEventListener('message', (event: MessageEvent) => {
  const request = event.data as VisionRequest;
  if (request.kind === 'warm') {
    void initModel().then(() => reply({ kind: 'ready', id: request.id, backend }));
    return;
  }
  if (request.kind === 'detect') {
    void detect(request);
  }
});

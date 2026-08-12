import type { BlazeFaceModel, NormalizedFace } from '@tensorflow-models/blazeface';
import { FaceBox, Landmarks, Pt } from '../domain/models';
import { pickPrimaryFace } from '../domain/crop';
import { DetectRequest, VisionRequest, VisionResponse, WorkerScope } from './protocol';

const scope = self as unknown as WorkerScope;

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
      model = await blazeface.load({ maxFaces: 6 });
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

async function detect(request: DetectRequest): Promise<void> {
  const bitmap = request.bitmap;
  try {
    const net = await initModel();
    if (!net) {
      reply({
        kind: 'detected',
        id: request.id,
        face: null,
        landmarks: null,
        candidates: 0,
        ambiguous: false,
        degraded: true,
      });
      return;
    }

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context in worker');
    ctx.drawImage(bitmap, 0, 0);

    const faces = await net.estimateFaces(canvas as unknown as HTMLCanvasElement, false);
    const boxes = faces.map(toBox);
    const chosen = pickPrimaryFace(boxes);
    const index = chosen.face ? boxes.indexOf(chosen.face) : -1;

    reply({
      kind: 'detected',
      id: request.id,
      face: chosen.face,
      landmarks: index >= 0 ? toLandmarks(faces[index]) : null,
      candidates: boxes.length,
      ambiguous: chosen.ambiguous,
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

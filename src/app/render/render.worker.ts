import { CHAIN } from './painters';
import { PaintMessage, RenderRequest, RenderResponse } from './protocol';
import { WorkerScope } from '../vision/protocol';

const scope = self as unknown as WorkerScope;

const bitmaps = new Map<number, ImageBitmap>();
let fontsReady = false;
let canvas: OffscreenCanvas | null = null;

function reply(message: RenderResponse, transfer?: Transferable[]): void {
  scope.postMessage(message, transfer);
}

function surface(width: number, height: number): OffscreenCanvas {
  if (!canvas || canvas.width !== width || canvas.height !== height) {
    canvas = new OffscreenCanvas(width, height);
  }
  return canvas;
}

async function registerFonts(payloads: RenderRequest & { kind: 'fonts' }): Promise<void> {
  const registry = scope.fonts;
  if (!registry) {
    reply({ kind: 'ack', id: payloads.id, fontsReady: false });
    return;
  }
  let ok = 0;
  for (const payload of payloads.fonts) {
    try {
      const face = new FontFace(payload.family, payload.data, {
        weight: payload.weight,
        unicodeRange: payload.range,
      });
      await face.load();
      registry.add(face);
      ok++;
    } catch {
      continue;
    }
  }
  fontsReady = ok > 0;
  reply({ kind: 'ack', id: payloads.id, fontsReady });
}

async function paint(message: PaintMessage): Promise<void> {
  const started = performance.now();
  try {
    const { spec, scale } = message;
    const target = surface(Math.round(spec.width * scale), Math.round(spec.height * scale));
    const ctx = target.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('no offscreen 2d context');

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    const input = { ctx, spec, bitmaps };
    for (const painter of CHAIN) {
      ctx.save();
      painter(input);
      ctx.restore();
    }
    ctx.restore();

    const blob = message.wantBlob
      ? await target.convertToBlob({ type: 'image/png' })
      : null;
    const preview = target.transferToImageBitmap();

    reply(
      { kind: 'painted', id: message.id, preview, blob, ms: performance.now() - started },
      [preview],
    );
  } catch (error) {
    reply({
      kind: 'error',
      id: message.id,
      message: error instanceof Error ? error.message : 'render failed',
    });
  }
}

scope.addEventListener('message', (event: MessageEvent) => {
  const request = event.data as RenderRequest;

  if (request.kind === 'fonts') {
    void registerFonts(request);
    return;
  }

  if (request.kind === 'upload') {
    const existing = bitmaps.get(request.slot);
    if (existing) existing.close();
    if (request.bitmap) {
      bitmaps.set(request.slot, request.bitmap);
    } else {
      bitmaps.delete(request.slot);
    }
    reply({ kind: 'ack', id: request.id, fontsReady });
    return;
  }

  if (request.kind === 'paint') {
    void paint(request);
  }
});

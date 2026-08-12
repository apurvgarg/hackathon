const MAX_EDGE = 2048;
const HEIC_PATTERN = /\.(heic|heif)$/i;
const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence'];

export interface DecodedSource {
  blob: Blob;
  width: number;
  height: number;
}

export function isHeic(file: File): boolean {
  return HEIC_PATTERN.test(file.name) || HEIC_TYPES.includes(file.type.toLowerCase());
}

async function convertHeic(file: File): Promise<Blob> {
  const mod = await import('heic2any');
  const convert = (mod as unknown as { default: (o: unknown) => Promise<Blob | Blob[]> }).default;
  const out = await convert({ blob: file, toType: 'image/jpeg', quality: 0.94 });
  return Array.isArray(out) ? out[0] : out;
}

async function toCanvasBlob(bitmap: ImageBitmap, w: number, h: number): Promise<Blob> {
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
}

export async function prepareSource(file: File): Promise<DecodedSource> {
  if (!file.type.startsWith('image/') && !isHeic(file)) {
    throw new Error('That is not an image file');
  }
  if (file.size > 40 * 1024 * 1024) {
    throw new Error('Image is over 40MB');
  }

  let blob: Blob = isHeic(file) ? await convertHeic(file) : file;
  let bitmap = await createImageBitmap(blob);
  let { width, height } = bitmap;

  const longest = Math.max(width, height);
  if (longest > MAX_EDGE) {
    const k = MAX_EDGE / longest;
    const w = Math.round(width * k);
    const h = Math.round(height * k);
    const shrunk = await toCanvasBlob(bitmap, w, h);
    bitmap.close();
    blob = shrunk;
    bitmap = await createImageBitmap(blob);
    width = bitmap.width;
    height = bitmap.height;
  }

  bitmap.close();
  return { blob, width, height };
}

export function bitmapFrom(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}

import { base36, fnv1a } from '../core/hash';
import { mulberry32 } from '../core/prng';

export const QR_TARGET = 'https://hhgoa.com';

export function serialFor(seed: number, crew: number): string {
  return `HH-GOA-${crew}${base36(fnv1a('serial' + seed), 4)}`;
}

export function barcodeBars(seed: number, count = 58): number[] {
  const rand = mulberry32((seed ^ 0xb17c0de) >>> 0);
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    bars.push(r < 0.34 ? 1 : r < 0.7 ? 2 : 3);
  }
  return bars;
}

export function qrMatrix(payload: string): boolean[][] {
  try {
    const factory = (globalThis as unknown as { __qrcode?: QrFactory }).__qrcode;
    if (!factory) return [];
    const qr = factory(0, 'M');
    qr.addData(payload);
    qr.make();
    const n = qr.getModuleCount();
    const grid: boolean[][] = [];
    for (let r = 0; r < n; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < n; c++) row.push(qr.isDark(r, c));
      grid.push(row);
    }
    return grid;
  } catch {
    return [];
  }
}

export interface QrInstance {
  addData(data: string): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

export type QrFactory = (type: number, ec: string) => QrInstance;

export async function loadQrFactory(): Promise<QrFactory | null> {
  const scope = globalThis as unknown as { __qrcode?: QrFactory };
  if (scope.__qrcode) return scope.__qrcode;
  try {
    const mod = await import('qrcode-generator');
    const factory = ((mod as unknown as { default?: QrFactory }).default ??
      (mod as unknown as QrFactory)) as QrFactory;
    scope.__qrcode = factory;
    return factory;
  } catch {
    return null;
  }
}

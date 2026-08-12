export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function rad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function round(v: number, places = 2): number {
  const f = Math.pow(10, places);
  return Math.round(v * f) / f;
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, 22);
}

export function displayName(value: string, fallback: string): string {
  const n = normalizeName(value);
  return n.length ? n.toUpperCase() : fallback;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

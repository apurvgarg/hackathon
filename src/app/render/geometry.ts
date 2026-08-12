import { mulberry32 } from '../core/prng';
import { Pt } from '../domain/models';

export type Ctx = OffscreenCanvasRenderingContext2D;

export function blobPath(radius: number, seed: number, points = 13, wobble = 0.055): Path2D {
  const rand = mulberry32((seed ^ 0xb10b) >>> 0);
  const pts: Pt[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radius * (1 - wobble + rand() * wobble * 2);
    pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  return closedSpline(pts);
}

export function closedSpline(pts: Pt[]): Path2D {
  const path = new Path2D();
  const n = pts.length;
  if (n < 3) return path;
  path.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    path.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    );
  }
  path.closePath();
  return path;
}

export function roundedPath(x: number, y: number, w: number, h: number, r: number): Path2D {
  const path = new Path2D();
  const radius = Math.min(r, w / 2, h / 2);
  path.moveTo(x + radius, y);
  path.lineTo(x + w - radius, y);
  path.quadraticCurveTo(x + w, y, x + w, y + radius);
  path.lineTo(x + w, y + h - radius);
  path.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  path.lineTo(x + radius, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  path.closePath();
  return path;
}

export function strokeDashed(
  ctx: Ctx,
  path: Path2D,
  color: string,
  width: number,
  dash: number[],
  offset = 0,
): void {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.lineDashOffset = offset;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke(path);
  ctx.restore();
}

export function crossMark(ctx: Ctx, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function perforatedTop(
  x: number,
  y: number,
  w: number,
  h: number,
  notch: number,
  step: number,
): Path2D {
  const path = new Path2D();
  path.moveTo(x, y);
  let cursor = x;
  while (cursor < x + w) {
    const next = Math.min(cursor + step, x + w);
    const mid = (cursor + next) / 2;
    path.lineTo(mid - notch, y);
    path.arc(mid, y, notch, Math.PI, 0, true);
    cursor = next;
  }
  path.lineTo(x + w, y);
  path.lineTo(x + w, y + h);
  path.lineTo(x, y + h);
  path.closePath();
  return path;
}

export function palmPath(scale: number): Path2D {
  const path = new Path2D();
  path.moveTo(0, 0);
  path.quadraticCurveTo(-2 * scale, -8 * scale, -1 * scale, -17 * scale);
  for (let i = 0; i < 5; i++) {
    const spread = (i - 2) * 0.42;
    const tipX = Math.sin(spread) * 13 * scale;
    const tipY = -17 * scale - Math.cos(spread) * 10 * scale;
    path.moveTo(-1 * scale, -17 * scale);
    path.quadraticCurveTo(tipX * 0.55, tipY - 3 * scale, tipX, tipY);
    path.quadraticCurveTo(tipX * 0.5, tipY + 3.4 * scale, -1 * scale, -17 * scale);
  }
  return path;
}

export function sunPath(radius: number, rays: number, rayLength: number): Path2D {
  const path = new Path2D();
  path.arc(0, 0, radius, 0, Math.PI * 2);
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    path.moveTo(Math.cos(a) * (radius + radius * 0.22), Math.sin(a) * (radius + radius * 0.22));
    path.lineTo(
      Math.cos(a) * (radius + rayLength),
      Math.sin(a) * (radius + rayLength),
    );
  }
  return path;
}

export function wavePath(width: number, amplitude: number, cycles: number): Path2D {
  const path = new Path2D();
  const step = width / (cycles * 2);
  path.moveTo(0, 0);
  for (let i = 0; i < cycles * 2; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    path.quadraticCurveTo(step * i + step / 2, dir * amplitude, step * (i + 1), 0);
  }
  return path;
}

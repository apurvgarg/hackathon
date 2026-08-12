import { FONTS } from '../domain/palette';
import { Ctx } from './geometry';

export type Family = 'display' | 'mono' | 'deva';

const STACK: Record<Family, string> = {
  display: `"${FONTS.display}", "Times New Roman", serif`,
  mono: `"${FONTS.mono}", ui-monospace, monospace`,
  deva: `"${FONTS.deva}", "Noto Sans Devanagari", sans-serif`,
};

export function font(ctx: Ctx, family: Family, size: number, weight = 400): void {
  ctx.font = `${weight} ${size}px ${STACK[family]}`;
}

export function measureTracked(ctx: Ctx, text: string, spacing: number): number {
  if (!text.length) return 0;
  let width = 0;
  for (const ch of text) width += ctx.measureText(ch).width + spacing;
  return width - spacing;
}

export function drawTracked(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: 'left' | 'center' | 'right' = 'left',
): number {
  const total = measureTracked(ctx, text, spacing);
  let cursor = align === 'left' ? x : align === 'center' ? x - total / 2 : x - total;
  const baseAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = baseAlign;
  return total;
}

export function fitFont(
  ctx: Ctx,
  text: string,
  maxWidth: number,
  family: Family,
  weight: number,
  start: number,
  min: number,
  spacing = 0,
): number {
  let size = start;
  while (size > min) {
    font(ctx, family, size, weight);
    const width = spacing ? measureTracked(ctx, text, spacing) : ctx.measureText(text).width;
    if (width <= maxWidth) break;
    size -= 1;
  }
  font(ctx, family, size, weight);
  return size;
}

export function wrapTracked(
  ctx: Ctx,
  text: string,
  maxWidth: number,
  spacing: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (measureTracked(ctx, next, spacing) <= maxWidth || !current) {
      current = next;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (measureTracked(ctx, last, spacing) > maxWidth) {
      lines[maxLines - 1] = truncate(ctx, last, maxWidth);
    }
  }
  return lines;
}

export function truncate(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(out + '…').width > maxWidth) {
    out = out.slice(0, -1);
  }
  return out + '…';
}

export function arcText(
  ctx: Ctx,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  centerAngle: number,
  spread: number,
  flip = false,
): void {
  const chars = [...text];
  if (!chars.length) return;
  const step = spread / Math.max(1, chars.length - 1);
  const start = centerAngle - spread / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  chars.forEach((ch, i) => {
    const angle = start + step * i;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.rotate(angle + (flip ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

export function outlinedText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  fill: string,
  stroke: string,
  strokeWidth: number,
): void {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

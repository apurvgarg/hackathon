import { PALETTE } from '../../domain/palette';
import { Ctx } from '../geometry';
import { font } from '../text';
import { PaintInput } from './types';

const TAU = Math.PI * 2;
let tile: OffscreenCanvas | null = null;

function halftoneTile(): OffscreenCanvas {
  if (tile) return tile;
  const size = 6;
  const canvas = new OffscreenCanvas(size, size);
  const g = canvas.getContext('2d');
  if (g) {
    g.fillStyle = PALETTE.green;
    g.beginPath();
    g.arc(1.5, 1.5, 0.82, 0, TAU);
    g.fill();
    g.beginPath();
    g.arc(4.5, 4.5, 0.82, 0, TAU);
    g.fill();
  }
  tile = canvas;
  return canvas;
}

function grid(ctx: Ctx, w: number, h: number): void {
  ctx.save();
  ctx.strokeStyle = PALETTE.green;
  ctx.globalAlpha = 0.055;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 26) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = 0; y <= h; y += 26) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

function watermark(ctx: Ctx): void {
  ctx.save();
  ctx.translate(886, 344);
  ctx.rotate((-11 * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  font(ctx, 'deva', 400, 800);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = PALETTE.creamShade;
  ctx.fillText('गोवा', 0, 0);
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.green;
  ctx.globalAlpha = 0.07;
  ctx.strokeText('गोवा', 0, 0);
  ctx.restore();
}

function bleedGlow(ctx: Ctx, w: number, h: number): void {
  const glow = ctx.createRadialGradient(w * 0.72, h * 0.28, 40, w * 0.72, h * 0.28, w * 0.62);
  glow.addColorStop(0, '#FFF7C733');
  glow.addColorStop(1, '#FFF7C700');
  ctx.save();
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function paintPaper({ ctx, spec }: PaintInput): void {
  const { width: w, height: h } = spec;

  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(0, 0, w, h);

  bleedGlow(ctx, w, h);
  grid(ctx, w, h);
  watermark(ctx);

  const pattern = ctx.createPattern(halftoneTile(), 'repeat');
  if (pattern) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

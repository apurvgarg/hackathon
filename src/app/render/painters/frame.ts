import { PALETTE } from '../../domain/palette';
import { crossMark, Ctx, roundedPath, strokeDashed } from '../geometry';
import { drawTracked, font } from '../text';
import { REGION } from '../regions';
import { PaintInput } from './types';

let strip: OffscreenCanvas | null = null;

function stripTile(): OffscreenCanvas {
  if (strip) return strip;
  const unit = 26;
  const height = REGION.strip;
  const canvas = new OffscreenCanvas(unit, height);
  const g = canvas.getContext('2d');
  if (g) {
    g.fillStyle = PALETTE.yellow;
    g.fillRect(0, 0, unit, height);

    g.fillStyle = PALETTE.green;
    g.beginPath();
    g.moveTo(0, height);
    g.lineTo(unit / 2, 1);
    g.lineTo(unit, height);
    g.closePath();
    g.fill();

    g.fillStyle = PALETTE.pink;
    g.beginPath();
    g.moveTo(unit / 2, height * 0.34);
    g.lineTo(unit * 0.74, height * 0.62);
    g.lineTo(unit / 2, height * 0.9);
    g.lineTo(unit * 0.26, height * 0.62);
    g.closePath();
    g.fill();
  }
  strip = canvas;
  return canvas;
}

function truckArtBand(ctx: Ctx, y: number, w: number, flip: boolean): void {
  const pattern = ctx.createPattern(stripTile(), 'repeat-x');
  if (!pattern) return;
  ctx.save();
  ctx.translate(0, y);
  if (flip) {
    ctx.translate(0, REGION.strip);
    ctx.scale(1, -1);
  }
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, REGION.strip);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = PALETTE.green;
  ctx.fillRect(0, flip ? y - 2 : y + REGION.strip, w, 2);
  ctx.restore();
}

export function paintFrame({ ctx, spec }: PaintInput): void {
  const { width: w, height: h } = spec;
  const t = REGION.trim;

  truckArtBand(ctx, 0, w, false);
  truckArtBand(ctx, h - REGION.strip, w, true);

  const trim = roundedPath(t, t + REGION.strip, w - t * 2, h - t * 2 - REGION.strip * 2, 10);
  strokeDashed(ctx, trim, PALETTE.graphite, 1.2, [9, 7]);

  const corners: [number, number][] = [
    [t + 12, t + REGION.strip + 12],
    [w - t - 12, t + REGION.strip + 12],
    [t + 12, h - t - REGION.strip - 12],
    [w - t - 12, h - t - REGION.strip - 12],
  ];
  for (const [x, y] of corners) crossMark(ctx, x, y, 7, PALETTE.graphite);

  ctx.save();
  ctx.fillStyle = PALETTE.graphite;
  font(ctx, 'mono', 10, 400);
  ctx.textBaseline = 'middle';
  ctx.translate(t + 14, h * 0.44);
  ctx.rotate(-Math.PI / 2);
  drawTracked(ctx, 'DIE CUT · GLOSS LAMINATE', 0, 0, 1.6, 'center');
  ctx.restore();

  ctx.save();
  ctx.fillStyle = PALETTE.graphite;
  font(ctx, 'mono', 10, 400);
  ctx.textBaseline = 'middle';
  ctx.translate(w - t - 14, h * 0.34);
  ctx.rotate(Math.PI / 2);
  drawTracked(ctx, `SEED ${spec.seed.toString(16).toUpperCase().slice(0, 6)}`, 0, 0, 1.6, 'center');
  ctx.restore();
}

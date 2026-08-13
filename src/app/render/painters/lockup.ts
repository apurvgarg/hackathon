import { PALETTE } from '../../domain/palette';
import { Ctx, palmPath, roundedPath, sunPath } from '../geometry';
import { arcText, drawTracked, font, outlinedText } from '../text';
import { REGION } from '../regions';
import { PaintInput } from './types';

function goaSticker(ctx: Ctx, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-9 * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  font(ctx, 'deva', size, 800);

  const w = ctx.measureText('गोवा').width;
  const pad = size * 0.2;
  const plate = roundedPath(-w / 2 - pad, -size * 0.86, w + pad * 2, size * 1.1, size * 0.28);

  ctx.shadowColor = '#00000026';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = PALETTE.white;
  ctx.fill(plate);
  ctx.shadowColor = 'transparent';

  ctx.lineWidth = size * 0.09;
  ctx.strokeStyle = PALETTE.pink;
  ctx.stroke(plate);

  ctx.fillStyle = PALETTE.pink;
  ctx.fillText('गोवा', 0, 0);
  ctx.restore();
}

function seal(ctx: Ctx, stamp: string): void {
  const { x, y, r } = REGION.seal;
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PALETTE.green;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, r - 6.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = PALETTE.green;
  font(ctx, 'mono', 9.6, 700);
  arcText(ctx, 'BUILT IN GOA', 0, 0, r - 15, -Math.PI / 2, 1.9);
  font(ctx, 'mono', 8.4, 400);
  arcText(ctx, stamp, 0, 0, r - 14.5, Math.PI / 2, 1.7, true);

  ctx.save();
  ctx.strokeStyle = PALETTE.yellowDeep;
  ctx.fillStyle = PALETTE.yellow;
  ctx.lineWidth = 1.6;
  ctx.translate(0, -3);
  const sun = sunPath(7.5, 9, 5);
  ctx.fill(sun);
  ctx.stroke(sun);
  ctx.restore();

  ctx.save();
  ctx.translate(0, 20);
  ctx.strokeStyle = PALETTE.green;
  ctx.lineWidth = 1.5;
  ctx.stroke(palmPath(0.62));
  ctx.restore();

  ctx.restore();
}

export function paintLockup({ ctx, spec }: PaintInput): void {
  const g = REGION.gutter;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PALETTE.green;
  font(ctx, 'mono', 12, 700);
  drawTracked(ctx, '2:47 PM STUDIO / SQUAD SHEET', g, REGION.metaY, 2);

  font(ctx, 'display', 66, 600);
  outlinedText(ctx, 'HACKER HOUSE', g, REGION.lockupY, PALETTE.green, PALETTE.greenDeep, 0);
  const width = ctx.measureText('HACKER HOUSE').width;
  goaSticker(ctx, g + width + 48, REGION.lockupY - 9, 33);

  ctx.strokeStyle = PALETTE.green;
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(g, REGION.ruleY);
  ctx.lineTo(g + REGION.leftWidth, REGION.ruleY);
  ctx.stroke();
  ctx.globalAlpha = 1;

  font(ctx, 'mono', 11.5, 700);
  ctx.fillStyle = PALETTE.pinkDeep;
  drawTracked(ctx, `GOA, INDIA · ${spec.stamp}`, g, REGION.ruleY - 13, 1.8);
  ctx.restore();

  seal(ctx, spec.stamp);
}

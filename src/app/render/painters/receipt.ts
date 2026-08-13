import { PALETTE } from '../../domain/palette';
import { Ctx, roundedPath } from '../geometry';
import { drawTracked, font } from '../text';
import { REGION } from '../regions';
import { PaintInput } from './types';

function barcode(ctx: Ctx, bars: number[], x: number, y: number, height: number, max: number): void {
  ctx.save();
  ctx.fillStyle = PALETTE.cream;
  let cursor = x;
  for (const weight of bars) {
    if (cursor - x > max) break;
    ctx.fillRect(cursor, y, weight, height);
    cursor += weight + 1.7;
  }
  ctx.restore();
}

function qr(ctx: Ctx, matrix: boolean[][], x: number, y: number, size: number): void {
  ctx.save();
  const quiet = 6;
  ctx.fillStyle = PALETTE.cream;
  ctx.fill(roundedPath(x - quiet, y - quiet, size + quiet * 2, size + quiet * 2, 7));

  if (!matrix.length) {
    ctx.fillStyle = PALETTE.green;
    font(ctx, 'mono', 10, 700);
    drawTracked(ctx, 'HHGOA', x + size / 2, y + size / 2 + 3, 1.4, 'center');
    ctx.restore();
    return;
  }

  const n = matrix.length;
  const cell = size / n;
  ctx.fillStyle = PALETTE.ink;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) ctx.fillRect(x + c * cell, y + r * cell, cell + 0.5, cell + 0.5);
    }
  }
  ctx.restore();
}

export function paintReceipt({ ctx, spec }: PaintInput): void {
  const col = REGION.cols[3];
  const top = REGION.foot.y + REGION.foot.pad + 4;
  const { serial, bars, qr: matrix, qrLabel } = spec.receipt;

  const size = 70;
  const qx = col.x + col.w - size - 4;

  ctx.save();
  ctx.fillStyle = PALETTE.yellow;
  font(ctx, 'mono', 11, 700);
  drawTracked(ctx, 'SHEET ID', col.x, top, 2.2);

  barcode(ctx, bars, col.x, top + 16, 44, qx - col.x - 26);

  ctx.fillStyle = PALETTE.cream;
  font(ctx, 'mono', 13, 700);
  drawTracked(ctx, serial, col.x, top + 82, 1.2);

  qr(ctx, matrix, qx, top + 14, size);

  ctx.fillStyle = PALETTE.cream;
  ctx.globalAlpha = 0.7;
  font(ctx, 'mono', 9.5, 400);
  drawTracked(ctx, qrLabel, qx + size / 2, top + 104, 1.2, 'center');
  ctx.restore();
}

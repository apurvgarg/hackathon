import { PALETTE } from '../../domain/palette';
import { blobPath, Ctx, roundedPath } from '../geometry';
import { drawTracked, font } from '../text';
import { PaintInput } from './types';

const RAD = Math.PI / 180;

function conic(ctx: Ctx, x: number, y: number, r: number): CanvasGradient | null {
  const maker = (
    ctx as unknown as {
      createConicGradient?: (start: number, x: number, y: number) => CanvasGradient;
    }
  ).createConicGradient;
  if (typeof maker !== 'function') return null;
  const grad = maker.call(ctx, 0.6, x, y);
  grad.addColorStop(0, '#FFFFFF00');
  grad.addColorStop(0.18, '#FFF7C9AA');
  grad.addColorStop(0.34, '#FF2D8F55');
  grad.addColorStop(0.52, '#FFFFFF00');
  grad.addColorStop(0.7, '#7CF6D144');
  grad.addColorStop(0.86, '#FEE10188');
  grad.addColorStop(1, '#FFFFFF00');
  return grad;
}

export function paintFoil({ ctx, spec }: PaintInput): void {
  if (!spec.foil) return;

  for (const place of spec.placements) {
    const person = spec.people.find((p) => p.slot === place.slot);
    if (person?.rarity !== 'GOA_TIER') continue;

    const shape = blobPath(place.r, spec.seed + place.slot * 977);
    ctx.save();
    ctx.translate(place.x, place.y);
    ctx.rotate(place.rot * RAD);
    ctx.clip(shape);
    const grad = conic(ctx, 0, 0, place.r);
    if (grad) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = grad;
      ctx.fillRect(-place.r, -place.r, place.r * 2, place.r * 2);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(514, 200);
  ctx.rotate(-7 * RAD);
  const plate = roundedPath(-52, -14, 104, 28, 14);
  ctx.shadowColor = '#00000033';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = PALETTE.yellow;
  ctx.fill(plate);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = PALETTE.pink;
  ctx.lineWidth = 2.2;
  ctx.stroke(plate);
  ctx.fillStyle = PALETTE.pinkDeep;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  font(ctx, 'mono', 10, 700);
  drawTracked(ctx, '1/1 FOIL', 0, 0.5, 2, 'center');
  ctx.restore();
}

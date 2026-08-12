import { PALETTE } from '../../domain/palette';
import { PersonSpec, Placement } from '../../domain/models';
import { blobPath, Ctx, palmPath, roundedPath, strokeDashed } from '../geometry';
import { drawTracked, font } from '../text';
import { PaintInput } from './types';

const RAD = Math.PI / 180;

function placeholder(ctx: Ctx, person: PersonSpec, r: number): void {
  const inner = blobPath(r - 12, 0x1234 + person.slot * 7, 13, 0.03);
  ctx.fillStyle = PALETTE.greenDeep;
  ctx.fill(inner);

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = PALETTE.yellow;
  ctx.lineWidth = 2;
  ctx.translate(r * 0.34, r * 0.52);
  ctx.stroke(palmPath(r * 0.048));
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  font(ctx, 'display', r * 0.82, 600);
  ctx.fillStyle = PALETTE.yellow;
  ctx.fillText(person.initials, 0, -r * 0.04);

  font(ctx, 'mono', 11.5, 700);
  ctx.fillStyle = person.loading ? PALETTE.yellow : PALETTE.cream;
  ctx.globalAlpha = person.loading ? 1 : 0.76;
  drawTracked(ctx, person.loading ? 'FINDING FACE' : 'DROP A PHOTO', 0, r * 0.46, 2, 'center');
  ctx.globalAlpha = 1;
}

function photo(ctx: Ctx, person: PersonSpec, bitmap: ImageBitmap, r: number): void {
  const crop = person.crop;
  const sx = crop?.sx ?? 0;
  const sy = crop?.sy ?? 0;
  const sw = crop?.sw ?? bitmap.width;
  const sh = crop?.sh ?? bitmap.height;

  ctx.save();
  ctx.rotate((crop?.roll ?? 0) * RAD);
  const span = r * 2.22;
  ctx.drawImage(bitmap, sx, sy, sw, sh, -span / 2, -span / 2, span, span);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = PALETTE.green;
  ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.16;
  const warm = ctx.createLinearGradient(-r, -r, r, r);
  warm.addColorStop(0, PALETTE.yellow);
  warm.addColorStop(1, PALETTE.pink);
  ctx.fillStyle = warm;
  ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
  ctx.restore();
}

function indexTab(ctx: Ctx, person: PersonSpec, r: number): void {
  const label = String(person.slot + 1).padStart(2, '0');
  ctx.save();
  ctx.translate(-r * 0.66, -r * 0.72);
  ctx.rotate(-14 * RAD);
  const plate = roundedPath(-18, -13, 36, 26, 8);
  ctx.fillStyle = PALETTE.green;
  ctx.fill(plate);
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 2.4;
  ctx.stroke(plate);
  ctx.fillStyle = PALETTE.yellow;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  font(ctx, 'mono', 13, 700);
  ctx.fillText(label, 0, 0.5);
  ctx.restore();
}

function sticker(
  ctx: Ctx,
  person: PersonSpec,
  place: Placement,
  bitmap: ImageBitmap | undefined,
  seed: number,
): void {
  const r = place.r;
  const shape = blobPath(r, seed + place.slot * 977);

  ctx.save();
  ctx.translate(place.x, place.y);
  ctx.rotate(place.rot * RAD);

  ctx.save();
  ctx.shadowColor = 'rgba(7, 59, 32, 0.34)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = PALETTE.white;
  ctx.fill(shape);
  ctx.restore();

  ctx.lineWidth = 15;
  ctx.strokeStyle = PALETTE.white;
  ctx.lineJoin = 'round';
  ctx.stroke(shape);

  ctx.save();
  ctx.clip(shape);
  if (bitmap && person.hasPhoto) {
    photo(ctx, person, bitmap, r);
  } else {
    placeholder(ctx, person, r);
  }
  ctx.restore();

  strokeDashed(ctx, shape, PALETTE.pink, 4.2, [11, 9], place.slot * 6);

  ctx.save();
  ctx.globalAlpha = 0.5;
  strokeDashed(ctx, blobPath(r + 11, seed + place.slot * 977, 13, 0.055), PALETTE.graphite, 1, [
    5, 6,
  ]);
  ctx.restore();

  indexTab(ctx, person, r);

  ctx.restore();
}

export function paintPeople({ ctx, spec, bitmaps }: PaintInput): void {
  for (const place of spec.placements) {
    const person = spec.people.find((p) => p.slot === place.slot);
    if (!person) continue;
    sticker(ctx, person, place, bitmaps.get(place.slot), spec.seed);
  }
}

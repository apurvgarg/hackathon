import { PALETTE } from '../../domain/palette';
import { STACK_PRINT_LIMIT } from '../../domain/taxonomy';
import { drawTracked, fitFont, font, measureTracked, outlinedText, truncate } from '../text';
import { REGION } from '../regions';
import { PaintInput } from './types';

const SIZE = { 1: 100, 2: 70, 3: 54 } as const;
const LEAD = { 1: 0, 2: 106, 3: 84 } as const;

export function paintNames({ ctx, spec }: PaintInput): void {
  const g = REGION.gutter;
  const max = REGION.leftWidth;
  const size = SIZE[spec.crew];
  const lead = LEAD[spec.crew];
  const top = spec.crew === 1 ? REGION.namesTop + 100 : REGION.namesTop + 56;

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  font(ctx, 'mono', 12, 700);
  ctx.fillStyle = PALETTE.green;
  drawTracked(ctx, spec.crew === 1 ? 'THE BUILDER' : 'THE CREW', g, REGION.namesTop + 6, 2.4);

  spec.people.forEach((person, index) => {
    const y = top + lead * index;

    fitFont(ctx, person.name, max, 'display', 600, size, 26);
    outlinedText(ctx, person.name, g, y, PALETTE.yellow, PALETTE.green, 5);

    font(ctx, 'mono', 12.5, 700);
    ctx.fillStyle = PALETTE.pinkDeep;
    drawTracked(ctx, truncate(ctx, person.className, max), g, y + 24, 1.4);
  });

  ctx.restore();
}

export function paintSoloSubtitle({ ctx, spec }: PaintInput): void {
  if (spec.crew !== 1) return;
  ctx.save();
  ctx.fillStyle = PALETTE.green;
  ctx.globalAlpha = 0.8;
  font(ctx, 'mono', 13.5, 400);
  ctx.fillText(spec.people[0].classSub, REGION.gutter, REGION.namesTop + 168);
  ctx.restore();
}

export function paintStackRail({ ctx, spec }: PaintInput): void {
  if (spec.crew !== 1) return;
  const stack = spec.people[0].stack;
  if (!stack.length) return;

  const shown = stack.slice(0, STACK_PRINT_LIMIT);
  const hidden = stack.length - shown.length;
  const all = hidden > 0 ? [...shown, `+${hidden}`] : shown;

  let x = REGION.gutter;
  let y = REGION.namesTop + 208;
  ctx.save();
  for (const item of all) {
    const text = item.toUpperCase();
    const extra = text.startsWith('+');
    font(ctx, 'mono', 11.5, 700);
    const w = measureTracked(ctx, text, 1.1) + 24;
    if (x + w > REGION.gutter + REGION.leftWidth) {
      x = REGION.gutter;
      y += 32;
      if (y > REGION.namesTop + 244) break;
    }
    ctx.fillStyle = extra ? PALETTE.pinkDeep : PALETTE.green;
    ctx.beginPath();
    ctx.roundRect(x, y - 16, w, 26, 13);
    ctx.fill();
    ctx.fillStyle = extra ? PALETTE.cream : PALETTE.yellow;
    drawTracked(ctx, text, x + 11, y + 2, 1.1);
    x += w + 8;
  }
  ctx.restore();
}

import { PALETTE } from '../../domain/palette';
import { CrewSynergy, SheetSpec } from '../../domain/models';
import { AXES, AXIS_LABEL, STACK_PRINT_LIMIT } from '../../domain/taxonomy';
import { gapLine } from '../../domain/synergy';
import { Ctx, perforatedTop, roundedPath } from '../geometry';
import { drawTracked, fitFont, font, measureTracked, truncate, wrapTracked } from '../text';
import { REGION } from '../regions';
import { PaintInput } from './types';

function label(ctx: Ctx, text: string, x: number, y: number): void {
  ctx.save();
  ctx.fillStyle = PALETTE.yellow;
  font(ctx, 'mono', 11, 700);
  drawTracked(ctx, text, x, y, 2.2);
  ctx.restore();
}

function chips(ctx: Ctx, items: string[], x: number, y: number, width: number): void {
  const shown = items.slice(0, STACK_PRINT_LIMIT);
  const hidden = items.length - shown.length;
  const all = hidden > 0 ? [...shown, `+${hidden} MORE`] : shown;

  let cx = x;
  let cy = y;
  ctx.save();
  for (const item of all) {
    const text = item.toUpperCase();
    const extra = text.startsWith('+');
    font(ctx, 'mono', 11, extra ? 700 : 400);
    const w = measureTracked(ctx, text, 1) + 22;
    if (cx + w > x + width) {
      cx = x;
      cy += 26;
      if (cy > y + 30) break;
    }
    const plate = roundedPath(cx, cy - 14, w, 23, 11.5);
    ctx.strokeStyle = extra ? PALETTE.pink : PALETTE.yellow;
    ctx.globalAlpha = extra ? 0.9 : 0.55;
    ctx.lineWidth = 1.2;
    ctx.stroke(plate);
    ctx.globalAlpha = 1;
    ctx.fillStyle = extra ? PALETTE.pink : PALETTE.cream;
    drawTracked(ctx, text, cx + 10, cy + 2, 1);
    cx += w + 7;
  }
  ctx.restore();
}

const AXIS_TRACK = 0.7;
const AXIS_GAP = 13;
const DOT_LEAD = 11;

function axisRow(ctx: Ctx, synergy: CrewSynergy, x: number, y: number, maxWidth: number): void {
  const total = (size: number) => {
    font(ctx, 'mono', size, 700);
    return AXES.reduce(
      (sum, axis) => sum + DOT_LEAD + measureTracked(ctx, AXIS_LABEL[axis], AXIS_TRACK) + AXIS_GAP,
      -AXIS_GAP,
    );
  };

  let size = 9;
  while (size > 7 && total(size) > maxWidth) size -= 0.25;

  let dx = x;
  for (const axis of AXES) {
    const on = synergy.coverage.includes(axis);
    ctx.fillStyle = on ? PALETTE.yellow : PALETTE.greenDeep;
    ctx.strokeStyle = on ? PALETTE.yellow : PALETTE.greenLite;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(dx + 3.6, y, 3.8, 0, Math.PI * 2);
    if (on) {
      ctx.fill();
    } else {
      ctx.stroke();
    }

    font(ctx, 'mono', size, 700);
    ctx.fillStyle = on ? PALETTE.cream : PALETTE.greenLite;
    const label = AXIS_LABEL[axis];
    drawTracked(ctx, label, dx + DOT_LEAD, y + 3.5, AXIS_TRACK);
    dx += DOT_LEAD + measureTracked(ctx, label, AXIS_TRACK) + AXIS_GAP;
  }
}

function meter(ctx: Ctx, synergy: CrewSynergy, x: number, y: number, width: number): void {
  const filled = Math.round((width * synergy.score) / 100);
  const room = width + 62;

  ctx.save();
  ctx.fillStyle = PALETTE.greenDeep;
  ctx.fill(roundedPath(x, y, width, 14, 7));

  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, PALETTE.yellow);
  grad.addColorStop(0.6, PALETTE.yellowDeep);
  grad.addColorStop(1, PALETTE.pink);
  ctx.fillStyle = grad;
  if (filled > 0) ctx.fill(roundedPath(x, y, Math.max(14, filled), 14, 7));

  ctx.fillStyle = PALETTE.cream;
  font(ctx, 'mono', 17, 700);
  const scoreWidth = drawTracked(ctx, `${synergy.score}`, x + width + 12, y + 13, 1);
  font(ctx, 'mono', 10.5, 400);
  ctx.globalAlpha = 0.66;
  drawTracked(ctx, '/100', x + width + 16 + scoreWidth, y + 13, 1);
  ctx.globalAlpha = 1;

  axisRow(ctx, synergy, x, y + 34, room);

  ctx.fillStyle = PALETTE.cream;
  ctx.globalAlpha = 0.74;
  font(ctx, 'mono', 10.5, 400);
  const lines = wrapTracked(ctx, gapLine(synergy.gaps), room, 0.6, 2);
  lines.forEach((line, i) => drawTracked(ctx, line, x, y + 58 + i * 15, 0.6));
  ctx.restore();
}

function classColumn(ctx: Ctx, spec: SheetSpec, x: number, y: number, width: number): void {
  const solo = spec.crew === 1;
  const title = solo ? spec.people[0].className : (spec.synergy?.title ?? 'CREW');
  const sub = solo ? spec.people[0].classSub : (spec.synergy?.blurb ?? '');

  label(ctx, solo ? 'BUILDER CLASS' : 'CREW CLASS', x, y);

  ctx.save();
  fitFont(ctx, title, width, 'display', 600, 46, 26);
  ctx.fillStyle = PALETTE.yellow;
  ctx.fillText(title, x, y + 42);

  ctx.fillStyle = PALETTE.cream;
  ctx.globalAlpha = 0.76;
  font(ctx, 'mono', 11, 400);
  drawTracked(ctx, truncate(ctx, sub, width), x, y + 64, 0.6);
  ctx.restore();
}

export function paintFoot(input: PaintInput): void {
  const { ctx, spec } = input;
  const { y, h, pad } = REGION.foot;
  const [c1, c2, c3] = REGION.cols;

  ctx.save();
  const bar = perforatedTop(0, y, spec.width, h, 5.5, 22);
  ctx.fillStyle = PALETTE.green;
  ctx.fill(bar);

  ctx.save();
  ctx.clip(bar);
  const sheen = ctx.createLinearGradient(0, y, spec.width, y + h);
  sheen.addColorStop(0, '#FFFFFF12');
  sheen.addColorStop(0.5, '#00000000');
  sheen.addColorStop(1, '#00000024');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, y, spec.width, h);
  ctx.restore();
  ctx.restore();

  const top = y + pad + 4;

  const stackItems =
    spec.crew === 1
      ? spec.people[0].stack
      : spec.synergy?.overlap.length
        ? spec.synergy.overlap
        : [...new Set(spec.people.flatMap((p) => p.stack))];

  label(ctx, spec.crew === 1 ? 'BEACH BAG' : 'SHARED STACK', c1.x, top);
  chips(ctx, stackItems.length ? stackItems : ['UNDECLARED'], c1.x, top + 32, c1.w);

  const vibes = spec.people.map((p) => p.vibe).filter((v): v is string => !!v);
  if (vibes.length) {
    ctx.save();
    ctx.fillStyle = PALETTE.cream;
    ctx.globalAlpha = 0.62;
    font(ctx, 'mono', 10.5, 400);
    drawTracked(ctx, truncate(ctx, vibes.join(' · ').toUpperCase(), c1.w), c1.x, top + 96, 1);
    ctx.restore();
  }

  classColumn(ctx, spec, c2.x, top, c2.w);

  if (spec.synergy) {
    label(ctx, 'CREW SYNERGY', c3.x, top);
    meter(ctx, spec.synergy, c3.x, top + 24, 200);
  }
}

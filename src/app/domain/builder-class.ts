import { fnv1a } from '../core/hash';
import { mulberry32, pick } from '../core/prng';
import { clamp } from '../core/util';
import { CLASS_TABLE, SOLO_FALLBACK } from './class-table';
import { Axis, BuilderClass, BuilderInput, Rarity } from './models';
import { AXES, TECH_BY_ID } from './taxonomy';

export type AxisScores = Record<Axis, number>;

export function scoreAxes(stack: readonly string[]): AxisScores {
  const scores: AxisScores = { metal: 0, surface: 0, signal: 0, chaos: 0, flow: 0 };
  for (const id of stack) {
    const tag = TECH_BY_ID.get(id);
    if (!tag) continue;
    for (const axis of AXES) {
      scores[axis] += tag.w[axis] ?? 0;
    }
  }
  return scores;
}

export function rankAxes(scores: AxisScores): Axis[] {
  return [...AXES].sort((a, b) => {
    const d = scores[b] - scores[a];
    return d !== 0 ? d : AXES.indexOf(a) - AXES.indexOf(b);
  });
}

export function axisSpread(scores: AxisScores): number {
  const values = AXES.map((a) => scores[a]);
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  const max = Math.max(...values);
  return max / total;
}

function seedOf(input: BuilderInput, salt: number): number {
  const stack = [...input.stack].sort().join(',');
  const name = input.name.trim().toLowerCase().replace(/\s+/g, ' ');
  return fnv1a(`${name}|${stack}|${input.vibe ?? ''}|${salt}`);
}

function rollRarity(rand: () => number, spread: number, stackSize: number, seed: number): Rarity {
  const focus = clamp((spread - 0.28) / 0.34, 0, 1);
  const declared = clamp(stackSize / 5, 0, 1) * 0.16;
  const scattered = stackSize > 9 ? -0.12 : 0;
  const luck = rand();
  const score = focus * 0.62 + declared + scattered + luck * 0.3;

  if (score > 0.94 || (seed & 0x3ff) === 0x2ff) return 'GOA_TIER';
  if (score > 0.72) return 'EPIC';
  if (score > 0.46) return 'RARE';
  return 'COMMON';
}

export function generateClass(input: BuilderInput, salt = 0): BuilderClass {
  const seed = seedOf(input, salt);
  const rand = mulberry32(seed);
  const scores = scoreAxes(input.stack);
  const ranked = rankAxes(scores);
  const primary = ranked[0];
  const secondary = ranked.find((a) => a !== primary && scores[a] > 0) ?? ranked[1];

  const pool = CLASS_TABLE[primary]?.[secondary];
  const variant = pool && pool.length ? pick(rand, pool) : SOLO_FALLBACK;
  const hasStack = input.stack.length > 0;

  return {
    key: `${primary}-${secondary}`,
    title: hasStack ? variant.title : SOLO_FALLBACK.title,
    subtitle: hasStack ? variant.subtitle : SOLO_FALLBACK.subtitle,
    primary,
    secondary,
    rarity: hasStack ? rollRarity(rand, axisSpread(scores), input.stack.length, seed) : 'COMMON',
  };
}

export const RARITY_ORDER: Rarity[] = ['COMMON', 'RARE', 'EPIC', 'GOA_TIER'];

export function rarityLabel(rarity: Rarity): string {
  return rarity === 'GOA_TIER' ? 'GOA TIER' : rarity;
}

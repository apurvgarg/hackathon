import { fnv1a } from '../core/hash';
import { mulberry32, pick } from '../core/prng';
import { clamp } from '../core/util';
import { CREW_TITLES } from './class-table';
import { rankAxes, scoreAxes } from './builder-class';
import { Axis, BuilderInput, CrewSynergy } from './models';
import { AXES, AXIS_GAP_LINE, TECH_BY_ID } from './taxonomy';

const BLURBS: string[] = [
  'this crew covers ground most teams cannot.',
  'balanced enough to build, weird enough to win.',
  'one of you will be awake at 4am. it is fine.',
  'the overlap is trust. the gaps are homework.',
  'strong spike, real edges. bring snacks.',
  'you three will argue about naming and ship anyway.',
];

export function computeSynergy(inputs: BuilderInput[], salt = 0): CrewSynergy | null {
  const active = inputs.filter((i) => i.stack.length > 0);
  if (inputs.length < 2) return null;

  const combined = scoreAxes(inputs.flatMap((i) => [...i.stack]));
  const total = AXES.reduce((s, a) => s + combined[a], 0);
  const covered = AXES.filter((a) => combined[a] > 0);
  const gaps = AXES.filter((a) => combined[a] === 0);

  const sets = inputs.map((i) => new Set(i.stack));
  const overlap = [...sets[0]].filter((id) => sets.every((s) => s.has(id)));
  const union = new Set(inputs.flatMap((i) => [...i.stack]));

  const coverageScore = covered.length / AXES.length;
  const diversityScore = union.size === 0 ? 0 : clamp(union.size / (inputs.length * 4), 0, 1);
  const overlapScore = union.size === 0 ? 0 : clamp(overlap.length / union.size, 0, 0.5);
  const raw = coverageScore * 0.5 + diversityScore * 0.32 + overlapScore * 0.18;
  const score = active.length === 0 ? 0 : Math.round(clamp(raw, 0, 1) * 100);

  const seed = fnv1a(
    inputs
      .map((i) => `${i.name.trim().toLowerCase()}:${[...i.stack].sort().join('+')}`)
      .join('|') + `|${salt}`,
  );
  const rand = mulberry32(seed);
  const dominant: Axis = total === 0 ? 'flow' : rankAxes(combined)[0];

  return {
    title: active.length === 0 ? 'CREW PENDING' : pick(rand, CREW_TITLES[dominant]),
    blurb: active.length === 0 ? 'add a stack for each builder.' : pick(rand, BLURBS),
    score,
    overlap: overlap.map((id) => TECH_BY_ID.get(id)?.label ?? id).slice(0, 4),
    coverage: covered,
    gaps,
  };
}

export function gapLine(gaps: Axis[]): string {
  if (!gaps.length) return 'no gaps. suspicious.';
  return AXIS_GAP_LINE[gaps[0]];
}

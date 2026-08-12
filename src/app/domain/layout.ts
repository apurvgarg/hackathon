import { jitter, mulberry32 } from '../core/prng';
import { CrewSize, Placement, Slot } from './models';

type Base = Omit<Placement, 'slot'> & { slot: Slot };

const SOLO: Base[] = [{ slot: 0, x: 862, y: 268, r: 176, rot: -7, z: 1 }];

const DUO: Base[] = [
  { slot: 0, x: 762, y: 252, r: 139, rot: -8, z: 2 },
  { slot: 1, x: 966, y: 296, r: 133, rot: 6, z: 1 },
];

const TRIO: Base[] = [
  { slot: 0, x: 748, y: 228, r: 100, rot: -9, z: 3 },
  { slot: 1, x: 968, y: 218, r: 96, rot: 5, z: 2 },
  { slot: 2, x: 858, y: 372, r: 102, rot: -3, z: 1 },
];

const BASES: Record<CrewSize, Base[]> = { 1: SOLO, 2: DUO, 3: TRIO };

export function solveLayout(crew: CrewSize, seed: number): Placement[] {
  const rand = mulberry32((seed ^ 0x5eed1e) >>> 0);
  return BASES[crew]
    .map((p) => ({
      slot: p.slot,
      r: p.r,
      z: p.z,
      x: p.x + jitter(rand, 7),
      y: p.y + jitter(rand, 7),
      rot: p.rot + jitter(rand, 1.6),
    }))
    .sort((a, b) => a.z - b.z);
}

export const LAYOUT_NAME: Record<CrewSize, string> = {
  1: 'SOLO',
  2: 'DUO',
  3: 'TRIO',
};

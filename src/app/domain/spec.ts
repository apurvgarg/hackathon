import { fnv1a } from '../core/hash';
import { displayName } from '../core/util';
import { generateClass } from './builder-class';
import { barcodeBars, qrMatrix, QR_TARGET, serialFor } from './identity';
import { solveLayout } from './layout';
import {
  BuilderInput,
  CrewSize,
  CrewSynergy,
  PersonSpec,
  PhotoAsset,
  SheetSpec,
  Slot,
} from './models';
import { SHEET } from './palette';
import { TECH_BY_ID, VIBE_BY_ID } from './taxonomy';

const PLACEHOLDER = ['BUILDER ONE', 'BUILDER TWO', 'BUILDER THREE'];

export interface SpecSources {
  crew: CrewSize;
  inputs: Record<Slot, BuilderInput>;
  photos: Record<Slot, PhotoAsset>;
  synergy: CrewSynergy | null;
  salt: number;
}

function initialsOf(name: string, slot: number): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return String(slot + 1);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function buildSpec(src: SpecSources): SheetSpec {
  const slots = [0, 1, 2].slice(0, src.crew) as Slot[];

  const seed = fnv1a(
    slots
      .map((s) => {
        const i = src.inputs[s];
        return `${i.name.trim().toLowerCase()}#${[...i.stack].sort().join('+')}#${i.vibe ?? ''}`;
      })
      .join('||') + `||${src.crew}||${src.salt}`,
  );

  const people: PersonSpec[] = slots.map((slot) => {
    const input = src.inputs[slot];
    const photo = src.photos[slot];
    const cls = generateClass(input, src.salt);
    const settled = photo.status === 'ready' || photo.status === 'no-face';
    return {
      slot,
      name: displayName(input.name, PLACEHOLDER[slot]),
      crop: photo.crop,
      hasPhoto: settled && !!photo.blob,
      loading: photo.status === 'decoding' || photo.status === 'detecting',
      className: cls.title,
      classSub: cls.subtitle,
      rarity: cls.rarity,
      stack: input.stack.map((id) => TECH_BY_ID.get(id)?.label ?? id),
      vibe: input.vibe ? VIBE_BY_ID.get(input.vibe)?.label ?? null : null,
      initials: initialsOf(input.name, slot),
    };
  });

  return {
    seed,
    crew: src.crew,
    width: SHEET.w,
    height: SHEET.h,
    placements: solveLayout(src.crew, seed),
    people,
    synergy: src.synergy,
    receipt: {
      serial: serialFor(seed, src.crew),
      bars: barcodeBars(seed),
      qr: qrMatrix(QR_TARGET),
      qrLabel: 'HHGOA.COM',
    },
    foil: people.some((p) => p.rarity === 'GOA_TIER'),
    stamp: '28-31 OCT 2026',
  };
}

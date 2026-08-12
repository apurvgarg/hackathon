export const PALETTE = {
  ink: '#04220F',
  green: '#0B6839',
  greenDeep: '#073B20',
  greenLite: '#12854A',
  greenGhost: '#0B683914',
  yellow: '#FEE101',
  yellowDeep: '#E4C700',
  cream: '#FFFBE8',
  creamShade: '#F1E8CB',
  pink: '#FF2D8F',
  pinkDeep: '#CE0F69',
  white: '#FFFFFF',
  graphite: '#7C8B7F',
} as const;

export const FONTS = {
  display: 'Imbue',
  mono: 'VictorMono',
  deva: 'Baloo2',
} as const;

export const SHEET = {
  w: 1200,
  h: 675,
  trim: 22,
  gutter: 54,
} as const;

export const RARITY_STYLE: Record<string, { fg: string; bg: string; foil: boolean }> = {
  COMMON: { fg: PALETTE.cream, bg: PALETTE.greenDeep, foil: false },
  RARE: { fg: PALETTE.ink, bg: PALETTE.yellow, foil: false },
  EPIC: { fg: PALETTE.cream, bg: PALETTE.pinkDeep, foil: false },
  GOA_TIER: { fg: PALETTE.ink, bg: PALETTE.yellow, foil: true },
};

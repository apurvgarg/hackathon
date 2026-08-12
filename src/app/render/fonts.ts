import { FONTS } from '../domain/palette';
import { FontPayload } from './protocol';

interface FontSource {
  family: string;
  weight: string;
  range: string;
  url: string;
}

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

const DEVANAGARI =
  'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09';

export const FONT_SOURCES: FontSource[] = [
  { family: FONTS.display, weight: '100 900', range: LATIN, url: 'fonts/imbue-latin.woff2' },
  {
    family: FONTS.display,
    weight: '100 900',
    range: LATIN_EXT,
    url: 'fonts/imbue-latin-ext.woff2',
  },
  { family: FONTS.mono, weight: '100 700', range: LATIN, url: 'fonts/victor-mono.woff2' },
  { family: FONTS.mono, weight: '100 700', range: LATIN_EXT, url: 'fonts/victor-mono-ext.woff2' },
  { family: FONTS.deva, weight: '400 800', range: DEVANAGARI, url: 'fonts/baloo2-deva.woff2' },
];

let cached: Promise<FontPayload[]> | null = null;

async function fetchOne(source: FontSource): Promise<FontPayload | null> {
  try {
    const response = await fetch(source.url);
    if (!response.ok) return null;
    const data = await response.arrayBuffer();
    if (data.byteLength < 512) return null;
    return {
      family: source.family,
      weight: source.weight,
      range: source.range,
      data,
    };
  } catch {
    return null;
  }
}

export function loadFontPayloads(): Promise<FontPayload[]> {
  if (cached) return cached;
  cached = Promise.all(FONT_SOURCES.map(fetchOne)).then((all) =>
    all.filter((f): f is FontPayload => !!f),
  );
  return cached;
}

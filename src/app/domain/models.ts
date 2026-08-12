export type Slot = 0 | 1 | 2;
export type CrewSize = 1 | 2 | 3;
export type Axis = 'metal' | 'surface' | 'signal' | 'chaos' | 'flow';
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'GOA_TIER';
export type PhotoStatus = 'empty' | 'decoding' | 'detecting' | 'ready' | 'no-face' | 'error';

export interface Pt {
  x: number;
  y: number;
}

export interface FaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
}

export interface Landmarks {
  rightEye: Pt;
  leftEye: Pt;
  nose: Pt;
  mouth: Pt;
  rightEar: Pt;
  leftEar: Pt;
}

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  roll: number;
}

export interface BuilderInput {
  slot: Slot;
  name: string;
  stack: readonly string[];
  vibe: string | null;
}

export interface BuilderClass {
  key: string;
  title: string;
  subtitle: string;
  primary: Axis;
  secondary: Axis;
  rarity: Rarity;
}

export interface PhotoAsset {
  slot: Slot;
  blob: Blob | null;
  url: string | null;
  width: number;
  height: number;
  faces: FaceBox[];
  allLandmarks: (Landmarks | null)[];
  chosenFace: number;
  face: FaceBox | null;
  landmarks: Landmarks | null;
  crop: CropRect | null;
  status: PhotoStatus;
  message: string;
}

export interface CrewSynergy {
  title: string;
  blurb: string;
  score: number;
  overlap: string[];
  coverage: Axis[];
  gaps: Axis[];
}

export interface Placement {
  slot: Slot;
  x: number;
  y: number;
  r: number;
  rot: number;
  z: number;
}

export interface PersonSpec {
  slot: Slot;
  name: string;
  crop: CropRect | null;
  hasPhoto: boolean;
  loading: boolean;
  className: string;
  classSub: string;
  rarity: Rarity;
  stack: string[];
  vibe: string | null;
  initials: string;
}

export interface ReceiptSpec {
  serial: string;
  bars: number[];
  qr: boolean[][];
  qrLabel: string;
}

export interface SheetSpec {
  seed: number;
  crew: CrewSize;
  width: number;
  height: number;
  placements: Placement[];
  people: PersonSpec[];
  synergy: CrewSynergy | null;
  receipt: ReceiptSpec;
  foil: boolean;
  stamp: string;
}

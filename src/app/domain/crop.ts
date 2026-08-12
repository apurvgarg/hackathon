import { clamp } from '../core/util';
import { CropRect, FaceBox, Landmarks } from './models';

const K_HEAD = 3.15;
const ANCHOR_Y = 0.42;
const MAX_ROLL = 8;
const SAFE = 0.06;
const SHRINK = 0.88;
const PASSES = 3;

export function solveRoll(lm: Landmarks | null): number {
  if (!lm) return 0;
  const dx = lm.leftEye.x - lm.rightEye.x;
  const dy = lm.leftEye.y - lm.rightEye.y;
  if (Math.abs(dx) < 1) return 0;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return clamp(-deg, -MAX_ROLL, MAX_ROLL);
}

export function saliencyFallback(width: number, height: number): CropRect {
  const side = Math.min(width, height) * 0.82;
  return {
    sx: clamp(width / 2 - side / 2, 0, Math.max(0, width - side)),
    sy: clamp(height * 0.06, 0, Math.max(0, height - side)),
    sw: side,
    sh: side,
    roll: 0,
  };
}

export function solveFaceCrop(
  face: FaceBox | null,
  landmarks: Landmarks | null,
  width: number,
  height: number,
): CropRect {
  if (!face || face.w <= 0 || face.h <= 0) return saliencyFallback(width, height);

  const cx = face.x + face.w / 2;
  const cy = face.y + face.h / 2;
  const maxSide = Math.min(width, height);
  let side = clamp(face.h * K_HEAD, Math.min(face.h * 1.6, maxSide), maxSide);
  let sx = 0;
  let sy = 0;

  for (let pass = 0; pass < PASSES; pass++) {
    sx = clamp(cx - side / 2, 0, Math.max(0, width - side));
    sy = clamp(cy - side * ANCHOR_Y, 0, Math.max(0, height - side));
    const inset = side * SAFE;
    const fits =
      face.x >= sx - inset &&
      face.x + face.w <= sx + side + inset &&
      face.y >= sy - inset &&
      face.y + face.h <= sy + side + inset;
    if (fits) break;
    side = Math.max(face.h * 1.5, side * SHRINK);
  }

  return { sx, sy, sw: side, sh: side, roll: solveRoll(landmarks) };
}

export function faceWeight(face: FaceBox): number {
  return face.score * face.w * face.h;
}

export function pickPrimaryFace(faces: FaceBox[]): { index: number; ambiguous: boolean } {
  if (!faces.length) return { index: -1, ambiguous: false };

  let best = 0;
  for (let i = 1; i < faces.length; i++) {
    if (faceWeight(faces[i]) > faceWeight(faces[best])) best = i;
  }

  let runner = -1;
  for (let i = 0; i < faces.length; i++) {
    if (i === best) continue;
    if (runner === -1 || faceWeight(faces[i]) > faceWeight(faces[runner])) runner = i;
  }

  return {
    index: best,
    ambiguous: runner !== -1 && faceWeight(faces[runner]) > faceWeight(faces[best]) * 0.85,
  };
}

import { SheetSpec } from '../../domain/models';
import { Ctx } from '../geometry';

export interface PaintInput {
  ctx: Ctx;
  spec: SheetSpec;
  bitmaps: Map<number, ImageBitmap>;
}

export type Painter = (input: PaintInput) => void;

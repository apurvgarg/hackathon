import { paintFoil } from './foil';
import { paintFoot } from './foot';
import { paintFrame } from './frame';
import { paintLockup } from './lockup';
import { paintNames, paintStackRail } from './names';
import { paintPaper } from './paper';
import { paintPeople } from './people';
import { paintReceipt } from './receipt';
import { Painter } from './types';

export const CHAIN: Painter[] = [
  paintPaper,
  paintFrame,
  paintLockup,
  paintNames,
  paintStackRail,
  paintPeople,
  paintFoot,
  paintReceipt,
  paintFoil,
];

export type { PaintInput, Painter } from './types';

import { SheetSpec } from '../domain/models';

export interface FontPayload {
  family: string;
  weight: string;
  range: string;
  data: ArrayBuffer;
}

export interface FontsMessage {
  kind: 'fonts';
  id: number;
  fonts: FontPayload[];
}

export interface UploadMessage {
  kind: 'upload';
  id: number;
  slot: number;
  bitmap: ImageBitmap | null;
}

export interface PaintMessage {
  kind: 'paint';
  id: number;
  spec: SheetSpec;
  scale: number;
  wantBlob: boolean;
}

export type RenderRequest = FontsMessage | UploadMessage | PaintMessage;

export interface PaintedMessage {
  kind: 'painted';
  id: number;
  preview: ImageBitmap | null;
  blob: Blob | null;
  ms: number;
}

export interface AckMessage {
  kind: 'ack';
  id: number;
  fontsReady: boolean;
}

export interface RenderErrorMessage {
  kind: 'error';
  id: number;
  message: string;
}

export type RenderResponse = PaintedMessage | AckMessage | RenderErrorMessage;

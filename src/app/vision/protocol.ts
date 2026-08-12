import { FaceBox, Landmarks } from '../domain/models';

export interface DetectRequest {
  kind: 'detect';
  id: number;
  bitmap: ImageBitmap;
}

export interface WarmRequest {
  kind: 'warm';
  id: number;
}

export type VisionRequest = DetectRequest | WarmRequest;

export interface DetectResult {
  kind: 'detected';
  id: number;
  faces: FaceBox[];
  landmarks: (Landmarks | null)[];
  chosen: number;
  ambiguous: boolean;
  degraded: boolean;
}

export interface VisionError {
  kind: 'error';
  id: number;
  message: string;
}

export interface VisionReady {
  kind: 'ready';
  id: number;
  backend: string;
}

export type VisionResponse = DetectResult | VisionError | VisionReady;

export interface WorkerScope {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
  fonts?: { add(font: FontFace): void };
}

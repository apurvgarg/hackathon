import { Injectable, signal } from '@angular/core';
import { bitmapFrom } from '../core/image';
import { DetectResult, VisionResponse } from './protocol';

@Injectable({ providedIn: 'root' })
export class VisionClient {
  private worker: Worker | null = null;
  private ticket = 0;
  private readonly pending = new Map<number, (result: DetectResult) => void>();

  readonly available = signal(typeof Worker !== 'undefined');
  readonly warm = signal(false);
  readonly backend = signal('idle');

  private ensure(): Worker | null {
    if (this.worker || !this.available()) return this.worker;
    try {
      this.worker = new Worker(new URL('./vision.worker', import.meta.url), { type: 'module' });
      this.worker.addEventListener('message', (event: MessageEvent) => this.receive(event));
      this.worker.addEventListener('error', () => this.degrade());
      return this.worker;
    } catch {
      this.degrade();
      return null;
    }
  }

  private degrade(): void {
    this.available.set(false);
    this.backend.set('unavailable');
    for (const [id, resolve] of this.pending) {
      resolve(this.emptyResult(id, true));
    }
    this.pending.clear();
  }

  private emptyResult(id: number, degraded: boolean): DetectResult {
    return {
      kind: 'detected',
      id,
      face: null,
      landmarks: null,
      candidates: 0,
      ambiguous: false,
      degraded,
    };
  }

  private receive(event: MessageEvent): void {
    const message = event.data as VisionResponse;
    if (message.kind === 'ready') {
      this.warm.set(true);
      this.backend.set(message.backend);
      return;
    }
    const resolve = this.pending.get(message.id);
    if (!resolve) return;
    this.pending.delete(message.id);
    resolve(
      message.kind === 'detected' ? message : this.emptyResult(message.id, true),
    );
  }

  warmup(): void {
    const worker = this.ensure();
    if (!worker) return;
    worker.postMessage({ kind: 'warm', id: ++this.ticket });
  }

  async detect(blob: Blob): Promise<DetectResult> {
    const worker = this.ensure();
    const id = ++this.ticket;
    if (!worker) return this.emptyResult(id, true);

    let bitmap: ImageBitmap;
    try {
      bitmap = await bitmapFrom(blob);
    } catch {
      return this.emptyResult(id, true);
    }

    return new Promise<DetectResult>((resolve) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) resolve(this.emptyResult(id, true));
      }, 15000);

      this.pending.set(id, (result) => {
        clearTimeout(timer);
        resolve(result);
      });

      worker.postMessage({ kind: 'detect', id, bitmap }, [bitmap]);
    });
  }
}

import { Injectable, signal } from '@angular/core';
import { bitmapFrom } from '../core/image';
import { SheetSpec } from '../domain/models';
import { loadFontPayloads } from './fonts';
import { PaintedMessage, RenderResponse } from './protocol';

export interface PaintOutcome {
  preview: ImageBitmap | null;
  blob: Blob | null;
  ms: number;
}

@Injectable({ providedIn: 'root' })
export class RenderClient {
  private worker: Worker | null = null;
  private ticket = 0;
  private fontsRequested = false;
  private readonly pending = new Map<number, (result: PaintedMessage | null) => void>();

  readonly fontsReady = signal(false);
  readonly failed = signal(false);
  readonly lastMs = signal(0);

  private ensure(): Worker | null {
    if (this.worker) return this.worker;
    try {
      this.worker = new Worker(new URL('./render.worker', import.meta.url), { type: 'module' });
      this.worker.addEventListener('message', (event: MessageEvent) => this.receive(event));
      this.worker.addEventListener('error', () => {
        this.failed.set(true);
        for (const [, resolve] of this.pending) resolve(null);
        this.pending.clear();
      });
      void this.sendFonts();
      return this.worker;
    } catch {
      this.failed.set(true);
      return null;
    }
  }

  private receive(event: MessageEvent): void {
    const message = event.data as RenderResponse;
    if (message.kind === 'ack') {
      if (message.fontsReady) this.fontsReady.set(true);
      return;
    }
    const resolve = this.pending.get(message.id);
    if (!resolve) return;
    this.pending.delete(message.id);
    if (message.kind === 'painted') {
      this.lastMs.set(Math.round(message.ms));
      resolve(message);
    } else {
      resolve(null);
    }
  }

  private async sendFonts(): Promise<void> {
    if (this.fontsRequested || !this.worker) return;
    this.fontsRequested = true;
    const payloads = await loadFontPayloads();
    if (!payloads.length || !this.worker) return;
    const cloned = payloads.map((p) => ({ ...p, data: p.data.slice(0) }));
    this.worker.postMessage(
      { kind: 'fonts', id: ++this.ticket, fonts: cloned },
      cloned.map((p) => p.data),
    );
  }

  async setPhoto(slot: number, blob: Blob | null): Promise<void> {
    const worker = this.ensure();
    if (!worker) return;
    if (!blob) {
      worker.postMessage({ kind: 'upload', id: ++this.ticket, slot, bitmap: null });
      return;
    }
    try {
      const bitmap = await bitmapFrom(blob);
      worker.postMessage({ kind: 'upload', id: ++this.ticket, slot, bitmap }, [bitmap]);
    } catch {
      return;
    }
  }

  paint(spec: SheetSpec, scale: number, wantBlob: boolean): Promise<PaintOutcome | null> {
    const worker = this.ensure();
    if (!worker) return Promise.resolve(null);
    const id = ++this.ticket;

    return new Promise<PaintOutcome | null>((resolve) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) resolve(null);
      }, 20000);

      this.pending.set(id, (message) => {
        clearTimeout(timer);
        resolve(
          message ? { preview: message.preview, blob: message.blob, ms: message.ms } : null,
        );
      });

      worker.postMessage({ kind: 'paint', id, spec, scale, wantBlob });
    });
  }
}

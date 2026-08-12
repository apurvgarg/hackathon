import { Injectable, signal } from '@angular/core';
import { downloadBlob } from '../core/util';
import { ToastService } from '../core/toast.service';
import { SheetSpec } from '../domain/models';

export type ShareTier = 'native' | 'clipboard' | 'download' | 'failed';

const INTENT = 'https://x.com/intent/post';

function canShareFiles(file: File): boolean {
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: unknown) => Promise<void>;
  };
  return typeof nav.share === 'function' && typeof nav.canShare === 'function'
    ? nav.canShare({ files: [file] })
    : false;
}

@Injectable({ providedIn: 'root' })
export class ShareService {
  readonly lastTier = signal<ShareTier | null>(null);
  readonly busy = signal(false);

  constructor(private readonly toast: ToastService) {}

  captionFor(spec: SheetSpec): string {
    const names = spec.people.map((p) => p.name).join(' + ');
    const line =
      spec.crew === 1
        ? `${names} — ${spec.people[0].className}.`
        : `${names} — ${spec.synergy?.title ?? 'CREW'} · synergy ${spec.synergy?.score ?? 0}/100.`;
    return [
      `my HH Goa 2026 squad sheet just printed.`,
      line,
      `sheet id ${spec.receipt.serial}`,
      ``,
      `make yours: pick 1-3 builders, drop a photo, it die-cuts itself.`,
      `#FrameInGoa`,
    ].join('\n');
  }

  filenameFor(spec: SheetSpec): string {
    return `hh-goa-squad-sheet-${spec.receipt.serial.toLowerCase()}.png`;
  }

  openIntent(text: string): void {
    const url = `${INTENT}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  save(blob: Blob, spec: SheetSpec): void {
    downloadBlob(blob, this.filenameFor(spec));
    this.toast.push('Sheet saved as PNG.', 'ok');
  }

  async share(blob: Blob, spec: SheetSpec): Promise<ShareTier> {
    this.busy.set(true);
    const text = this.captionFor(spec);
    const file = new File([blob], this.filenameFor(spec), { type: 'image/png' });

    try {
      if (canShareFiles(file)) {
        try {
          await (navigator as Navigator & { share: (d: unknown) => Promise<void> }).share({
            files: [file],
            text,
          });
          this.lastTier.set('native');
          return 'native';
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            this.lastTier.set('native');
            return 'native';
          }
        }
      }

      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        this.openIntent(text);
        this.toast.push('Sheet copied. Paste it into the post with Ctrl+V.', 'warn', 7000);
        this.lastTier.set('clipboard');
        return 'clipboard';
      } catch {
        downloadBlob(blob, this.filenameFor(spec));
        this.openIntent(text);
        this.toast.push('Sheet downloaded. Attach it to the post.', 'warn', 7000);
        this.lastTier.set('download');
        return 'download';
      }
    } finally {
      this.busy.set(false);
    }
  }
}

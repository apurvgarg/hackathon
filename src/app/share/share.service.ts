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

function probeNative(): boolean {
  try {
    const probe = new File([new Uint8Array([0])], 'probe.png', { type: 'image/png' });
    return canShareFiles(probe);
  } catch {
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class ShareService {
  readonly lastTier = signal<ShareTier | null>(null);
  readonly busy = signal(false);
  readonly nativeCapable = signal(false);
  readonly pasteHint = signal(false);

  constructor(private readonly toast: ToastService) {
    this.nativeCapable.set(probeNative());
  }

  dismissHint(): void {
    this.pasteHint.set(false);
  }

  async copyImage(blob: Blob): Promise<boolean> {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      this.toast.push('Copied again. Paste with Ctrl+V.', 'ok', 3000);
      return true;
    } catch {
      this.toast.push('Could not copy. Use SAVE .PNG instead.', 'bad', 4000);
      return false;
    }
  }

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
    this.pasteHint.set(false);
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
          this.pasteHint.set(false);
          this.lastTier.set('native');
          return 'native';
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            this.pasteHint.set(false);
            this.lastTier.set('native');
            return 'native';
          }
        }
      }

      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        this.pasteHint.set(true);
        this.lastTier.set('clipboard');
        this.openIntent(text);
        return 'clipboard';
      } catch {
        downloadBlob(blob, this.filenameFor(spec));
        this.pasteHint.set(true);
        this.lastTier.set('download');
        this.openIntent(text);
        return 'download';
      }
    } finally {
      this.busy.set(false);
    }
  }
}

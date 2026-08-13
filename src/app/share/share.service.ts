import { Injectable, signal } from '@angular/core';
import { downloadBlob } from '../core/util';
import { ToastService } from '../core/toast.service';
import { SheetSpec } from '../domain/models';

export type ShareTier = 'clipboard' | 'download' | 'failed';

const INTENT = 'https://twitter.com/intent/tweet';

@Injectable({ providedIn: 'root' })
export class ShareService {
  readonly lastTier = signal<ShareTier | null>(null);
  readonly busy = signal(false);
  readonly pasteHint = signal(false);

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
      `make yours: 1-3 builders, drop a photo, it die-cuts itself. #FrameInGoa`,
    ].join('\n');
  }

  filenameFor(spec: SheetSpec): string {
    return `hh-goa-squad-sheet-${spec.receipt.serial.toLowerCase()}.png`;
  }

  openIntent(text: string): void {
    const url = `${INTENT}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  dismissHint(): void {
    this.pasteHint.set(false);
  }

  private copy(blob: Blob): Promise<boolean> {
    try {
      return navigator.clipboard
        .write([new ClipboardItem({ 'image/png': blob })])
        .then(() => true)
        .catch(() => false);
    } catch {
      return Promise.resolve(false);
    }
  }

  async copyImage(blob: Blob): Promise<boolean> {
    const copied = await this.copy(blob);
    this.toast.push(
      copied ? 'Copied again. Paste with Ctrl+V.' : 'Could not copy. Use SAVE .PNG instead.',
      copied ? 'ok' : 'bad',
      3200,
    );
    return copied;
  }

  save(blob: Blob, spec: SheetSpec): void {
    downloadBlob(blob, this.filenameFor(spec));
    this.toast.push('Sheet saved as PNG.', 'ok');
  }

  async share(blob: Blob, spec: SheetSpec): Promise<ShareTier> {
    this.busy.set(true);
    const text = this.captionFor(spec);

    try {
      const copying = this.copy(blob);
      this.openIntent(text);

      const copied = await copying;
      if (!copied) downloadBlob(blob, this.filenameFor(spec));

      this.pasteHint.set(true);
      this.lastTier.set(copied ? 'clipboard' : 'download');
      return copied ? 'clipboard' : 'download';
    } finally {
      this.busy.set(false);
    }
  }
}

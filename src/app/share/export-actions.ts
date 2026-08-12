import { computed, inject, Injectable, signal } from '@angular/core';
import { ToastService } from '../core/toast.service';
import { StudioStore } from '../state/studio.store';
import { ShareService } from './share.service';

@Injectable({ providedIn: 'root' })
export class ExportActions {
  private readonly store = inject(StudioStore);
  private readonly share = inject(ShareService);
  private readonly toast = inject(ToastService);

  readonly ready = computed(() => this.store.readyToShare());
  readonly busy = computed(() => this.share.busy());
  readonly canReroll = computed(() => this.store.canReroll());
  readonly complete = computed(() => this.store.complete());
  readonly pasteHint = computed(() => this.share.pasteHint());
  readonly downloaded = computed(() => this.share.lastTier() === 'download');
  readonly hasWork = computed(() => this.store.hasWork());
  readonly arming = signal(false);

  private armTimer: ReturnType<typeof setTimeout> | null = null;

  readonly hint = computed(() => {
    const gaps = this.store.missing();
    if (gaps.length) return `STILL NEED: ${gaps.slice(0, 3).join(', ')}`;
    const tier = this.share.lastTier();
    if (tier === 'native') return 'SHARED WITH THE IMAGE ATTACHED';
    if (tier === 'clipboard') return 'PASTE IT IN THE POST BOX';
    if (tier === 'download') return 'ATTACH THE DOWNLOADED FILE';
    return this.share.nativeCapable()
      ? 'ONE TAP ATTACHES THE PNG'
      : 'COPIES THE IMAGE, THEN YOU PASTE IT';
  });

  dismissHint(): void {
    this.share.dismissHint();
  }

  copyAgain(): void {
    const blob = this.store.exportBlob();
    if (blob) void this.share.copyImage(blob);
  }

  private resolveBlob(): Blob | null {
    const gaps = this.store.missing();
    if (gaps.length) {
      this.toast.push(`Add ${gaps[0].toLowerCase()} first.`, 'warn', 2600);
      return null;
    }
    const blob = this.store.exportBlob();
    if (!blob) {
      this.toast.push('Still printing. One second.', 'warn', 2200);
      return null;
    }
    return blob;
  }

  save(): void {
    const blob = this.resolveBlob();
    if (blob) this.share.save(blob, this.store.spec());
  }

  post(): void {
    const blob = this.resolveBlob();
    if (blob) void this.share.share(blob, this.store.spec());
  }

  reroll(): void {
    this.store.reroll();
  }

  startOver(): void {
    if (this.armTimer) clearTimeout(this.armTimer);

    if (!this.arming()) {
      this.arming.set(true);
      this.armTimer = setTimeout(() => this.arming.set(false), 3500);
      return;
    }

    this.arming.set(false);
    this.store.reset();
  }
}

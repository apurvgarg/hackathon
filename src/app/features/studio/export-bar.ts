import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ShareService } from '../../share/share.service';
import { StudioStore } from '../../state/studio.store';

@Component({
  selector: 'hh-export-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2">
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.3fr]">
        <button
          type="button"
          [disabled]="!ready()"
          (click)="save()"
          class="press border-2 border-ink bg-paper px-4 py-3.5 text-xs font-bold tracked text-goa-deep hard-shadow disabled:opacity-40"
        >
          SAVE .PNG
        </button>

        <button
          type="button"
          [disabled]="!ready() || share.busy()"
          (click)="post()"
          class="press border-2 border-ink bg-sun px-4 py-3.5 text-xs font-bold tracked text-ink hard-shadow disabled:opacity-40"
        >
          {{ share.busy() ? 'OPENING…' : 'POST TO X' }}
        </button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          [disabled]="!store.canReroll()"
          (click)="store.reroll()"
          class="text-[10px] tracked underline decoration-dotted disabled:no-underline disabled:opacity-30"
          [class]="
            store.canReroll()
              ? 'text-paper/45 hover:text-sun'
              : 'cursor-not-allowed text-paper/25'
          "
        >
          REROLL THE CLASS
        </button>
        <span class="text-[10px] tracked" [class]="store.complete() ? 'text-paper/35' : 'text-sun'">{{
          hint()
        }}</span>
      </div>
    </div>
  `,
})
export class ExportBar {
  readonly store = inject(StudioStore);
  readonly share = inject(ShareService);
  private readonly toast = inject(ToastService);

  readonly ready = computed(() => this.store.readyToShare());

  hint(): string {
    const gaps = this.store.missing();
    if (gaps.length) return `STILL NEED: ${gaps.slice(0, 4).join(', ')}`;
    const tier = this.share.lastTier();
    if (tier === 'native') return 'SHARED WITH THE IMAGE ATTACHED';
    if (tier === 'clipboard') return 'PASTE IN THE COMPOSER';
    if (tier === 'download') return 'ATTACH THE DOWNLOADED FILE';
    return 'ONE TAP ON MOBILE ATTACHES THE PNG';
  }

  private blockedBlob(): Blob | null {
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
    const blob = this.blockedBlob();
    if (blob) this.share.save(blob, this.store.spec());
  }

  post(): void {
    const blob = this.blockedBlob();
    if (blob) void this.share.share(blob, this.store.spec());
  }
}

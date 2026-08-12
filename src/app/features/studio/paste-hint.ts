import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExportActions } from '../../share/export-actions';

@Component({
  selector: 'hh-paste-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (actions.pasteHint()) {
      <div class="animate-rise border-2 border-ink bg-sun px-3 py-2.5 text-ink hard-shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <p class="text-[11px] font-bold leading-snug">
            {{ actions.downloaded() ? 'SHEET DOWNLOADED' : 'SHEET COPIED' }} — PRESS
            <span class="rounded bg-ink px-1.5 py-0.5 text-sun">{{ combo }}</span>
            IN THE X POST BOX
          </p>
          <button
            type="button"
            (click)="actions.dismissHint()"
            aria-label="Dismiss"
            class="shrink-0 text-[13px] leading-none text-ink/50 hover:text-neon-deep"
          >
            ✕
          </button>
        </div>

        @if (!actions.downloaded()) {
          <button
            type="button"
            (click)="actions.copyAgain()"
            class="mt-1.5 text-[10px] tracked text-ink/70 underline decoration-dotted hover:text-neon-deep"
          >
            COPY AGAIN
          </button>
        } @else {
          <p class="mt-1.5 text-[10px] leading-snug text-ink/70">
            clipboard was blocked, so attach the file you just downloaded
          </p>
        }
      </div>
    }
  `,
})
export class PasteHint {
  readonly actions = inject(ExportActions);
  readonly combo = /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘V' : 'CTRL+V';
}

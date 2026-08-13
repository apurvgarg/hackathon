import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExportActions } from '../../share/export-actions';
import { StudioStore } from '../../state/studio.store';
import { PasteHint } from './paste-hint';

@Component({
  selector: 'hh-mobile-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PasteHint],
  template: `
    <div
      class="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-goa-deep/97 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div class="mx-auto max-w-3xl px-3 pt-2.5 pb-3">
        @if (actions.pasteHint()) {
          <div class="mb-2">
            <hh-paste-hint />
          </div>
        }

        <div class="mb-2 flex items-center justify-between gap-3">
          <span class="min-w-0 flex-1 truncate text-[10px] tracked text-sun">{{
            actions.hint()
          }}</span>

          <button
            type="button"
            [disabled]="!actions.canReroll()"
            (click)="actions.reroll()"
            class="shrink-0 text-[10px] tracked underline decoration-dotted disabled:no-underline"
            [class]="actions.canReroll() ? 'text-paper/50' : 'text-paper/20'"
          >
            REROLL
          </button>
        </div>

        <div class="grid grid-cols-[1fr_1.4fr] gap-2">
          <button
            type="button"
            [disabled]="!actions.ready()"
            (click)="actions.save()"
            class="press border-2 border-ink bg-paper py-3 text-[11px] font-bold tracked text-goa-deep hard-shadow-sm disabled:opacity-40"
          >
            SAVE .PNG
          </button>

          <button
            type="button"
            [disabled]="!actions.ready() || actions.busy()"
            (click)="actions.post()"
            class="press border-2 border-ink bg-sun py-3 text-[11px] font-bold tracked text-ink hard-shadow-sm disabled:opacity-40"
          >
            {{ actions.busy() ? 'OPENING…' : 'POST TO X' }}
          </button>
        </div>

      </div>
    </div>
  `,
})
export class MobileActionBar {
  readonly actions = inject(ExportActions);
  readonly store = inject(StudioStore);
}

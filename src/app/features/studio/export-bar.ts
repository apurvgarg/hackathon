import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExportActions } from '../../share/export-actions';
import { PasteHint } from './paste-hint';

@Component({
  selector: 'hh-export-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PasteHint],
  template: `
    <div class="space-y-2">
      <hh-paste-hint />
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.3fr]">
        <button
          type="button"
          [disabled]="!actions.ready()"
          (click)="actions.save()"
          class="press border-2 border-ink bg-paper px-4 py-3.5 text-xs font-bold tracked text-goa-deep hard-shadow disabled:opacity-40"
        >
          SAVE .PNG
        </button>

        <button
          type="button"
          [disabled]="!actions.ready() || actions.busy()"
          (click)="actions.post()"
          class="press border-2 border-ink bg-sun px-4 py-3.5 text-xs font-bold tracked text-ink hard-shadow disabled:opacity-40"
        >
          {{ actions.busy() ? 'OPENING…' : 'POST TO X' }}
        </button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <button
          type="button"
          [disabled]="!actions.canReroll()"
          (click)="actions.reroll()"
          class="text-[10px] tracked underline decoration-dotted disabled:no-underline"
          [class]="
            actions.canReroll()
              ? 'text-paper/45 hover:text-sun'
              : 'cursor-not-allowed text-paper/25'
          "
        >
          REROLL THE CLASS
        </button>

        @if (actions.hint()) {
          <span class="text-[10px] tracked text-sun">{{ actions.hint() }}</span>
        }
      </div>
    </div>
  `,
})
export class ExportBar {
  readonly actions = inject(ExportActions);
}

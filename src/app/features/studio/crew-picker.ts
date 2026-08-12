import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CrewSize } from '../../domain/models';
import { StudioStore } from '../../state/studio.store';

interface Option {
  size: CrewSize;
  label: string;
  hint: string;
}

@Component({
  selector: 'hh-crew-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <p class="mb-3 text-[11px] tracked text-paper/60">
        HOW MANY BUILDERS ON THIS SHEET
      </p>
      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        @for (option of options; track option.size) {
          <button
            type="button"
            (click)="store.setCrew(option.size)"
            [attr.aria-pressed]="store.crew() === option.size"
            class="press group relative overflow-hidden border-2 border-ink px-2 py-3 text-left hard-shadow-sm sm:px-4 sm:py-4"
            [class]="
              store.crew() === option.size
                ? 'bg-sun text-ink'
                : 'bg-goa-deep text-paper/70 hover:bg-goa-lite hover:text-paper'
            "
          >
            <span class="block font-display text-2xl leading-none sm:text-3xl">{{
              option.size
            }}</span>
            <span class="mt-1 block text-[10px] font-bold tracked sm:text-[11px]">{{
              option.label
            }}</span>
            <span class="mt-0.5 hidden text-[10px] opacity-70 sm:block">{{ option.hint }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class CrewPicker {
  readonly store = inject(StudioStore);

  readonly options: Option[] = [
    { size: 1, label: 'SOLO', hint: 'one big die-cut' },
    { size: 2, label: 'DUO', hint: 'overlapping pair' },
    { size: 3, label: 'TRIO', hint: 'the triangle' },
  ];
}

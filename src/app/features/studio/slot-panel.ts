import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { normalizeName } from '../../core/util';
import { rarityLabel } from '../../domain/builder-class';
import { Slot } from '../../domain/models';
import { StudioStore } from '../../state/studio.store';
import { Dropzone } from './dropzone';
import { StackPicker } from './stack-picker';

@Component({
  selector: 'hh-slot-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dropzone, StackPicker],
  template: `
    <section class="animate-rise border-2 border-ink bg-goa hard-shadow">
      <header class="flex items-center justify-between border-b-2 border-ink bg-goa-deep px-4 py-2.5">
        <div class="flex items-center gap-2.5">
          <span
            class="grid size-7 place-items-center border-2 border-paper/30 bg-goa text-[11px] font-bold text-sun"
            >{{ index() }}</span
          >
          <span class="text-[11px] font-bold tracked text-paper/80">BUILDER {{ index() }}</span>
        </div>
        <span class="text-[10px] tracked" [class]="rarityClass()">{{ rarity() }}</span>
      </header>

      <div class="space-y-5 p-4 pb-5">
        <label class="block">
          <span class="mb-1.5 block text-[10px] tracked text-paper/55">NAME</span>
          <input
            type="text"
            maxlength="22"
            autocomplete="name"
            placeholder="eg. John Doe"
            [value]="input().name"
            (input)="setName($event)"
            class="w-full border-2 border-paper/25 bg-goa-deep px-3 py-2 text-sm text-paper placeholder:text-paper/25 focus:border-sun"
          />
        </label>

        <hh-dropzone [slot]="slot()" />

        <hh-stack-picker [slot]="slot()" />

        <div class="border-t-2 border-paper/10 pt-5">
          <div class="border-2 border-dashed border-sun/40 bg-goa-deep px-3 py-3">
            <p class="text-[9px] tracked text-sun/60">BUILDER CLASS</p>
            <p class="mt-1 font-display text-xl leading-tight text-sun">{{ className() }}</p>
            <p class="mt-1 text-[10px] leading-relaxed text-paper/55">{{ classSub() }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class SlotPanel {
  readonly store = inject(StudioStore);
  readonly slot = input.required<Slot>();

  readonly index = computed(() => this.slot() + 1);
  readonly input = computed(() => this.store.inputs()[this.slot()]);

  private readonly klass = computed(() => {
    const list = this.store.classes();
    return list[this.slot()] ?? list[0];
  });

  readonly className = computed(() => this.klass()?.title ?? '');
  readonly classSub = computed(() => this.klass()?.subtitle ?? '');
  readonly rarity = computed(() => rarityLabel(this.klass()?.rarity ?? 'COMMON'));

  rarityClass(): string {
    const value = this.klass()?.rarity;
    if (value === 'GOA_TIER') return 'text-sun';
    if (value === 'EPIC') return 'text-neon';
    if (value === 'RARE') return 'text-paper/80';
    return 'text-paper/35';
  }

  setName(event: Event): void {
    const value = normalizeName((event.target as HTMLInputElement).value);
    this.store.patchInput(this.slot(), { name: value });
  }
}

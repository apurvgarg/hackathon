import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { normalizeName } from '../../core/util';
import { rarityLabel } from '../../domain/builder-class';
import { Slot } from '../../domain/models';
import { StudioStore } from '../../state/studio.store';
import { Dropzone } from './dropzone';
import { FaceChooser } from './face-chooser';
import { StackPicker } from './stack-picker';

@Component({
  selector: 'hh-slot-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dropzone, FaceChooser, StackPicker],
  template: `
    <section class="border-2 border-ink bg-goa hard-shadow">
      <button
        type="button"
        [disabled]="!collapsible()"
        (click)="toggled.emit()"
        class="flex w-full items-center justify-between gap-3 border-b-2 border-ink bg-goa-deep px-4 py-2.5 text-left"
        [class]="collapsible() ? 'press' : ''"
      >
        <span class="flex min-w-0 items-center gap-2.5">
          <span
            class="grid size-7 shrink-0 place-items-center border-2 text-[11px] font-bold"
            [class]="
              open() ? 'border-sun bg-sun text-ink' : 'border-paper/30 bg-goa text-sun'
            "
            >{{ index() }}</span
          >
          <span class="min-w-0">
            <span class="block truncate text-[11px] font-bold tracked text-paper/85">{{
              heading()
            }}</span>
            @if (!open()) {
              <span class="mt-0.5 block truncate text-[10px]" [class]="summaryClass()">{{
                summary()
              }}</span>
            }
          </span>
        </span>

        <span class="flex shrink-0 items-center gap-2.5">
          <span class="text-[10px] tracked" [class]="rarityClass()">{{ rarity() }}</span>
          @if (collapsible()) {
            <span class="w-3 text-center text-[13px] leading-none text-paper/45">{{
              open() ? '−' : '+'
            }}</span>
          }
        </span>
      </button>

      @if (open()) {
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

          <hh-face-chooser [slot]="slot()" />

          <hh-stack-picker [slot]="slot()" />

          <div class="border-t-2 border-paper/10 pt-5">
            <div class="border-2 border-dashed border-sun/40 bg-goa-deep px-3 py-3">
              <p class="text-[9px] tracked text-sun/60">BUILDER CLASS</p>
              <p class="mt-1 font-display text-xl leading-tight text-sun">{{ className() }}</p>
              <p class="mt-1 text-[10px] leading-relaxed text-paper/55">{{ classSub() }}</p>
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export class SlotPanel {
  readonly store = inject(StudioStore);

  readonly slot = input.required<Slot>();
  readonly open = input(true);
  readonly collapsible = input(false);
  readonly toggled = output<void>();

  readonly index = computed(() => this.slot() + 1);
  readonly input = computed(() => this.store.inputs()[this.slot()]);
  private readonly photo = computed(() => this.store.photos()[this.slot()]);

  private readonly klass = computed(() => {
    const list = this.store.classes();
    return list[this.slot()] ?? list[0];
  });

  readonly className = computed(() => this.klass()?.title ?? '');
  readonly classSub = computed(() => this.klass()?.subtitle ?? '');
  readonly rarity = computed(() => rarityLabel(this.klass()?.rarity ?? 'COMMON'));

  readonly heading = computed(() => {
    const name = this.input().name.trim();
    return name || `BUILDER ${this.index()}`;
  });

  readonly summary = computed(() => {
    const photo = this.photo();
    const tags = this.input().stack.length;
    const bits: string[] = [];

    if (!this.input().name.trim()) bits.push('no name');
    if (photo.status === 'ready') bits.push('face locked');
    else if (photo.status === 'no-face') bits.push('centred crop');
    else if (photo.status === 'detecting' || photo.status === 'decoding') bits.push('reading…');
    else if (photo.status === 'error') bits.push('upload failed');
    else bits.push('no photo');
    bits.push(tags === 1 ? '1 tag' : `${tags} tags`);

    return bits.join(' · ');
  });

  summaryClass(): string {
    const photo = this.photo();
    const done = !!this.input().name.trim() && !!photo.blob && this.input().stack.length > 0;
    if (photo.status === 'error') return 'text-neon';
    return done ? 'text-sun/80' : 'text-paper/45';
  }

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

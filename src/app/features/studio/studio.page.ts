import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { LAYOUT_NAME } from '../../domain/layout';
import { StudioStore } from '../../state/studio.store';
import { CrewPicker } from './crew-picker';
import { ExportBar } from './export-bar';
import { SheetPreview } from './sheet-preview';
import { SlotPanel } from './slot-panel';

@Component({
  selector: 'hh-studio-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrewPicker, SlotPanel, SheetPreview, ExportBar],
  host: { '(document:paste)': 'onPaste($event)' },
  template: `
    <div class="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 sm:py-10">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="font-display text-4xl leading-none text-sun sm:text-5xl">THE STUDIO</h1>
          <p class="mt-1 text-[11px] tracked text-paper/50">
            {{ LAYOUT[store.crew()] }} SHEET · ONE CARD FOR THE WHOLE CREW
          </p>
        </div>
        <p class="text-[10px] tracked text-paper/35">
          PASTE AN IMAGE ANYWHERE TO FILL THE NEXT EMPTY SLOT
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-8">
        <div class="order-2 space-y-5 lg:order-1">
          <hh-crew-picker />

          @for (slot of store.activeSlots(); track slot) {
            <hh-slot-panel [slot]="slot" />
          }

          @if (store.crew() < 3) {
            <button
              type="button"
              (click)="addBuilder()"
              class="press w-full border-2 border-dashed border-paper/30 py-3 text-[11px] tracked text-paper/50 hover:border-sun hover:text-sun"
            >
              + ADD BUILDER {{ store.crew() + 1 }}
            </button>
          }
        </div>

        <div class="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          <div class="mx-auto max-w-[1060px] space-y-4">
            <hh-sheet-preview />
            <hh-export-bar />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StudioPage implements OnInit {
  readonly store = inject(StudioStore);
  readonly LAYOUT = LAYOUT_NAME;

  ngOnInit(): void {
    this.store.warmupVision();
  }

  addBuilder(): void {
    const next = this.store.crew() + 1;
    if (next === 2 || next === 3) this.store.setCrew(next);
  }

  onPaste(event: ClipboardEvent): void {
    const file = [...(event.clipboardData?.items ?? [])]
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .find((f): f is File => !!f);
    if (!file) return;

    const target =
      this.store.activeSlots().find((slot) => !this.store.photos()[slot].blob) ??
      this.store.activeSlots()[0];
    void this.store.acceptFile(target, file);
  }
}

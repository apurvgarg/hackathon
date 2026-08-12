import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { SHEET } from '../../domain/palette';
import { StudioStore } from '../../state/studio.store';

@Component({
  selector: 'hh-sheet-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="m-0">
      <div class="relative border-2 border-ink bg-paper hard-shadow">
        <canvas
          #surface
          [width]="width"
          [height]="height"
          class="block h-auto w-full"
          aria-label="Your HH Goa squad sheet"
        ></canvas>

        @if (store.rendering()) {
          <span
            class="absolute right-2 top-2 border-2 border-ink bg-sun px-2 py-1 text-[9px] font-bold tracked text-ink"
            >PRINTING</span
          >
        }

        @if (store.detecting()) {
          <span
            class="absolute left-2 top-2 border-2 border-ink bg-neon px-2 py-1 text-[9px] font-bold tracked text-paper"
            >DETECTING FACE</span
          >
        }
      </div>

      <figcaption
        class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] tracked text-paper/45"
      >
        <span>{{ width }}×{{ height }} · EXPORTS AT 2× · {{ store.spec().receipt.serial }}</span>
        <span>{{ store.filledCount() }}/{{ store.crew() }} PHOTOS</span>
      </figcaption>
    </figure>
  `,
})
export class SheetPreview {
  readonly store = inject(StudioStore);
  readonly width = SHEET.w;
  readonly height = SHEET.h;

  private readonly surface = viewChild.required<ElementRef<HTMLCanvasElement>>('surface');

  constructor() {
    afterRenderEffect(() => {
      const bitmap = this.store.preview();
      const canvas = this.surface().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (!bitmap) {
        ctx.fillStyle = '#FFFBE8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    });
  }
}

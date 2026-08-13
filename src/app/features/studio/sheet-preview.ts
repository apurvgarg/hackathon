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
            class="absolute left-2 top-2 flex items-center gap-1.5 border-2 border-ink bg-neon px-2 py-1 text-[9px] font-bold tracked text-paper"
          >
            <span
              class="size-2.5 animate-spin rounded-full border-2 border-paper border-t-transparent"
            ></span>
            FINDING FACE
          </span>
        }
      </div>

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

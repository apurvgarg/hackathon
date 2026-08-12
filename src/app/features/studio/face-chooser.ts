import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PhotoAsset, Slot } from '../../domain/models';
import { StudioStore } from '../../state/studio.store';

const BOX = 54;
const PAD = 1.75;

interface Option {
  index: number;
  width: number;
  height: number;
  left: number;
  top: number;
}

@Component({
  selector: 'hh-face-chooser',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (options().length > 1) {
      <div class="animate-rise border-2 border-neon/50 bg-goa-deep px-3 py-3">
        <p class="mb-2.5 text-[10px] tracked text-neon">
          {{ options().length }} PEOPLE IN THIS PHOTO — WHICH ONE IS YOU?
        </p>

        <div class="flex flex-wrap gap-2.5">
          @for (option of options(); track option.index) {
            <button
              type="button"
              (click)="store.chooseFace(slot(), option.index)"
              [attr.aria-pressed]="photo().chosenFace === option.index"
              [attr.aria-label]="'Use person ' + (option.index + 1)"
              class="press relative block overflow-hidden rounded-full border-[3px] transition"
              [class]="
                photo().chosenFace === option.index
                  ? 'border-sun'
                  : 'border-paper/25 opacity-60 hover:border-neon hover:opacity-100'
              "
              [style.width.px]="box"
              [style.height.px]="box"
            >
              <img
                [src]="photo().url"
                alt=""
                class="pointer-events-none absolute max-w-none"
                [style.width.px]="option.width"
                [style.height.px]="option.height"
                [style.left.px]="option.left"
                [style.top.px]="option.top"
              />
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class FaceChooser {
  readonly store = inject(StudioStore);
  readonly slot = input.required<Slot>();
  readonly box = BOX;

  readonly photo = computed<PhotoAsset>(() => this.store.photos()[this.slot()]);

  readonly options = computed<Option[]>(() => {
    const photo = this.photo();
    if (!photo.url || photo.faces.length < 2) return [];

    return photo.faces.map((face, index) => {
      const span = Math.max(face.w, face.h) * PAD;
      const scale = BOX / span;
      return {
        index,
        width: photo.width * scale,
        height: photo.height * scale,
        left: BOX / 2 - (face.x + face.w / 2) * scale,
        top: BOX / 2 - (face.y + face.h / 2) * scale,
      };
    });
  });
}

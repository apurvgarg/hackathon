import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { PhotoAsset, Slot } from '../../domain/models';
import { StudioStore } from '../../state/studio.store';

@Component({
  selector: 'hh-dropzone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative"
      (dragover)="onDragOver($event)"
      (dragleave)="hover.set(false)"
      (drop)="onDrop($event)"
    >
      <input
        #picker
        type="file"
        accept="image/*,.heic,.heif"
        class="hidden"
        (change)="onPick($event)"
      />

      <button
        type="button"
        (click)="picker.click()"
        class="press flex w-full items-center gap-3 border-2 border-dashed px-4 py-3 text-left"
        [class]="
          hover()
            ? 'border-neon bg-neon/15'
            : busy()
              ? 'border-sun bg-goa-deep'
              : 'border-paper/35 bg-goa-deep hover:border-sun hover:bg-goa-lite/40'
        "
      >
        <span
          class="grid size-11 shrink-0 place-items-center rounded-full border-2"
          [class]="badgeClass()"
        >
          @if (busy()) {
            <span
              class="size-4 animate-spin rounded-full border-2 border-ink border-t-transparent"
            ></span>
          } @else {
            <span class="font-display text-xl leading-none">{{ glyph() }}</span>
          }
        </span>

        <span class="min-w-0 flex-1">
          <span class="block text-[11px] font-bold tracked text-paper">{{ headline() }}</span>
          <span class="mt-0.5 block truncate text-[10px]" [class]="messageClass()">{{
            detail()
          }}</span>
        </span>

        @if (photo().blob) {
          <span
            role="button"
            tabindex="0"
            (click)="clear($event)"
            (keydown.enter)="clear($event)"
            class="shrink-0 border-2 border-paper/30 px-2 py-1 text-[10px] tracked text-paper/60 hover:border-neon hover:text-neon"
            >CLEAR</span
          >
        }
      </button>
    </div>
  `,
})
export class Dropzone {
  private readonly store = inject(StudioStore);

  readonly slot = input.required<Slot>();
  readonly hover = signal(false);

  readonly photo = computed<PhotoAsset>(() => this.store.photos()[this.slot()]);
  readonly busy = computed(() => {
    const status = this.photo().status;
    return status === 'decoding' || status === 'detecting';
  });

  glyph(): string {
    const status = this.photo().status;
    if (status === 'ready') return '✓';
    if (status === 'error') return '!';
    if (status === 'no-face') return '~';
    return '+';
  }

  badgeClass(): string {
    const status = this.photo().status;
    if (status === 'ready') return 'border-ink bg-sun text-ink';
    if (status === 'error') return 'border-ink bg-neon text-paper';
    if (status === 'no-face') return 'border-ink bg-paper-shade text-ink';
    return 'border-paper/40 bg-goa text-paper/70';
  }

  headline(): string {
    const status = this.photo().status;
    if (status === 'empty') return 'DROP A PHOTO';
    if (status === 'decoding') return 'READING FILE';
    if (status === 'detecting') return 'FINDING THE FACE';
    if (status === 'ready') return 'FACE LOCKED';
    if (status === 'no-face') return 'CENTRED CROP';
    return 'UPLOAD FAILED';
  }

  detail(): string {
    const photo = this.photo();
    if (photo.status === 'empty') return 'jpg, png, webp or iphone heic';
    if (photo.message) return photo.message;
    return `${photo.width}×${photo.height}`;
  }

  messageClass(): string {
    const status = this.photo().status;
    if (status === 'ready') return 'text-sun';
    if (status === 'error') return 'text-neon';
    return 'text-paper/50';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.hover.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.hover.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) void this.store.acceptFile(this.slot(), file);
  }

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.store.acceptFile(this.slot(), file);
    input.value = '';
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.store.clearPhoto(this.slot());
  }
}

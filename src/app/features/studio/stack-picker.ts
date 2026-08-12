import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Slot } from '../../domain/models';
import { StudioStore } from '../../state/studio.store';
import { STACK_PRINT_LIMIT, TECH_GROUPS, VIBES } from '../../domain/taxonomy';

@Component({
  selector: 'hh-stack-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <div class="flex items-baseline justify-between">
        <p class="text-[11px] tracked text-paper/60">BEACH BAG</p>
        <p class="text-[10px] tracked text-paper/40">
          {{ chosen().length }} TAGGED
          @if (chosen().length > printLimit) {
            <span class="text-sun/70">· {{ printLimit }} PRINT</span>
          }
        </p>
      </div>

      <div class="max-h-64 space-y-3 overflow-y-auto no-scrollbar pr-1">
        @for (group of groups; track group.id) {
          <div>
            <p class="mb-1.5 text-[9px] tracked-wide text-sun/60">{{ group.label }}</p>
            <div class="flex flex-wrap gap-1.5">
              @for (tag of group.tags; track tag.id) {
                <button
                  type="button"
                  (click)="store.toggleTech(slot(), tag.id)"
                  [attr.aria-pressed]="chosen().includes(tag.id)"
                  class="press rounded-full border-2 px-2.5 py-1 text-[10px] font-bold"
                  [class]="
                    chosen().includes(tag.id)
                      ? 'border-ink bg-sun text-ink'
                      : 'border-paper/30 text-paper/70 hover:border-sun hover:text-sun'
                  "
                >
                  {{ tag.label }}
                </button>
              }
            </div>
          </div>
        }
      </div>

      <div>
        <p class="mb-1.5 text-[9px] tracked-wide text-sun/60">ONE VIBE</p>
        <div class="flex flex-wrap gap-1.5">
          @for (vibe of vibes; track vibe.id) {
            <button
              type="button"
              (click)="store.setVibe(slot(), vibe.id)"
              [attr.aria-pressed]="current() === vibe.id"
              class="press rounded-full border-2 px-2.5 py-1 text-[10px]"
              [class]="
                current() === vibe.id
                  ? 'border-ink bg-neon text-paper'
                  : 'border-paper/25 text-paper/60 hover:border-neon hover:text-neon'
              "
            >
              {{ vibe.label }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class StackPicker {
  readonly store = inject(StudioStore);
  readonly slot = input.required<Slot>();

  readonly groups = TECH_GROUPS;
  readonly vibes = VIBES;
  readonly printLimit = STACK_PRINT_LIMIT;

  readonly chosen = computed(() => this.store.inputs()[this.slot()].stack);
  readonly current = computed(() => this.store.inputs()[this.slot()].vibe);
}

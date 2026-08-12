import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Slot } from '../../domain/models';
import { StudioStore } from '../../state/studio.store';
import { STACK_PRINT_LIMIT, TECH_BY_ID, TECH_GROUPS, VIBES } from '../../domain/taxonomy';

@Component({
  selector: 'hh-stack-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <div class="flex items-baseline justify-between gap-2">
        <p class="text-[11px] tracked text-paper/60">BEACH BAG</p>
        <p class="text-[10px] tracked text-paper/40">
          {{ chosen().length }} TAGGED
          @if (chosen().length > printLimit) {
            <span class="text-sun/70">· {{ printLimit }} PRINT</span>
          }
        </p>
      </div>

      @if (chosen().length) {
        <div class="flex flex-wrap gap-2 border-b-2 border-paper/10 pb-4">
          @for (id of chosen(); track id) {
            <button
              type="button"
              (click)="store.toggleTech(slot(), id)"
              class="press flex items-center gap-1.5 rounded-full border-2 border-ink bg-sun px-2.5 py-1 text-[10px] font-bold text-ink"
            >
              {{ labelOf(id) }}
              <span class="text-neon-deep">✕</span>
            </button>
          }
        </div>
      }

      <input
        type="search"
        [value]="query()"
        (input)="onQuery($event)"
        placeholder="filter — java, spring, aws, figma…"
        class="w-full border-2 border-paper/25 bg-goa-deep px-3 py-2 text-xs text-paper placeholder:text-paper/30 focus:border-sun"
      />

      <div class="max-h-[19rem] space-y-4 overflow-y-auto no-scrollbar pr-1">
        @for (group of visibleGroups(); track group.id) {
          <div>
            <p class="mb-2 text-[9px] tracked-wide text-sun/60">{{ group.label }}</p>
            <div class="flex flex-wrap gap-2">
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
        } @empty {
          <p class="py-4 text-center text-[11px] text-paper/40">
            nothing matches “{{ query() }}”
          </p>
        }
      </div>

      <div class="pt-1">
        <p class="mb-2 text-[9px] tracked-wide text-sun/60">ONE VIBE</p>
        <div class="flex flex-wrap gap-2">
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

  readonly vibes = VIBES;
  readonly printLimit = STACK_PRINT_LIMIT;
  readonly query = signal('');

  readonly chosen = computed(() => this.store.inputs()[this.slot()].stack);
  readonly current = computed(() => this.store.inputs()[this.slot()].vibe);

  readonly visibleGroups = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return TECH_GROUPS;
    return TECH_GROUPS.map((group) => ({
      ...group,
      tags: group.tags.filter(
        (tag) => tag.label.toLowerCase().includes(q) || tag.id.includes(q),
      ),
    })).filter((group) => group.tags.length > 0);
  });

  labelOf(id: string): string {
    return TECH_BY_ID.get(id)?.label ?? id;
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'hh-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex overflow-hidden border-y-2 border-ink bg-sun py-2 select-none">
      <div class="animate-marquee flex shrink-0 whitespace-nowrap">
        @for (item of doubled(); track $index) {
          <span class="mx-5 text-xs font-bold tracked-wide text-ink">{{ item }}</span>
          <span class="text-xs text-neon-deep">◆</span>
        }
      </div>
    </div>
  `,
})
export class Marquee {
  readonly items = input.required<string[]>();
  readonly doubled = computed(() => [...this.items(), ...this.items()]);
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Member } from './team.data';

@Component({
  selector: 'hh-member-sticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group text-center">
      <a
        [href]="member().linkedin"
        target="_blank"
        rel="noopener"
        [attr.aria-label]="member().name + ' on LinkedIn'"
        class="block"
      >
        <div
          class="relative mx-auto grid aspect-square w-full max-w-[210px] place-items-center rounded-[46%_54%_52%_48%/48%_46%_54%_52%] border-[7px] border-paper bg-goa-deep shadow-[0_14px_34px_-10px_rgba(4,34,15,0.65)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-[1.04]"
          [style.rotate]="tilt()"
        >
          <span
            class="absolute inset-0 rounded-[46%_54%_52%_48%/48%_46%_54%_52%] border-[3px] border-dashed border-neon"
          ></span>

          @if (member().photo) {
            <img
              [src]="member().photo"
              [alt]="member().name"
              class="size-full rounded-[46%_54%_52%_48%/48%_46%_54%_52%] object-cover"
            />
          } @else {
            <span class="font-display text-6xl leading-none text-sun">{{ initials() }}</span>
          }

          <span
            class="absolute -left-2 -top-2 grid size-9 place-items-center rounded-full border-2 border-paper bg-goa text-[11px] font-bold text-sun"
            >{{ badge() }}</span
          >
        </div>
      </a>

      <h3 class="mt-6 font-display text-3xl leading-none text-sun">{{ member().name }}</h3>
      <p class="mt-1.5 text-[11px] tracked text-paper/75">{{ member().title }}</p>
      <p class="mt-0.5 text-[10px] tracked text-paper/40">{{ member().location }}</p>

      <p class="mx-auto mt-3 max-w-[280px] text-[12px] leading-relaxed text-paper/60">
        {{ member().note }}
      </p>

      <a
        [href]="member().linkedin"
        target="_blank"
        rel="noopener"
        class="mt-3 inline-block border-b-2 border-dashed border-paper/25 pb-0.5 text-[10px] tracked text-paper/50 transition hover:border-neon hover:text-neon"
        >LINKEDIN ↗</a
      >
    </article>
  `,
})
export class MemberSticker {
  readonly member = input.required<Member>();
  readonly index = input.required<number>();

  readonly badge = computed(() => String(this.index() + 1).padStart(2, '0'));
  readonly tilt = computed(() => `${[-6, 4, -3][this.index() % 3]}deg`);

  readonly initials = computed(() => {
    const parts = this.member().name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MemberSticker } from './member-sticker';
import { Member, TEAM, TEAM_NAME, TEAM_NOTE } from './team.data';

@Component({
  selector: 'hh-about-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MemberSticker],
  template: `
    <section class="scroll-mt-24 border-t-2 border-ink/25 bg-goa pb-14 pt-20 sm:pb-20 sm:pt-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <header class="mb-12 text-center">
          <p class="text-[11px] tracked-wide text-sun/60">
            {{ label() }}
          </p>
          <h2 class="mt-2 font-display text-5xl leading-none text-paper sm:text-7xl">
            {{ teamName }}
          </h2>
          <p class="mt-1 text-[11px] tracked text-neon">THE CREW BEHIND THE SHEET</p>
          <p class="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-paper/55">
            {{ note }}
          </p>
        </header>

        <div class="grid gap-12 sm:gap-8" [class]="gridClass()">
          @for (member of members(); track member.linkedin; let i = $index) {
            <hh-member-sticker [member]="member" [index]="i" />
          }
        </div>
      </div>
    </section>
  `,
})
export class AboutSection {
  readonly members = input<Member[]>(TEAM);
  readonly teamName = TEAM_NAME;
  readonly note = TEAM_NOTE;

  readonly count = computed(() => this.members().length);

  readonly label = computed(() => {
    const n = this.count();
    return n === 1 ? 'SOLO ENTRY' : n === 2 ? 'DUO ENTRY' : `TEAM OF ${n}`;
  });

  gridClass(): string {
    const n = this.count();
    if (n === 1) return 'max-w-xs mx-auto';
    if (n === 2) return 'sm:grid-cols-2 max-w-2xl mx-auto';
    return 'sm:grid-cols-3';
  }
}

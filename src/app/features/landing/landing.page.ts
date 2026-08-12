import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutSection } from '../about/about.section';
import { StudioStore } from '../../state/studio.store';
import { Marquee } from '../../ui/marquee';

@Component({
  selector: 'hh-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Marquee, AboutSection],
  template: `
    <section class="relative overflow-hidden bg-goa">
      <div class="halftone paper-grid pointer-events-none absolute inset-0 opacity-30"></div>

      <div
        class="pointer-events-none absolute -right-24 top-8 select-none font-deva text-[22rem] leading-none text-paper/[0.04] sm:text-[30rem]"
      >
        गोवा
      </div>

      <div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p class="text-[11px] tracked-wide text-sun/70">
          BUILDER ID · गोवा · 28–31 OCT 2026
        </p>

        <h1 class="mt-4 font-display text-[3.5rem] leading-[0.86] text-sun sm:text-[7rem]">
          NOT AN<br />
          ID CARD.
        </h1>

        <p class="mt-6 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg">
          A <span class="text-sun">die-cut sticker sheet</span> for Hacker House Goa. Drop a photo,
          it finds your face and cuts around it. Pick a stack, it names your builder class. Bring
          one or two more and the whole crew prints on
          <span class="text-neon">one sheet</span>.
        </p>

        <div class="mt-9 flex flex-wrap items-center gap-3">
          <a
            routerLink="/studio"
            class="press border-2 border-ink bg-sun px-7 py-4 text-xs font-bold tracked text-ink hard-shadow"
            >{{ store.hasWork() ? 'RESUME MY SHEET' : 'PRINT MY SHEET' }}</a
          >
          <a
            href="#how"
            class="border-b-2 border-dashed border-paper/30 pb-1 text-xs tracked text-paper/60 hover:border-neon hover:text-neon"
            >HOW IT WORKS</a
          >
        </div>

        <dl class="mt-14 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          @for (stat of stats; track stat.k) {
            <div>
              <dt class="font-display text-4xl leading-none text-paper">{{ stat.v }}</dt>
              <dd class="mt-1 text-[10px] tracked text-paper/45">{{ stat.k }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>

    <hh-marquee [items]="ticker" />

    <section id="how" class="scroll-mt-24 bg-goa-deep py-16 sm:py-20">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 class="font-display text-5xl leading-none text-sun sm:text-6xl">FOUR STEPS</h2>
        <p class="mt-2 max-w-lg text-sm text-paper/50">
          Everything runs in this tab. Your photo stays on your device.
        </p>

        <ol class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (step of steps; track step.n) {
            <li class="border-2 border-ink bg-goa p-5 hard-shadow">
              <span class="font-display text-5xl leading-none text-sun/30">{{ step.n }}</span>
              <h3 class="mt-2 text-xs font-bold tracked text-paper">{{ step.t }}</h3>
              <p class="mt-2 text-[12px] leading-relaxed text-paper/55">{{ step.d }}</p>
            </li>
          }
        </ol>
      </div>
    </section>

    <section class="border-y-2 border-ink/25 bg-goa py-16 sm:py-20">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 class="font-display text-5xl leading-none text-paper sm:text-6xl">
          ONE SHEET.<br />
          <span class="text-sun">ONE, TWO OR THREE BUILDERS.</span>
        </h2>

        <div class="mt-10 grid gap-5 sm:grid-cols-3">
          @for (mode of modes; track mode.n) {
            <article class="border-2 border-ink bg-goa-deep p-6 hard-shadow">
              <div class="flex items-baseline justify-between">
                <span class="font-display text-6xl leading-none text-sun">{{ mode.n }}</span>
                <span class="text-[11px] font-bold tracked text-neon">{{ mode.name }}</span>
              </div>
              <p class="mt-3 text-[12px] leading-relaxed text-paper/60">{{ mode.d }}</p>
            </article>
          }
        </div>

        <p class="mt-8 max-w-2xl text-sm leading-relaxed text-paper/50">
          Switch sizes whenever you like. Everything you already typed and uploaded stays exactly
          where you left it.
        </p>
      </div>
    </section>

    <hh-about-section />

    <section class="bg-goa-deep py-16">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 class="font-display text-5xl leading-none text-sun sm:text-6xl">
          GO GET YOUR SHEET
        </h2>
        <a
          routerLink="/studio"
          class="press mt-8 inline-block border-2 border-ink bg-sun px-8 py-4 text-xs font-bold tracked text-ink hard-shadow"
          >{{ store.hasWork() ? 'BACK TO MY SHEET' : 'OPEN THE STUDIO' }}</a
        >
      </div>
    </section>
  `,
})
export class LandingPage {
  readonly store = inject(StudioStore);

  readonly stats = [
    { v: '1–3', k: 'BUILDERS PER SHEET' },
    { v: '60', k: 'BUILDER CLASSES' },
    { v: '0', k: 'SERVER CALLS' },
    { v: '2×', k: 'EXPORT RESOLUTION' },
  ];

  readonly ticker = [
    'DIE CUT',
    'GLOSS LAMINATE',
    'FACE DETECTED',
    'CUT ON THE LINE',
    '#FRAMEINGOA',
    'GOA 28–31 OCT 2026',
    '1/1 FOIL',
    '2:47 PM STUDIO',
  ];

  readonly steps = [
    {
      n: '01',
      t: 'PICK THE CREW SIZE',
      d: 'Solo, duo or trio. The sheet re-composes itself — a trio prints as a triangle.',
    },
    {
      n: '02',
      t: 'DROP A PHOTO',
      d: 'The detector finds your face, adds headroom above it, and levels the tilt using your eye line. Straight off the camera roll is fine.',
    },
    {
      n: '03',
      t: 'DECLARE YOUR STACK',
      d: 'Tag everything you actually build with. It all scores across five axes to name your builder class — a sharp spike prints foil.',
    },
    {
      n: '04',
      t: 'POST IT',
      d: 'One tap on mobile shares the actual PNG straight into X. No copy-paste dance.',
    },
  ];

  readonly modes = [
    {
      n: '1',
      name: 'SOLO',
      d: 'One oversized die-cut, your name at 96pt, and a locked synergy meter daring you to bring two more.',
    },
    {
      n: '2',
      name: 'DUO',
      d: 'Two stickers overlapping with a dashed seam. Shared stack surfaces along the bottom.',
    },
    {
      n: '3',
      name: 'TRIO',
      d: 'The triangle — problem, solution, market. Scored together, gaps named honestly.',
    },
  ];
}

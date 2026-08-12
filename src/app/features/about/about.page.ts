import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutSection } from './about.section';

@Component({
  selector: 'hh-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AboutSection, RouterLink],
  template: `
    <hh-about-section />

    <section class="border-t-2 border-ink/25 bg-goa-deep py-14">
      <div class="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 class="font-display text-4xl leading-none text-sun">HOW IT IS BUILT</h2>
        <dl class="mt-6 grid gap-5 sm:grid-cols-2">
          @for (row of rows; track row.k) {
            <div class="border-l-2 border-sun/40 pl-4">
              <dt class="text-[11px] tracked text-sun/70">{{ row.k }}</dt>
              <dd class="mt-1 text-sm leading-relaxed text-paper/65">{{ row.v }}</dd>
            </div>
          }
        </dl>

        <a
          routerLink="/studio"
          class="press mt-10 inline-block border-2 border-ink bg-sun px-6 py-3.5 text-xs font-bold tracked text-ink hard-shadow"
          >MAKE YOUR SHEET</a
        >
      </div>
    </section>
  `,
})
export class AboutPage {
  readonly rows = [
    { k: 'FRAMEWORK', v: 'Angular 22, standalone, zoneless, signals only. No state library.' },
    { k: 'BACKEND', v: 'None. Every pixel is composited in the browser.' },
    {
      k: 'FACE DETECTION',
      v: 'BlazeFace on the TFJS WASM backend, in its own worker. Eye landmarks level the crop.',
    },
    {
      k: 'RENDERING',
      v: 'A second worker paints an OffscreenCanvas through a ten-stage painter chain, then hands back an ImageBitmap.',
    },
    {
      k: 'DETERMINISM',
      v: 'No random calls. A seeded PRNG from a hash of your inputs, so the same crew always prints the same sheet.',
    },
    {
      k: 'SHARING',
      v: 'Web Share Level 2 attaches the real PNG. Clipboard and download tiers cover the rest.',
    },
  ];
}

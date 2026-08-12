import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutSection } from './about.section';

@Component({
  selector: 'hh-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AboutSection],
  template: ` <hh-about-section /> `,
})
export class AboutPage {}

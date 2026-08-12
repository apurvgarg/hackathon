import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StudioStore } from './state/studio.store';
import { Toaster } from './ui/toaster';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toaster],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly store = inject(StudioStore);

  ngOnInit(): void {
    this.store.warmupVision();
  }
}

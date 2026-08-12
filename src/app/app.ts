import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ExportActions } from './share/export-actions';
import { StudioStore } from './state/studio.store';
import { Toaster } from './ui/toaster';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toaster],
  templateUrl: './app.html',
})
export class App implements OnInit {
  readonly store = inject(StudioStore);
  readonly actions = inject(ExportActions);
  private readonly router = inject(Router);

  readonly inStudio = signal(false);

  constructor() {
    this.sync();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.sync());
  }

  ngOnInit(): void {
    this.store.warmupVision();
  }

  private sync(): void {
    this.inStudio.set(this.router.url.startsWith('/studio'));
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'hh-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      @for (toast of toasts.items(); track toast.id) {
        <button
          type="button"
          (click)="toasts.dismiss(toast.id)"
          class="press pointer-events-auto animate-rise max-w-md rounded-full border-2 px-5 py-2.5 text-xs tracked hard-shadow-sm"
          [class]="tone(toast.tone)"
        >
          {{ toast.text }}
        </button>
      }
    </div>
  `,
})
export class Toaster {
  readonly toasts = inject(ToastService);

  tone(value: string): string {
    if (value === 'bad') return 'bg-neon border-ink text-paper';
    if (value === 'warn') return 'bg-sun border-ink text-ink';
    return 'bg-paper border-ink text-goa-deep';
  }
}

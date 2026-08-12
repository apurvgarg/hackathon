import { Injectable, signal } from '@angular/core';

export type ToastTone = 'ok' | 'warn' | 'bad';

export interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private ticket = 0;
  readonly items = signal<Toast[]>([]);

  push(text: string, tone: ToastTone = 'ok', ttl = 4200): void {
    const id = ++this.ticket;
    this.items.update((list) => [...list, { id, text, tone }].slice(-3));
    setTimeout(() => this.dismiss(id), ttl);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }
}

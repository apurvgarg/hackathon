import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'गोवा SQUAD SHEET · HH Goa 2026',
    loadComponent: () => import('./features/landing/landing.page').then((m) => m.LandingPage),
  },
  {
    path: 'studio',
    title: 'Studio · गोवा SQUAD SHEET',
    loadComponent: () => import('./features/studio/studio.page').then((m) => m.StudioPage),
  },
  {
    path: 'about',
    title: 'The Crew · गोवा SQUAD SHEET',
    loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage),
  },
  { path: '**', redirectTo: '' },
];

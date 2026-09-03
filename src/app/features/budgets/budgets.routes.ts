import { Routes } from '@angular/router';

export const BUDGETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/budgets-page/budgets-page').then((m) => m.BudgetsPage),
  },
];

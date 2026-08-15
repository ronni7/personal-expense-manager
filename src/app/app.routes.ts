import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./features/expenses/pages/expenses-page/expenses-page').then((m) => m.ExpensesPage),
  },
];

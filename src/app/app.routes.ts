import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';
import { LoginPage } from './auth/pages/login-page/login-page';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./features/expenses/pages/expenses-page/expenses-page').then(
            (m) => m.ExpensesPage,
          ),
      },
      {
        path: 'budgets',
        loadChildren: () =>
          import('./features/budgets/budgets.routes').then((m) => m.BUDGETS_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

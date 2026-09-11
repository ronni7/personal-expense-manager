import { Routes } from '@angular/router';

import { authGuard } from './auth/guards/auth.guard';
import { LoginPage } from './auth/pages/login-page/login-page';
import { ForbiddenPage } from './auth/pages/forbidden-page/forbidden-page/forbidden-page';
import { permissionGuard } from './auth/guards/auth-permission-guard';
import { AppShell } from './layout/app-shell/app-shell';
import { AUTH_PERMISSIONS } from './auth/auth.permissions';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },

  {
    path: 'forbidden',
    component: ForbiddenPage,
  },

  {
    path: '',
    component: AppShell,
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
        canActivate: [permissionGuard(AUTH_PERMISSIONS.budgets.view)],
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

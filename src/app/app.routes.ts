import { Routes } from '@angular/router';

import { authGuard } from './auth/guards/auth.guard';
import { ForbiddenPage } from './auth/pages/forbidden-page/forbidden-page/forbidden-page';
import { LoginPage } from './auth/pages/login-page/login-page';
import { AppShell } from './layout/app-shell/app-shell';

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
        // permission check off for presentational purposes canActivate: [permissionGuard(AUTH_PERMISSIONS.budgets.view)],
        loadChildren: () =>
          import('./features/budgets/budgets.routes').then((m) => m.BUDGETS_ROUTES),
      },

      {
        path: 'knowledge',
        loadChildren: () =>
          import('./features/knowledge/knowledge.routes').then((m) => m.KNOWLEDGE_ROUTES),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

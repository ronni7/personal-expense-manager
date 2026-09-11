import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthState } from '../auth-state/auth.state';
import { AuthPermission } from '../auth.permissions';

export function permissionGuard(role: AuthPermission): CanActivateFn {
  return () => {
    const authState = inject(AuthState);
    const router = inject(Router);

    return authState.hasPermission(role) ? true : router.createUrlTree(['/forbidden']);
  };
}

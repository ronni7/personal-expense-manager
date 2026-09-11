import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { describe, expect, test, vi } from 'vitest';

import { AuthState } from '../auth-state/auth.state';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const authStateMock = {
    isAuthenticated: vi.fn(),
  };

  const routerMock = {
    createUrlTree: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthState,
          useValue: authStateMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });
  });

  test('should allow authenticated user', () => {
    authStateMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  test('should redirect anonymous user to login', () => {
    authStateMock.isAuthenticated.mockReturnValue(false);

    const loginUrlTree = { redirectTo: '/login' };
    routerMock.createUrlTree.mockReturnValue(loginUrlTree);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/budgets' } as RouterStateSnapshot),
    );

    expect(result).toBe(loginUrlTree);

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/budgets',
      },
    });
  });
});

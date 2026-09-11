// @vitest-environment jsdom

import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import 'zone.js';
import 'zone.js/testing';

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type Keycloak from 'keycloak-js';
import { AuthState } from '../auth-state/auth.state';
import { KEYCLOAK } from './keycloak.token';

const keycloakMock: Partial<Keycloak> = {
  init: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  updateToken: vi.fn(),
  clearToken: vi.fn(),

  authenticated: false,
  token: undefined,
  tokenParsed: undefined,
  subject: undefined,
  resourceAccess: undefined,

  onAuthSuccess: undefined,
  onAuthLogout: undefined,
  onAuthRefreshSuccess: undefined,
  onAuthRefreshError: undefined,
};

let AuthService: typeof import('./auth.service').AuthService;
beforeAll(async () => {
  ({ AuthService } = await import('./auth.service'));
});

describe('AuthService', () => {
  let service: import('./auth.service').AuthService;
  const authStateMock = {
    setAuthenticated: vi.fn(),
    setAnonymous: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    keycloakMock.init = vi.fn().mockResolvedValue(false);
    keycloakMock.login = vi.fn().mockResolvedValue(undefined);
    keycloakMock.logout = vi.fn().mockResolvedValue(undefined);
    keycloakMock.updateToken = vi.fn();
    keycloakMock.clearToken = vi.fn();

    keycloakMock.authenticated = false;
    keycloakMock.token = undefined;
    keycloakMock.tokenParsed = undefined;
    keycloakMock.subject = undefined;
    keycloakMock.resourceAccess = undefined;
    keycloakMock.onAuthSuccess = undefined;
    keycloakMock.onAuthLogout = undefined;
    keycloakMock.onAuthRefreshSuccess = undefined;
    keycloakMock.onAuthRefreshError = undefined;

    authStateMock.setAuthenticated.mockReset();
    authStateMock.setAnonymous.mockReset();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthState,
          useValue: authStateMock,
        },
        {
          provide: KEYCLOAK,
          useValue: keycloakMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  test('should initialize Keycloak with expected configuration', async () => {
    keycloakMock.init = vi.fn().mockResolvedValue(false);

    const result = await service.init();

    expect(result).toBe(false);
    expect(keycloakMock.init).toHaveBeenCalledOnce();
    expect(keycloakMock.init).toHaveBeenCalledWith({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
  });

  test('should call mocked Keycloak init', async () => {
    keycloakMock.init = vi.fn().mockResolvedValue(false);

    const initPromise = service.init();

    expect(keycloakMock.init).toHaveBeenCalled();

    await initPromise;
  });

  test('should set anonymous state when user is not authenticated', async () => {
    keycloakMock.init = vi.fn().mockResolvedValue(false);

    await service.init();

    expect(authStateMock.setAnonymous).toHaveBeenCalledOnce();
    expect(authStateMock.setAuthenticated).not.toHaveBeenCalled();
  });

  test('should set authenticated state when user is authenticated', async () => {
    keycloakMock.init = vi.fn().mockResolvedValue(true);
    keycloakMock.authenticated = true;
    keycloakMock.subject = 'user-1';
    keycloakMock.tokenParsed = {
      preferred_username: 'demo',
      email: 'demo@example.com',
      given_name: 'Demo',
      family_name: 'User',
    } as Record<string, string | undefined>;
    keycloakMock.resourceAccess = {
      'personal-expense-manager': {
        roles: ['expenses:view', 'budgets:view'],
      },
    };

    await service.init();

    expect(authStateMock.setAuthenticated).toHaveBeenCalledWith(
      {
        id: 'user-1',
        username: 'demo',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
      },
      ['expenses:view', 'budgets:view'],
    );

    expect(authStateMock.setAnonymous).not.toHaveBeenCalled();
  });

  test('should register Keycloak authentication callbacks', async () => {
    keycloakMock.init = vi.fn().mockResolvedValue(false);

    await service.init();

    expect(keycloakMock.onAuthSuccess).toEqual(expect.any(Function));
    expect(keycloakMock.onAuthLogout).toEqual(expect.any(Function));
    expect(keycloakMock.onAuthRefreshSuccess).toEqual(expect.any(Function));
    expect(keycloakMock.onAuthRefreshError).toEqual(expect.any(Function));
  });

  describe('login', () => {
    test('should delegate login to Keycloak', async () => {
      keycloakMock.login = vi.fn().mockResolvedValue(undefined);

      await service.login();

      expect(keycloakMock.login).toHaveBeenCalledWith({
        redirectUri: window.location.origin,
      });
    });

    test('should use custom redirect URI', async () => {
      keycloakMock.login = vi.fn().mockResolvedValue(undefined);

      await service.login('/expenses');

      expect(keycloakMock.login).toHaveBeenCalledWith({
        redirectUri: '/expenses',
      });
    });
  });

  describe('logout', () => {
    test('should delegate logout to Keycloak', async () => {
      keycloakMock.logout = vi.fn().mockResolvedValue(undefined);

      await service.logout();

      expect(keycloakMock.logout).toHaveBeenCalledWith({
        redirectUri: window.location.origin,
      });
    });
  });

  describe('getValidToken', () => {
    test('should return undefined when user is not authenticated', async () => {
      keycloakMock.authenticated = false;

      const result = await service.getValidToken();

      expect(result).toBeUndefined();
      expect(keycloakMock.updateToken).not.toHaveBeenCalled();
    });

    test('should return current token when token is valid', async () => {
      keycloakMock.authenticated = true;
      keycloakMock.token = 'access-token';
      keycloakMock.updateToken = vi.fn().mockResolvedValue(false);

      const result = await service.getValidToken();

      expect(result).toBe('access-token');
      expect(keycloakMock.updateToken).toHaveBeenCalledWith(30);
    });

    test('should return refreshed token when token is refreshed', async () => {
      keycloakMock.authenticated = true;
      keycloakMock.token = 'new-token';

      keycloakMock.updateToken = vi.fn().mockImplementation(async () => {
        keycloakMock.token = 'new-token';
        return true;
      });

      const result = await service.getValidToken();

      expect(result).toBe('new-token');
      expect(keycloakMock.updateToken).toHaveBeenCalledWith(30);
    });

    test('should clear authentication state when refresh fails', async () => {
      keycloakMock.authenticated = true;

      const refreshError = new Error('Refresh failed');
      keycloakMock.updateToken = vi.fn().mockRejectedValue(refreshError);

      const result = await service.getValidToken();

      expect(result).toBeUndefined();
      expect(keycloakMock.clearToken).toHaveBeenCalledOnce();
      expect(authStateMock.setAnonymous).toHaveBeenCalledOnce();
    });

    test('should share refresh operation between concurrent calls', async () => {
      keycloakMock.authenticated = true;
      keycloakMock.token = 'shared-token';

      let resolveRefresh!: (value: boolean) => void;

      const refreshPromise = new Promise<boolean>((resolve) => {
        resolveRefresh = resolve;
      });

      keycloakMock.updateToken = vi.fn().mockReturnValue(refreshPromise);

      const firstRequest = service.getValidToken();
      const secondRequest = service.getValidToken();
      const thirdRequest = service.getValidToken();

      expect(keycloakMock.updateToken).toHaveBeenCalledOnce();

      resolveRefresh(true);

      const results = await Promise.all([firstRequest, secondRequest, thirdRequest]);

      expect(results).toEqual(['shared-token', 'shared-token', 'shared-token']);
    });

    test('should allow a new refresh after previous refresh completes', async () => {
      keycloakMock.authenticated = true;
      keycloakMock.token = 'token';
      keycloakMock.updateToken = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true);

      await service.getValidToken();
      await service.getValidToken();

      expect(keycloakMock.updateToken).toHaveBeenCalledTimes(2);
    });
  });

  describe('authentication callbacks', () => {
    test('should update authenticated state after auth success', async () => {
      keycloakMock.init = vi.fn().mockResolvedValue(false);

      await service.init();

      keycloakMock.authenticated = true;
      keycloakMock.subject = 'user-1';
      keycloakMock.tokenParsed = {
        preferred_username: 'demo',
        email: 'demo@example.com',
        given_name: 'Demo',
        family_name: 'User',
      } as Record<string, string | undefined>;
      keycloakMock.resourceAccess = {
        'personal-expense-manager': {
          roles: ['budgets:view'],
        },
      };

      keycloakMock.onAuthSuccess?.();

      expect(authStateMock.setAuthenticated).toHaveBeenCalledWith(
        {
          id: 'user-1',
          username: 'demo',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
        },
        ['budgets:view'],
      );
    });

    test('should set anonymous after logout', async () => {
      keycloakMock.init = vi.fn().mockResolvedValue(false);

      await service.init();

      keycloakMock.onAuthLogout?.();

      expect(authStateMock.setAnonymous).toHaveBeenCalled();
    });

    test('should update authenticated state after token refresh', async () => {
      keycloakMock.init = vi.fn().mockResolvedValue(false);

      await service.init();

      keycloakMock.authenticated = true;
      keycloakMock.subject = 'user-1';
      keycloakMock.tokenParsed = {
        preferred_username: 'demo',
      } as Record<string, string | undefined>;
      keycloakMock.resourceAccess = {
        'personal-expense-manager': {
          roles: ['expenses:view'],
        },
      };

      keycloakMock.onAuthRefreshSuccess?.();

      expect(authStateMock.setAuthenticated).toHaveBeenCalled();
    });

    test('should handle refresh error as authentication failure', async () => {
      keycloakMock.init = vi.fn().mockResolvedValue(false);

      await service.init();

      authStateMock.setAnonymous.mockClear();

      keycloakMock.onAuthRefreshError?.();

      expect(keycloakMock.clearToken).toHaveBeenCalledOnce();
      expect(authStateMock.setAnonymous).toHaveBeenCalledOnce();
    });
  });

  describe('handleAuthenticationFailure', () => {
    test('should clear Keycloak token and authentication state', () => {
      service.handleAuthenticationFailure();

      expect(keycloakMock.clearToken).toHaveBeenCalledOnce();
      expect(authStateMock.setAnonymous).toHaveBeenCalledOnce();
    });
  });
});

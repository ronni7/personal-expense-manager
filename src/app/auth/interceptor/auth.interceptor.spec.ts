import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { authConfig } from '../auth.config';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const authServiceMock = {
    getValidToken: vi.fn(),
    handleAuthenticationFailure: vi.fn(),
  };

  beforeEach(() => {
    authServiceMock.getValidToken.mockReset();
    authServiceMock.handleAuthenticationFailure.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  test('should attach Authorization header to protected resource', async () => {
    authServiceMock.getValidToken.mockResolvedValue('access-token');

    http.get(authConfig.protectedResourceUrls[0]).subscribe();

    await Promise.resolve();

    const request = httpMock.expectOne(authConfig.protectedResourceUrls[0]);

    expect(request.request.headers.get('Authorization')).toBe('Bearer access-token');

    expect(authServiceMock.getValidToken).toHaveBeenCalledOnce();

    request.flush({
      preferred_username: 'demo',
    });
  });

  test('should not attach Authorization header to unprotected resource', () => {
    http.get('/assets/config.json').subscribe();

    const request = httpMock.expectOne('/assets/config.json');

    expect(request.request.headers.has('Authorization')).toBe(false);

    expect(authServiceMock.getValidToken).not.toHaveBeenCalled();

    request.flush({});
  });

  test('should send request without Authorization when token is unavailable', async () => {
    authServiceMock.getValidToken.mockResolvedValue(undefined);

    http.get(authConfig.protectedResourceUrls[0]).subscribe();

    await Promise.resolve();

    const request = httpMock.expectOne(authConfig.protectedResourceUrls[0]);

    expect(request.request.headers.has('Authorization')).toBe(false);

    expect(authServiceMock.getValidToken).toHaveBeenCalledOnce();

    request.flush({});
  });

  test('should handle 401 response as authentication failure', async () => {
    authServiceMock.getValidToken.mockResolvedValue('access-token');

    let receivedError: unknown;

    http.get(authConfig.protectedResourceUrls[0]).subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    await Promise.resolve();

    const request = httpMock.expectOne(authConfig.protectedResourceUrls[0]);

    request.flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(authServiceMock.handleAuthenticationFailure).toHaveBeenCalledOnce();

    expect(receivedError).toBeTruthy();
  });
});

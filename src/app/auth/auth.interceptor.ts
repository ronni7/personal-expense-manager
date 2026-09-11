import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, from, switchMap, throwError } from 'rxjs';

import { AuthService } from './services/auth.service';
import { authConfig } from './auth.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // TODO
  const isProtectedResource = authConfig.protectedResourceUrls.some((url) =>
    req.url.startsWith(url),
  );

  if (!isProtectedResource) {
    return next(req);
  }

  return from(authService.getValidToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const authenticatedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(authenticatedRequest);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.handleAuthenticationFailure();
      }

      return throwError(() => error);
    }),
  );
};

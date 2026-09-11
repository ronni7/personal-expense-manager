import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './auth/services/auth.service';
import { authInterceptor } from './auth/interceptor/auth.interceptor';
import { KEYCLOAK } from './auth/services/keycloak.token';
import { keycloakConfig } from './auth/auth.config';
import Keycloak from 'keycloak-js';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: KEYCLOAK,
      useFactory: () => new Keycloak(keycloakConfig),
    },

    provideAppInitializer(() => {
      const authService = inject(AuthService);

      return authService.init();
    }),

    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    {
      provide: LOCALE_ID,
      useValue: 'pl-PL',
    },
  ],
};

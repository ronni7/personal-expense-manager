import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideAppInitializer(() => {
      const authService = inject(AuthService);

      return authService.init();
    }),

    provideRouter(routes),

    {
      provide: LOCALE_ID,
      useValue: 'pl-PL',
    },
  ],
};

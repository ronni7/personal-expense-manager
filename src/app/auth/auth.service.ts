import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

import { keycloakConfig } from './auth.config';
import { AuthState } from './auth.state';
import type { AuthUser } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly keycloak = new Keycloak(keycloakConfig);
  private readonly authState = inject(AuthState);

  async init(): Promise<boolean> {
    this.registerKeycloakCallbacks();

    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    if (authenticated) {
      this.updateAuthenticatedState();
    } else {
      this.authState.setAnonymous();
    }

    return authenticated;
  }

  async login(redirectUri = window.location.origin): Promise<void> {
    await this.keycloak.login({
      redirectUri,
    });
  }

  async logout(): Promise<void> {
    await this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }
  private updateAuthenticatedState(): void {
    const token = this.keycloak.tokenParsed;

    if (!token || !this.keycloak.authenticated) {
      this.authState.setAnonymous();
      return;
    }

    const user: AuthUser = {
      id: this.keycloak.subject ?? '',
      username: token['preferred_username'] ?? '',
      email: token['email'] ?? null,
      firstName: token['given_name'] ?? null,
      lastName: token['family_name'] ?? null,
    };

    const roles = this.keycloak.resourceAccess?.[keycloakConfig.clientId]?.roles ?? [];

    this.authState.setAuthenticated(user, roles);
  }

  private registerKeycloakCallbacks(): void {
    this.keycloak.onAuthSuccess = () => {
      this.updateAuthenticatedState();
    };

    this.keycloak.onAuthLogout = () => {
      this.authState.setAnonymous();
    };

    this.keycloak.onAuthRefreshSuccess = () => {
      this.updateAuthenticatedState();
    };

    this.keycloak.onAuthRefreshError = () => {
      this.authState.setAnonymous();
    };
  }
}

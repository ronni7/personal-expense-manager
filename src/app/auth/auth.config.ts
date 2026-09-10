import type { KeycloakConfig } from 'keycloak-js';

export const keycloakConfig: KeycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'PEM',
  clientId: 'personal-expense-manager',
};

export const authConfig = {
  protectedResourceUrls: ['http://localhost:8080/realms/PEM/protocol/openid-connect/userinfo'],
} as const;

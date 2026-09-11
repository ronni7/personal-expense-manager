# ADR: Authentication and Authorization with Keycloak

- **Status:** Accepted
- **Date:** 2026-09-11
- **Decision owners:** Project team
- **Scope:** Frontend authentication and authorization

## Context

Personal Expense Manager requires authentication and authorization capabilities, but the project currently does not have its own backend API.

Implementing OAuth 2.0 / OpenID Connect directly inside the Angular application would introduce unnecessary complexity and would duplicate functionality already provided by established identity providers.

The application also needs to demonstrate production-oriented authentication patterns, including:

- OpenID Connect authentication,
- Authorization Code Flow with PKCE,
- token lifecycle management,
- role-based authorization,
- protected routes,
- authenticated HTTP requests,
- token refresh,
- centralized authentication failure handling.

## Decision

Keycloak is used as the Identity Provider for PEM.

The Angular application is configured as a public OpenID Connect client using the Authorization Code Flow with PKCE (`S256`).

The application uses the official `keycloak-js` adapter.

Authentication responsibilities are isolated behind an application-level `AuthService`, while reactive authentication state is exposed through `AuthState` using Angular Signals.

The Keycloak instance is provided through Angular Dependency Injection using an `InjectionToken`, allowing the real Keycloak implementation to be replaced by a mock during testing without mocking the external module globally.

Authorization is based on Keycloak client roles, which are mapped to application permissions.

Angular uses:

- `authGuard` for authentication-based route protection,
- `permissionGuard` for permission-based route protection,
- permission checks for conditional UI rendering,
- an HTTP interceptor for attaching access tokens to explicitly configured protected resources.

Access tokens are kept in the Keycloak adapter rather than persisted in browser storage.

Before protected HTTP requests, the application calls `updateToken()` to refresh the access token when it is close to expiration.

Concurrent refresh operations are coordinated using a shared in-flight promise to avoid multiple simultaneous token refresh requests.

## Consequences

### Positive

- Authentication is delegated to a dedicated identity provider rather than implemented manually.
- OAuth/OIDC protocol handling remains outside application business logic.
- PKCE is used for the browser-based public client.
- Authentication logic is centralized and easier to test.
- Keycloak can be replaced or adapted without exposing its API throughout the application.
- Roles and permissions can be managed externally from the Angular application.
- Token refresh and authenticated HTTP requests are handled centrally.
- Angular authorization logic remains reusable across routes and UI components.
- The current implementation provides realistic authentication and authorization patterns despite the absence of a backend.

### Negative

- The application becomes dependent on Keycloak and `keycloak-js`.
- Authentication cannot be fully exercised without running the Keycloak infrastructure.
- Frontend authorization does not provide real resource security.
- Without a backend, JWT validation and server-side authorization cannot be demonstrated.
- Local development requires additional infrastructure.

## Security considerations

Client-side route guards and permission checks are not considered a security boundary.

A future PEM backend must independently:

1. validate the access token,
2. validate issuer, audience and token lifetime,
3. enforce authorization for protected resources,
4. reject unauthorized operations with appropriate HTTP status codes.

The frontend implementation is therefore responsible primarily for authentication state, navigation control and user experience, while the backend must enforce actual resource authorization.

## Alternatives considered

### Custom authentication implementation

Rejected.

Implementing authentication and token handling directly in Angular would unnecessarily duplicate established OAuth/OIDC functionality and introduce significant security risk.

### OAuth/OIDC library without an Identity Provider

Rejected for the current project.

A browser client still requires a real authorization server / identity provider to provide authentication and issue tokens.

### Storing access tokens in `localStorage`

Rejected.

Persistent browser storage increases the impact of successful script injection and is unnecessary for the current Keycloak adapter-based implementation.

### Custom application-level authentication mock

Rejected as the primary implementation.

A mock would be useful for isolated tests, but it would not demonstrate a realistic production authentication flow.

## Out of scope

The current implementation does not include:

- a PEM backend,
- server-side JWT validation,
- server-side authorization,
- database-backed identity management,
- production Keycloak deployment,
- multi-tenant identity management.

Those concerns may be addressed in future iterations.

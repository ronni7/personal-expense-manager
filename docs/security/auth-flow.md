# PEM Authentication & Authorization Flow

## 1. Identity Provider

PEM does not implement authentication itself. Keycloak acts as the Identity Provider (IdP).

```text
Angular SPA
    ↓
Keycloak
```

Keycloak is responsible for:

- authenticating the user,
- maintaining the authentication session,
- issuing tokens,
- managing roles.

The Angular application integrates with Keycloak through `keycloak-js`.

---

## 2. OIDC Authorization Code + PKCE

The application is configured as a public OpenID Connect client.

Login flow:

```text
Angular
  ↓
Keycloak authorization endpoint
  ↓
Username + password
  ↓
Authorization Code
  ↓
Angular
  ↓
Code exchange + PKCE
  ↓
Access Token + Refresh Token
```

PEM uses:

```text
response_type = code
code_challenge_method = S256
```

The SPA does not contain a client secret.

---

## 3. Access Token

The access token is a JWT.

Its payload contains claims describing the authenticated user and authorization information.

For PEM client roles, the relevant structure is:

```json
{
  "resource_access": {
    "personal-expense-manager": {
      "roles": ["expenses:view", "expenses:edit", "budgets:view"]
    }
  }
}
```

The JWT payload is encoded, not encrypted, so it must not contain sensitive information that should remain secret.

---

## 4. Authentication State

`AuthService` owns the integration with `keycloak-js`.

`AuthState` is the Angular-facing reactive representation of authentication state.

```text
Keycloak
    ↓
keycloak-js
    ↓
AuthService
    ↓
AuthState (Signals)
    ↓
Angular components / guards
```

`AuthState` contains information such as:

```text
status
user
roles / permissions
isAuthenticated
```

Tokens themselves are not stored in Angular Signals or `localStorage`.

---

## 5. Authentication vs Authorization

These are separate concerns.

### Authentication

Answers:

> Who is the user?

Examples:

```text
authenticated
anonymous
current user
session state
```

### Authorization

Answers:

> What is the user allowed to do?

PEM uses Keycloak client roles and maps them to application permissions.

```text
Keycloak role
    ↓
Application permission
```

Example:

```text
budgets:view
budgets:manage
```

---

## 6. Route Authorization

The application uses two guards.

### `authGuard`

Checks whether the user is authenticated.

```text
anonymous
    ↓
authGuard
    ↓
/login
```

### `permissionGuard`

Checks whether an authenticated user has the required permission.

```text
authenticated
    ↓
permissionGuard('budgets:view')
    ↓
allowed → requested page
denied  → /forbidden
```

This gives:

```text
401-style situation
→ user is not authenticated

403-style situation
→ user is authenticated but lacks permission
```

---

## 7. UI Authorization

Permissions are also used to control the UI.

Example:

```html
@if (authState.hasPermission(permissions.budgets.manage)) {
<button>Add Budget</button>
}
```

This improves the user experience, but it is not a security boundary.

A malicious user can modify client-side JavaScript or requests.

Real resource authorization must ultimately be enforced by the backend.

---

## 8. HTTP Interceptor

The Angular HTTP interceptor adds the access token to requests targeting protected resources.

```text
HttpClient
    ↓
AuthInterceptor
    ↓
AuthService
    ↓
getValidToken()
    ↓
Authorization: Bearer <access_token>
    ↓
Protected resource
```

Only explicitly configured protected resources receive the token.

The application must not blindly attach the PEM access token to arbitrary requests.

---

## 9. Token Refresh

Access tokens are short-lived.

Before a protected request, PEM calls:

```ts
keycloak.updateToken(30);
```

This means:

> Refresh the access token if it expires within the next 30 seconds.

Flow:

```text
Request
  ↓
getValidToken()
  ↓
updateToken(30)
  ├── token is still valid
  │      ↓
  │   existing token
  │
  └── token is close to expiry
         ↓
      refresh token
         ↓
      new access token
  ↓
Authorization header
  ↓
Request
```

---

## 10. Single-Flight Refresh

Multiple HTTP requests can arrive at the same time when the token is close to expiration.

Without coordination:

```text
Request A ──→ refresh
Request B ──→ refresh
Request C ──→ refresh
```

PEM shares the refresh operation:

```text
Request A ──┐
Request B ──┼──→ shared refresh Promise
Request C ──┘
                   ↓
              one updateToken()
                   ↓
              new access token
                   ↓
             A + B + C continue
```

The shared promise is cleared in `finally()`, so the mechanism is reusable after both successful and failed refresh operations.

---

## 11. HTTP 401

A `401 Unauthorized` response indicates an authentication problem.

PEM handles this centrally in the interceptor:

```text
HTTP 401
   ↓
AuthInterceptor
   ↓
AuthService
   ↓
clear authentication state
```

`403 Forbidden` is intentionally different:

```text
authenticated user
        ↓
insufficient permission
        ↓
403 / forbidden
```

The frontend may react to this through routing or UI, but resource authorization must ultimately be enforced by the backend.

---

## 12. Important Architectural Boundary

PEM currently has no backend.

Therefore this project demonstrates:

```text
✅ OIDC authentication
✅ PKCE
✅ token handling
✅ session state
✅ client-side authorization
✅ route protection
✅ UI permissions
✅ HTTP bearer token handling
✅ token refresh
```

It does **not** demonstrate server-side authorization because there is no PEM API yet.

The production architecture would eventually be:

```text
                     Keycloak
                         │
                    authentication
                         │
                         ▼
Angular SPA ──────── access token ────────→ PEM API
                                             │
                                      JWT validation
                                             │
                                        authorization
                                             │
                                             ▼
                                       Protected data
```

The Angular authorization layer should therefore be treated as a UX and navigation layer, not as the final security boundary.

# Personal Expense Manager

Modern Personal Expense Manager built with **Angular 20**, **Signals**, **NgRx Signal Store** and a **feature-first architecture**.

The project is also used as a practical learning project for frontend architecture, authentication, Docker, Nginx and CI/CD.

## Tech Stack

- Angular 20
- TypeScript
- RxJS
- Angular Signals
- NgRx Signal Store
- Angular Material
- Tailwind CSS
- Keycloak
- Nginx
- Docker / Docker Compose
- Vitest

## Running the Project

The recommended way to run PEM is with Docker Compose.

### Prerequisites

Install:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

Docker Desktop includes Docker Engine and Docker Compose.

### 1. Clone the repository

```bash
git clone <this-repo>
cd personal-expense-manager
```

### 2. Start the application

```bash
docker compose up --build
```

The first startup builds the Angular application and starts the required services.

After the containers are ready, open:

**Application**

http://localhost:4200

**Keycloak Admin Console**

http://localhost:8080

## Demo Account

PEM contains a local demo account created automatically during startup:

```text
Username: demo
Password: demo
```

The demo account is created by the Keycloak initialization script and is intended **for local development and demonstration only**.

### Keycloak Admin Account

The local Keycloak instance also uses the default development admin credentials:

```text
Username: admin
Password: admin
```

Do not use these credentials in a production environment.

## Docker Architecture

The application consists of two main services:

```text
                    Docker Compose
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
        ┌──────────┐             ┌───────────┐
        │ Keycloak │             │ Frontend  │
        │          │             │           │
        │ OIDC     │             │ Nginx     │
        │ Auth     │             │ Angular   │
        └────┬─────┘             └─────┬─────┘
             │                         │
       localhost:8080            localhost:4200
```

### Frontend container

The frontend uses a multi-stage Docker build.

```text
Node.js
   │
   ├── npm ci
   ├── Angular build
   │
   ▼
dist/
   │
   ▼
Nginx
   │
   ▼
Angular application
```

Node.js and the Angular build tools are only used during the build stage.

The final runtime image contains Nginx and the generated Angular static files.

### Keycloak container

Keycloak is initialized automatically from:

```text
docker/keycloak/PEM-realm.json
```

The imported realm contains the PEM-specific configuration, including:

- Realm: `PEM`
- Client: `personal-expense-manager`
- Realm role: `budgets:view`

The demo user is provisioned separately by:

```text
docker/keycloak/init-keycloak.sh
```

This keeps user provisioning separate from the realm configuration.

## Authentication

PEM uses Keycloak as an OpenID Connect identity provider.

The Angular application is configured as a public browser client and uses:

- Authorization Code Flow
- PKCE
- PKCE method: `S256`

Local development endpoints:

```text
Angular:
http://localhost:4200

Keycloak:
http://localhost:8080

Realm:
PEM

Client:
personal-expense-manager
```

## Keycloak Initialization

On startup, Docker Compose performs the following steps:

```text
1. Start Keycloak
        │
        ▼
2. Import PEM realm configuration
        │
        ▼
3. Wait until Keycloak is healthy
        │
        ▼
4. Run keycloak-init
        │
        ├── create demo user if it does not exist
        └── ensure demo user is configured correctly
        │
        ▼
5. Start/use the Angular frontend
```

The initialization script is idempotent, so starting the environment again does not create duplicate demo users.

## Project Structure

```text
personal-expense-manager/
│
├── .github/
│   └── workflows/
│
├── docker/
│   └── keycloak/
│       ├── PEM-realm.json
│       └── init-keycloak.sh
│
├── src/
├── public/
│
├── Dockerfile
├── nginx.conf
├── docker-compose.yml
├── .dockerignore
├── package.json
└── README.md
```

## Useful Docker Commands

Check running services:

```bash
docker compose ps
```

View Keycloak logs:

```bash
docker compose logs keycloak
```

View the initialization script logs:

```bash
docker compose logs keycloak-init
```

Follow logs live:

```bash
docker compose logs -f
```

Stop the environment:

```bash
docker compose down
```

Rebuild the frontend image:

```bash
docker compose up --build
```

## Resetting the Local Keycloak Environment

PEM intentionally does not rely on a persistent Keycloak database for the local demo environment.

The realm configuration is stored in the repository and imported automatically.

Therefore, recreating the containers restores the configured PEM environment:

```bash
docker compose down
docker compose up --build
```

This also means that changes made manually in the Keycloak Admin Console are **not treated as persistent project configuration**.

The source of truth for the repository is:

```text
docker/keycloak/PEM-realm.json
docker/keycloak/init-keycloak.sh
docker-compose.yml
```

## Nginx and Angular Routing

Angular is deployed as a static application and served by Nginx.

The Nginx configuration includes SPA fallback routing:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This allows Angular routes such as:

```text
/expenses
/dashboard
```

to work correctly when the page is loaded directly or refreshed.

## Development

Docker is the recommended way to start the complete environment because it provides both the Angular frontend and the Keycloak authentication server.

For frontend-only development, Angular can also be run directly with the project's npm scripts while Keycloak is running separately.

## Security Notice

This repository contains configuration intended for **local development and demonstration**.

The following credentials are intentionally simple:

```text
Keycloak admin: admin / admin
Demo user:      demo / demo
```

Do not reuse them in production environments.

Production deployments should use:

- secure credentials
- HTTPS
- environment-specific configuration
- properly managed secrets
- restricted redirect URIs
- production Keycloak configuration
- a persistent and properly managed database

## License

Add your preferred license here.

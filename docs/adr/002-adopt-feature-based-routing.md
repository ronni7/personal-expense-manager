# ADR-002: Adopt Feature-Based Routing

**Status:** Accepted

**Date:** 2026-08-08

## Context

The application is organized around independent business and application features such as dashboard, expenses, budgets, categories, and settings.

As the application grows, routing configuration can become difficult to maintain if all routes and their implementation details are kept in a single application-level routing file.

We want routing to follow the same ownership boundaries established by the feature-first architecture. Each feature should be responsible for defining its own routes, while the application-level router should only be responsible for composing the top-level route tree.

The application should also avoid loading feature code that is not required for the current view.

## Decision

We adopt **feature-based routing with lazy-loaded feature boundaries**.

The root application routes will define the top-level navigation structure and lazy-load individual features.

For example:

```text
app.routes.ts
    │
    ├── /dashboard ──→ features/dashboard/routes.ts
    ├── /expenses  ──→ features/expenses/routes.ts
    ├── /budgets   ──→ features/budgets/routes.ts
    └── /settings  ──→ features/settings/routes.ts
```

Each feature owns its internal routing configuration.

For example:

```text
features/
└── expenses/
    ├── pages/
    ├── components/
    ├── store/
    ├── api/
    ├── models/
    └── routes.ts
```

The application-level routing configuration should contain only routes necessary to compose the application's top-level navigation.

Feature-specific routes should remain inside the corresponding feature and should not be duplicated in `app.routes.ts`.

The root path `/` will redirect to `/dashboard`, which is the primary application view.

Feature routes will use Angular's lazy-loading mechanisms from the beginning of the project. Lazy loading is treated as a natural architectural boundary between the application shell and individual features rather than as an optimization introduced only after performance problems occur.

## Consequences

### Positive

- Clear ownership of routing configuration.
- Feature implementation and its routes remain colocated.
- Feature boundaries align with lazy-loading boundaries.
- The root routing configuration remains small and easy to understand.
- Features can evolve their internal navigation without unnecessarily modifying application-level routing.
- Unused feature code does not need to be included in the initial application bundle.
- The routing structure scales naturally as new features are introduced.

### Negative

- Routing configuration is distributed across multiple files.
- Developers need to understand the distinction between application-level and feature-level routes.
- Lazy-loaded features introduce additional routing configuration compared with a single flat route definition.
- Some simple routes may require more structure than would be necessary in a very small application.

This decision complements ADR-001 and establishes routing as part of the feature ownership model.

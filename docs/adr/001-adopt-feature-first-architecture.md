# ADR-001: Adopt Feature-First Architecture

**Status:** Accepted

**Date:** 2026-08-08

## Context

The application is expected to grow across multiple business domains, including expenses, budgets, categories, dashboard, and settings.

As the application grows, organizing code primarily by technical type (for example, placing all components, services, models, and pipes in separate global directories) can make related functionality increasingly difficult to locate and maintain.

We want an architecture that provides clear ownership of business functionality, keeps related code close together, and allows individual features to evolve with minimal impact on unrelated parts of the application.

The architecture should also align with Angular's standalone application model and support lazy-loaded feature routes.

## Decision

We adopt a **feature-first architecture** for the application.

Business functionality will be organized into self-contained feature areas under the `features/` directory.

Each feature owns its implementation details, including its pages, components, state management, API communication, models, validators, and routes where applicable.

A typical feature structure is:

```text
features/
└── expenses/
    ├── pages/
    ├── components/
    ├── store/
    ├── api/
    ├── models/
    ├── validators/
    └── routes.ts
```

The application will also maintain separate areas for cross-cutting concerns:

```text
app/
├── core/
├── shared/
├── features/
└── app.routes.ts
```

The following ownership rules apply:

- **Features** own business-specific functionality and domain logic.
- **Core** contains application-wide infrastructure and cross-cutting concerns.
- **Shared** contains reusable functionality that is not specific to a single business feature.
- Features should not depend directly on the internal implementation details of other features.
- Code should only be moved to `shared/` or `core/` when there is a clear architectural reason to do so.
- Feature directories should be created as the corresponding functionality is introduced rather than pre-created without an actual use case.

A type-first structure was considered but rejected because it distributes related functionality across global technical directories and weakens feature ownership.

A more granular vertical-slice approach was also considered but was deemed unnecessarily complex for the current scope of the application.

## Consequences

### Positive

- Clear ownership of business functionality.
- Related code remains close together.
- Easier navigation and maintenance as the application grows.
- Features can evolve with limited impact on unrelated domains.
- Natural boundaries for lazy-loaded routes.
- Clearer separation between business functionality and application infrastructure.
- The structure scales better than a global type-first organization.

### Negative

- The project contains more directories than a simple type-first structure.
- Small features may initially contain only a few files.
- Developers need to understand and respect the boundaries between `core`, `shared`, and `features`.
- Some reusable functionality may require an explicit decision about whether it belongs to a feature, `shared`, or `core`.

The architecture may be refined as the application grows, but changes to these boundaries should be treated as deliberate architectural decisions rather than ad-hoc restructuring.

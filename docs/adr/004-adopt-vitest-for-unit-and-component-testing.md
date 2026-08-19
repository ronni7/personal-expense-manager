# ADR-004: Adopt Vitest for Unit and Component Testing

**Status:** Accepted

**Date:** 2026-08-19

## Context

PEM requires a modern, fast, and maintainable testing setup suitable for an Angular 20 application using standalone APIs, Signals, and NgRx Signal Store.

The project initially contained the traditional Karma/Jasmine testing setup. Vitest was introduced and evaluated in the application through real unit and component tests, including Signal Stores, Angular components, Angular Material tables, and reactive state.

Maintaining both Karma/Jasmine and Vitest would introduce unnecessary complexity and require developers to maintain two testing approaches.

## Decision

We adopt **Vitest** as the primary test runner for unit and component testing.

Vitest will be used for:

- Signal Store unit tests,
- component tests,
- template/rendering tests,
- component integration tests involving Angular Material and other Angular dependencies.

Karma/Jasmine will not be maintained as a second testing stack.

## Rationale

Vitest provides a modern testing API, fast execution, and straightforward mocking with `vi.*` (for example `vi.fn()` and `vi.spyOn()`), making it a good fit for the current Angular testing ecosystem.

The decision was made after using Vitest in the actual PEM codebase rather than relying solely on theoretical comparisons. The resulting test setup proved suitable for both isolated Store tests and higher-level component tests.

## Consequences

The testing architecture is structured as follows:

```text
Angular TestBed
      ↓
    Vitest
      ↓
Unit tests / Component tests
```

- **Store tests**
  State, computed values, transformations and Store behavior.

- **Component tests**
  Rendering, UI states and interaction between components, Stores and Angular dependencies.

- **E2E tests**
  Reserved for future end-to-end user flows.

Vitest-specific APIs such as `vi.fn()`, `vi.spyOn()` and Vitest assertions will be preferred over Jasmine equivalents.

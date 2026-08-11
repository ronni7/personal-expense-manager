# ADR-003: Adopt Angular Material and Tailwind CSS

**Status:** Accepted

**Date:** 2026-08-11

## Context

The application requires a consistent UI foundation that supports accessible components, responsive layouts, and efficient development without tightly coupling the application's visual design to a single component library.

We want to avoid the limitations of relying exclusively on a pre-designed UI framework while also avoiding the unnecessary development effort of building common UI primitives from scratch.

The styling approach should allow the application to evolve visually without requiring large-scale changes when new fields, components, or features are introduced.

## Decision

We adopt **Angular Material** as the primary component library and **Tailwind CSS** as the utility styling and layout framework.

Responsibilities are divided as follows:

```text
Angular Material
    → accessible UI components

Tailwind CSS
    → layout and utility styling

Custom components
    → application-specific abstractions
```

Angular Material will be used for common interactive and accessible UI components such as buttons, form controls, dialogs, menus, tables, and navigation components.

Tailwind CSS will primarily be used for layout, spacing, responsive behavior, and utility-level styling. It should complement Angular Material rather than replace its component implementations.

Custom components will be introduced when they represent meaningful application-specific abstractions or reusable UI patterns. Material components should not be wrapped solely for the purpose of hiding their APIs.

The application will avoid unnecessary customization of framework components. Custom styling should be introduced when there is a clear design or application requirement rather than as a general replacement for the underlying UI library.

The styling approach should remain flexible enough to accommodate future visual changes without requiring structural changes to feature implementations.

## Consequences

### Positive

- Accessible and well-tested UI primitives are available out of the box.
- Responsive layouts can be implemented without creating large amounts of custom CSS.
- Layout and component responsibilities remain clearly separated.
- The application can develop its own visual language on top of Material components.
- Custom components are created only where they provide meaningful application-level abstractions.
- New fields and UI requirements can be introduced without being tightly coupled to a rigid framework-specific layout.
- Development of common UI functionality is significantly faster than building everything from scratch.

### Negative

- The project introduces both Angular Material and Tailwind CSS as dependencies.
- Developers need to understand the responsibilities and boundaries of both styling systems.
- Material components may occasionally require custom styling to match the application's visual design.
- Introducing custom components creates an additional abstraction layer that must be maintained.
- Care is required to avoid duplicating functionality between Material, Tailwind, and custom CSS.

This decision establishes the initial UI and styling strategy. Specific design decisions may be introduced later as the application's visual language develops.

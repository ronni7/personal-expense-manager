# Performance Experiment #1 — Lazy Loading Create Expense

## Summary

The `/expenses` feature initially loaded significantly more JavaScript than necessary because the **Create Expense dialog and its dependencies were part of the initial Expenses page bundle**.

The goal of this experiment was to verify whether moving the dialog behind a lazy-loading boundary would reduce the JavaScript required during the initial `/expenses` navigation.

### Result

The experiment was successful.

- The Expenses page code was reduced from approximately **263 KB** to approximately **53 KB**.
- The Create Expense dialog was moved into a separate lazy-loaded chunk.
- The lazy chunk is **not requested during the initial `/expenses` navigation**.
- The lazy chunk is requested only after clicking **Create Expense**.
- The remaining initial chunks were investigated using `stats.json`, Chrome DevTools Network, Waterfall, and dependency tracing.
- A large shared chunk containing Angular, RxJS, CDK, Signals, and related dependencies was identified and traced further.
- `debug_node.mjs` was found to originate from Angular Core itself, not from application code or the Create Expense feature.
- No further optimization was applied to the shared Angular dependency chunk.

---

## 1. Context

The Personal Expense Manager (PEM) is an Angular 20 application using a feature-first architecture.

The `/expenses` feature contains the Expenses page and the **Create Expense** functionality.

Before the experiment, the Create Expense dialog was part of the eagerly loaded Expenses page dependency graph.

This meant that code required only when creating an expense could potentially be downloaded during the initial `/expenses` navigation.

The performance investigation was performed using:

- Angular production build
- `stats.json`
- Chrome DevTools Network
- Network Waterfall
- Lighthouse

---

## 2. Initial Hypothesis

The initial hypothesis was:

> The Create Expense dialog is unnecessarily included in the initial `/expenses` JavaScript payload and should be moved behind a lazy-loading boundary.

The expected architecture was:

```text
BEFORE

/expenses
└── ExpensesPage
    └── CreateExpenseDialog
        └── ExpenseForm
            └── dependencies
```

The desired architecture was:

```text
AFTER

/expenses
└── ExpensesPage
    └── ExpensesPage dependencies

Create Expense click
└── lazy-loaded chunk
    └── CreateExpenseDialog
        └── ExpenseForm
            └── dialog-specific dependencies
```

---

## 3. Baseline

Bundle analysis showed that the Expenses page contained approximately:

```text
ExpensesPage ≈ 263 KB
```

This indicated that a significant amount of code was being loaded as part of the initial Expenses feature.

The important question was not only the total size, but also **which functionality contributed to that size**.

The Create Expense dialog was identified as functionality that did not need to be available before the user interacted with the page.

---

## 4. Change

The Create Expense functionality was moved behind a lazy-loading boundary.

Instead of eagerly importing the dialog component and its dependencies, the application uses a dynamic import so that the related code is loaded only when the user requests the functionality.

Conceptually:

```ts
const { CreateExpenseDialog } = await import('./create-expense-dialog');
```

The exact implementation is part of the Expenses feature.

The important architectural change was:

```text
eager import
    ↓
initial Expenses bundle
```

changed to:

```text
dynamic import
    ↓
separate lazy chunk
    ↓
loaded on interaction
```

No changes were made to Angular's shared runtime dependencies as part of this experiment.

---

## 5. Bundle Analysis After the Change

After the change, the Expenses page chunk was reduced to approximately:

```text
ExpensesPage ≈ 53 KB
```

Compared with the original:

```text
Before: ≈ 263 KB
After:  ≈ 53 KB
```

This represents a reduction of approximately:

```text
≈ 210 KB
```

or roughly:

```text
≈ 79.8% reduction
```

The resulting Expenses page chunk is approximately **20.2% of its original size**.

The removed functionality was not eliminated from the application. Instead, it was moved into a separate lazy-loaded chunk.

---

## 6. Lazy Chunk Verification

The production build generated a separate chunk for Create Expense:

```text
chunk-UYQKTJEZ.js
```

Network verification showed that this chunk is **not requested during the initial `/expenses` navigation**.

The observed behavior is:

```text
Reload /expenses
    ↓
initial chunks
    ↓
Expenses page rendered

Click "Create Expense"
    ↓
chunk-UYQKTJEZ.js requested
    ↓
Create Expense dialog rendered
```

This confirmed that the lazy-loading boundary is working as intended.

---

## 7. Network and Waterfall Analysis

Initially, the Network **Waterfall** column was hidden, which made it difficult to determine the exact order in which chunks were requested.

After enabling the Waterfall column, the request sequence became visible.

The initial `/expenses` navigation loads several chunks, including:

```text
main-QF4JBOVA.js
chunk-CW3IFV3E.js
chunk-BU2MECFH.js
chunk-7RSZYXBC.js
chunk-VS7NOGWD.js
chunk-WNL7VUUF.js
```

The important observation was:

```text
Reload /expenses
    ↓
initial chunks are downloaded

Click "Create Expense"
    ↓
chunk-UYQKTJEZ.js
```

Therefore, the Create Expense chunk is outside the initial `/expenses` loading path.

---

## 8. Initial Dependency Graph

`stats.json` showed the following relationship around the Dashboard feature:

```text
chunk-BU2MECFH.js
├── chunk-7RSZYXBC.js
├── chunk-VS7NOGWD.js
└── chunk-WNL7VUUF.js
```

`chunk-BU2MECFH.js` is associated with:

```text
src/app/features/dashboard/routes.ts
```

and contains the Dashboard page/store-related code.

Its output size was approximately:

```text
12.5 KB
```

---

## 9. Categories Chunk

`chunk-7RSZYXBC.js` was very small:

```text
≈ 832 B
```

It contains code related to the Categories feature:

```text
category.mapper.ts
category.mock.ts
category-api.service.ts
category.store.ts
```

It also imports:

```text
chunk-VS7NOGWD.js
chunk-WNL7VUUF.js
```

This indicated that the small feature-specific chunks depend on shared application/framework dependencies.

---

## 10. Expenses Store Chunk

`chunk-VS7NOGWD.js` was approximately:

```text
≈ 6 KB
```

It contained primarily Expenses store/API code and NgRx Signals dependencies:

```text
@ngrx/signals
@ngrx/signals-rxjs-interop
@ngrx/operators

expense.mapper.ts
expenses-mock.ts
expense-api-service.ts
expense.store.ts
```

This confirmed that the Expenses store itself was relatively small and was not responsible for the large shared chunk size.

---

## 11. Shared Chunk Investigation

The large shared chunk was:

```text
chunk-WNL7VUUF.js
≈ 213 KB
```

Unlike the feature chunks, this chunk had:

```text
no entryPoint
```

It was imported by multiple output chunks, including:

```text
main-QF4JBOVA.js
chunk-BU2MECFH.js
chunk-UYQKTJEZ.js
chunk-3C2JYZ2O.js
chunk-CW3IFV3E.js
chunk-7RSZYXBC.js
chunk-7WOJ4NZZ.js
chunk-4LMUQCFA.js
```

This established that `WNL7VUUF.js` is an automatically generated **shared dependency chunk**, not a Dashboard-specific or Create Expense-specific chunk.

Conceptually:

```text
             ┌── Dashboard
             ├── Create Expense
             ├── Categories
             ├── other feature chunks
             └── main
                    │
                    ▼
              WNL7VUUF.js
              shared dependencies
```

Because the chunk is shared, it should not be treated as a feature-specific bundle that can simply be lazy-loaded away.

---

## 12. `debug_node.mjs` Investigation

The shared chunk contained:

```text
@angular/core/fesm2022/debug_node.mjs
```

with:

```text
bytesInOutput ≈ 97,745 B
```

The module was present only in:

```text
chunk-WNL7VUUF.js
```

This initially looked suspicious because the module name suggests development/debug functionality.

However, the dependency was traced further.

The investigation showed:

```text
application code
    ↓
@angular/core
    ↓
core.mjs
    ↓
./debug_node.mjs
    ↓
chunk-WNL7VUUF.js
```

The direct import of `debug_node.mjs` comes from Angular Core itself.

There was no application-level import such as:

```ts
import ... from '@angular/core/.../debug_node';
```

and no evidence that Angular Material, CDK, RxJS, or NgRx was directly responsible for importing the module.

Therefore:

> `debug_node.mjs` is part of the Angular Core dependency graph in the current Angular 20 production build.

---

## 13. Why We Did Not Optimize `debug_node.mjs`

The presence of approximately 97.7 KB of `debug_node.mjs` in the shared chunk does not, by itself, prove that this is 97.7 KB of removable or unnecessary code.

The important evidence is:

- the module originates from `@angular/core`,
- it is inside a shared chunk,
- the shared chunk is used by multiple parts of the application,
- there is no application-specific import of `debug_node.mjs`,
- the production build configuration is valid,
- removing the dependency would require changing Angular's internal module graph rather than simply refactoring one feature.

Therefore, no attempt was made to artificially lazy-load or remove the shared chunk.

This investigation was intentionally stopped once the dependency was traced to Angular Core.

---

## 14. Production Build Verification

The project uses Angular's application builder:

```text
@angular/build:application
```

The build configuration contains:

```json
"production": {
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kB",
      "maximumError": "1MB"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "4kB",
      "maximumError": "8kB"
    }
  ],
  "outputHashing": "all"
}
```

The development configuration explicitly contains:

```json
"optimization": false,
"extractLicenses": false,
"sourceMap": true
```

The project's build target has:

```json
"defaultConfiguration": "production"
```

The `serve` target defaults to development, while:

```bash
ng serve --configuration production
```

uses the production build target.

This confirms that the bundle analysis was performed against the intended production configuration rather than an accidentally unoptimized development build.

---

## 15. Final Loading Graph

After the investigation, the important parts of the loading graph can be summarized as:

```text
Initial /expenses
│
├── main-QF4JBOVA.js
│
├── chunk-CW3IFV3E.js
│
├── chunk-BU2MECFH.js
│   ├── chunk-7RSZYXBC.js
│   │   ├── chunk-VS7NOGWD.js
│   │   └── chunk-WNL7VUUF.js
│   │
│   ├── chunk-VS7NOGWD.js
│   └── chunk-WNL7VUUF.js
│
└── chunk-WNL7VUUF.js
    └── shared Angular / RxJS / CDK / Signals dependencies

Create Expense click
│
└── chunk-UYQKTJEZ.js
    └── Create Expense functionality
```

The important architectural boundary is:

```text
Initial page
    ≠
Create Expense dialog
```

The dialog now has its own loading boundary.

---

## 16. Result

### What improved

The primary performance problem identified during the experiment was successfully addressed.

```text
ExpensesPage

Before:
≈ 263 KB

After:
≈ 53 KB
```

This represents approximately:

```text
≈ 210 KB reduction
≈ 79.8% reduction
```

The Create Expense dialog now loads on demand.

Network verification confirmed:

```text
/expenses reload
    → no Create Expense chunk

Create Expense click
    → chunk-UYQKTJEZ.js
```

### What did not change

Angular's shared framework dependencies remain in the shared chunk.

This is expected because those dependencies are used by multiple parts of the application.

`debug_node.mjs` was investigated and traced to Angular Core itself. It was therefore not treated as an application-level optimization opportunity.

---

## 17. Conclusion

The experiment confirmed that the application had a meaningful code-splitting opportunity at the **Create Expense interaction boundary**.

The correct optimization was not to further split Angular's shared runtime dependencies, but to make the feature boundary explicit:

```text
Page rendering
    ↓
load only code required for initial rendering

User interaction
    ↓
load feature-specific functionality
```

The experiment demonstrates an important performance principle:

> Do not optimize bundle size by looking only at the largest chunk. First determine **when the code is needed**, identify the loading boundary, and verify the actual request behavior in the browser.

In this case:

```text
Create Expense
    → not required for initial /expenses
    → moved behind lazy boundary
    → initial page bundle reduced substantially
    → lazy loading verified in Network
```

The investigation of the remaining large shared chunk showed that its largest identified dependency, `debug_node.mjs`, originates from Angular Core itself and is not caused by an application-level dependency mistake.

Therefore:

> **Experiment #1 is considered successful and complete.**

# Performance Investigation #1 — Expenses Rendering & Large Dataset

## Objective

The goal of this experiment was to practice profiling an Angular application using:

- Angular DevTools Profiler
- Chrome DevTools Performance
- Call Tree / Bottom-Up
- Rendering tools
- browser performance metrics

The investigation focused on the `Expenses` feature of the Personal Expense Manager (PEM).

The primary objective was not to optimize the application prematurely, but to identify the actual source of performance costs and distinguish between:

- Angular change detection
- JavaScript execution
- data processing
- DOM rendering
- layout
- paint
- garbage collection
- external browser activity

> **Note:** This document was reconstructed from the profiling session and recorded measurements after the original Performance trace was no longer available. Values should therefore be treated as observed measurements rather than an exported raw profiling artifact.

---

## 1. Angular DevTools — Initial Baseline

The investigation started with Angular DevTools Profiler.

A typical change detection cycle was below the 16.67 ms frame budget for 60 FPS. The most expensive observed cycle reached approximately:

```text
Time spent: 22 ms
Frame rate: 45 FPS
Source: setInterval
```

The visible application components were inexpensive:

```text
_App                  ~0.3 ms
_DashboardPage        ~0.2 ms
_MatSidenavContainer  ~0.1 ms
_AppShell             ~0.1 ms
```

The setInterval source was investigated, but no corresponding setInterval, interval() or timer() implementation was found in the application code.

This meant there was no immediate evidence of an application-level timer causing the observed change detection cycle.

Initial conclusion:

Angular change detection did not appear to be the primary bottleneck for the normal Expenses view.

No component with an obviously excessive change detection cost was identified.

## 2. Chrome Performance — Initial Navigation

Chrome DevTools Performance was then used to profile navigation between Dashboard and Expenses.

The first navigation was consistently more expensive than subsequent navigations.

Observed timings:

| Scenario                   | Approximate total work |
| -------------------------- | ---------------------- |
| First Dashboard → Expenses | ~50–62 ms              |
| Subsequent navigation      | ~20–25 ms              |

The initial navigation contained work associated with creating the Expenses view, including ExpensePage and ExpenseFormComponent.

After the page stabilized, approximately 15 seconds of idle recording showed no continuous background work.

No recurring expensive change detection, timer-driven processing or animation loop was observed.

Conclusion:

The normal Expenses page showed a one-time initialization cost, followed by a significantly cheaper steady state.

There was no evidence of a persistent background performance problem.

## 3. Search Interaction

Search interaction was profiled using Chrome DevTools Performance.

Search resulting in zero matches.

Observed timings:

| Operation         | Time  |
| ----------------- | ----- |
| Keypress handling | ~5 ms |
| Data filtering    | ~6 ms |
| Rendering         | ~8 ms |

Total observed work was approximately:

~19 ms

This slightly exceeds the 16.67 ms frame budget for a 60 FPS frame.

Search resulting in five matches.

After adding additional test data and searching for "o":

| Operation             | Time    |
| --------------------- | ------- |
| Keypress handling     | ~3.5 ms |
| requestAnimationFrame | ~9 ms   |
| Layout / rendering    | ~2 ms   |

Total observed work was approximately:

~14–15 ms

Conclusion:

Search processing was measurable, but did not indicate a significant bottleneck for the current dataset.

Increasing the number of visible results did not cause a dramatic increase in rendering cost at the tested scale.

## 4. Sorting Interaction

Sorting was also profiled.

Typical sorting interactions were in the range:

~8–14 ms

The highest observed case was approximately:

~18 ms

With a large dataset, the total interaction cost was significantly higher because rendering and layout dominated the operation.

Two representative sorting measurements:

| Total interaction | JavaScript | Rendering / Layout / Paint |
| ----------------- | ---------- | -------------------------- |
| ~134 ms           | ~40 ms     | ~94 ms                     |
| ~114 ms           | ~35 ms     | ~79 ms                     |

Repeatedly triggering sorting did not cause progressive degradation or accumulation of background work.

Conclusion:

The sorting operation itself was not identified as the primary bottleneck.

The dominant cost at larger dataset sizes came from updating and rendering the table rather than pure data sorting.

## 5. Stress Test — 100 Generated Expenses

A synthetic dataset was introduced to investigate application scalability.

The fake API intentionally contained a:

```text
delay(500)
```

to simulate backend latency.

This delay was treated separately from frontend CPU and rendering time.

The generated expenses were rendered directly by the Angular Material table without pagination or virtual scrolling.

At this stage, all generated records were rendered to the page.

100 expenses.

The first navigation remained more expensive than subsequent navigations.

Representative measurements:

| Scenario              | Time      |
| --------------------- | --------- |
| First navigation      | ~62 ms    |
| Subsequent navigation | ~24–25 ms |

No persistent background activity was observed after the page stabilized.

## 6. Stress Test — 1000 Generated Expenses

The dataset was increased from 100 to 1000 expenses.

All 1000 records were rendered simultaneously in the Angular Material table.

Observed navigation timings:

| Scenario          | Time               |
| ----------------- | ------------------ |
| Second navigation | ~117 ms JavaScript |
| Third navigation  | ~97 ms JavaScript  |

The layout cost was significantly larger:

| Scenario          | Time           |
| ----------------- | -------------- |
| Second navigation | ~148 ms Layout |
| Third navigation  | ~96 ms Layout  |

Therefore the total browser work for the navigation could reach approximately:

| Scenario          | Time    |
| ----------------- | ------- |
| Second navigation | ~265 ms |
| Third navigation  | ~193 ms |

The JavaScript and Layout costs appeared as separate tasks.

This distinction was important because the performance issue was not a single monolithic Angular task.

## 7. Chrome Performance — Bottom-Up Analysis

Bottom-Up analysis of the expensive JavaScript task showed several representative expensive operations:

```text
~14 ms  add → constructor
        table.mjs

~10 ms  setValue
        dom_renderer.mjs
        → updateTextNode

~7 ms   getNodeInjectable

~6 ms   Garbage Collection
~6 ms   Garbage Collection
```

These measurements indicated significant work associated with:

- Angular Material table instantiation
- DOM text updates
- dependency injection
- temporary object allocation and garbage collection

The call stack also contained framework-level Zone.js operations such as:

```text
invokeTask
runTask
onInvokeTask
onLeave
checkStable
Subject.next
errorContext
```

These entries were treated as framework plumbing rather than evidence that Zone.js itself was responsible for the majority of the execution time.

Important profiling lesson:

A framework function appearing in the call stack does not necessarily mean that the framework function is the root cause of the performance issue.

Further investigation is required to identify the actual work consuming CPU time.

## 8. Control Experiment — 1000 Records, 50 Rendered Rows

To isolate the impact of DOM size, the dataset remained at 1000 records, but only 50 records were passed to the table.

This produced a significant reduction in rendering cost:

| Metric             | Time      |
| ------------------ | --------- |
| JavaScript         | ~24–42 ms |
| Layout / Rendering | ~6–10 ms  |

Compared with rendering all 1000 rows:

| Scenario           | JavaScript | Layout     |
| ------------------ | ---------- | ---------- |
| 1000 rows rendered | ~97–117 ms | ~96–148 ms |

Interpretation:

The comparison strongly indicates that the primary scalability issue is not simply the existence of 1000 expense objects in memory.

The dominant factor is rendering a large number of rows and associated Angular Material / DOM structures simultaneously.

## 9. External Browser Activity

During one profiling session, a significant amount of work was attributed to:

`content_script_bundle.js`

This was identified as browser extension / content-script activity rather than application code.

This demonstrated the importance of profiling applications in a clean browser environment when precise measurements are required.

Third-party browser extensions can observe:

- DOM mutations
- input events
- page content
- application state changes

and may introduce additional work that should not be attributed to the application itself.

Profiling lesson:

Performance traces should be interpreted in the context of the profiling environment.

Unexpected scripts such as `content_script_bundle.js` should be investigated before attributing their cost to Angular or application code.

## 10. Key Findings

### Finding 1 — No persistent background performance issue

After navigation and rendering had stabilized, no continuous expensive work was observed during idle recording.

This ruled out an obvious recurring performance problem such as continuous polling, repeated change detection or an active animation loop.

### Finding 2 — Initial navigation is more expensive

The first navigation to Expenses was consistently more expensive than subsequent navigations.

Observed values:

| Scenario              | Time      |
| --------------------- | --------- |
| First navigation      | ~50–62 ms |
| Subsequent navigation | ~20–25 ms |

This suggests one-time initialization and first-use costs rather than a persistent runtime bottleneck.

### Finding 3 — Search is relatively inexpensive

Typical search interactions remained around:

~14–19 ms

for the tested dataset.

No major bottleneck was identified in the filtering operation.

### Finding 4 — Sorting is not the primary bottleneck

Sorting itself generally stayed around:

~8–14 ms

with an observed worst case of approximately:

~18 ms

At 1000 rendered rows, most of the total interaction time was spent in rendering and layout rather than in JavaScript sorting.

### Finding 5 — DOM size is the dominant scalability problem

Rendering 1000 rows simultaneously caused approximately:

| Metric     | Time       |
| ---------- | ---------- |
| JavaScript | ~97–117 ms |
| Layout     | ~96–148 ms |

while limiting the rendered rows to 50 reduced the cost to approximately:

| Metric     | Time      |
| ---------- | --------- |
| JavaScript | ~24–42 ms |
| Layout     | ~6–10 ms  |

This was the strongest evidence obtained during the investigation.

## 11. Conclusion

The performance investigation did not reveal a significant bottleneck in Angular change detection, search filtering or sorting for the normal dataset.

The stress test did, however, expose a clear scalability limitation:

Rendering a very large number of table rows simultaneously causes substantial JavaScript, DOM and Layout costs.

The problem is therefore primarily related to the amount of UI rendered at once rather than simply the amount of data held in application state.

For a production enterprise application, the appropriate solution would be to limit the number of simultaneously rendered rows using a strategy such as:

- client-side pagination
- server-side pagination
- virtual scrolling

The fake API latency of 500 ms was intentionally used to simulate backend response time and should be considered separately from the frontend CPU/rendering measurements.

No production optimization was implemented as part of this investigation.

The purpose of the exercise was to:

- establish a measurable baseline,
- identify the actual source of performance costs,
- distinguish JavaScript execution from rendering and layout,
- perform a controlled stress test,
- validate the hypothesis with a control experiment,
- avoid premature optimization.

## 12. Performance Profiling Workflow

This investigation reinforced the following profiling workflow:

```text
User-visible symptom
        ↓
Angular DevTools
        ↓
Is Angular change detection expensive?
        ↓
Chrome Performance
        ↓
JS / Rendering / Layout / Paint / GC
        ↓
Call Tree / Bottom-Up
        ↓
Identify the expensive operation
        ↓
Create a controlled experiment
        ↓
Compare measurements
        ↓
Only then implement an optimization
```

The key lesson is:

Measure first, form a hypothesis, validate it with a controlled experiment, and only then optimize.

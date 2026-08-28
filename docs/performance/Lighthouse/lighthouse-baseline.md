# Lighthouse Performance Baseline

## Test Configuration

| Field                    | Value                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL                      | /expenses                                                                                                                                         |
| Test date/time           | 2026-08-27T12:29:39.126Z                                                                                                                          |
| Lighthouse version       | 13.0.2                                                                                                                                            |
| Gather mode              | navigation                                                                                                                                        |
| Host user agent          | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.131.0 Chrome/148.0.7778.280 Electron/42.7.0 Safari/537.36 |
| Network user agent       | Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36                 |
| Benchmark index          | 3450.5                                                                                                                                            |
| Browser/environment      | Host user agent is Electron/Chrome on Windows; network user agent is a mobile Chrome profile                                                      |
| Throttling configuration | No explicit throttling configuration field is present in the JSON                                                                                 |

## Lighthouse Scores

| Category       | Score |
| -------------- | ----: |
| Performance    |  0.94 |
| Accessibility  |     1 |
| Best Practices |     1 |
| SEO            |     1 |

## Performance Metrics

| Metric                          |               Value | Unit        |
| ------------------------------- | ------------------: | ----------- |
| First Contentful Paint (FCP)    |           2270.7305 | millisecond |
| Largest Contentful Paint (LCP)  |            2676.974 | millisecond |
| Total Blocking Time (TBT)       |                13.5 | millisecond |
| Cumulative Layout Shift (CLS)   |                   0 | unitless    |
| Speed Index                     |           2270.7305 | millisecond |
| Interaction to Next Paint (INP) | Not present in JSON | —           |
| Max Potential First Input Delay |                  77 | millisecond |

## Performance Findings

### Measured findings

- Performance category score: 0.94.
- First Contentful Paint: 2270.7305 ms (displayed as 2.3 s).
- Largest Contentful Paint: 2676.974 ms (displayed as 2.7 s).
- Total Blocking Time: 13.5 ms (displayed as 10 ms).
- Cumulative Layout Shift: 0.
- Speed Index: 2270.7305 ms (displayed as 2.3 s).
- Max Potential First Input Delay: 77 ms (displayed as 80 ms).

### Estimated savings

- Audit: `Reduce unused JavaScript`
  - Score: 0
  - Numeric value: 150 ms
  - Display value: "Est savings of 83 KiB"
  - Metric savings: FCP = 150 ms; LCP = 150 ms
  - Overall savings: 84,722 bytes
  - Relevant items:
    - `node:electron/js2c/sandbox_bundle` — total bytes 43,855; wasted bytes 36,536; wasted percent 83.31%
    - `/chunk-33MHLDIH.js` — total bytes 57,830; wasted bytes 26,769; wasted percent 46.29%
    - `/chunk-WAGTDBVM.js` — total bytes 70,170; wasted bytes 21,417; wasted percent 30.52%

- Audit: `JavaScript execution time`
  - Score: 1
  - Numeric value: 268.988 ms
  - Metric savings: TBT = 50 ms
  - Summary: wasted ms = 268.988 ms

### Informational / unscored insights

- `Avoid long main-thread tasks` reported 4 long tasks found.
  - `Unattributable` — duration 109 ms at start time 606.7435 ms
  - `/polyfills-5CFQRCPP.js` — duration 77 ms at start time 2969.974 ms
  - `Unattributable` — duration 52 ms at start time 771.7435 ms
  - `/expenses` — duration 51 ms at start time 715.7435 ms

- `Minimizes main-thread work` reported a total of 678.524 ms of main-thread work.
  - Other: 319.564 ms
  - Script Evaluation: 270.924 ms
  - Style & Layout: 72.408 ms
  - Rendering: 8.196 ms
  - Parse HTML & CSS: 5.684 ms
  - Script Parsing & Compilation: 1.748 ms

- `Diagnostics` reported 10 requests, 6 scripts, 1 stylesheet, 2 fonts, 476 tasks, 6 tasks over 10 ms, 1 task over 25 ms, and 0 tasks over 50 ms/100 ms/500 ms.

## JavaScript Bundle Findings

| Finding                                   | Reported value                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `Reduce unused JavaScript` score          | 0                                                                                                            |
| `Reduce unused JavaScript` numeric value  | 150 ms                                                                                                       |
| Display value                             | "Est savings of 83 KiB"                                                                                      |
| Overall savings (bytes)                   | 84,722                                                                                                       |
| `JavaScript execution time` score         | 1                                                                                                            |
| `JavaScript execution time` numeric value | 268.988 ms                                                                                                   |
| `Minimizes main-thread work` score        | 1                                                                                                            |
| `Minimizes main-thread work` total        | 678.524 ms                                                                                                   |
| Script evaluation total                   | 270.924 ms                                                                                                   |
| Script parsing and compilation total      | 1.748 ms                                                                                                     |
| Total script requests                     | 6                                                                                                            |
| Script transfer size                      | 194,807 bytes                                                                                                |
| Largest JavaScript resources              | `/chunk-WAGTDBVM.js` (70,530 bytes); `/chunk-33MHLDIH.js` (58,190 bytes); `/main-RSIYTOMY.js` (33,840 bytes) |

The JavaScript-specific diagnostics in the JSON identify the following relevant items:

- `Bootup time` reported the following CPU time totals:
  - `Unattributable` — 314.4 ms total, 82.18 ms scripting, 0 ms parse/compile
  - `/expenses` — 162.232 ms total, 10.072 ms scripting, 1.108 ms parse/compile
  - `/chunk-WAGTDBVM.js` — 97.752 ms total, 92.508 ms scripting, 0.18 ms parse/compile
  - `/polyfills-5CFQRCPP.js` — 84.396 ms total, 82.892 ms scripting, 0.048 ms parse/compile

- `Resource summary` reported 10 total requests, 6 script requests, and a total transfer size of 278,536 bytes.

- `Network requests` listed these JavaScript assets in the load:
  - `/chunk-ZZBZXV35.js` — 16,020 bytes transferred; resource size 58,035 bytes
  - `/chunk-WAGTDBVM.js` — 70,530 bytes transferred; resource size 212,885 bytes
  - `/polyfills-5CFQRCPP.js` — 13,287 bytes transferred; resource size 34,585 bytes
  - `/main-RSIYTOMY.js` — 33,840 bytes transferred; resource size 122,637 bytes
  - `/chunk-33MHLDIH.js` — 58,190 bytes transferred; resource size 263,004 bytes
  - `/chunk-7OUACEIT.js` — 2,940 bytes transferred; resource size 6,700 bytes

## Network Findings

- No explicit critical request chain data is present in the JSON.
- No explicit critical path latency value is present in the JSON.
- `Resource summary` reported a total of 10 requests and 278,536 bytes transferred.
- Resource transfer by type:
  - Script: 194,807 bytes across 6 requests
  - Font: 72,589 bytes across 2 requests
  - Stylesheet: 5,727 bytes across 1 request
  - Document: 5,413 bytes across 1 request
  - Image: 0 bytes across 0 requests
  - Media: 0 bytes across 0 requests
  - Other: 0 bytes across 0 requests
  - Third-party: 72,589 bytes across 2 requests
- `Total byte weight` reported a total of 278,536 bytes, displayed as "Total size was 272 KiB".
- Top transfer-size resources reported by `total-byte-weight`:
  - `/chunk-WAGTDBVM.js` — 70,530 bytes
  - `/chunk-33MHLDIH.js` — 58,190 bytes
  - `https://fonts.gstatic.com/s/roboto/v51/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBA.woff2` — 43,168 bytes
  - `/main-RSIYTOMY.js` — 33,840 bytes
  - `https://fonts.gstatic.com/s/roboto/v51/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3KUBGEe.woff2` — 29,421 bytes
- The JSON identifies the third-party resource as Google Fonts (`https://fonts.gstatic.com/...`), with a transfer size of 72,589 bytes across 2 requests.
- `Network Round Trip Times` reported:
  - `https://fonts.gstatic.com` — 28.015 ms
  - `` — 0.244 ms
- `Server Backend Latencies` reported:
  - `` — 6.7435 ms
  - `https://fonts.gstatic.com` — 0 ms
- `Cache-related findings` are not explicitly reported in the JSON.

## Accessibility Summary

- Accessibility category score: 1.
- The JSON reports no failing accessibility audits for this page in the automated results.
- The audit set includes successful checks such as `document-title`, `heading-order`, `html-has-lang`, `html-lang-valid`, `label`, `landmark-one-main`, `link-name`, `meta-viewport`, `target-size`, `tabindex`, `table-fake-caption`, `td-has-header`, and `td-headers-attr`.
- Some accessibility audits are reported as `notApplicable` or `manual` rather than scored pass/fail in this dataset.
- The JSON does not provide a separate manual accessibility-testing result.

## Best Practices Summary

- Best Practices category score: 1.
- Reported checks in the JSON include:
  - `No browser errors logged to the console` — score 1
  - `Displays images with correct aspect ratio` — score 1
  - `Serves images with appropriate resolution` — score 1
  - `Avoids deprecated APIs` — score 1
  - `Avoids third-party cookies` — score 1
  - `No issues in the Issues panel in Chrome Devtools` — score 1
  - `Detected JavaScript libraries` — Angular 20.3.27 reported
  - `Uses HTTPS` — score 1
  - `Page has successful HTTP status code` — score 1
- The JSON does not report any failing or scored best-practices issues for this page.

## SEO Summary

- SEO category score: 1.
- Reported checks in the JSON include:
  - `Document has a <title> element` — score 1
  - `Document has a meta description` — score 1
  - `Page isn’t blocked from indexing` — score 1
  - `robots.txt is valid` — score 1
  - `Document has a valid hreflang` — score 1
  - `Links have descriptive text` — score 1
  - `Links are crawlable` — score 1
  - `Page has successful HTTP status code` — score 1
- `Document has a valid rel=canonical` is reported as `null` with `notApplicable`.
- `Structured data is valid` is reported as `null` with `manual`.
- The JSON does not report any SEO failures for the page.

## Baseline Assessment

The measured Lighthouse baseline for this page is a performance score of 0.94, with Accessibility, Best Practices, and SEO all reported as 1. The actual measured timing values are FCP = 2270.7305 ms, LCP = 2676.974 ms, TBT = 13.5 ms, CLS = 0, and Speed Index = 2270.7305 ms. These are measured values from the report and are not interpreted as a final production-quality assessment.

The most relevant performance opportunity reported by Lighthouse is JavaScript usage. The JSON specifically records an unused-JavaScript opportunity with 150 ms of potential savings and 84,722 bytes of estimated savings, plus JavaScript execution and main-thread work concentrated in script evaluation. The report also shows 10 network requests with 278,536 bytes transferred, and the largest transfer-size assets are JavaScript chunks and Google Fonts payloads. This is a measured baseline of the current state; it is not a claim that the application is fully optimized or production-ready.

## Next Step

The next investigation should be JavaScript bundle analysis. The JSON identifies the clearest reported opportunity as unused JavaScript and related script execution overhead, with the highest savings associated with `node:electron/js2c/sandbox_bundle`, `/chunk-33MHLDIH.js`, and `/chunk-WAGTDBVM.js`. This should be investigated before changing performance-related implementation details.

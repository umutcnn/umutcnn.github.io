# V2 test report

Run on 2026-11-16 (Windows 11, Node 20.20.2, Playwright 1.65.1 / Chromium 159) against the production build served by
`vite preview` (pre-rendered HTML, deferred entry script, hydration).

## Summary

| Check                            | Command                                          | Result                                                                                       |
| -------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Type check (app, tests, node)    | `npm run typecheck`                              | ✅ 0 errors                                                                                  |
| Lint                             | `npm run lint`                                   | ✅ 0 problems                                                                                |
| Format                           | `npm run format:check`                           | ✅                                                                                           |
| Unit + integration               | `npm test`                                       | ✅ **79 / 79** (6 files; V1: 56)                                                             |
| Build + prerender                | `npm run build`                                  | ✅ 14 routes + 404, sitemap 14 URLs                                                          |
| Project-site base path           | `VITE_BASE=/repo/ npm run build` + browser check | ✅ hydrates, navigation keeps prefix, 0 errors                                               |
| E2E + a11y + responsive + visual | `npm run test:e2e`                               | ✅ **94 passed, 0 failed, 38 skipped** — two consecutive full runs                           |
| Runtime audit                    | `npm audit --omit=dev`                           | ✅ 0 vulnerabilities                                                                         |
| Lighthouse                       | `npm run lighthouse`                             | mobile 94–95 / 100 / 100 / 100, desktop 99–100 / 100 / 100 / 100 (see V2_PERFORMANCE_REPORT) |

Skipped tests are by design: device-specific scenarios run in one project (e.g. pointer physics and CDP leak check
only in `desktop`, focus-trap menu only in `mobile`), and the responsive/visual suites set their own viewports so
they run once (`desktop` project). Every E2E test fails on any console error, page error, failed request or HTTP ≥ 400.

## New in V2

### Unit (`tests/unit/v2.test.ts`, 18 tests)

Quality tiers (reduced motion always minimal, tiers never upgrade) · kinetic name (push away, capped, springs back to
rest) · Intelligence Field (bounded flow field, adjacency, signals continue from the node they reached, radial exit
with depth, nearest node) · constellation (every technology in a domain, **0 label overlaps**, domain → project
links, lit sets) · architecture explorer (**flows exactly as in the brief**, feedback arcs, zoom around a fixed
point + clamping) · page transitions fall back to a synchronous update without the API.

### Integration (`tests/integration/v2.test.tsx`, 5 tests)

Constellation domain/technology selection → shared project panel · achievement tabs with arrow/End keys · FL client
inspection, phase explanation, update rule per algorithm · CV class filter + average confidence · architecture zoom
buttons, fit and keyboard (+ / 0).

### Playwright scenarios (`tests/e2e/scenarios.spec.ts`)

| Scenario                 | What is verified                                                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A — first impression     | brief headline + tagline + 3 signal lines, no overflow, scrolling never locked, hero fades on scroll; kinetic name displaces under the pointer and returns to rest                                                                                           |
| B — portfolio navigation | open the FL case study from the project visual (cursor hint visible) → heading focused → gallery → back to `/#work` with scroll restored → next project, title updated                                                                                       |
| C — interactive systems  | FL start / pause (nothing advances) / reset / algorithm switch / client inspection; architecture zoom, keyboard pan, fit, system switch                                                                                                                      |
| D — responsive           | `responsive.spec.ts`: 320–1920 px, hero never clipped, no overflow, no clipped headings, all case studies at 375 px                                                                                                                                          |
| E — keyboard only        | skip link → logo, story tabs with arrows, gallery opened with Enter, Escape, focus restored                                                                                                                                                                  |
| F — localization         | TR → EN → TR on home and a case study, route kept, no `undefined` / `[object Object]` / `NaN` in the page                                                                                                                                                    |
| G — stability            | 5 cycles of next/back navigation + 3 dialog open/close each: **window + document listener count does not grow** (CDP), rapid language toggling ends consistent, 6 resizes incl. an orientation flip without overflow, navigation during a running transition |
| Theme default            | OS prefers dark → first visit is light; chosen dark persists across reload                                                                                                                                                                                   |

### Visual regression (`tests/visual/visual.spec.ts`)

16 baselines (7 home sections + FL case hero, desktop 1440 and mobile 375) in reduced-motion mode with CSS
animations disabled; live visualisations are masked; fonts are warmed so `font-display: optional` can't flip
between runs. Baselines are OS-specific: `npx playwright test tests/visual --update-snapshots`.

## Problems the new tests caught (all fixed)

| Found by                | Problem                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| a11y (axe) under load   | hero stuck 3 % faded after a ScrollTrigger refresh during a smoothed scrub   |
| debugging that          | hero bottom block shifted 18 px (GSAP read a mid-animation transform)        |
| Scenario G              | unhandled `ViewTransition.ready` rejection on fast navigation                |
| Lighthouse              | logo / language button accessible names not containing the visible text      |
| visual baselines        | first baseline entirely masked (canvas mask); optional-font timing flakiness |
| constellation unit test | overlapping labels before box relaxation                                     |

## Not covered

Safari / Firefox (only Chromium automated; view transitions and the scroll-progress bar are progressive
enhancement), real devices, field INP, screen-reader runs with NVDA/VoiceOver (semantics checked by axe + role
queries only).

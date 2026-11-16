# V4 test results

Environment: Windows 11, Node 20.20.2, npm 10.8.2, Playwright 1.65.1 (Chromium), Vitest 4.1.12. All runs against
`npm run build` + `vite preview` (port 4173). Logs: `tests/.artifacts/` (git-ignored).

## Commands from the README

| Command                                                       | Exists in `package.json`      | Before                                                                                                           | After                                                                           |
| ------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `npm run check` (typecheck + lint + unit/integration + build) | yes                           | PASS (79 tests)                                                                                                  | PASS (89 tests)                                                                 |
| `npm test`                                                    | yes                           | PASS 79                                                                                                          | PASS 89                                                                         |
| `npm run build`                                               | yes                           | PASS (14 routes + 404)                                                                                           | PASS (14 routes + 404)                                                          |
| `npm run test:e2e` (e2e + accessibility)                      | yes                           | PASS 93, 30 skipped                                                                                              | PASS 99, 30 skipped                                                             |
| Visual (`npx playwright test tests/visual`, local only)       | —                             | **FAIL 2** (stale baselines)                                                                                     | PASS 4 (baselines regenerated, see B29)                                         |
| `npm run lighthouse`                                          | yes (needs a running preview) | run                                                                                                              | run — see performance report                                                    |
| `npm run lint`                                                | yes                           | PASS                                                                                                             | PASS                                                                            |
| `npm run format:check`                                        | yes                           | fails locally on CRLF line endings only (`core.autocrlf=true`); with `--end-of-line auto` the changed files pass | same (README.md and V2 guide had pre-existing formatting drift, left untouched) |

"Skipped" = specs that run in one Playwright project only (e.g. visual specs skip outside `desktop`, some mobile-only
or desktop-only scenarios).

## New tests (each written to fail first)

| Test                                                                  | File                             | Fails on old code               |
| --------------------------------------------------------------------- | -------------------------------- | ------------------------------- |
| Case studies styled without JS (no FOUC)                              | `tests/e2e/journey.spec.ts`      | yes (17 px title)               |
| "All projects" returns to the exact spot                              | `tests/e2e/scenarios.spec.ts`    | yes on desktop (6050 → 5311 px) |
| Arrow keys stay with controls inside the lightbox                     | `tests/integration/app.test.tsx` | yes                             |
| Focus trap with a trailing radio group                                | `tests/unit/focus-trap.test.tsx` | yes                             |
| One shared Lenis instance under StrictMode                            | `tests/unit/scroll.test.ts`      | yes                             |
| FL rounds never exceed the target                                     | `tests/unit/logic.test.ts`       | yes                             |
| theme-color follows the theme                                         | `tests/unit/logic.test.ts`       | yes (no sync existed)           |
| Descriptions ≤ 160 chars at word boundaries; full head sync incl. 404 | `tests/unit/seo.test.ts`         | yes                             |

One existing assertion changed on purpose: the TR journey test now expects the Turkish number format `≈ %96,25`
on the Turkish case page (it previously asserted the untranslated `≈96.25%`).

## Brief §14.2 scenarios

| Scenario                                                                     | Status | Where                                                                                 |
| ---------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| A — First load (hero, fonts, content, no console errors, no failed requests) | PASS   | `scenarios.spec.ts` + fixture that fails any test on console errors / failed requests |
| B — Navigation (menu links, active section, back to top)                     | PASS   | `journey.spec.ts`, `scenarios.spec.ts`                                                |
| C — Projects (open, detail, gallery, back, direct URL, refresh)              | PASS   | `journey.spec.ts`, new smart-back test                                                |
| D — Localization (TR/EN, persistence, no missing keys)                       | PASS   | E2E + `router-i18n.test.ts` (typed dictionaries)                                      |
| E — Responsive (phone, tablet, laptop, desktop, ultra-wide)                  | PASS   | `responsive.spec.ts` + responsive sweep at 10 widths (320–1920)                       |
| F — Interactions (theme, modal, gallery, filter, AI Lab, copy, contact)      | PASS   | E2E + integration                                                                     |
| G — Motion (reduced motion, repeated navigation, resize, transitions)        | PASS   | `scenarios.spec.ts`, reduced-motion project                                           |
| H — Accessibility (keyboard, focus, dialogs, contrast, axe)                  | PASS   | `a11y.spec.ts` (0 violations)                                                         |

## Responsive sweep (10 widths × 4 pages)

Script: `tests/.artifacts/scripts/responsive-sweep.mjs`. Checks horizontal scroll, elements outside the viewport,
text clipped by overflow, navbar collisions, tap targets < 24 px, hero name width.

- Before: 0 horizontal scroll; clipped detection label (B19); 20×44 px gallery button and 23 px e-mail link (B20).
- After: clean at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920 (the rotating portrait ring is a known false
  positive).

All device results are **emulation**, not real devices.

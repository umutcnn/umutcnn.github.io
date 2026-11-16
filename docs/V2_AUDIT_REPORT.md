# V2 audit report

Audit of the V1 build on 2026-11-16 before any V2 change. Method: code review of `src/`, the production build served
by `vite preview`, Playwright runs at 320 / 375 / 390 / 430 / 768 / 1024 / 1440 / 1920 px (touch emulation below
1024 px), screenshots in `tests/.artifacts/audit/`, the existing 56 unit and 66 E2E/a11y tests, Lighthouse 12.

## What was verified as implemented (not assumed)

| Area          | Status in V1                                                                                                                                | Evidence                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Stack         | React 19.3, Vite 8.3, TS 6.0 strict, Tailwind 4, GSAP 3.15 + ScrollTrigger, Lenis 1.3, Motion 14 (case chunk only). No Three.js / R3F / OGL | `package.json`, bundle analysis      |
| Routing       | Custom History router, `/` TR, `/en/` EN, `/work/<slug>/`, 404; pre-rendered HTML per route; refresh-safe                                   | unit + E2E deep-link tests           |
| i18n          | Typed TR/EN dictionaries, compile-time parity, `<html lang>`, hreflang                                                                      | parity test                          |
| SEO           | Per-route title/description/canonical/OG/JSON-LD, sitemap, robots                                                                           | prerender output, Lighthouse SEO 100 |
| Accessibility | Skip link, landmarks, focus-trapped dialogs, ARIA tabs, reduced motion; axe 0 violations                                                    | `a11y.spec.ts`                       |
| Errors        | 0 console errors, 0 failed requests, 0 horizontal overflow at all 8 widths                                                                  | audit run below                      |
| Performance   | Lighthouse desktop 100 / mobile **85** (FCP 3.0 s, LCP 3.4 s simulated)                                                                     | `test-report.md`                     |

### Audit run (production build)

| Width | Hero name width | Hero font size | DOM nodes | Overflow | Pinned work stage | Console / network errors |
| ----- | --------------- | -------------- | --------- | -------- | ----------------- | ------------------------ |
| 320   | 288 px          | 54 px          | 1 316     | 0        | no                | 0                        |
| 375   | 343 px          | 64 px          | 1 316     | 0        | no                | 0                        |
| 390   | 357 px          | 66 px          | 1 316     | 0        | no                | 0                        |
| 430   | 394 px          | 73 px          | 1 316     | 0        | no                | 0                        |
| 768   | 704 px          | 112 px         | 1 316     | 0        | no                | 0                        |
| 1024  | 938 px          | 150 px         | 1 316     | 0        | yes               | 0                        |
| 1440  | 1 328 px        | 210 px         | 1 316     | 0        | yes               | 0                        |
| 1920  | 1 368 px        | 248 px         | 1 316     | 0        | yes               | 0                        |

Language switch on a case study kept the route at every width (title switched to English).

## Section scores (1–10)

These are reviewer judgements from the screenshots and interaction checks, not objective measurements. Only the
Performance and Accessibility columns are backed by measurements.

| Section       | Identity | Typography | Motion | Layout | Projects | Story | Responsive | Interaction | A11y | Perf |
| ------------- | -------- | ---------- | ------ | ------ | -------- | ----- | ---------- | ----------- | ---- | ---- |
| Hero          | 8        | 9          | 6      | 8      | –        | 7     | 8          | 5           | 9    | 7    |
| About         | 7        | 8          | 6      | 8      | –        | 7     | 8          | 5           | 9    | 9    |
| Selected Work | 8        | 8          | 7      | 8      | 7        | 7     | 7          | 6           | 9    | 8    |
| Case studies  | 7        | 8          | 4      | 7      | 7        | 7     | 8          | 6           | 9    | 8    |
| Research      | 7        | 8          | 5      | 8      | –        | 8     | 8          | 4           | 9    | 9    |
| Achievements  | 7        | 8          | 5      | 7      | –        | 5     | 8          | 6           | 9    | 9    |
| Tech stack    | 6        | 7          | 4      | 7      | 6        | 5     | 8          | 7           | 9    | 9    |
| AI Lab        | 7        | 7          | 6      | 7      | –        | 7     | 7          | 7           | 9    | 8    |
| Contact       | 8        | 9          | 5      | 8      | –        | 7     | 9          | 7           | 9    | 9    |

## Findings by priority

### P0 — blocks use

None found. No crash, broken route, console error, failed request or layout overflow.

### P1 — important functional / design problems

1. **Mobile performance below target**: Lighthouse mobile 85 (< 90). The FCP estimate includes the 119 KB entry
   script that starts downloading before first paint.
2. **Hero name is inert after its entrance**: only a CSS hover lift per letter, no pointer field, nothing on touch.
3. **Particle field reads as generic "plexus"**: no depth, no information flow, no managed exit mode; the hero exit is
   a GSAP tween unrelated to the particles.
4. **Card → case-study transition is a hard cut**: no continuity between the project visual and the detail page; focus
   is not moved to the new page heading.
5. **Tech stack is a chip grid** with a side list — not the knowledge map the brief asks for.
6. **Architecture explorer** has no zoom / pan / fit, no animated flow, and its node chains do not follow the exact
   flows the brief specifies (ERP, CAD, FL).
7. **Achievements are an accordion**, not a story: the four milestones are text rows.

### P2 — UX / performance improvements

1. FL simulator: no client inspection and no per-phase explanation of what aggregation does.
2. CV playground: not titled "Sample Detection Visualization"; no class filter, label/score toggles or confidence summary.
3. ScrollTrigger is not refreshed after web fonts load or after lazy content mounts (possible trigger drift).
4. Motion helpers are spread across `hooks/`, `lib/` and `components/motion` without one entry point; no explicit
   quality tiers (only an internal device-tier function).
5. Project visuals are not clickable themselves (only title + CTA); no hover affordance or cursor hint.
6. Case-study table of contents has no active-section indicator.
7. Pre-render output hard-codes `/` for favicon, manifest, font preload and `data-route` — breaks a non-root base path.
8. No Vercel configuration (headers, caching, output).

### P3 — cosmetic / micro

1. Hero headline uses the long SEO title instead of the brief's `AI ENGINEER / COMPUTER VISION / INTELLIGENT SYSTEMS`.
2. Hero shows only one achievement; the brief asks for three short info lines.
3. Buttons have hover but no press feedback.

## Strengths kept

Pre-rendered bilingual routing, content integrity rules (no invented data, labelled simulations), accessibility
baseline (axe 0), CLS 0, test coverage, desktop Lighthouse 100, the editorial type system and paper/night storytelling.

## V2 plan (executed — see V2_TEST_REPORT.md for verification)

Hero kinetic name + Intelligence Field with modes; view-transition case-study continuity + focus; clickable visuals
with cursor hint; FL client inspection + explanations; CV playground options; architecture explorer zoom/pan/fit with
brief-exact flows; knowledge constellation with list fallback; achievement story tabs; motion entry point + quality
tiers; ScrollTrigger refresh lifecycle; deferred entry script for mobile FCP; base-path-safe prerender; Vercel config;
Playwright scenarios A–G and screenshot baselines.

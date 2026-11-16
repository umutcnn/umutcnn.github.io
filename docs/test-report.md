# Test report

Run on 2026-11-16, Windows 11, Node 20.20.2, Vite 8.3.8, Playwright 1.65.1 (Chromium 159 headless shell),
against the production build served by `vite preview` (pre-rendered HTML + hydration).

## Summary

| Check                            | Command                | Result                                                    |
| -------------------------------- | ---------------------- | --------------------------------------------------------- |
| Type check (app/tests/node)      | `npm run typecheck`    | ✅ 0 errors                                               |
| Lint (ESLint 10 + react-hooks 7) | `npm run lint`         | ✅ 0 problems                                             |
| Formatting                       | `npm run format:check` | ✅ all files formatted                                    |
| Unit + integration               | `npm test`             | ✅ 56 / 56 passed (4 files)                               |
| Production build + prerender     | `npm run build`        | ✅ 14 routes + 404.html, sitemap (14 URLs), robots.txt    |
| E2E + a11y + responsive          | `npm run test:e2e`     | ✅ 66 passed, 24 skipped (by design, see below), 0 failed |
| Runtime dependency audit         | `npm audit --omit=dev` | ✅ 0 vulnerabilities                                      |
| Lighthouse                       | `npm run lighthouse`   | see below                                                 |

Skipped tests are intentional: the 9-width responsive suite (11 tests) runs only in the `desktop` project (it sets
its own viewport sizes), and the mobile-menu focus-trap test runs only in the `mobile` project.

Dev-only audit: `npm audit` reports 7 moderate advisories in `minimatch` pulled in by ESLint/typescript-eslint
(ReDoS in glob parsing — dev tooling only, not shipped). Lighthouse is run through `npx lighthouse@12.8.2` instead
of being a dependency, which avoids 29 further dev-only advisories from its puppeteer chain.

## Unit & integration (Vitest 4.1 + jsdom 27 + Testing Library)

- `tests/unit/content.test.ts` — unique ids/slugs, 6 featured projects with case studies, related projects and
  technologies exist, every localized field complete in TR and EN (incl. list lengths), every metric has context,
  FL limitations mention "clinical", only https GitHub links enabled, confidential projects have no public links or
  images, every tech in exactly one cluster, verified contact links, valid timeline dates, counters backed by real
  numbers, architecture graphs only connect existing nodes.
- `tests/unit/router-i18n.test.ts` — route parsing (TR/EN/alias/index.html/malformed), round-trip with sub-folder
  base, dictionary shape parity TR↔EN, no empty strings, locale fallback, month formatting, Turkish upper-casing.
- `tests/unit/logic.test.ts` — theme resolution/persistence and **boot-script parity with index.html**, device tier,
  FL state machine (phase order, rounds clamp, restart, reset on algorithm change, synthetic drift monotonic),
  detection thresholding (inclusive, monotonic, false positives removed), particle physics (budget caps, repulsion,
  damping, bounds, settling), tech→project relations, next case study wrap-around, SEO metadata (canonical,
  hreflang, JSON-LD, 404 noindex, archive item without case study → 404).
- `tests/integration/app.test.tsx` — hero h1, all sections, single h1; TR→EN switch with URL + storage +
  `<html lang>`; theme toggle persistence; mobile menu modal, scroll lock, Escape, focus restore; tech map; archive
  filter; clipboard success **and** failure toasts; FL demo stepping; CV threshold changes the count; lab tabs
  arrow/End keys; deep link + next project; browser back; localized 404; gallery dialog keyboard + focus restore.

## E2E (Playwright, 3 projects: desktop 1440×900, mobile 375×812 touch, reduced-motion 1280×800)

Every test fails automatically on any `console.error`, uncaught page error, failed same-origin request or HTTP ≥ 400.

| Spec                                        | Covers                                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `journey.spec.ts` › primary visitor journey | home → hero → nav to About → Work → open FL case study → content + metric + limits + title → gallery (open, →, Esc, focus back) → next project → browser back → TR→EN on same route → theme toggle persists across reload |
| › interactive lab                           | FL step + rounds slider, CV threshold changes count, architecture node detail                                                                                                                                             |
| › contact and links                         | mailto, GitHub, LinkedIn hrefs; no `tel:` link; CV download returns 200 `application/pdf`; every in-app link on `/` and `/en/` returns 200                                                                                |
| › deep links and errors                     | direct load of `/en/work/autonomous-robotaxi/` (pre-rendered HTML, canonical, hydration, LiDAR layer toggle); unknown deep link → localized 404 → home                                                                    |
| › mobile navigation                         | focus trapped after 20 Tabs, Escape closes, focus restored                                                                                                                                                                |
| › regressions from code review              | pages readable **with JavaScript disabled** (home + case study, no hidden content); non-hydrated EN 404 gets an English `<title>`; language switch keeps `#section`; scroll position survives reload                      |
| `responsive.spec.ts`                        | 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 px: hero name fully inside viewport, no horizontal overflow after walking the page, no clipped headings; all 6 case studies + 404 without overflow at 375 px; screenshots |
| `a11y.spec.ts`                              | axe-core WCAG 2.0/2.1/2.2 A+AA on `/`, `/en/`, ERP case, EN coil case, 404, dark theme → **0 violations**; skip link moves focus; reduced motion keeps every section heading visible and untransformed                    |

## Issues found by testing and fixed

| Found by                 | Problem                                                                                                                                                                          | Fix                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| axe                      | counters used `aria-label` on `<span>`                                                                                                                                           | visually hidden text instead                                                                                           |
| axe                      | permission matrix scroll region not focusable                                                                                                                                    | `role="region"`, label, `tabIndex=0`                                                                                   |
| responsive test          | 28–54 px horizontal overflow: rotating portrait orbit, a long CTA, `<legend class="sr-only">`, sr-only cells escaping the matrix scroller                                        | `contain: paint`, `min-width: 0` on grid columns, wrap long buttons < 480 px, visible legend, positioned scroller      |
| responsive test          | award "+" icon rotated box clipped heading                                                                                                                                       | rotate the glyph, not the circle                                                                                       |
| E2E                      | navbar auto-hid during menu-triggered scroll                                                                                                                                     | scroll lock window for programmatic navigation                                                                         |
| independent code review  | case-study HTML shipped with `opacity:0` (Motion `initial`)                                                                                                                      | transform-only CSS entrance                                                                                            |
| code review + no-JS test | React 19 `prerender` outlined the large case-study Suspense boundary into a hidden segment                                                                                       | case page rendered without Suspense on the server; client pre-loads that chunk before hydrating case URLs              |
| code review              | `<head>` not updated when a page isn't hydrated (EN 404)                                                                                                                         | sync on first render unless hydrated from matching HTML                                                                |
| code review              | hydration mismatch for URLs with `#hash`; stale hash on language switch; scroll not restored on reload; focus trap re-running on every navbar render; preview re-rendering 60×/s | hash read after mount; live hash; restore saved `scrollY`; callback ref in trap; 10 fps sweep, off on low-tier devices |

## Lighthouse 12.8.2 (local `vite preview`, Playwright Chromium, default throttling)

| Preset                                           | Performance | Accessibility | Best practices | SEO     | FCP   | LCP   | TBT    | CLS |
| ------------------------------------------------ | ----------- | ------------- | -------------- | ------- | ----- | ----- | ------ | --- |
| Desktop                                          | **100**     | **100**       | **100**        | **100** | 0.7 s | 0.7 s | 0 ms   | 0   |
| Mobile (simulated Moto G Power, slow 4G, 4× CPU) | **85**      | **100**       | **100**        | **100** | 3.0 s | 3.4 s | 150 ms | 0   |

Mobile performance is below the 90 target. What dominates: the 119 KB (gzip) main bundle (React DOM ≈ 60 KB plus
both languages' content, required to hydrate the pre-rendered page) and ~1 300 DOM nodes of fully rendered
content. Already applied: inlined CSS, latin/latin-ext fonts only with LCP font preload, transform-only hero
entrance, GSAP/Lenis deferred to first interaction/idle, Motion and all visualisations in lazy chunks,
below-the-fold visuals mounted near the viewport. Further options (not done): splitting long case-study text out of
the main bundle (~6 KB gz), per-locale content bundles, or island-style partial hydration.

Not measured: real-device field data (CrUX/INP) — the site is not deployed yet; Safari/Firefox (only Chromium
was automated; layout uses standard CSS, `animation-timeline` progress bar is progressive enhancement).

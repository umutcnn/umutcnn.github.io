# V2 performance report

Environment: Windows 11, Node 20.20.2, production build served by `vite preview` (localhost), Lighthouse 12.8.2 with
Playwright's Chromium (`npm run lighthouse`), default throttling (mobile: simulated Moto G Power, slow 4G, 4× CPU).
Each figure is from two consecutive runs; ranges show the variation.

## Before / after

|                  | Performance | Accessibility | Best practices | SEO     | FCP       | LCP       | TBT       | CLS     |
| ---------------- | ----------- | ------------- | -------------- | ------- | --------- | --------- | --------- | ------- |
| Mobile — V1      | 85          | 100           | 100            | 100     | 3.0 s     | 3.4 s     | 150 ms    | 0       |
| **Mobile — V2**  | **94–95**   | **100**       | **100**        | **100** | **2.0 s** | **2.7 s** | 30–110 ms | 0–0.002 |
| Desktop — V1     | 100         | 100           | 100            | 100     | 0.7 s     | 0.7 s     | 0 ms      | 0       |
| **Desktop — V2** | **99–100**  | **100**       | **100**        | **100** | 0.5 s     | 0.6 s     | 0–60 ms   | 0       |

Targets: Performance ≥ 90 ✅ (both), Accessibility / Best practices / SEO ≥ 95 ✅, CLS ≤ 0.1 ✅.
LCP ≤ 2.5 s: **not met on simulated mobile (2.7 s)**; met on desktop (0.6 s). In the unthrottled trace FCP = LCP =
332 ms. INP was not measured (no field data; the site is not deployed) — TBT stays ≤ 110 ms.

## What changed and what it bought

| Change                                                                                                                                         | Effect measured                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Entry script requested only after first paint (inline boot script, `scripts/prerender-routes.mjs`)                                             | FCP 3.0 → 2.8 s, TBT 150 → 60–90 ms                                     |
| All stylesheets inlined (entry + the shared ArchitectureGraph chunk that Vite linked in `<head>`); `modulepreload`s moved into the boot script | FCP 2.8 → 2.6 s (no render-blocking request left)                       |
| Turkish-only `latin-ext` font subsets (`scripts/subset-fonts.py`): Inter 85 → 3.2 kB, Space Grotesk 19 → 2.4 kB, JetBrains Mono 15 → 2.5 kB    | **FCP 2.6 → 2.0 s, LCP 3.4 → 2.7 s, score 87 → 94–95**                  |
| `font-display: optional` for body/label fonts + metric-matched `Inter Fallback`                                                                | removes late re-render of first-screen text (no CLS, no LCP re-trigger) |
| GSAP / ScrollTrigger / Lenis loaded on first interaction or idle                                                                               | not on the critical path (requests start after FCP in the trace)        |
| Visualisations + Lab panels behind `LazyMount` + `React.lazy` (already V1)                                                                     | below-the-fold code and SVG not rendered or downloaded up front         |

## Bundle (gzip)

| Chunk                                                      | gzip           | Loaded                                          |
| ---------------------------------------------------------- | -------------- | ----------------------------------------------- |
| `index` (React DOM ≈ 60 kB + app + TR/EN content)          | 103 kB         | after first paint                               |
| `ArchitectureGraph` (shared: diagrams, Lab/visual helpers) | 26 kB          | after first paint (deferred modulepreload)      |
| `CaseStudyPage` (+ Motion)                                 | 35 kB          | case-study routes / on project hover (prefetch) |
| `gsap` + `ScrollTrigger`                                   | 27 + 17 kB     | first interaction / idle                        |
| `lenis`                                                    | 5 kB           | first interaction / idle, fine pointer only     |
| `FederatedSim`, `ProjectVisual`, `LabPanels`               | 5 + 4 + 0.5 kB | when scrolled near                              |

Pre-rendered HTML (with inlined CSS): home 35 kB gzip, case study 25 kB gzip. No Three.js / R3F / OGL: the hero field
is Canvas 2D (≤ 300 nodes, edges batched into 4 strokes, nodes into one fill per layer) — WebGL would add a
dependency and a context-loss path without visible benefit at this node count. Runtime `npm audit --omit=dev`: 0.

## Remaining opportunities (not done)

- Mobile LCP 2.7 s → ≤ 2.5 s: the main chunk is still 103 kB; per-locale content bundles or moving case-study long
  text out of the entry (~6 kB) are the next levers.
- The latin font files (Inter 48 kB, JetBrains Mono 40 kB) could also be subset to the glyphs actually used.

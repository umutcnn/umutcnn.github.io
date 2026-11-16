# V4 performance report

## Method

- Lighthouse 12.8.2 (`npm run lighthouse`, Playwright Chromium, headless) against `vite preview`.
- **Before** = the unmodified build of commit `fdd3d87` (served on port 4180); **after** = the working tree (port
  4173). Same machine, same session, same tool version, simulated throttling (Lighthouse defaults).
- Mobile home page: 3 alternating runs each, median reported. Other rows: single run.
- Raw JSON: `tests/.artifacts/baseline/lh-*` and `tests/.artifacts/after/lh-*` (git-ignored).

## Results

| Metric                   | Before                                             | After                           |
| ------------------------ | -------------------------------------------------- | ------------------------------- |
| Home · mobile · Perf     | 95 (95/95/95)                                      | 95 (95/95/93)                   |
| Home · mobile · LCP      | 2.7 s                                              | 2.6 s                           |
| Home · mobile · TBT      | 30 ms                                              | 60 ms                           |
| Home · mobile · CLS      | 0 – 0.002                                          | 0 – 0.002                       |
| Home · desktop · Perf    | 100 (LCP 0.6 s, CLS 0)                             | 100 (LCP 0.6 s, CLS 0)          |
| Case · mobile · Perf     | 91 (LCP 3.0 s)                                     | 92 (LCP 3.0 s)                  |
| Case · desktop · Perf    | 100, **CLS 0.035**                                 | 100, **CLS 0**                  |
| Accessibility (all runs) | 100                                                | 100                             |
| Best Practices           | 100                                                | 100                             |
| SEO                      | 100                                                | 100                             |
| INP                      | Not Measured (needs field data)                    | Not Measured                    |
| Entry JS (raw / gzip)    | 327.8 + 69.5 KB shared chunk = 397.3 KB / 129.4 KB | 401.4 KB / 128.7 KB (one chunk) |
| Case chunk JS            | 100.9 KB                                           | 101.2 KB                        |
| Entry CSS (raw)          | 62.9 + 13.4 KB                                     | 77.8 KB                         |
| Home HTML                | 173.5 KB                                           | 175.2 KB                        |
| Case HTML                | 109.7 KB                                           | 117.1 KB (+ inlined case CSS)   |

Reading the table honestly:

- The **case-page CLS fix (0.035 → 0)** is the measurable win; it comes from inlining the route CSS (B1).
- Scores are otherwise unchanged within noise. The +30 ms TBT median is inside the run-to-run spread (one "after" run
  was 150 ms, the other two 50–60 ms) and far below the 200 ms threshold.
- The entry chunk grew because Rolldown merged the previously separate `ArchitectureGraph` chunk into it. The home
  page already loaded that chunk on every visit, so total transfer is essentially unchanged (−0.7 KB gzip; +4 KB raw
  for the new code).
- Case HTML is +7 KB because its CSS is now inline — that is the fix for the unstyled flash.

## Targets

| Target                                    | Status                                                                                                                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance ≥ 90                          | Met everywhere (lowest: case mobile 92).                                                                                                                                                                                                  |
| Accessibility / Best Practices / SEO ≥ 95 | Met (100).                                                                                                                                                                                                                                |
| LCP ≤ 2.5 s                               | Met on desktop. **Not met in Lighthouse's simulated mobile profile** (2.6 s home, 3.0 s case). Observed (unthrottled) LCP is 0.33–0.35 s; the simulated value is dominated by "render delay" of 4×-slowed style & layout of a large page. |
| CLS ≤ 0.1                                 | Met (≤ 0.002).                                                                                                                                                                                                                            |
| INP ≤ 200 ms                              | Not measurable in the lab. TBT (a lab proxy) ≤ 160 ms in every run.                                                                                                                                                                       |

## Bottlenecks investigated

| Area                          | Finding                                                                                                                                                       | Action                                                                                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Render-blocking               | None: CSS is inlined, the entry script is injected after first paint.                                                                                         | —                                                                                                                                                                                                                                            |
| Mobile LCP                    | 83–85 % "render delay"; main thread on the home page is dominated by Style & Layout (~1.1 s simulated) on ~1350 DOM nodes and 78 KB of CSS.                   | Not changed. `content-visibility: auto` would cut this, but it changes section heights before they render and would break exactly the scroll restoration and pinned-section maths fixed in B21. Recommended only with a dedicated test pass. |
| Hero name on slow mobile (B3) | Pixel 5, 4× CPU, slow 3G: name visible ~1.9 s, LCP (lede) 1.5 s.                                                                                              | No change needed.                                                                                                                                                                                                                            |
| Continuous loops              | Particle field already paused off-screen and in background tabs; kinetic name loop now also pauses off-screen (B8); particles now really start on idle (B11). | Fixed.                                                                                                                                                                                                                                       |
| Layer promotion               | Permanent `will-change` on the ~5.5-viewport pinned Work section and every button.                                                                            | Removed (B27).                                                                                                                                                                                                                               |
| Fonts                         | 3 variable families + Turkish subsets, self-hosted; Space Grotesk preloaded (`swap`), Inter/JetBrains (`optional`).                                           | —                                                                                                                                                                                                                                            |
| Images                        | Only the portrait (AVIF/WebP 320/640, width/height, lazy). Visuals are SVG/canvas.                                                                            | —                                                                                                                                                                                                                                            |
| Large asset                   | `public/cv/Umut-Can-Yildiz-CV.pdf` is 557 KB (downloaded only on click).                                                                                      | Owner: re-export the PDF (it also still contains the phone number).                                                                                                                                                                          |

## Further opportunities (not done, with reason)

1. Lazy-load the compact architecture diagram in Research (~26 KB gzip off the entry). Needs the same no-Suspense
   prerender treatment as the case-study route; risk of hydration mismatch.
2. Split the 78 KB global stylesheet per section. Large refactor; gains mostly on simulated mobile.

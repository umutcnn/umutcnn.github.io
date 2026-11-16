# Reference analysis — suedakurnaz.github.io/suedakurnazwebsite

Analysed on 2026-11-16 from the live site and the public repository
`github.com/suedakurnaz/suedakurnazwebsite` (branch `main`).

## Licensing

The repository has **no license file** (GitHub API `license: null`). Under default copyright no code, styles,
images, sounds or text may be reused. This project therefore re-implements every idea from scratch and copies
nothing — not components, not CSS, not assets. Only general experience principles are carried over.

## How the reference is built

| Area          | Finding                                                                                                                                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack         | React 18 + Vite 5 + OGL; plain JS/JSX; no router, no i18n, no tests                                                                                                                                                                                                    |
| Structure     | `App.jsx` (~12 KB) orchestrates; sections in `src/sections/*` (`Space`, `CaseStudy`, `Viewer`, `Lower`); content in `site.js` and `projects.js`                                                                                                                        |
| Hero          | Full-screen, mono kicker lines top-left / top-right, giant name drawn by a canvas "TechText" component (letter reveal, typing intro, specks), lede + CTA bottom row                                                                                                    |
| Particles     | `Antigravity.jsx`: 2D-canvas dashes that drift; a "magnet" follows the pointer (exponential smoothing, `1 - exp(-dt/τ)`) and pulls nearby particles into a rotating ring; wanders on its own when idle; DPR capped at 2; reduced-motion aware; pauses when not visible |
| Scrolling     | CSS `scroll-snap-type: y mandatory` plus a custom "directional snap" (`snap.js`) that waits for scroll to settle, snaps forward/back, and leaves tall sections free to read                                                                                            |
| Projects      | "Space" section: one full-viewport _poster_ per project, pointer-driven parallax via CSS vars `--mx/--my`, device mock-ups (phone / laptop), per-project accent + glow; a bottom **dock** (dots, prev/next, current name) acts as project-position navigation          |
| Case studies  | Full-screen overlay with its own address `#proje-<id>`; hash read once on load; "next project" loop; screenshot viewer (lightbox) with step navigation                                                                                                                 |
| Feedback      | Web-Audio synthesised click ("petal") and arrival "braam" sounds, toggleable                                                                                                                                                                                           |
| Accessibility | Skip link, `aria-label`s, `aria-current` on dock, mobile menu with Escape + focus return, body scroll lock, toast `role=status`                                                                                                                                        |
| Theme         | Light paper `#f3f2ee`, ink `#111110`, single orange accent `#ff6b3d`; Mona Sans + JetBrains Mono                                                                                                                                                                       |

## Experience principles we keep

1. **The name is the hero.** A full-bleed typographic name with a restrained, physically plausible particle field.
2. **Mono "instrument" labels** framing the page (coordinates, location, year) — editorial, technical tone.
3. **One project per stage.** Projects are presented as scenes, not as a grid of small cards, with a position indicator.
4. **Case studies have their own address** so they can be shared and the browser back button works.
5. **Pointer-driven depth** via CSS custom properties (cheap: transform only).
6. **Particles that pause** off-screen and respect reduced motion.
7. **Content separated from presentation** (data modules drive rendering).

## What we deliberately do differently (originality + quality)

| Reference                                                  | This portfolio                                                                                                                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hash routes `#proje-x`, no SSR                             | Real paths `/work/<slug>/` and `/en/…`, **pre-rendered static HTML** per route (SEO, shareable, refresh-safe on GitHub Pages)                                                                           |
| Canvas-drawn name (text invisible to crawlers, slower LCP) | Real `<h1>` DOM text with CSS mask reveal; LCP is text from the first HTML byte                                                                                                                         |
| Mandatory scroll-snap + custom snapper                     | Native scroll everywhere; optional Lenis smoothing on fine pointers only; CSS `position: sticky` stage for projects — never traps the user                                                              |
| Device mock-ups with screenshots                           | We have no product screenshots (and MAKS work is confidential) → **live, labelled engineering visualisations** (federated rounds, detection overlays, LiDAR layers, CAD wireframe, architecture graphs) |
| Sound feedback                                             | Omitted: low information value, startles screen-reader users                                                                                                                                            |
| Single orange accent on beige                              | "Research lab" identity: paper / night surfaces, _signal lime_ `#A4FF70` used sparingly, _research violet_ `#7776FF`, lab-notebook grid, node/edge motifs                                               |
| Mona Sans                                                  | Space Grotesk (display) + Inter (body) + JetBrains Mono (labels), self-hosted                                                                                                                           |
| Turkish only                                               | TR (default) + EN with typed dictionaries, `hreflang`, localized metadata                                                                                                                               |
| No tests                                                   | Vitest unit/integration, Playwright E2E, axe accessibility, Lighthouse                                                                                                                                  |
| Magnet ring particles                                      | Different behaviour: a _field_ of nodes with pointer repulsion + spring back to a home lattice, faint proximity edges (a "neural mesh"), velocity damping, adaptive count                               |

## Risks noted

- Heavy effects can delay LCP → hero text is server-rendered HTML; canvas starts on idle.
- Pinned scenes can trap mobile users → sticky stage only on wide, fine-pointer, motion-allowed screens; stacked cards elsewhere.
- No real media → every visual is generated and explicitly labelled as conceptual / representative.

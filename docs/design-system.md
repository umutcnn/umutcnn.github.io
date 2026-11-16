# Design system — "Engineering Intelligence"

Source of truth: `src/styles/tokens.css` (CSS custom properties) and `src/lib/motion-tokens.ts` (JS motion values).
Tailwind v4 maps the semantic tokens to utilities via `@theme inline` in `src/styles/globals.css`.

## Concept

A research-lab notebook: paper surfaces with a faint 72 px grid, mono "instrument" labels (`[03] / 09 — WORK`),
node/edge motifs, and cinematic night chapters for the work and the lab. Accent colour is used as a _signal_,
never as decoration.

## Colour

| Token                                | Value                 | Use                                                                                        |
| ------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------ |
| `--c-paper`                          | `#F5F4F0`             | Primary light surface                                                                      |
| `--c-paper-2`                        | `#EBE9E3`             | Secondary light surface (Journey)                                                          |
| `--c-surface`                        | `#FFFFFF`             | Cards on paper                                                                             |
| `--c-ink`                            | `#111318`             | Primary text                                                                               |
| `--c-muted`                          | `#5C616B`             | Secondary text — darkened from the brief's `#707580` to reach 5.6:1 on paper (WCAG AA)     |
| `--c-night`                          | `#090D18`             | Cinematic sections (Work, Achievements, Lab, case-study heroes, footer)                    |
| `--c-night-text` / `--c-night-muted` | `#E8EBF2` / `#9BA3B6` | Text on night (≥ 7:1)                                                                      |
| `--c-signal`                         | `#A4FF70`             | Electric accent: active states, award highlight, progress, CTAs. Never small text on paper |
| `--c-signal-ink`                     | `#2F6A12`             | Signal family when it must be text on paper (AA)                                           |
| `--c-violet` / `--c-violet-ink`      | `#7776FF` / `#4744D4` | Research / AI accent; `-ink` variant for text on paper                                     |
| `--c-warn`                           | `#FFB547`             | "Conceptual / representative" notes, partial detections                                    |

Semantic layer: every section declares `.tone-paper` or `.tone-night`, which set `--bg`, `--fg`, `--fg-muted`,
`--border`, `--accent-text`, `--focus`… Components only use the semantic names, so the same component works on
both surfaces.

**Dark theme** (`html[data-theme="dark"]`): paper surfaces become graphite (`#0D111B`), night sections deepen to
`#04060C`, so the light ↔ night storytelling still reads. The theme is chosen before first paint by an inline
script (stored choice → system preference), persisted in `localStorage['ucy.theme']`.

## Typography

| Role    | Family                           | Notes                                                         |
| ------- | -------------------------------- | ------------------------------------------------------------- |
| Display | Space Grotesk Variable (300–700) | Headlines, hero name, numbers; tracking −0.03…−0.06 em        |
| Body    | Inter Variable (100–900)         | Paragraphs, UI                                                |
| Labels  | JetBrains Mono Variable          | Upper-case instrument labels, metrics context, code-like tags |

Self-hosted woff2 (SIL OFL 1.1 via `@fontsource-variable`), only `latin` + `latin-ext` subsets
(`src/styles/fonts.css`) — enough for Turkish and English. `font-display: swap`; the Space Grotesk latin file is
preloaded on every pre-rendered page.

Fluid scale (`clamp()`): `--fs-hero` 3.1 → 15.5 rem (17 vw below 600 px), `--fs-display` 2.35 → 6 rem,
`--fs-h2` 2 → 4 rem, `--fs-h3` 1.35 → 1.9 rem, `--fs-lead` 1.1 → 1.4 rem, body 17 px, labels 12 px.
The hero name never clips — verified by the responsive E2E test at 320–1920 px.

English strings inside Turkish pages (e.g. the professional headline, GitHub/LinkedIn) carry `lang="en"` so
CSS upper-casing doesn't produce Turkish dotted "İ".

## Spacing & layout

`--gutter` 1 → 3.5 rem, `--section-y` 5.5 → 10.5 rem, max content width 1480 px, nav height 4.25 rem.
Radii 6 / 14 / 26 px. Two-column layouts collapse below 1024 px (960 px for Journey); grid children use
`min-width: 0` so long strings never widen the viewport.

## Motion

| Token           | Value                            | Typical use                              |
| --------------- | -------------------------------- | ---------------------------------------- |
| fast            | 150 ms                           | hover colour, focus                      |
| normal          | 280 ms                           | toggles, chips                           |
| emphasis        | 560 ms                           | panels, disclosures, active project fade |
| cinematic       | 960 ms                           | section reveals, word reveals            |
| `--ease-out`    | `cubic-bezier(0.16, 1, 0.3, 1)`  | entrances                                |
| `--ease-in-out` | `cubic-bezier(0.76, 0, 0.24, 1)` | menu wipe, morphs                        |
| stagger         | 40 ms letters / 80 ms items      |                                          |

Tool per job:

| Effect                                                         | Tool                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| Hover, focus, reveals, menu wipe, hero letter mask             | CSS (transform/opacity/clip-path only)                            |
| Reveal-on-scroll triggers                                      | one shared `IntersectionObserver` (`useReveal`)                   |
| Hero exit scrub, Work panel clip-rise, pinned project progress | GSAP + ScrollTrigger (lazy, `gsap.context().revert()` on unmount) |
| Smooth wheel scrolling                                         | Lenis (fine pointer only, wired to GSAP's ticker)                 |
| Case-study page enter, gallery lightbox                        | Motion (`LazyMotion` + `m`, only in the case-study chunk)         |
| Particle field, CAD wireframe                                  | `requestAnimationFrame` loops paused off-screen / hidden tab      |
| Counters                                                       | small custom hook (counts only if it starts off-screen)           |
| Magnetic CTAs, card tilt + spotlight                           | pointer → CSS variables, rAF-throttled, fine pointer only         |

`prefers-reduced-motion: reduce` → all CSS animation/transition durations collapse, reveals render visible,
no pinning (stacked projects), no Lenis, particle field draws a single static frame, demos only move on user
action. Content is never hidden behind an animation: without JS everything is visible (reveal styles apply only
under `html.js`, with a 3.5 s CSS fail-safe).

## Components (selection)

`SectionHeader`, `Reveal` / `SplitWords`, `Counter`, `Magnetic`, `LazyMount`, `ArchitectureGraph`
(keyboard-operable nodes, list fallback via container query < 560 px), `FederatedSim`, `DetectionPlayground`,
`AerialScene`, `RobotaxiScene`, `CadWireframe`, `PermissionMatrix`, `Gallery` (modal lightbox).

# V2 design system — changes on top of `design-system.md`

Concept: **ENGINEERING INTELLIGENCE — From Research to Real-World Systems.** The V1 tokens (paper / night surfaces,
signal lime, research violet, Space Grotesk / Inter / JetBrains Mono, motion tokens) stay the foundation; V2 gives
each section its own scene without leaving that system.

## Theme

First visit always opens in the **light** theme (owner's decision, 2026-11-16); dark only after the visitor picks it
with the toggle, and that choice is remembered (`localStorage['ucy.theme']`). The OS colour-scheme preference is no
longer read. `theme-color` is the paper colour.

## Scenes per section

| Section       | Scene                                   | Key elements                                                                                                                                                      |
| ------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero          | kinetic typography + Intelligence Field | discipline line `AI ENGINEER / COMPUTER VISION / INTELLIGENT SYSTEMS` (localized), kinetic name, three signal lines (TEKNOFEST 2nd · AI & CV · FL research), CTAs |
| About         | editorial                               | unchanged layout; portrait from the owner's studio photo                                                                                                          |
| Selected Work | cinematic pinned stage                  | clickable visuals, lime cursor pill "Vaka çalışmasını incele ↗", zoom + index fill + title shift + category reveal on hover                                       |
| Case studies  | continuity                              | project visual and title morph from the card (View Transitions)                                                                                                   |
| Research      | interactive algorithm explanation       | FL flow diagram follows the brief exactly                                                                                                                         |
| Achievements  | story chapters                          | ARIA tabs per milestone, rolling year, abstract glyph per milestone (podium "2", three finals, federated clients, stacked degree)                                 |
| Tech stack    | knowledge constellation                 | person at the centre, 7 competence domains, 41 technologies; list fallback < 1100 px                                                                              |
| AI Lab        | engineering demonstrations              | FL training simulation with client inspection + update rules; "Sample Detection Visualization"; zoomable architecture explorer                                    |
| Contact       | bold closing                            | unchanged                                                                                                                                                         |

## New components & tokens

- `KineticName`, `ParticleField` controller API, `Constellation`, story tabs, architecture toolbar.
- Constellation sizes are container-relative (`cqi`) so the computed layout (1000 × 700 units) never overlaps.
- Achievement glyphs use `--c-signal` for the highlighted element, white at 8–35 % for structure — no photos or
  certificates are imitated.
- Fonts: latin + Turkish-only extension subsets; display face `swap` (preloaded), body/labels `optional` with a
  metric-matched `Inter Fallback`.

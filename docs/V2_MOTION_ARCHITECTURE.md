# V2 motion architecture

## One entry point — `src/motion/index.ts`

| Export                                        | Purpose                                            | Implementation                               |
| --------------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| `useReducedMotion`                            | live `prefers-reduced-motion` (hydration-safe)     | `lib/prefs.ts`, `useSyncExternalStore`       |
| `useAnimationQuality` / `getAnimationQuality` | `full` / `balanced` / `minimal` tier               | `motion/quality.ts`                          |
| `useScrollReveal`                             | reveal-on-scroll (one shared IntersectionObserver) | `hooks/useReveal.ts`                         |
| `useElementVisibility`, `useInView`           | pause loops off-screen / lazy start                | `hooks/useReveal.ts`                         |
| `usePointerPosition`                          | shared mutable pointer (no React state per move)   | `lib/pointer.ts`, ref-counted listener       |
| `useMagneticInteraction`                      | spring "magnetic" hover                            | `motion/interaction.ts` (used by `Magnetic`) |
| `usePageTransition` / `runPageTransition`     | route transitions + shared elements                | `motion/page-transition.ts`                  |
| `DURATION`, `EASE`, `STAGGER`, `GSAP_EASE`    | timing tokens                                      | `lib/motion-tokens.ts` ↔ CSS vars            |

## Quality tiers

`resolveQuality({ reducedMotion, tier })` — reduced motion → `minimal` always; device tier (cores, memory,
Save-Data, reduced data, coarse pointer) only ever _lowers_ quality; unknown hardware → `balanced`.

| Tier     | Hero field          | Signals | Canvas DPR | Kinetic name | Pinned Work stage / Lenis           |
| -------- | ------------------- | ------- | ---------- | ------------ | ----------------------------------- |
| full     | full density        | 12      | ≤ 2        | yes          | yes (fine pointer, ≥ 1024 px)       |
| balanced | reduced             | 6       | ≤ 1.5      | yes          | yes (fine pointer, ≥ 1024 px)       |
| minimal  | single static frame | 0       | 1          | off          | off — stacked layout, native scroll |

## Effects and who drives them

| Effect                                       | Driver                                              | Notes                                                                                                                                                                   |
| -------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name entrance                                | CSS mask + stagger                                  | visible in SSR HTML, transform-only                                                                                                                                     |
| Kinetic name                                 | `sections/Hero/KineticName.tsx` + pure `kinetic.ts` | spring per character (push away + 3D tilt, capped at 0.09 em), scroll-velocity skew, sleeps at rest; touch: tap ripple                                                  |
| Intelligence Field                           | `ParticleField.tsx` + pure `particle-physics.ts`    | modes idle (noise flow + signals), interactive (repulsion/swirl, signals start at pointer), exit (radial dispersal from scroll); controller ref API `setExit` / `burst` |
| Hero → About                                 | GSAP ScrollTrigger (`scrub: true`)                  | `fromTo` with explicit start values; drives `field.setExit(progress)`                                                                                                   |
| Work panel rise + pinned progress            | GSAP ScrollTrigger + CSS `position: sticky`         | no pin-spacers; one trigger updates the active project                                                                                                                  |
| Project hover                                | CSS + `usePointerGlow` vars                         | cursor hint, image zoom, index fill, title displacement, category reveal (fine pointer only)                                                                            |
| Card → case study                            | View Transitions API                                | `data-vt-media` / `data-vt-title` morph; reduced motion / unsupported → instant                                                                                         |
| Story tabs, constellation, architecture flow | CSS transitions / keyframes                         | state changes only                                                                                                                                                      |
| Lab sims                                     | rAF / CSS / SMIL                                    | pause when off-screen; compact previews autoplay only while visible                                                                                                     |

## Scroll engineering

- Every GSAP setup runs inside `gsap.context()` and is `revert()`ed on unmount / route change; async loads check a
  `cancelled` flag.
- `installRefreshLifecycle` (`lib/gsap.ts`): `ScrollTrigger.refresh()` after `document.fonts.ready` and (debounced)
  when the document height changes (lazy content, route changes); `ignoreMobileResize` avoids address-bar jitter.
- No nested scroll containers, no scroll-snap, no wheel hijacking (the diagram zooms only with Ctrl/⌘ + wheel).

## Page transitions

`RouterProvider.commit()`: async _prepare_ (loads the case-study chunk) → one synchronous update inside
`document.startViewTransition` (`flushSync`). A newer navigation increments a token and calls `skipTransition()` on
the running one; the rejected `ready`/`updateCallbackDone` promises are handled. Focus moves to the new page's
`<h1>` (or the target section) after a page change — not after a language switch. Scroll intent is applied inside
the transition so the new snapshot already has the right position.

## Bugs found while building V2 (fixed, with tests)

| Bug                                                    | Root cause                                                       | Fix                                                                            |
| ------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Hero stayed 3 % faded at the top of the page on mobile | `ScrollTrigger.refresh()` during a smoothed scrub (`scrub: 0.6`) | `scrub: true` (progress always derived from scroll)                            |
| Hero bottom block permanently shifted 18 px            | GSAP read the start transform mid CSS entrance                   | `fromTo` with explicit start values                                            |
| `pageerror: Transition was skipped` on fast navigation | unhandled `ViewTransition.ready` rejection                       | handle `ready` / `updateCallbackDone`                                          |
| Focus ring on the hero name at first load (dev)        | StrictMode double effect vs "first run" flag                     | compare against previous route key                                             |
| Lucide icons blown up inside visualisations            | `.viz svg { width: 100% }` matched icons                         | `.viz svg:not(.lucide)`                                                        |
| Constellation labels overlapping                       | radial placement only                                            | deterministic box relaxation + container-relative font size (test: 0 overlaps) |

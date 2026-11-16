# V4 accessibility report (WCAG 2.2 AA)

## Automated

| Check                                                                                                                                                                                                       | Result                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| axe-core (`tests/accessibility/a11y.spec.ts`, tags wcag2a/aa, 21a/aa, 22aa) on `/`, `/en/`, a TR and an EN case study, the 404, and the dark theme — in desktop, mobile (touch) and reduced-motion projects | **0 violations** (all pass)                       |
| Lighthouse accessibility                                                                                                                                                                                    | 100 on home and case, mobile and desktop          |
| Tap targets (responsive sweep, 320–430 px)                                                                                                                                                                  | No interactive element under 24 × 24 px after B20 |

Automated tools cannot judge everything; the manual checks below were run as Playwright scenarios.

## Keyboard and focus (manual scenarios, automated in E2E)

| Scenario                                                                                                    | Result          |
| ----------------------------------------------------------------------------------------------------------- | --------------- |
| Skip link is the first tab stop and moves focus to `<main>`                                                 | Pass            |
| Keyboard-only journey (Scenario E: nav, lab tabs, simulator, gallery, back)                                 | Pass            |
| Mobile menu: focus trap, Escape, focus returns to the menu button                                           | Pass            |
| Gallery lightbox: focus trap, Escape, focus returns to the opening thumbnail                                | Pass            |
| Lightbox with interactive media: ←/→ on a control stays with the control (B4)                               | Pass (new test) |
| Focus trap when the last tab stop is a radio group (B14)                                                    | Pass (new test) |
| Lab and Achievements tabs: roving tabindex, ←/→/Home/End; selected tab kept in view on narrow screens (B18) | Pass            |
| After in-app navigation focus moves to the new page's `h1` / target section                                 | Pass            |

## Semantics

- One `h1` per page; sections use `aria-labelledby`; landmarks `header`/`nav`/`main`/`footer`.
- Icon buttons all have accessible names; decorative canvases and SVGs are `aria-hidden`; generated visuals have
  `role="img"` with a label that says they are conceptual.
- `lang` is now correct inside mixed-language labels (B17b): screen readers and CSS casing get English tech names on
  Turkish pages and Turkish names on English pages.
- Navbar CV link announces "(opens in a new tab)".

## Reduced motion

`prefers-reduced-motion: reduce` disables Lenis, GSAP scroll effects, pinning, view transitions, magnetic CTAs,
pointer glow and the particle loop (one static frame). V4 fixes: no content held hidden by entrance delays (B6) and
the cursor no longer disappears over project visuals (B5). The dedicated E2E project runs the whole suite with
reduced motion.

## Remaining / not verified

- Real screen-reader passes (NVDA/VoiceOver) were not performed.
- Background is not made `inert` while the mobile menu or lightbox is open (focus is trapped, so this matters mostly
  for screen-reader virtual cursors).
- `aria-labelledby` on a plain `div` in `ProjectArchive.tsx:16` and `aria-label` on a plain `span` in
  `TechStack.tsx` are ignored by assistive tech (harmless, not changed).
- The FL simulator announces each phase in two `aria-live` regions while playing (chatty, not changed).

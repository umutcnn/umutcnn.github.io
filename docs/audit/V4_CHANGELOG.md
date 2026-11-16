# V4 changelog

Bug IDs refer to [V4_BUG_REGISTER.md](V4_BUG_REGISTER.md).

## Build, deploy, SEO

- `vite.config.ts` — `build.manifest: true` (read by the prerender script, then deleted from `dist`). (B1)
- `scripts/prerender-routes.mjs` — inline the lazy case-study chunk CSS into case pages (B1); apple-touch icon and
  `og:image:alt` in the head (B25); sitemap `lastmod` from the last content commit (B26); site origin imported from
  the SSR bundle instead of a second hard-coded constant.
- `src/entry-server.tsx` — `isCase` flag per page; exports `SITE_URL` from `PROFILE.siteUrl`.
- `.github/workflows/deploy.yml` — `fetch-depth: 0`; second build only for project sites (base ≠ `/`). (B28, B31)
- `src/lib/seo.ts` — `truncateAtWord` (≤ 160 chars) (B16); `applyRouteMeta` syncs every route-dependent tag (B15);
  `ogImageAlt`.
- `index.html`, `src/locales/*` — recommended TR/EN titles and descriptions; `og:image:alt` text; apple-touch icon.
- `public/site.webmanifest`, `public/icons/*`, `scripts/build-assets.mjs` (`--only=icons`) — PNG icons, matching
  theme colour. (B25)

## Navigation and scrolling

- `src/lib/scroll.ts` — ref-counted shared Lenis instance (B10); `lenis.resize()` before programmatic scrolls (B21);
  `scrollToY(y, { smooth })`.
- `src/app/providers/RouterProvider.tsx` — second restore pass only if nothing scrolled (B22); `history.state.from` +
  `cameFrom()`. (B23)
- `src/features/case-studies/CaseStudyPage.tsx` — "All projects" uses `history.back()` when opened from home (B23);
  tone markers (B12); localized metric values (B17c).
- `src/sections/Projects/Work.tsx` / `Work.css` — pinned layout decided on the first post-hydration render (B21);
  index buttons through the shared scroller (B13); cursor and underline fixes (B5, B7); no permanent `will-change`
  (B27).
- `src/app/navigation.ts` — `holdNavDuringScroll()`; `useNavTone(dep, initial)` (B30).
- `src/components/layout/Navbar.tsx` / `.css` — tone keyed on slug and initialised from the route (B12, B30);
  desktop **CV** link.
- `src/components/layout/Footer.tsx` — tone marker.

## Motion

- `src/styles/globals.css` — reveal fail-safe only before hydration (B2); reduced motion resets `animation-delay`
  (B6); `.scroll-fade` edge-fade utility (B18); `.btn` without `will-change` (B27).
- `src/app/App.tsx` — late hydration keeps already-revealed content visible. (B2)
- `src/sections/Hero/KineticName.tsx` — loop paused off-screen. (B8)
- `src/components/visualizations/ParticleField.tsx` — really starts on idle. (B11)
- `src/lib/motion-tokens.ts` — `DURATION.scroll` used by the scroll layer.

## Interactions and accessibility

- `src/hooks/useFocusTrap.ts` — radio group counts as one tab stop. (B14)
- `src/features/case-studies/Gallery.tsx` — arrow keys left to controls inside the viewer. (B4)
- `src/hooks/useOverflowFade.ts` (new) — edge fade + selected tab in view for Achievements and Lab tab strips. (B18)
- `src/components/visualizations/fl-model.ts` — rounds never exceed the target. (B9)
- `src/components/visualizations/AerialScene.tsx` — labels stay inside the frame. (B19)
- `src/features/case-studies/CaseStudy.css`, `src/sections/Contact/Contact.css` — tap targets. (B20)
- `src/sections/Contact/Contact.tsx` — copy fallback. (B24)
- `src/app/providers/theme.ts`, `index.html` — `theme-color` follows the theme. (B25)

## Content and localization (B17)

- `src/types/content.ts` — `Metric.value: string | Localized`.
- `src/content/projects.ts` — TR number formats for metrics; EN TEKNOFEST wording aligned with TR; MAKS CAD
  limitations section from already-disclosed facts.
- `src/content/profile.ts` — localized ordinal suffix ("2." / "2nd").
- `src/content/awards.ts` — "AI in Healthcare" used consistently.
- `src/locales/tr.ts`, `en.ts` — "Hesaplamayı düzenle", formal "Keşfedin" in the lab title, "Şekil 01"/"Fig. 01",
  British "Visualisation".
- `src/components/ui/langTerm.tsx` (new) — correct casing for mixed-language labels; used in
  `TechStack.tsx` and `Research.tsx`.
- `src/sections/Hero/Hero.tsx`, `About.tsx`, `RobotaxiScene.tsx` — Turkish casing for TÜRKİYE; localized figure
  label; localized aria-label.

## Tests and tooling

- New: `tests/unit/{focus-trap,scroll,seo}.test.*`; new cases in `logic.test.ts`, `app.test.tsx`,
  `journey.spec.ts`, `scenarios.spec.ts`.
- `tests/visual/__screenshots__/*` regenerated (stale since the phone number was removed). (B29)
- `tsconfig.node.json` — type-checks `tests/visual`.
- `docs/deployment.md`, `docs/V2_DEPLOYMENT_GUIDE.md` — short "superseded / historical" notes.
- `docs/audit/*` — this audit.

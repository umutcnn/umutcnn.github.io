# Deployment

Nothing has been pushed or published. Choose one of the options below when ready.

## Local

```bash
npm ci
npm run dev            # http://localhost:5173 (client-side render, fast refresh)
npm run build          # typecheck + vite build + pre-render all routes into dist/
npm run preview        # http://localhost:4173 — serves dist/ exactly like a static host
```

## Option A — GitHub Pages user site (configured target: https://umutcnn.github.io/)

1. Create a repository named **`umutcnn.github.io`** (public).
2. Push this folder to its `main` branch.
3. Repository → Settings → Pages → _Source_: **GitHub Actions**.
4. `.github/workflows/deploy.yml` then type-checks, lints, runs unit + Playwright tests, builds and deploys on every push to `main`.

Routing on Pages: every route is a real file (`/work/<slug>/index.html`, `/en/…/index.html`), so refresh and
deep links work without SPA tricks. Unknown paths get `404.html`, which renders the localized 404 view.
`.nojekyll` is emitted so files starting with `_` are served.

## Option B — GitHub Pages project site (e.g. `/umutcan-portfolio/`)

Build with a base path:

```bash
VITE_BASE=/umutcan-portfolio/ npm run build
```

and change `PROFILE.siteUrl` (`src/content/profile.ts`) plus `SITE_URL` in `scripts/prerender-routes.mjs` so
canonical URLs, sitemap and OG image point to `https://umutcnn.github.io/umutcan-portfolio/`.
(Absolute `/favicon.svg`, `/site.webmanifest` and font-preload links in the pre-render head would need the same prefix — prefer Option A.)

## Option C — Vercel / Netlify

- Build command: `npm run build` · Output directory: `dist` · Node 20.19+ or 22.
- No rewrites needed (every route is pre-rendered); configure the platform's 404 page to `404.html`.
- Update `PROFILE.siteUrl` and `SITE_URL` to the final domain before building, so canonical/OG/sitemap URLs are correct.

## Changing the domain later

1. `src/content/profile.ts` → `siteUrl`
2. `scripts/prerender-routes.mjs` → `SITE_URL`
3. `index.html` → `og:image` fallback
4. Rebuild; check `dist/sitemap.xml` and a page's `<link rel="canonical">`.

## Regenerating assets

```bash
# replace assets-src/profile.jpg to change the portrait (square, ≥ 640 px)
npm run assets         # → public/profile/*.avif|webp and public/og-image.png (needs Playwright Chromium)
```

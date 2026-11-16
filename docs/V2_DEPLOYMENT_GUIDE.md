# V2 deployment guide

Nothing has been pushed, deployed or connected to an external service. Everything below is prepared and tested
locally (`npm run build && npm run preview`).

## Build output

`npm run build` = typecheck → Vite build → `scripts/prerender-routes.mjs`, producing in `dist/`:

- 14 pre-rendered routes (`/`, `/en/`, 6 case studies × 2 languages) with localized `<head>`, canonical, hreflang,
  OG and JSON-LD; inlined CSS; deferred entry script;
- `404.html` (renders the localized 404 view for any unknown path), `sitemap.xml`, `robots.txt`, `.nojekyll`.

Every route is a real `…/index.html`, so deep links and refreshes never 404 on a static host.

## GitHub Pages — repository `umutcnn` (current target)

The repository is named `umutcnn`, so Pages serves it at **https://umutcnn.github.io/umutcnn/** (base `/umutcnn/`).

1. Push this project folder (the one with `package.json`) as the repository root, branch `main`.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. `.github/workflows/deploy.yml` then, on every push to `main`: type-checks, lints, runs unit + integration tests,
   builds at `/` and runs the Playwright E2E + accessibility suites, rebuilds with the base path **derived from the
   repository name** (`/umutcnn/`), checks `data-route` / canonical in the output, and deploys.

To publish at the root `https://umutcnn.github.io/` instead, rename the repository to `umutcnn.github.io` — the
workflow switches to base `/` automatically. Visual baselines are Windows-rendered and run locally only.

Note: a repository with exactly your username (`umutcnn/umutcnn`) is also GitHub's special *profile README*
repository — its `README.md` is shown on your GitHub profile page.

Cache behaviour: hashed files under `/assets/` are immutable by content; HTML is revalidated by Pages' default
`max-age=600`.

## GitHub Pages — project site (`/repo/`)

Now supported end to end: `VITE_BASE=/repo/ npm run build` prefixes asset URLs, favicon/manifest, font preload,
`data-route`, canonical/hreflang/OG/sitemap URLs and the router base. Set the same variable in the workflow's build
step (`env: VITE_BASE: /repo/`).
Verified locally: `/repo/en/work/autonomous-robotaxi/` hydrates, client navigation keeps the prefix, canonical is
`https://umutcnn.github.io/repo/…`, 0 console/network errors. On Windows Git Bash prefix the command with
`MSYS_NO_PATHCONV=1`, otherwise the shell rewrites `/repo/` into a Windows path.

## Vercel

`vercel.json` is included: build `npm run build`, output `dist`, `npm ci`, `trailingSlash: true`, immutable cache
for `/assets/*`, and security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`,
`Permissions-Policy`). No rewrites are needed (all routes are files); Vercel serves `404.html` for unknown paths.
Before deploying to a custom domain, update `PROFILE.siteUrl` (`src/content/profile.ts`) and `SITE_URL`
(`scripts/prerender-routes.mjs`).

A Content-Security-Policy header is not set: the page uses three small inline scripts (theme boot, JSON-LD, entry
boot). Adding CSP would require hashes for them — a reasonable follow-up once the domain is final.

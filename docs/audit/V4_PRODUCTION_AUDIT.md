# V4 production audit — Umut Can Yıldız portfolio

Date: 2026-11-16 · Branch: `claude/portfolio-audit-refinement-d2801f` (from `fdd3d87`) · **Not pushed, not deployed.**

Related reports: [bug register](V4_BUG_REGISTER.md) · [UI/UX](V4_UI_UX_REVIEW.md) ·
[performance](V4_PERFORMANCE_REPORT.md) · [accessibility](V4_ACCESSIBILITY_REPORT.md) · [SEO](V4_SEO_REPORT.md) ·
[tests](V4_TEST_RESULTS.md) · [changelog](V4_CHANGELOG.md)

## 1. Executive summary

The site was already in good shape: it loads without errors, every route is pre-rendered and reachable directly,
Lighthouse scored 91–100, axe found nothing, and the content matched the reference facts (TEKNOFEST 2023 2nd place
with Codent, TEKNOFEST 2024 finalist in three categories, TÜBİTAK 2209-A without clinical or publication claims,
≈96.25 % FedProx and YOLOv9 mAP figures shown with their conditions and limits).

The audit found **no P0 issues**, **four P1 issues** and about twenty P2/P3 issues — all fixed except the items that
need the owner (listed in the bug register). The P1s:

1. Case studies opened directly showed an **unstyled page** until JS loaded (route CSS was not inlined).
2. The **scroll-reveal system switched itself off** 3.5 s after load (a fail-safe that fired for everyone).
3. **Going back to the home page landed ~740 px off** on desktop (Lenis kept the previous page's scroll limit).
4. A committed test screenshot in the public repo still showed the **phone number** removed from the site.

## 2. Live vs local

| Check                           | Production (live)                      | Local preview (`fdd3d87`) | Result          |
| ------------------------------- | -------------------------------------- | ------------------------- | --------------- |
| Asset/CSS/font loading          | all 200, no console errors             | same                      | identical build |
| Routing / refresh / direct URLs | 200 for all 14 routes, 404 for unknown | same                      | OK              |
| Base path                       | `/` (repo `umutcnn.github.io`)         | `/`                       | correct         |
| Service worker                  | none                                   | none                      | —               |
| Case-study first paint          | unstyled until JS                      | unstyled until JS         | **B1**, fixed   |

The two GitHub starter workflows added in `f12f2ac`/`154a49a` (raw-repo upload and Jekyll) had already been removed
in `fdd3d87`; only `deploy.yml` remains, uploading `dist/`. Whether the repository's Pages source is set to
"GitHub Actions" cannot be read from code — please confirm in Settings → Pages.

## 3. Pre-render architecture (kept)

`tsc → vite build → scripts/prerender-routes.mjs`: React `prerender` renders 14 routes + 404 into `dist/<route>/
index.html` with localized heads, inlines CSS, defers the entry script to after first paint, writes sitemap,
robots and `.nojekyll`. Clean URLs work on GitHub Pages without a HashRouter, so the architecture was kept and only
the CSS inlining gap was closed.

## 4. Security and privacy

| Item                                   | Result                                                                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Secrets, tokens, env files in the repo | none (`.env*` git-ignored, none tracked)                                                                                                    |
| Third-party scripts / fetches          | none; fonts self-hosted                                                                                                                     |
| `target="_blank"`                      | all with `rel="noopener"` (+ `noreferrer` for external)                                                                                     |
| `dangerouslySetInnerHTML` / `eval`     | none                                                                                                                                        |
| Commercial confidentiality             | MAKS projects show only representative visuals and disclosure notes                                                                         |
| Phone number                           | removed from the site, **still in the CV PDF and in git history** (old test screenshot) — owner decision                                    |
| `npm audit`                            | 7 moderate, all in the dev-only lint toolchain (`minimatch` via `typescript-eslint`); suggested fix is a major-version change — not applied |
| CSP                                    | none possible via headers on GitHub Pages (unchanged)                                                                                       |

## 5. Deployment readiness

- `npm run check` ✔ · E2E + axe 99/99 ✔ · visual 4/4 ✔ · `dist/` has 14 route pages + `404.html`, `sitemap.xml`,
  `robots.txt`, `.nojekyll`, inlined case CSS, no `.vite/` folder.
- To publish: review the diff, commit on this branch, open a PR into `main`, merge. **A push to `main` deploys to
  the live site** through `deploy.yml` (it re-runs typecheck, lint, unit, E2E and axe before uploading).
- After deploy: hard-refresh a case-study URL to confirm it is styled before JS; then follow the Search Console steps
  in the SEO report.

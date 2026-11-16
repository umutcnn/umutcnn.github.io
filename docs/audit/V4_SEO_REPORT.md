# V4 SEO report

## Verified on the live site and the local build

| Item                 | Status                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deployment           | `umutcnn/umutcnn.github.io` → `https://umutcnn.github.io/`, Vite `base: '/'`, one workflow (`deploy.yml`) uploading `dist/`. The briefly-added Jekyll/static starter workflows were already removed in `fdd3d87`. |
| Pre-rendered routes  | 14: `/`, `/en/`, 6 × `/work/<slug>/`, 6 × `/en/work/<slug>/`. Each has its own title, description, canonical, hreflang (`tr`, `en`, `x-default`), OG, Twitter card and JSON-LD (`Person` / `CreativeWork`).       |
| Direct URL / refresh | 200 for every route; unknown paths get `404.html` (noindex, no canonical) with the localized 404 view. No HashRouter needed.                                                                                      |
| Content without JS   | Full text of every page is in the HTML; case pages are now also **styled** without JS (B1).                                                                                                                       |
| `robots.txt`         | `Allow: /` + sitemap URL (origin now from `PROFILE.siteUrl` only).                                                                                                                                                |
| `sitemap.xml`        | 14 URLs with `xhtml:link` alternates; `lastmod` = last content commit (B26).                                                                                                                                      |
| `og-image.png`       | 1200 × 630, 16 KB; `og:image:alt` added.                                                                                                                                                                          |
| Icons                | SVG favicon + new PNG 192/512 + apple-touch icon; manifest updated.                                                                                                                                               |
| `<html lang>`        | Correct per page and updated on language switch.                                                                                                                                                                  |

## Changes in V4

1. **Titles / descriptions** (brief §10.1):
   - EN: `Umut Can Yıldız | AI Engineer & Computer Vision` — "Explore the AI engineering, computer vision, federated
     learning, and software development projects of Umut Can Yıldız."
   - TR: `Umut Can Yıldız | Yapay Zekâ Mühendisi & Bilgisayarlı Görü` — "Umut Can Yıldız’ın yapay zekâ
     mühendisliği, bilgisayarlı görü, federe öğrenme ve yazılım geliştirme projelerini keşfedin."
2. Case-study descriptions: ≤ 160 characters, cut at a word boundary (B16). Before: 9/12 were cut mid-word at 300.
3. Client-side navigation keeps the whole head in sync (B15) — relevant for crawlers that execute JS and for share
   previews taken after navigation.
4. `theme-color` follows the theme; manifest colour matches the page.

## Google Search Console — manual steps for the owner

Nothing was connected or verified on your behalf.

1. Open https://search.google.com/search-console and add a **URL-prefix** property for `https://umutcnn.github.io/`
   (a Domain property is not possible for `github.io`).
2. Verify with the **HTML tag** method: copy the `<meta name="google-site-verification" …>` tag and add it to
   `headFor()` in `scripts/prerender-routes.mjs` (and to `index.html` for dev). Commit, push to `main`, wait for the
   Pages deploy, then press Verify. (The HTML-file method also works: put the file in `public/`.)
3. Sitemaps → submit `https://umutcnn.github.io/sitemap.xml`.
4. URL inspection → request indexing for `/`, `/en/` and the six case studies.
5. Check "Page indexing" after a few days; the 404 page is intentionally `noindex`.

## Remaining

- A single English OG image is used for every page (no per-project or Turkish image).
- The language switch is a button, not a crawlable link; alternates are declared through `hreflang` only.
- JSON-LD `Person` publishes the e-mail address (it is also on the page — by design).

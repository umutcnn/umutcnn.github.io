// Post-build static generation.
// 1. Builds the SSR entry (dist-ssr/) with Vite.
// 2. Renders every route to HTML with React's static `prerender` (waits for lazy chunks).
// 3. Writes dist/<route>/index.html with localized <head> (title, description, canonical, hreflang, OG, JSON-LD),
//    dist/404.html (GitHub Pages fallback), sitemap.xml and robots.txt.
// 4. Inlines the entry CSS and defers the entry script until after first paint (see bootScript).
// Base-path aware: set VITE_BASE=/repo/ for a GitHub Pages project site (all URLs, files and data-route follow it).
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrOut = path.join(root, 'dist-ssr');
const BASE = (() => {
  let b = process.env.VITE_BASE ?? '/';
  if (!b.startsWith('/')) b = `/${b}`;
  return b.endsWith('/') ? b : `${b}/`;
})();
/** "/repo/en/" → "en/" (path inside dist/) */
const stripBase = p => (p.startsWith(BASE) ? p.slice(BASE.length) : p.replace(/^\//, ''));

/**
 * The page is fully pre-rendered and readable without JS, so the entry module is requested only after the first
 * paint: HTML + inlined CSS paint first instead of competing with the JS download on slow connections.
 */
const bootScript = (src, preloads) =>
  `<script>(function(){function go(){var d=document,h=d.head;${JSON.stringify(preloads)}.forEach(function(u){var l=d.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=u;h.appendChild(l)});var s=d.createElement('script');s.type='module';s.crossOrigin='';s.src=${JSON.stringify(src)};h.appendChild(s)}requestAnimationFrame(function(){setTimeout(go,0)})})();</script>`;

const escapeHtml = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function headFor(meta, fontPreload) {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    `<meta name="author" content="Umut Can Yıldız" />`,
    `<meta name="theme-color" content="#f5f4f0" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="Umut Can Yıldız" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:locale" content="${meta.ogLocale}" />`,
    `<meta property="og:image" content="${meta.ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.ogImage}" />`,
    `<link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml" />`,
    `<link rel="apple-touch-icon" href="${BASE}icons/apple-touch-icon.png" />`,
    `<link rel="manifest" href="${BASE}site.webmanifest" />`,
  ];
  if (meta.canonical) {
    tags.push(`<link rel="canonical" href="${meta.canonical}" />`);
    tags.push(`<meta property="og:url" content="${meta.canonical}" />`);
  }
  for (const alt of meta.alternates)
    tags.push(`<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`);
  if (fontPreload) tags.push(`<link rel="preload" href="${fontPreload}" as="font" type="font/woff2" crossorigin />`);
  if (meta.jsonLd) {
    const json = JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }
  return tags.join('\n    ');
}

function fillTemplate(template, { html, meta, routePath, fontPreload, extraStyles = '' }) {
  const head = headFor(meta, fontPreload);
  const out = template
    .replace('</head>', () => `${extraStyles}</head>`)
    // function replacers: `$&`, `$'` etc. inside rendered content must never be interpreted
    .replace(/<html lang="[^"]*"/, () => `<html lang="${meta.lang}"`)
    .replace(/<!--app-head-->[\s\S]*?<!--\/app-head-->/, () => head)
    .replace('<div id="root"><!--app-html--></div>', () => `<div id="root" data-route="${routePath}">${html}</div>`);
  if (out.includes('<!--app-html-->') || out.includes('<!--app-head-->'))
    throw new Error(`template markers left in ${routePath}`);
  return out;
}

/**
 * sitemap <lastmod>: date of the last commit that changed site content (not the build date, which would mark every
 * URL as modified on each deploy). Falls back to today outside a git checkout.
 */
function contentDate() {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', 'src/content', 'src/locales', 'public'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  } catch {
    // not a git checkout
  }
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  if (!existsSync(path.join(dist, 'index.html'))) throw new Error('dist/index.html missing — run `vite build` first');

  await build({
    root,
    logLevel: 'warn',
    build: { ssr: path.join(root, 'src/entry-server.tsx'), outDir: ssrOut, emptyOutDir: true, copyPublicDir: false },
  });
  const ssrFile = (await readdir(ssrOut)).find(f => /^entry-server\.m?js$/.test(f));
  const { listRoutes, renderPath, SITE_URL } = await import(pathToFileURL(path.join(ssrOut, ssrFile)).href);

  let template = await readFile(path.join(dist, 'index.html'), 'utf8');
  const inlineCss = async href => {
    const css = await readFile(path.join(dist, stripBase(href)), 'utf8');
    const safeCss = css.replace(/<\/style/gi, '<\\/style'); // never let CSS text close the <style> element
    return `<style data-inline="${path.basename(href)}">${safeCss}</style>`;
  };
  // Inline every stylesheet the entry needs (entry + shared chunks): no render-blocking CSS request on first visit.
  const inlined = new Set();
  for (const cssLink of [...template.matchAll(/<link rel="stylesheet"[^>]*href="([^"]*assets\/[^"]+\.css)"[^>]*>/g)]) {
    inlined.add(path.basename(cssLink[1]));
    const tag = await inlineCss(cssLink[1]);
    template = template.replace(cssLink[0], () => tag);
  }

  // Case-study pages: the route chunk is lazy, so its CSS is not in index.html. Without inlining it the static
  // page paints unstyled until the deferred entry script has loaded the chunk (FOUC on direct visits).
  const manifestFile = path.join(dist, '.vite', 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  const chunkCss = (key, seen = new Set()) => {
    const chunk = manifest[key];
    if (!chunk || seen.has(key)) return [];
    seen.add(key);
    return [...(chunk.imports ?? []).flatMap(k => chunkCss(k, seen)), ...(chunk.css ?? [])];
  };
  const caseKey = 'src/features/case-studies/CaseStudyPage.tsx';
  if (!manifest[caseKey]) throw new Error(`${caseKey} missing from the Vite manifest`);
  const caseCssFiles = [...new Set(chunkCss(caseKey))].filter(f => !inlined.has(path.basename(f)));
  const caseStyles = (await Promise.all(caseCssFiles.map(f => inlineCss(`${BASE}${f}`)))).join('');
  await rm(path.join(dist, '.vite'), { recursive: true, force: true });
  // Static-import preloads move into the boot script, so they too start after the first paint.
  const preloads = [...template.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"[^>]*>/g)];
  for (const m of preloads) template = template.replace(m[0], '');
  const entry = template.match(/<script type="module" crossorigin src="([^"]*assets\/index-[^"]+\.js)"><\/script>/);
  if (!entry) throw new Error('entry <script type="module"> not found in dist/index.html');
  template = template.replace(entry[0], '').replace(
    '</body>',
    () =>
      `  ${bootScript(
        entry[1],
        preloads.map(m => m[1]),
      )}\n  </body>`,
  );
  const assets = await readdir(path.join(dist, 'assets'));
  const font = assets.find(f => /^space-grotesk-latin-wght-normal.*\.woff2$/.test(f));
  const fontPreload = font ? `${BASE}assets/${font}` : null;

  const routes = listRoutes();
  const indexable = [];
  for (const routePath of routes) {
    const page = await renderPath(routePath, '');
    const file = path.join(dist, stripBase(routePath), 'index.html');
    await mkdir(path.dirname(file), { recursive: true });
    const extraStyles = page.isCase ? caseStyles : '';
    await writeFile(
      file,
      fillTemplate(template, { html: page.html, meta: page.meta, routePath, fontPreload, extraStyles }),
    );
    if (page.meta.canonical) indexable.push(page.meta);
    console.log(`prerendered ${routePath}`);
  }

  // GitHub Pages serves 404.html for unknown paths. Its markup is the TR 404 view; the client re-renders
  // (no hydration) when the actual path differs from data-route, so /en/unknown shows the English 404.
  const nf = await renderPath(`${BASE}404/`, '');
  await writeFile(
    path.join(dist, '404.html'),
    fillTemplate(template, { html: nf.html, meta: nf.meta, routePath: `${BASE}404/`, fontPreload }),
  );
  console.log('prerendered 404.html');

  const lastmod = contentDate();
  const urls = indexable
    .map(m => {
      const alts = m.alternates
        .map(a => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
        .join('\n');
      return `  <url>\n    <loc>${m.canonical}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alts}\n  </url>`;
    })
    .join('\n');
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
  );
  await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}${BASE}sitemap.xml\n`);
  await writeFile(path.join(dist, '.nojekyll'), '');
  await rm(ssrOut, { recursive: true, force: true });
  console.log(`sitemap: ${indexable.length} urls`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

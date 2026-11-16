// Generates optimised static assets into public/.
//  1. Profile photo  → public/profile/umut-can-yildiz-{320,640}.{avif,webp}
//  2. Open Graph card → public/og-image.png (rendered from scripts/og-template.html with Playwright Chromium)
//  3. App icons       → public/icons/icon-{192,512}.png, public/icons/apple-touch-icon.png (from public/favicon.svg)
//
// Run a subset with --only=photo,og,icons (default: all).
//
// Source photo: assets-src/profile.jpg (portrait supplied by the owner, 800×800). Fallback: the portrait extracted
// from the CV with scripts/extract-photo.py into tests/.artifacts/profile-source.png.
// Only the optimised variants are written to public/.
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const photoSrc = [
  path.join(root, 'assets-src/profile.jpg'),
  path.join(root, 'tests/.artifacts/profile-source.png'),
].find(p => existsSync(p));

async function buildPhoto() {
  if (!photoSrc) {
    console.warn('skip photo: add assets-src/profile.jpg (or run scripts/extract-photo.py to extract the CV portrait)');
    return;
  }
  const outDir = path.join(root, 'public/profile');
  await mkdir(outDir, { recursive: true });
  for (const size of [320, 640]) {
    const base = sharp(photoSrc).resize(size, size, { fit: 'cover', position: 'attention' });
    await base
      .clone()
      .avif({ quality: 55 })
      .toFile(path.join(outDir, `umut-can-yildiz-${size}.avif`));
    await base
      .clone()
      .webp({ quality: 78 })
      .toFile(path.join(outDir, `umut-can-yildiz-${size}.webp`));
  }
  console.log(`photo: ok (${path.relative(root, photoSrc)})`);
}

async function buildOgImage() {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.join(root, 'scripts/og-template.html')).href);
    // eslint-disable-next-line no-undef -- runs in the browser page
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: 'png' });
    await sharp(png)
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toFile(path.join(root, 'public/og-image.png'));
    console.log('og-image: ok');
  } finally {
    await browser.close();
  }
}

async function buildIcons() {
  const outDir = path.join(root, 'public/icons');
  await mkdir(outDir, { recursive: true });
  const svg = path.join(root, 'public/favicon.svg');
  for (const [name, size] of [
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['apple-touch-icon.png', 180],
  ]) {
    await sharp(svg, { density: Math.ceil((72 * size) / 64) })
      .resize(size, size)
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(outDir, name));
  }
  console.log('icons: ok');
}

const only = process.argv
  .find(a => a.startsWith('--only='))
  ?.slice(7)
  .split(',');
const run = step => !only || only.includes(step);
if (run('photo')) await buildPhoto();
if (run('og')) await buildOgImage();
if (run('icons')) await buildIcons();

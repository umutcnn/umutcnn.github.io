// Runs Lighthouse (mobile + desktop presets) against the production preview (http://localhost:4173).
// Uses Playwright's Chromium so no system Chrome is required. Lighthouse 12.x is used because 13.x needs Node 22.
// Usage: npm run build && npm run preview (separate terminal) && npm run lighthouse
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const url = process.argv[2] ?? 'http://localhost:4173/';
const outDir = 'tests/.artifacts/lighthouse';
mkdirSync(outDir, { recursive: true });
const chromePath = chromium.executablePath();
const results = {};
for (const preset of ['mobile', 'desktop']) {
  const out = path.join(outDir, `${preset}.json`);
  const args = [
    '-y',
    'lighthouse@12.8.2',
    url,
    '--quiet',
    '--output=json',
    `--output-path=${out}`,
    '--chrome-flags=--headless=new --no-sandbox',
  ];
  if (preset === 'desktop') args.push('--preset=desktop');
  execFileSync('npx', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, CHROME_PATH: chromePath },
  });
  const r = JSON.parse(readFileSync(out, 'utf8'));
  results[preset] = {
    performance: Math.round(r.categories.performance.score * 100),
    accessibility: Math.round(r.categories.accessibility.score * 100),
    bestPractices: Math.round(r.categories['best-practices'].score * 100),
    seo: Math.round(r.categories.seo.score * 100),
    LCP: r.audits['largest-contentful-paint'].displayValue,
    CLS: r.audits['cumulative-layout-shift'].displayValue,
    TBT: r.audits['total-blocking-time'].displayValue,
    FCP: r.audits['first-contentful-paint'].displayValue,
    SI: r.audits['speed-index'].displayValue,
  };
}
console.log(JSON.stringify(results, null, 2));

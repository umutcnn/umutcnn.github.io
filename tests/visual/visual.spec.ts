import type { Page } from '@playwright/test';
import { expect, test } from '../e2e/fixtures';

/**
 * Visual regression baselines for the main sections (desktop 1440 + mobile 375).
 * Stabilised: reduced motion (no particles loop, no autoplay, no reveals), CSS animations disabled, and every
 * time-dependent surface (canvas field, live visualisations) masked so they can't cause false diffs.
 * Baselines are OS-specific (font rasterisation): regenerate with `npx playwright test tests/visual --update-snapshots`.
 */
test.use({ contextOptions: { reducedMotion: 'reduce' }, colorScheme: 'light' });

/**
 * Body/label fonts use `font-display: optional`, so whether a first visit renders them depends on network timing.
 * Load every face once, then reload: the cached fonts are used immediately (the returning-visitor state).
 */
async function warmFonts(page: Page) {
  await page.evaluate(() => Promise.all([...document.fonts].map(f => f.load().catch(() => null))));
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
}

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
] as const;

const SECTIONS = ['home', 'about', 'work', 'achievements', 'stack', 'lab', 'contact'] as const;

test.describe('visual baselines', () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'sizes are set per test; run once');
  });

  for (const size of SIZES) {
    test(`home sections — ${size.name}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/');
      await warmFonts(page);
      for (const id of SECTIONS) {
        await page.evaluate(i => document.getElementById(i)!.scrollIntoView({ block: 'start' }), id);
        await page.waitForTimeout(250);
        await expect(page).toHaveScreenshot(`${id}-${size.name}.png`, {
          animations: 'disabled',
          caret: 'hide',
          // the hero field draws one deterministic static frame under reduced motion, so it is not masked
          mask: [page.locator('.viz--compact'), page.locator('.lab__panel .viz__canvas')],
          maxDiffPixelRatio: 0.01,
        });
      }
    });

    test(`case study hero — ${size.name}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/work/federated-cataract-detection/');
      await warmFonts(page);
      await expect(page).toHaveScreenshot(`case-fl-${size.name}.png`, {
        animations: 'disabled',
        caret: 'hide',
        mask: [page.locator('.case__visual .viz__canvas')],
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});

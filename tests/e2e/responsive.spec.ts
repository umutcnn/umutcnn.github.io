import { mkdirSync } from 'node:fs';
import { expect, test } from './fixtures';

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const OUT = 'tests/.artifacts/screens';

test.describe('responsive layout', () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'runs once — viewport sizes are set per test');
  });

  for (const width of WIDTHS) {
    test(`no overflow or clipping at ${width}px`, async ({ page }) => {
      mkdirSync(OUT, { recursive: true });
      const height = width < 768 ? 820 : width < 1280 ? 900 : 1000;
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForTimeout(1500);

      // the hero name must be fully visible (never cropped)
      const box = await page.locator('.hero__name').boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      await page.screenshot({ path: `${OUT}/hero-${width}.png` });

      // walk the page to trigger reveals, then check overflow everywhere
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.7) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 40));
        }
      });
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(0);

      // no heading wider than its container (text clipping)
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll('h1, h2, h3')]
          .filter(
            h =>
              (h as HTMLElement).offsetParent &&
              h.scrollWidth > h.clientWidth + 2 &&
              !h.classList.contains('hero__name'),
          )
          .map(h => h.textContent?.slice(0, 40)),
      );
      expect(clipped, clipped.join(' | ')).toEqual([]);

      if (width === 375 || width === 1440) {
        for (const id of ['about', 'work', 'research', 'achievements', 'stack', 'journey', 'lab', 'contact']) {
          await page.locator(`#${id}`).scrollIntoViewIfNeeded();
          await page.evaluate(i => document.getElementById(i)!.scrollIntoView(), id);
          await page.waitForTimeout(700);
          await page.screenshot({ path: `${OUT}/${id}-${width}.png` });
        }
      }
    });
  }

  test('case studies and 404 have no horizontal overflow on phones', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 820 });
    for (const path of [
      '/work/federated-cataract-detection/',
      '/work/teknofest-2023-transportation-ai/',
      '/en/work/autonomous-robotaxi/',
      '/work/maks-cad-intelligence/',
      '/en/work/maks-enterprise-erp/',
      '/work/industrial-coil-detection/',
      '/work/does-not-exist/',
    ]) {
      await page.goto(path);
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 30));
        }
      });
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('case study and 404 screenshots', async ({ page }) => {
    mkdirSync(OUT, { recursive: true });
    for (const [w, h] of [
      [1440, 1000],
      [375, 820],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/work/maks-cad-intelligence/');
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}/case-cad-${w}.png` });
      await page.goto('/en/work/maks-enterprise-erp/');
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}/case-erp-${w}.png`, fullPage: true });
    }
  });
});

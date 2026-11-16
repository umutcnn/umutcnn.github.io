import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from '../e2e/fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function scan(page: Page) {
  // Let reveal animations settle so contrast is measured on final colours.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  // The hero exit is a scroll-scrubbed fade; wait until it has settled back to fully opaque before measuring contrast.
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.hero__bottom');
      return !el || Number(getComputedStyle(el).opacity) > 0.99;
    },
    null,
    { timeout: 5000 },
  );
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map(
    v =>
      `${v.id} (${v.impact}): ${v.nodes
        .slice(0, 3)
        .map(n => n.target.join(' '))
        .join(' | ')}`,
  );
  expect(summary, summary.join('\n')).toEqual([]);
}

for (const path of [
  '/',
  '/en/',
  '/work/maks-enterprise-erp/',
  '/en/work/industrial-coil-detection/',
  '/work/does-not-exist/',
]) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await scan(page);
  });
}

test('axe: dark theme home', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ucy.theme', 'dark'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await scan(page);
});

test('keyboard: skip link moves focus to main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'İçeriğe geç' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('reduced motion keeps every section readable', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  for (const id of ['about', 'work', 'research', 'achievements', 'stack', 'journey', 'lab', 'contact']) {
    const heading = page.locator(`#${id} h2`).first();
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    expect(
      await heading.evaluate(el => getComputedStyle(el.querySelector('.split-word > span') ?? el).transform),
    ).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
  }
  await context.close();
});

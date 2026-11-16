import { test as base, expect, type Page } from '@playwright/test';

/**
 * Every test fails if the page logs a console error, throws, or a same-origin request fails.
 * This is how hydration mismatches, broken assets and runtime exceptions surface.
 */
/** Waits until React has hydrated (the entry script is deliberately requested after first paint). */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === '1', null, { timeout: 15_000 });
}

export const test = base.extend<{ diagnostics: string[] }>({
  // page.goto / reload / back / forward resolve only once the app is interactive.
  page: async ({ page }, use) => {
    for (const method of ['goto', 'reload', 'goBack', 'goForward'] as const) {
      const original = page[method].bind(page) as (...a: unknown[]) => Promise<unknown>;
      (page as unknown as Record<string, unknown>)[method] = async (...args: unknown[]) => {
        const res = await original(...args);
        await waitForHydration(page).catch(() => {});
        return res;
      };
    }
    await use(page);
  },
  diagnostics: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`);
      });
      page.on('pageerror', err => problems.push(`pageerror: ${err.message}`));
      page.on('requestfailed', req => {
        if (req.url().startsWith(baseURL ?? ''))
          problems.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`);
      });
      page.on('response', res => {
        if (
          res.url().startsWith(baseURL ?? '') &&
          res.status() >= 400 &&
          !res.url().includes('does-not-exist') &&
          !res.url().includes('bilinmeyen')
        )
          problems.push(`HTTP ${res.status()}: ${res.url()}`);
      });
      await use(problems);
      expect(problems, problems.join('\n')).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;

/** Go to a home-page section via the real navigation UI (desktop bar or mobile menu). */
export async function navigateToSection(page: Page, label: RegExp | string) {
  if (isMobile(page)) {
    await page.getByTestId('menu-open').click();
    const menu = page.getByTestId('mobile-menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: label }).click();
    await expect(menu).toBeHidden();
  } else {
    await page
      .getByRole('navigation', { name: /Ana menü|Main navigation/ })
      .getByRole('link', { name: label })
      .click();
  }
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

import type { Page } from '@playwright/test';
import { expect, expectNoHorizontalOverflow, isMobile, navigateToSection, test, waitForHydration } from './fixtures';

/** Number of event listeners on window + document (Chromium DevTools protocol). */
async function listenerCount(page: Page): Promise<number> {
  const cdp = await page.context().newCDPSession(page);
  let total = 0;
  for (const expr of ['window', 'document']) {
    const { result } = await cdp.send('Runtime.evaluate', { expression: expr });
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId! });
    total += listeners.length;
  }
  await cdp.detach();
  return total;
}

test.describe('Scenario A — first impression', () => {
  test('hero renders the brief headline and exits on scroll without locking it', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Umut Can Yıldız' })).toBeVisible();
    await expect(page.getByText('YAPAY ZEKÂ MÜHENDİSİ / BİLGİSAYARLI GÖRÜ / AKILLI SİSTEMLER')).toBeVisible();
    await expect(page.getByText('Zekâyı gerçek dünya çözümlerine dönüştürüyorum.')).toBeVisible();
    await expect(page.locator('.hero__signals li')).toHaveCount(3);
    await expectNoHorizontalOverflow(page);
    // scrolling is never locked: the page moves and the hero hands over to About
    await page.mouse.wheel(0, 900);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    if (test.info().project.name === 'desktop') {
      await expect
        .poll(() => page.evaluate(() => Number(getComputedStyle(document.querySelector('.hero__center')!).opacity)))
        .toBeLessThan(0.95);
    }
  });

  test('kinetic name reacts to the pointer and returns to rest', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'fine pointer + full motion only');
    await page.goto('/');
    const box = (await page.locator('.hero__name').boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3, { steps: 4 });
    await expect
      .poll(() =>
        page
          .locator('.hero__mask')
          .evaluateAll(els => els.some(e => /translate3d\((?!0px, 0px)/.test(e.style.transform))),
      )
      .toBe(true);
    await page.mouse.move(5, 5, { steps: 4 });
    await expect
      .poll(
        () =>
          page.locator('.hero__mask').evaluateAll(els =>
            els.every(e => {
              const m = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(e.style.transform);
              return !m || (Math.abs(+m[1]!) < 0.2 && Math.abs(+m[2]!) < 0.2);
            }),
          ),
        { timeout: 5000 },
      )
      .toBe(true);
  });
});

test.describe('Scenario B — portfolio navigation', () => {
  test('open a case study from the project visual, use the gallery, go back, open another', async ({ page }) => {
    await page.goto('/');
    await navigateToSection(page, /Projeler/);
    if (isMobile(page) || test.info().project.name !== 'desktop') {
      await page.getByRole('link', { name: /Vaka çalışmasını incele: Federe Öğrenme/ }).click();
    } else {
      // desktop: the visual itself is a pointer shortcut (with a contextual cursor hint)
      const visual = page.locator('.work-item.is-active .work-item__visual');
      await visual.hover();
      await expect(visual.locator('.work-item__cursor')).toBeVisible();
      await visual.locator('.work-item__hit').click();
    }
    await expect(page).toHaveURL(/\/work\/federated-cataract-detection\/$/);
    await expect(page.getByRole('heading', { level: 1, name: /Katarakt/ })).toBeFocused();

    await page.getByTestId('gallery-open-1').click();
    await expect(page.getByTestId('lightbox-counter')).toHaveText('2 / 2');
    await page.keyboard.press('Escape');

    await page.goBack();
    await expect(page).toHaveURL(/\/#work$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    await page.goto('/work/maks-cad-intelligence/');
    await expect(page.getByRole('heading', { level: 1, name: 'MAKS CAD Intelligence' })).toBeVisible();
    await page.getByTestId('case-next').click();
    await expect(page).toHaveURL(/maks-enterprise-erp/);
    await expect(page).toHaveTitle(/MAKS Enterprise ERP/);
  });
});

test.describe('Scenario C — interactive systems', () => {
  test('federated simulator: start, pause, reset, switch algorithm', async ({ page }) => {
    await page.goto('/#lab');
    const lab = page.locator('#lab');
    await lab.locator('.lab__shell').scrollIntoViewIfNeeded();
    const status = lab.locator('.viz__status');
    await expect(status).toContainText('Tur 0 / 5');

    await lab.getByTestId('fl-play').click(); // start
    await expect(status).not.toContainText('Hazır', { timeout: 5000 });
    await expect(lab.getByTestId('fl-play')).toHaveText(/Duraklat/);
    await lab.getByTestId('fl-play').click(); // pause
    const paused = await status.textContent();
    await page.waitForTimeout(1600);
    await expect(status).toHaveText(paused!); // nothing advances while paused

    await lab.getByRole('button', { name: 'Sıfırla' }).click(); // reset
    await expect(status).toContainText('Tur 0 / 5');
    await expect(status).toContainText('Hazır');

    await lab.getByText('FedAvg', { exact: true }).click(); // algorithm
    await expect(lab.locator('.fl-explain__rule')).toHaveText('w ← Σₖ (nₖ / n) · wₖ');
    await expect(lab.locator('.fl-server text').first()).toHaveText('FedAvg');
    await lab.getByTestId('fl-client-1').check({ force: true });
    await expect(lab.getByTestId('fl-client-card')).toContainText('%33');
  });

  test('architecture explorer zooms, pans with the keyboard and fits back', async ({ page }) => {
    test.skip(isMobile(page), 'narrow screens get the ordered flow list instead of the zoomable canvas');
    await page.goto('/#lab');
    const lab = page.locator('#lab');
    await lab.getByTestId('lab-tab-arch').click();
    const stage = lab.getByTestId('arch-stage');
    await stage.focus();
    await page.keyboard.press('+');
    await expect(lab.getByTestId('arch-zoom')).toHaveText('120%');
    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(() => stage.locator('.arch__viewport').evaluate(e => (e as HTMLElement).style.transform))
      .toContain('translate(');
    await lab.getByTestId('arch-fit').click();
    await expect(lab.getByTestId('arch-zoom')).toHaveText('100%');
    await lab.getByText('MAKS CAD · işleme hattı').click();
    await expect(lab.getByRole('button', { name: 'BOM dışa aktarımı' }).first()).toBeVisible();
  });
});

test.describe('Scenario E — keyboard only', () => {
  test('tab order reaches navigation, lab tabs and story tabs; Escape closes dialogs', async ({ page }) => {
    test.skip(isMobile(page), 'desktop keyboard flow');
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'İçeriğe geç' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.navbar__logo')).toBeFocused();
    // story tabs: arrow keys move selection and focus
    const tab = page.getByTestId('story-tab-teknofest-2023');
    await tab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('story-tab-tubitak-2209a')).toBeFocused();
    await expect(page.getByTestId('story-tab-tubitak-2209a')).toHaveAttribute('aria-selected', 'true');
    // gallery dialog on a case study
    await page.goto('/work/autonomous-robotaxi/');
    await page.getByTestId('gallery-open-0').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('lightbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('lightbox')).toBeHidden();
    await expect(page.getByTestId('gallery-open-0')).toBeFocused();
  });
});

test.describe('Scenario F — localization round trip', () => {
  test('TR → EN → TR keeps the route and leaves no untranslated keys', async ({ page }) => {
    for (const path of ['/', '/work/maks-enterprise-erp/']) {
      await page.goto(path);
      for (const lang of ['en', 'tr'] as const) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByTestId('lang-toggle').first().click();
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        const text = await page.locator('body').innerText();
        expect(text, `${path} ${lang}`).not.toMatch(/undefined|\[object Object\]|NaN/);
      }
      expect(new URL(page.url()).pathname).toBe(path);
    }
  });
});

test.describe('Scenario G — stability', () => {
  test('repeated navigation, rapid clicks, resizes and dialogs leave no leaks or errors', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'CDP + resize run once');
    await page.goto('/work/federated-cataract-detection/');
    const cycle = async () => {
      for (let i = 0; i < 3; i++) {
        await page.getByTestId('case-next').click();
        await expect(page.locator('main h1')).toBeVisible();
      }
      for (let i = 0; i < 3; i++) await page.goBack();
      await expect(page).toHaveURL(/federated-cataract-detection/);
      for (let i = 0; i < 3; i++) {
        await page.getByTestId('gallery-open-0').click();
        await expect(page.getByTestId('lightbox')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('lightbox')).toBeHidden();
      }
    };
    await cycle();
    const baseline = await listenerCount(page);
    for (let i = 0; i < 4; i++) await cycle();
    const after = await listenerCount(page);
    expect(after - baseline, `listeners ${baseline} → ${after}`).toBeLessThanOrEqual(2);

    // rapid language toggling ends in a consistent state
    await page.evaluate(() => window.scrollTo(0, 0));
    for (let i = 0; i < 6; i++) await page.getByTestId('lang-toggle').first().click({ delay: 10 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
    await expect(page).toHaveURL(/\/work\/federated-cataract-detection\/$/);

    // resizes and an orientation flip
    await page.goto('/');
    for (const [w, h] of [
      [1440, 900],
      [768, 1024],
      [1024, 768],
      [375, 812],
      [812, 375],
      [1440, 900],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(250);
      await expectNoHorizontalOverflow(page);
    }
    await waitForHydration(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Umut Can Yıldız' })).toBeVisible();
  });

  test('"All projects" returns to the exact spot on the home page the case study was opened from', async ({ page }) => {
    await page.goto('/');
    // the active card (desktop pins the section and makes the other cards inert)
    await page.locator('#work').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 400);
    const link = page.locator('#work .work-item:not([inert]) .work-item__title-link').first();
    await link.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300); // let the scroll position be saved into history.state (debounced)
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(300);
    await link.click();
    await expect(page).toHaveURL(/\/work\/[a-z0-9-]+\/$/);
    await page.getByTestId('case-back').click();
    await expect(page).toHaveURL(/\/(#work)?$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 80);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(before + 80);
    // history did not grow: one more "back" leaves the site's home entry (nothing to go back to in this test)
    expect(await page.evaluate(() => history.length)).toBeLessThanOrEqual(3);
  });

  test('navigating while a transition is running stays consistent', async ({ page }) => {
    await page.goto('/work/teknofest-2023-transportation-ai/');
    // two navigations back to back (the second cancels the first transition)
    await page.getByTestId('case-next').click();
    await page.getByTestId('case-back').click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator('#work')).toBeVisible();
  });
});

test.describe('theme default', () => {
  test('first visit opens in light even when the OS prefers dark; a chosen dark theme is remembered', async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === '1');
    await page.getByTestId('theme-toggle').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await context.close();
  });
});

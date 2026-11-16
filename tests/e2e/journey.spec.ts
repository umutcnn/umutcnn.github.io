import { expect, expectNoHorizontalOverflow, isMobile, navigateToSection, test } from './fixtures';

test.describe('primary visitor journey', () => {
  test('home → about → work → case study → gallery → next → back → EN → theme', async ({ page }) => {
    // 1–2. Home + hero
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Umut Can Yıldız' })).toBeVisible();
    await expect(page.locator('.hero__award')).toContainText('TEKNOFEST 2023 — TÜRKİYE 2.Sİ');
    await expect(page.locator('.hero__award')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // 3. Navigate to About
    await navigateToSection(page, /Hakkımda/);
    await expect(page.locator('#about')).toBeInViewport({ ratio: 0.1 });
    await expect(page).toHaveURL(/#about$/);

    // 4. Navigate to Selected Work
    await navigateToSection(page, /Projeler/);
    await expect(page.locator('#work')).toBeInViewport({ ratio: 0.05 });

    // 5. Open the federated learning case study
    await page.getByRole('link', { name: /Vaka çalışmasını incele: Federe Öğrenme/ }).click();
    await expect(page).toHaveURL(/\/work\/federated-cataract-detection\/$/);

    // 6. Case study content
    await expect(page.getByRole('heading', { level: 1, name: 'Federe Öğrenme ile Katarakt Tespiti' })).toBeVisible();
    await expect(page.getByText('≈ %96,25')).toBeVisible(); // TR number format
    await expect(page.getByRole('heading', { name: /Problem/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Sınırlar/ })).toBeVisible();
    await expect(page).toHaveTitle(/Federe Öğrenme ile Katarakt Tespiti — Vaka Çalışması/);

    // 7. Gallery lightbox
    await page.getByTestId('gallery-open-0').click();
    const dialog = page.getByTestId('lightbox');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('lightbox-counter')).toHaveText('1 / 2');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByTestId('lightbox-counter')).toHaveText('2 / 2');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('gallery-open-0')).toBeFocused();

    // 8. Next project
    await page.getByTestId('case-next').click();
    await expect(page).toHaveURL(/\/work\/teknofest-2023-transportation-ai\/$/);
    await expect(page.getByRole('heading', { level: 1, name: /TEKNOFEST 2023/ })).toBeVisible();

    // 9. Browser back
    await page.goBack();
    await expect(page).toHaveURL(/\/work\/federated-cataract-detection\/$/);
    await expect(page.getByRole('heading', { level: 1, name: /Katarakt/ })).toBeVisible();

    // 10. TR → EN on the same route (scroll up first: the bar hides while reading downwards)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByTestId('lang-toggle').first().click();
    await expect(page).toHaveURL(/\/en\/work\/federated-cataract-detection\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Federated Learning Cataract Detection' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/Case Study/);

    // 11. Theme toggle
    const before = await page.locator('html').getAttribute('data-theme');
    await page.getByTestId('theme-toggle').first().click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '');
    await page.reload();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? '');
  });
});

test.describe('interactive lab', () => {
  test('federated, vision and architecture demos respond to input', async ({ page }) => {
    await page.goto('/#lab');
    const lab = page.locator('#lab');
    await lab.scrollIntoViewIfNeeded();
    await expect(lab.getByText(/Eğitim simülasyonu — gerçek eğitim çalıştırılmaz/)).toBeVisible();

    await lab.getByTestId('fl-step').click();
    await expect(lab.getByText('Yerel eğitim', { exact: true })).toBeVisible();
    await lab.getByTestId('fl-rounds').fill('8');
    await expect(lab.getByText(/Tur 0 \/ 8/)).toBeVisible();

    await lab.getByTestId('lab-tab-cv').click();
    await expect(lab.getByText(/gerçek model çıkarımı yapılmaz/)).toBeVisible();
    const count = lab.getByTestId('cv-count');
    await lab.getByTestId('cv-threshold').fill('0.1');
    const low = Number(await count.textContent());
    await lab.getByTestId('cv-threshold').fill('0.9');
    await expect.poll(async () => Number(await count.textContent())).toBeLessThan(low);

    await lab.getByTestId('lab-tab-arch').click();
    const node = lab.getByRole('button', { name: 'API (NestJS)' }).first();
    await node.click();
    await expect(lab.getByText(/rol tabanlı yetki \(RBAC\)/)).toBeVisible();
  });
});

test.describe('contact and links', () => {
  test('exposes verified contact actions and a working CV download', async ({ page, request }) => {
    await page.goto('/#contact');
    const contact = page.locator('#contact');
    await expect(contact.getByTestId('contact-email')).toHaveAttribute('href', 'mailto:yildizumutcan21@gmail.com');
    await expect(contact.getByRole('link', { name: /github\.com\/umutcnn/ })).toHaveAttribute(
      'href',
      'https://github.com/umutcnn',
    );
    await expect(contact.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute(
      'href',
      /linkedin\.com\/in\/umut-can-yildiz/,
    );
    // the phone number was removed at the owner's request
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    const cvHref = await contact.getByRole('link', { name: /PDF/ }).getAttribute('href');
    const res = await request.get(cvHref!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
  });

  test('every in-app link resolves', async ({ page, request }) => {
    for (const path of ['/', '/en/']) {
      await page.goto(path);
      const hrefs = await page.$$eval('a[href^="/"]', as => [
        ...new Set(as.map(a => (a as HTMLAnchorElement).pathname)),
      ]);
      for (const href of hrefs) {
        const res = await request.get(href);
        expect(res.status(), href).toBe(200);
      }
    }
  });
});

test.describe('deep links and errors', () => {
  test('direct load of a pre-rendered case study (refresh-safe) hydrates without errors', async ({ page }) => {
    const res = await page.goto('/en/work/autonomous-robotaxi/');
    expect(res?.status()).toBe(200);
    const html = await res!.text();
    expect(html).toContain('Autonomous Robotaxi Systems');
    expect(html).toContain('<link rel="canonical" href="https://umutcnn.github.io/en/work/autonomous-robotaxi/"');
    await expect(page.getByRole('heading', { level: 1, name: 'Autonomous Robotaxi Systems' })).toBeVisible();
    // layer toggles work after hydration
    const scene = page.locator('.case__visual');
    const lidar = scene.getByTestId('layer-lidar');
    await expect(lidar).toBeChecked();
    await scene.getByText('LiDAR', { exact: true }).click();
    await expect(lidar).not.toBeChecked();
    await expect(scene.locator('.taxi-lidar')).toHaveCount(0);
  });

  test('unknown deep links show a localized 404 with a way home', async ({ page }) => {
    await page.goto('/work/does-not-exist/');
    await expect(page.getByRole('heading', { name: 'Bu rota haritada yok.' })).toBeVisible();
    await page.getByRole('link', { name: 'Ana sayfaya dön' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Umut Can Yıldız' })).toBeVisible();
  });
});

test.describe('mobile navigation', () => {
  test('menu traps focus, closes with Escape and restores focus', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await page.goto('/');
    const opener = page.getByTestId('menu-open');
    await opener.click();
    const menu = page.getByTestId('mobile-menu');
    await expect(menu).toBeVisible();
    for (let i = 0; i < 20; i++) await page.keyboard.press('Tab');
    expect(await menu.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe('regressions from code review', () => {
  test('pre-rendered pages are readable with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    for (const [path, name] of [
      ['/', 'Umut Can Yıldız'],
      ['/en/work/maks-cad-intelligence/', 'MAKS CAD Intelligence'],
    ] as const) {
      await page.goto(path);
      const h1 = page.getByRole('heading', { level: 1, name });
      await expect(h1).toBeVisible();
      const opacity = await page.locator('main').evaluate(el => {
        let o = 1;
        for (let n: Element | null = el.querySelector('h1'); n; n = n.parentElement)
          o *= Number(getComputedStyle(n).opacity);
        return o;
      });
      expect(opacity, path).toBe(1);
    }
    await context.close();
  });

  test('case studies are styled before any script runs (route CSS is inlined, no FOUC)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/work/federated-cataract-detection/');
    const styles = await page.locator('.case__title').evaluate(el => {
      const hero = el.closest('.case__hero')!;
      return {
        size: parseFloat(getComputedStyle(el).fontSize),
        heroPad: parseFloat(getComputedStyle(hero).paddingTop),
      };
    });
    // CaseStudy.css sets a display-size title and a padded night hero; unstyled the title is 17px with no padding
    expect(styles.size).toBeGreaterThan(30);
    expect(styles.heroPad).toBeGreaterThan(0);
    await context.close();
  });

  test('a non-hydrated English 404 gets an English <title>', async ({ page }) => {
    await page.goto('/en/work/does-not-exist/');
    await expect(page.getByRole('heading', { name: 'This route is not on the map.' })).toBeVisible();
    await expect(page).toHaveTitle('Page not found | Umut Can Yıldız');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('switching language keeps the current section hash', async ({ page }) => {
    await page.goto('/');
    await navigateToSection(page, /Başarılar/);
    await expect(page).toHaveURL(/#achievements$/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByTestId('lang-toggle').first().click();
    await expect(page).toHaveURL(/\/en\/#achievements$/);
  });

  test('a nav click that is also the first interaction still reaches its section', async ({ page }) => {
    // On a busy machine the browser never reports idle, so the click itself opens the gate that loads GSAP and
    // Lenis. ScrollTrigger.refresh() used to cancel the native smooth scroll the click had just started (CI flake).
    await page.addInitScript(() => {
      window.requestIdleCallback = () => 0;
    });
    await page.goto('/');
    await navigateToSection(page, /Hakkımda/);
    await expect(page.locator('#about')).toBeInViewport({ ratio: 0.1 });
  });

  test('scroll position survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('#research').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.getElementById('research')!.offsetTop));
    await page.waitForTimeout(400); // the router saves scrollY into history.state (debounced)
    const before = await page.evaluate(() => window.scrollY);
    await page.reload();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 200);
  });
});

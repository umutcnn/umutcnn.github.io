import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the production build served by `vite preview` (pre-rendered HTML + hydration),
 * i.e. what GitHub Pages will serve. Run `npm run build` first.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'accessibility/**/*.spec.ts', 'visual/**/*.spec.ts'],
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{arg}{ext}',
  outputDir: './test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
  ],
});

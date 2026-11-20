import { defineConfig } from '@playwright/test';

export const TRANSLATE_URL = 'https://translate.test';

const executablePath = process.env.CHROME_PATH || undefined;
const launchOptions = { executablePath };

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  // The iPhone and desktop projects run side by side: 13.7 min with one worker, 9.5 min with two
  // on a 2-CPU machine (20 November 2026).
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4174/',
    locale: 'fr-FR',
    launchOptions,
    // A stuck step fails fast with its own name instead of the whole test timing out.
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
  },
  // A separate build, wired to a fake translation service that the tests answer themselves.
  webServer: {
    command: 'vite build --outDir .e2e-dist --emptyOutDir && vite preview --outDir .e2e-dist --port 4174 --strictPort',
    env: { VITE_TRANSLATE_URL: TRANSLATE_URL, VITE_COUNTS_URL: TRANSLATE_URL },
    url: 'http://localhost:4174/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'iphone',
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});

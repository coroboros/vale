import { defineConfig } from '@playwright/test';

export const TRANSLATE_URL = 'https://translate.test';

/** Set CHROME_PATH to use an installed Chrome instead of Playwright's bundled browser. */
const executablePath = process.env.CHROME_PATH || undefined;
const launchOptions = {
  executablePath,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
};

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4174/', locale: 'fr-FR', launchOptions },
  // A separate build, wired to a fake translation service that the tests answer themselves.
  webServer: {
    command: 'vite build --outDir .e2e-dist --emptyOutDir && vite preview --outDir .e2e-dist --port 4174 --strictPort',
    env: { VITE_TRANSLATE_URL: TRANSLATE_URL },
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

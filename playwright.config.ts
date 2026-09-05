import { defineConfig, devices } from '@playwright/test';

const externalBase = process.env.PATCHCARD_TEST_URL;

export default defineConfig({
  testDir: './browser-tests',
  fullyParallel: false,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [['line']],
  use: {
    baseURL: externalBase ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: externalBase ? undefined : {
    command: 'node scripts/serve-site.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30_000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});

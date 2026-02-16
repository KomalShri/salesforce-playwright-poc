// @ts-check
require('dotenv').config();
const { defineConfig } = require('@playwright/test');

/**
 * Playwright config — tuned for Salesforce Lightning.
 *
 * Key decisions:
 *  • Single Chromium browser (SF Lightning is Chromium-optimised)
 *  • Long navigation timeout — SF orgs can be slow, especially free dev editions
 *  • fullyParallel: false — SF dev orgs share state; serial execution prevents conflicts
 *  • storageState reuse via global-setup keeps login cost amortised across specs
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,          // SF dev orgs are single-tenant; avoid data races
  retries: process.env.CI ? 1 : 0,
  workers: 1,                    // single worker for dev-org safety
  timeout: 120_000,              // 2 min per test — SF pages can be sluggish
  expect: { timeout: 15_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    baseURL: process.env.SF_BASE_URL,
    headless: true,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    navigationTimeout: parseInt(process.env.SF_NAVIGATION_TIMEOUT || '60000'),
    actionTimeout: parseInt(process.env.SF_ACTION_TIMEOUT || '30000'),
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled'],   // reduce bot-detection friction
    },
  },

  projects: [
    {
      name: 'salesforce-chromium',
      use: { browserName: 'chromium' },
    },
  ],
});

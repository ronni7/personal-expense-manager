import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  fullyParallel: true,

  // Nie pozwalaj na pozostawienie test.only w CI.
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4200',

    // Zbieraj materiały diagnostyczne w przypadku błędu.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});

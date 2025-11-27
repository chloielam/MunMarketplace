import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/acceptance',
  timeout: 60000,
  fullyParallel: false,
  retries: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});

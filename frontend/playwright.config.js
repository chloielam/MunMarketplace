// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 5173);
const backendPort = Number(process.env.E2E_BACKEND_PORT || 3000);
const defaultHost = process.env.E2E_HOST || 'localhost';
const frontendOrigin = process.env.E2E_FRONTEND_ORIGIN || `http://${defaultHost}:${frontendPort}`;
const shouldStartWebServers = process.env.E2E_SKIP_WEB_SERVERS !== '1';

module.exports = defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || `${frontendOrigin}`,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: shouldStartWebServers
    ? [
        {
          command: 'npm run start',
          cwd: __dirname,
          port: frontendPort,
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
          env: {
            ...process.env,
            PORT: String(frontendPort),
            BROWSER: 'none',
            HTTPS: 'false',
          },
        },
        {
          command: 'npm run start',
          cwd: path.join(__dirname, '../backend'),
          port: backendPort,
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
          env: {
            ...process.env,
            NODE_ENV: process.env.E2E_BACKEND_NODE_ENV || 'test',
            PORT: String(backendPort),
            FRONTEND_ORIGIN: frontendOrigin,
            CORS_ORIGIN: frontendOrigin,
            SESSION_SECRET: process.env.SESSION_SECRET || 'playwright-test-secret',
          },
        },
      ]
    : [],
});

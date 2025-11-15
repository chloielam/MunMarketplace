const { test, expect, request } = require('@playwright/test');

const backendBaseUrl =
  process.env.E2E_BACKEND_BASE_URL || `http://localhost:${process.env.E2E_BACKEND_PORT || 3000}/api`;

const TEST_USER = {
  email: 'playwright.user@mun.ca',
  password: 'Password123!',
  firstName: 'Playwright',
  lastName: 'User',
};

test.beforeAll(async () => {
  const api = await request.newContext();

  const response = await api.post(`${backendBaseUrl}/test-support/seed-user`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password,
      firstName: TEST_USER.firstName,
      lastName: TEST_USER.lastName,
      verified: true,
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to seed login user: ${response.status()} ${await response.text()}`
    );
  }

  await api.dispose();
});

test('verified user can log in and reach listings', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  await page.getByPlaceholder('your.name@mun.ca').fill(TEST_USER.email);
  await page.getByPlaceholder('Enter your password').fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL('**/items');
  await expect(page).toHaveURL(/\/items$/);

  await expect(page.getByRole('heading', { name: 'Browse Listings' })).toBeVisible();

  const sessionUser = await page.evaluate(() => window.localStorage.getItem('sessionUser'));
  expect(sessionUser, 'session user is stored').toBeTruthy();

  const parsedSession = JSON.parse(sessionUser || '{}');
  expect(parsedSession.email).toBe(TEST_USER.email);
});

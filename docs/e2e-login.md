# End-to-End Login Test

The repository now ships with a Playwright acceptance test that drives the real login flow across the React frontend and NestJS backend.

## Prerequisites
- Node.js 18 or newer.
- Installed project dependencies:
  ```bash
  # Backend dependencies
  cd backend
  npm install

  # Frontend dependencies + Playwright browsers
  cd ../frontend
  npm install
  npx playwright install
  ```

## Running the suite
```bash
cd frontend
npm run test:e2e
```

When the command runs, Playwright will:
1. Boot the frontend (`react-scripts start`) on `http://localhost:5173`.
2. Boot the backend (`nest start`) with `NODE_ENV=test`, giving us an in-memory SQLite database.
3. Call the `/api/test-support/seed-user` helper to create a verified MUN user with known credentials.
4. Drive the browser to complete the login form and assert the redirect to `/items`.

## Configuration Options
- `E2E_FRONTEND_PORT`, `E2E_BACKEND_PORT`, `E2E_HOST`: override default host/ports.
- `E2E_BASE_URL`: point tests at an already running frontend; set `CI=1` to skip auto booting servers.
- `ENABLE_TEST_SUPPORT=false` or `NODE_ENV=production`: disable the seeding endpoint in environments where it should not be exposed.

## Troubleshooting
- Remember to install browsers with `npx playwright install` after adding the dependency.
- If you prefer to keep MySQL running during E2E, start the backend manually and export `CI=1` before running the test command so Playwright does not try to spawn its own servers.

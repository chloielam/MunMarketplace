# MUN Marketplace  Frontend

##  Tech Stack
- React (Vite + TypeScript)
- TailwindCSS (optional)
- Axios (for API calls)

##  Setup


1. **Install dependencies**
```bash
npm install
```

2. **Run dev server**
```bash
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Connection

By default, the frontend expects the backend API at http://localhost:3000.

Update the base URL in `src/config.ts` if needed.

##  Backend setup & tests

```bash
cd backend
npm install
npm run lint
npm run test:cov
npm run test:e2e (runs the Nest e2e suite against in-memory SQLite)
```

##  Acceptance (Playwright) login flow

Ensure both installs above finished.

Start the real services: npm run start (frontend) in one terminal, npm run start:dev (backend) in another, and bring up MySQL if needed (e.g., docker-compose up database or your normal stack). Alternatively use the dev servers you already run for manual testing.
With the servers listening on http://localhost:5173 and http://localhost:3000, run:
```bash
cd frontend
E2E_SKIP_WEB_SERVERS=1 \
E2E_BASE_URL=http://localhost:5173 \
E2E_BACKEND_BASE_URL=http://localhost:3000/api \
npm run test:e2e
```

This exercises the full login journey using the seeded test user.
---

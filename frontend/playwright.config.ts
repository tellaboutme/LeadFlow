import { defineConfig, devices } from '@playwright/test'

// A dedicated port and SQLite file, distinct from a developer's own `npm run
// dev` (5173/8000, dev DB) — E2E never touches or races with that state.
const BACKEND_PORT = 8099
const FRONTEND_PORT = 4199

export default defineConfig({
  testDir: './e2e',
  // Each spec resets the DB via POST /api/v1/testing/reset before running
  // (see e2e/fixtures.ts), so concurrent workers would race on shared
  // server-side state. One worker keeps every run deterministic.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'retain-on-failure',
    // The app's PageTransition respects prefers-reduced-motion (duration 0).
    // Enabling it here removes a real source of flakiness/false-positive a11y
    // contrast reads: axe scanning mid-fade sees a blended, lower-contrast
    // color rather than the final rendered one.
    reducedMotion: 'reduce',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Runs migrations then starts the API against an isolated test DB with
      // both external integrations mocked, so E2E never calls a real AI or
      // Telegram API. ENVIRONMENT=test is what unlocks POST /testing/reset.
      command: 'uv run alembic upgrade head && uv run uvicorn app.main:app --port 8099',
      cwd: '../backend',
      url: `http://localhost:${BACKEND_PORT}/api/v1/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ENVIRONMENT: 'test',
        AI_PROVIDER: 'mock',
        TELEGRAM_PROVIDER: 'mock',
        DATABASE_URL: 'sqlite:///./data/e2e.db',
      },
    },
    {
      // Real production build (per the M10 requirement to exercise it, not
      // just the dev server), served locally and proxied to the isolated
      // backend above.
      command: 'npm run build && npm run preview -- --port 4199 --strictPort',
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { E2E_BACKEND_PORT: String(BACKEND_PORT) },
    },
  ],
})

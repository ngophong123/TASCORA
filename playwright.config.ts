import { defineConfig, devices } from "@playwright/test"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const PORT = process.env.PORT || 3000
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${PORT}`
const fixtureMode = process.env.PREMIUM_CATALOG_FIXTURE !== "0"
if (fixtureMode) process.env.PREMIUM_CATALOG_FIXTURE = "1"
const local = new URL(BASE_URL)
if (fixtureMode && !["localhost", "127.0.0.1", "[::1]"].includes(local.hostname))
  throw new Error("SSR fixture tests require a loopback frontend")
const appPort = local.port || (local.protocol === "https:" ? "443" : "80")
const next = fixtureMode
  ? "node --require ./scripts/catalog-fetch-fixture.cjs ./apps/web/node_modules/next/dist/bin/next"
  : "pnpm --filter web exec next"
const appDirectory = fixtureMode ? "apps/web " : ""
const appCommand = process.env.CI
  ? `${process.env.PLAYWRIGHT_SKIP_BUILD === "1" ? "" : "pnpm --filter web build && "}${next} start ${appDirectory}-p ${appPort} -H localhost`
  : `${next} dev ${appDirectory}-p ${appPort} -H localhost`
const appEnv: Record<string, string> = fixtureMode
  ? {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com",
      NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || "https://web.example.com",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fixture_only",
    }
  : {}
const appServer = {
  command: appCommand,
  url: BASE_URL,
  reuseExistingServer: !fixtureMode && !process.env.CI,
  timeout: 120 * 1000,
  env: appEnv,
}

export default defineConfig({
  testDir: "./tests/e2e",
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Anti-flaky policy: 0 retries locally to surface true errors immediately; max 1 retry on CI */
  retries: process.env.CI ? 1 : 0,
  /* Stateful SSR fixture controls require a single worker. */
  // Outage/delay controls share a loopback fixture store; isolate tests serially.
  workers: fixtureMode ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { open: "never" }], ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Take screenshot only on failure */
    screenshot: "only-on-failure",
    /* Retain video only on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* Mobile Viewport */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: fixtureMode
    ? [
        {
          command: "node scripts/run-premium-catalog-fixture.mjs",
          url: "http://localhost:3211/__lab/health",
          reuseExistingServer: false,
          timeout: 30000,
        },
        appServer,
      ]
    : appServer,
})

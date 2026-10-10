import { defineConfig } from '@playwright/test';
const runLabel = process.env.PREMIUM_RUN_LABEL || 'current';
if (!/^[a-z0-9-]{1,64}$/i.test(runLabel)) throw new Error('Invalid PREMIUM_RUN_LABEL');
export default defineConfig({
  testDir: './tests/premium', timeout: 90000, workers: 1, retries: 0,
  expect: { timeout: 20000 },
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3210', browserName: 'chromium', reducedMotion: 'reduce' },
  outputDir: `test-results-premium/${runLabel}`,
});

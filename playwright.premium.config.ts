import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/premium', timeout: 90000, workers: 1, retries: 0,
  expect: { timeout: 20000 },
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3210', browserName: 'chromium', reducedMotion: 'reduce' },
  outputDir: `test-results-premium/run-${process.pid}`,
});

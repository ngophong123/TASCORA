import { defineConfig } from '@playwright/test';
import premium from './playwright.premium.config';

export default defineConfig({
  ...premium,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});

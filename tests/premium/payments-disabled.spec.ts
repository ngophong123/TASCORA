// Reuse existing safety regressions against isolated local preview only.
import { test } from '../e2e/support/live-fixtures';
import '../e2e/marketplace/payments-disabled.spec';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

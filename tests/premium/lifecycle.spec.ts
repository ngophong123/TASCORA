// Existing order/delivery/payment regressions use a test-only stateful provider.
import { test } from '../e2e/support/live-fixtures';
import '../e2e/marketplace/financial-lifecycle.spec';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

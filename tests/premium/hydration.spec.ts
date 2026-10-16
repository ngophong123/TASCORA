import { test, expect } from '../e2e/support/live-fixtures';

test.use({ javaScriptEnabled: false });
test('Explore loading reserves viewport space before hydration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.goto('/explore');
  await expect(page.getByRole('status')).toBeVisible();
  const footer = await page.locator('footer').boundingBox();
  expect(footer!.y).toBeGreaterThanOrEqual(844);
});
for (const route of ['login', 'register', 'verify-email']) {
  test(`auth ${route} cannot submit before client handlers attach`, async ({ page }) => {
    await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    await page.goto(`/en/${route}`);
    // useSearchParams can render the Suspense fallback without JavaScript.
    // Both fallback and disabled server form must prevent native submission.
    if (await page.locator('form').count()) {
      await expect(page.locator('form')).toHaveAttribute('method', 'post');
      await expect(page.locator('form button[type="submit"]')).toBeDisabled();
      await expect(page.locator('form input').first()).toBeDisabled();
    } else {
      await expect(page.locator('input[type="password"], button[type="submit"]')).toHaveCount(0);
    }
    await expect(page).not.toHaveURL(/password=/);
  });
}

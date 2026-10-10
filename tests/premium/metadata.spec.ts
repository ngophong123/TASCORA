import { test, expect } from '../e2e/support/live-fixtures';
test('missing file routes retain 404 rather than a static-to-dynamic locale error', async ({ request }) => {
  for (const url of ['/robots.txt', '/missing-asset.txt']) {
    const response = await request.get(url);
    expect(response.status()).toBe(404);
  }
});
for (const path of ['/categories', '/explore', '/services/srv-1', '/freelancers/seller', '/vi/categories']) {
  test(`canonical belongs to ${path}`, async ({ page }) => {
    await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://tascora.example${path}`);
  });
}
test('verification challenge page is not indexed', async ({ page }) => {
  await page.goto('/verify-email');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

import { test, expect } from '../e2e/support/live-fixtures';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});
test('legacy Explore keeps search, price, sorting and browser navigation', async ({ page }) => {
  await page.goto('/en/explore?category=programming&deliveryTime=7');
  await expect(page.getByTestId('gig-card').first()).toBeVisible();
  await page.getByRole('combobox', { name: 'Sort by:' }).selectOption('price_asc');
  await expect(page).toHaveURL(/sort=price_asc/);
  await expect(page).toHaveURL(/deliveryTime=7/);
  await page.getByRole('button', { name: 'Graphics & Design', exact: true }).click();
  await expect(page).toHaveURL(/category=design/);
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Programming & Tech', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

import { test, expect } from '../e2e/support/live-fixtures';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});
test('search, sort, view and clear filters stay synchronized with URL', async ({ page }) => {
  await page.goto('/en/services');
  await expect(page.getByTestId('gig-card').first()).toBeVisible();
  await page.getByTestId('services-search-input').fill('Next.js');
  await expect(page).toHaveURL(/q=Next\.js/);
  const sort = page.getByLabel('Sort services');
  const value = await sort.locator('option').nth(1).getAttribute('value');
  await sort.selectOption(value!); await expect(page).toHaveURL(new RegExp(`sort=${value}`));
  await page.getByRole('button', { name: 'List view', exact: true }).click();
  await expect(page.getByRole('button', { name: 'List view', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(page.getByTestId('services-search-input')).toHaveValue('');
});
test('mobile filters contain keyboard focus and restore opener', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 }); await page.goto('/en/services');
  const opener = page.getByRole('button', { name: /^Filters/ }); await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Filter Services' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible(); await expect(opener).toBeFocused();
});
test('catalog outage displays retry without fabricated records or empty results', async ({ page }) => {
  let outage = true;
  await page.route('**/api/v1/services?**', route => outage ? route.fulfill({ status: 503, json: { success: false, error: 'Catalog temporarily unavailable' } }) : route.fallback());
  await page.goto('/en/services');
  await expect(page.getByRole('alert').filter({ hasText: 'Catalog temporarily unavailable' })).toBeVisible();
  await expect(page.getByTestId('gig-card')).toHaveCount(0);
  outage = false; await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByTestId('gig-card').first()).toBeVisible();
});
test('mobile favorite is visible, accessible and persists through reload', async ({ page, marketplace }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/en/services');
  const card = page.getByTestId('gig-card').first(); const favorite = card.getByRole('button', { name: 'Save service', exact: true });
  await expect(favorite).toBeVisible();
  const bounds = await favorite.boundingBox(); expect(bounds!.width).toBeGreaterThanOrEqual(44); expect(bounds!.height).toBeGreaterThanOrEqual(44);
  await favorite.click(); await expect(card.getByRole('button', { name: 'Remove from saved' })).toHaveAttribute('aria-pressed', 'true');
  expect(marketplace.favorites.size).toBe(1); await page.reload();
  await expect(page.getByTestId('gig-card').first().getByRole('button', { name: 'Remove from saved' })).toHaveAttribute('aria-pressed', 'true');
});

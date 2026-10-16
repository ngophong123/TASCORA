import { test, expect } from '../e2e/support/live-fixtures';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});
test('desktop disclosure supports keyboard and Escape restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  const trigger = page.getByTestId('mega-menu-trigger');
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('mega-menu-dropdown').locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
test('mobile navigation traps focus, closes with Escape and restores opener', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en');
  const trigger = page.getByTestId('mobile-menu-toggle');
  await trigger.click();
  const dialog = page.getByTestId('mobile-drawer');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('mobile-drawer-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible(); await expect(trigger).toBeFocused();
});
test('hero search preserves query/category in navigation', async ({ page }) => {
  await page.goto('/en');
  await page.getByTestId('hero-search-input').fill('Next.js');
  await page.getByTestId('hero-category-select').selectOption('programming');
  await page.getByTestId('hero-search-submit').click();
  await expect(page).toHaveURL(/services\?.*q=Next\.js.*category=programming/);
});

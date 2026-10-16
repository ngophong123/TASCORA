import { test, expect } from '../e2e/support/live-fixtures';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});
test('actual taxonomy child slug reaches its published services', async ({ page, marketplace }) => {
  const parent = marketplace.categories[0]!;
  const child = { id: 'fixture-child', name: 'Interface engineering', slug: 'interface-engineering', parentId: parent.id, _count: { services: 1 } };
  (marketplace.categories as { id: string; name: string; slug: string; parentId: string | null; _count: { services: number } }[]).push(child);
  marketplace.services[0]!.category = child;
  await page.goto('/en/categories');
  await page.getByRole('link', { name: child.name, exact: true }).click();
  await expect(page).toHaveURL(/category=interface-engineering/);
  await expect(page.getByTestId('gig-card')).toHaveCount(1);
  await expect(page.getByTestId('gig-card')).toContainText(marketplace.services[0]!.title);
});
test('gallery changes image and package selection changes real price', async ({ page }) => {
  await page.goto('/en/services/srv-1');
  const gallery = page.getByRole('region', { name: 'Service image gallery' });
  const initial = await gallery.locator('img').getAttribute('src');
  await page.getByRole('button', { name: 'Next image', exact: true }).click();
  await expect(gallery.locator('img')).not.toHaveAttribute('src', initial!);
  await page.getByTestId('package-tab-basic').click();
  await expect(page.getByTestId('package-price')).toContainText('$250');
  await page.getByTestId('package-tab-premium').click();
  await expect(page.getByTestId('package-price')).toContainText('$850');
});

import { test, expect } from '../e2e/support/live-fixtures';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});
for (const route of ['/services', '/explore']) {
  test(`public ${route} paints actual cards before client hydration`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // Inline streamed-HTML scripts may execute; application bundles cannot.
    await page.route('**/_next/static/**/*.js', route => route.abort());
    let browserCatalogReads = 0;
    page.on('request', request => { if (new URL(request.url()).pathname === '/api/v1/services') browserCatalogReads++; });
    await page.goto(route);
    const cards = page.getByTestId('gig-card');
    await expect(cards).toHaveCount(route === '/services' ? 12 : 73);
    const image = cards.first().locator('img').first();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await image.evaluate(node => getComputedStyle(node).opacity)).toBe('1');
    expect(browserCatalogReads).toBe(0);
  });
}
test('services keeps query, sorting, pagination, browser history and locale without refetching catalog', async ({ page }) => {
  let reads = 0;
  page.on('request', request => { if (new URL(request.url()).pathname === '/api/v1/services') reads++; });
  await page.goto('/vi/services');
  await expect(page.getByTestId('gig-card')).toHaveCount(12);
  await page.getByLabel('Go to page 2').click();
  await expect(page).toHaveURL(/\/vi\/services\?page=2/);
  const second = await page.getByTestId('gig-card-link').first().textContent();
  await page.goBack();
  await expect(page).toHaveURL(/\/vi\/services$/);
  await expect(page.getByTestId('gig-card-link').first()).not.toHaveText(second!);
  await page.goForward(); await expect(page).toHaveURL(/page=2/);
  await page.getByTestId('services-search-input').fill('Next.js');
  await expect(page).toHaveURL(/\/vi\/services\?q=Next\.js/);
  await page.getByLabel('Sort services').selectOption('price_asc');
  await expect(page).toHaveURL(/sort=price_asc/);
  expect(reads).toBe(0);
});
test('Explore search, price sort, clear and history preserve data without a query-fetch waterfall', async ({ page }) => {
  let reads = 0;
  page.on('request', request => { if (new URL(request.url()).pathname === '/api/v1/services') reads++; });
  await page.goto('/explore?q=Next.js&sort=price_asc');
  await expect(page.getByTestId('gig-card').first()).toBeVisible();
  await expect(page.locator('input[type="search"]')).toHaveValue('Next.js');
  await page.getByTestId('clear-all-filters').click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByTestId('gig-card')).toHaveCount(73);
  await page.goBack(); await expect(page).toHaveURL(/q=Next\.js/);
  await expect(page.locator('input[type="search"]')).toHaveValue('Next.js');
  expect(reads).toBe(0);
});
test('SSR deadline reports outage and browser retry recovers instead of hiding dependency failure', async ({ page, request }) => {
  // Explicit isolated fixture server, never a hosted endpoint.
  const configured = await request.post('http://localhost:3211/__lab/delay?ms=6000');
  expect(configured.ok()).toBe(true);
  try {
    await page.goto('/services');
    await expect(page.getByRole('alert').filter({ hasText: 'Catalog unavailable. Please retry.' })).toBeVisible();
    await expect(page.getByTestId('gig-card')).toHaveCount(0);
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByTestId('gig-card')).toHaveCount(12);
  } finally { await request.post('http://localhost:3211/__lab/delay?ms=100'); }
});
test('public SSR payload excludes unpublished drafts consistently with the API', async ({ page, marketplace }) => {
  const hidden = marketplace.services[0]!;
  hidden.status = 'DRAFT';
  await page.goto('/services');
  await expect(page.getByTestId('gig-card')).toHaveCount(12);
  expect(await page.content()).not.toContain(hidden.id);
});

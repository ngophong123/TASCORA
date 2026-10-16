import { test, expect } from '../e2e/support/live-fixtures';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

for (const route of ['/', '/services']) {
  test(`text entered before hydration survives on ${route}`, async ({ page }) => {
    await page.route('**/_next/static/**/*.js', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    await page.goto(route, { waitUntil: 'commit' });
    const input = page.getByTestId(route === '/' ? 'hero-search-input' : 'services-search-input');
    await input.fill('Next.js');
    if (route === '/') {
      await page.getByTestId('hero-category-select').selectOption('programming');
      await page.getByTestId('hero-search-submit').click();
    }
    await expect(page).toHaveURL(/q=Next\.js/);
    if (route === '/') await expect(page).toHaveURL(/category=programming/);
  });
}

test('catalog toolbar and sidebar do not collide with fixed navigation', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/services');
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);
  await page.waitForTimeout(500);
  const nav = await page.locator('header').boundingBox();
  const input = await page.getByTestId('services-search-input').boundingBox();
  const toolbar = await page.getByTestId('services-search-input').evaluate(node => node.closest('.sticky')!.getBoundingClientRect().bottom);
  const sidebar = await page.getByRole('complementary').first().evaluate(node => node.closest('.sticky')!.getBoundingClientRect().top);
  await page.screenshot({ path: testInfo.outputPath('catalog-sticky.png') });
  expect(input!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height + 8);
  expect(sidebar).toBeGreaterThanOrEqual(toolbar + 8);
});

for (const locale of ['en', 'vi']) {
  test(`native homepage search works without JavaScript in ${locale}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      await page.goto(`http://localhost:3210/${locale}`);
      await page.getByTestId('hero-search-input').fill('Next.js');
      await page.getByTestId('hero-search-submit').click();
      await expect(page).toHaveURL(/q=Next\.js/);
      await expect(page).toHaveURL(url => url.pathname === (locale === 'en' ? '/services' : '/vi/services'));
      await expect(page.getByTestId('gig-card').first()).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`native-search-${locale}.png`) });
    } finally { await context.close(); }
  });
}

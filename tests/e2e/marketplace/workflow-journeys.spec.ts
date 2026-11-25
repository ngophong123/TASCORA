import { test, expect } from '../support/live-fixtures';
import { ServicesPage } from '../pages/ServicesPage';
import { GigDetailPage } from '../pages/GigDetailPage';

test.describe('Phase 4B Marketplace End-to-End Journeys', () => {
  test('guest explores storefront, filters services, inspects gig detail, and handles empty search without errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    const servicesPage = new ServicesPage(page);
    await servicesPage.goto();

    const initialCount = await servicesPage.getResultCountNumber();
    expect(initialCount).toBeGreaterThan(0);

    // Search for a non-existent query and verify clean empty state (no crash / 500)
    await servicesPage.search('zzzz-nonexistent-tascora-query-4b');
    await expect(servicesPage.gigCards).toHaveCount(0);

    // Clear search and navigate into first gig detail
    await servicesPage.clearSearch();
    await expect(servicesPage.gigCards.first()).toBeVisible();

    const firstCardLink = page.getByTestId('gig-card-link').first();
    await firstCardLink.click();
    await expect(page).toHaveURL(/.*\/services\/.+/);

    const detailPage = new GigDetailPage(page);
    await expect(detailPage.serviceTitle).toBeVisible();
    await expect(detailPage.packagePrice).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('guest can switch between en and vi localized catalog routes cleanly', async ({ page }) => {
    const resEn = await page.goto('/en/services');
    expect(resEn?.status()).toBeLessThan(400);
    await expect(page.getByTestId('services-search-input')).toBeVisible();

    const resVi = await page.goto('/vi/services');
    expect(resVi?.status()).toBeLessThan(400);
    await expect(page.getByTestId('services-search-input')).toBeVisible();
  });
});

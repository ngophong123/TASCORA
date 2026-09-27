import { test, expect } from "@playwright/test"
import { ServicesPage } from "./pages/ServicesPage"

test.describe("Search and Filter Flows", () => {
  test("hero search on homepage redirects to /services with query param", async ({ page }) => {
    await page.goto("/")

    const heroSearchInput = page.getByTestId("hero-search-input")
    const heroSearchSubmit = page.getByTestId("hero-search-submit")

    await expect(heroSearchInput).toBeVisible()
    await heroSearchInput.fill("Next.js")
    await heroSearchSubmit.click()

    // URL should redirect to /services?q=Next.js (or localized /en/services?q=Next.js)
    await expect(page).toHaveURL(/.*\/services\?.*q=Next\.js/)

    // Result count should be visible and results should show
    const servicesPage = new ServicesPage(page)
    await expect(servicesPage.searchInput).toHaveValue("Next.js")
    await expect(servicesPage.gigCards.first()).toBeVisible()
  })

  test("filtering by category updates URL and filters result set", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop sidebar test")

    const servicesPage = new ServicesPage(page)
    await servicesPage.goto()

    const initialCount = await servicesPage.getResultCountNumber()
    expect(initialCount).toBeGreaterThan(0)

    // Filter by programming
    await servicesPage.selectCategory("programming")

    // URL should contain category=programming
    await expect(page).toHaveURL(/category=programming/)

    // Results should be displayed
    await expect(servicesPage.gigCards.first()).toBeVisible()
    const filteredCount = await servicesPage.getResultCountNumber()
    expect(filteredCount).toBeGreaterThan(0)
  })

  test("filtering by rating updates results and clearing filters restores original count", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop sidebar test")

    const servicesPage = new ServicesPage(page)
    await servicesPage.goto()

    const initialCount = await servicesPage.getResultCountNumber()

    // Filter by 4.5+ rating
    await servicesPage.selectRating(4.5)
    await expect(page).toHaveURL(/rating=4\.5/)

    const ratedCount = await servicesPage.getResultCountNumber()
    expect(ratedCount).toBeLessThanOrEqual(initialCount)

    // Clear filters
    await servicesPage.clearFilters()

    // URL should no longer have rating=4.5 and result count should restore
    await expect(page).not.toHaveURL(/rating=4\.5/)
    const restoredCount = await servicesPage.getResultCountNumber()
    expect(restoredCount).toBe(initialCount)
  })

  test("pagination switches pages and updates active page state", async ({ page }) => {
    const servicesPage = new ServicesPage(page)
    await servicesPage.goto()

    await expect(servicesPage.gigCards.first()).toBeVisible()
    const page2Button = servicesPage.getPaginationPage(2)
    // Only test pagination if page 2 exists for mock data
    if (await page2Button.isVisible()) {
      await page2Button.click()
      await expect(page).toHaveURL(/page=2/)
      await expect(page2Button).toHaveAttribute("aria-current", "page")
      await expect(servicesPage.paginationPrev).toBeEnabled()
      await expect(servicesPage.gigCards.first()).toBeVisible()

      // Click previous to go back to page 1
      await servicesPage.paginationPrev.click()
      await expect(page).not.toHaveURL(/page=2/)
      const page1Button = servicesPage.getPaginationPage(1)
      await expect(page1Button).toHaveAttribute("aria-current", "page")
    }
  })
})

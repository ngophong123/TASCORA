import { test, expect } from "../support/live-fixtures"
import { ServicesPage } from "../pages/ServicesPage"
import { GigDetailPage } from "../pages/GigDetailPage"

test.describe("Gig Detail and Order Flows", () => {
  test("navigating from services listing to gig detail displays correct service info", async ({ page }) => {
    const servicesPage = new ServicesPage(page)
    await servicesPage.goto()

    // Get the first gig card and click its link
    const cardLink = page.getByTestId("gig-card-link").first()
    await expect(cardLink).toBeVisible()
    await cardLink.click()

    // URL should now be on /services/[id]
    await expect(page).toHaveURL(/.*\/services\/.+/)

    // Gig detail page elements should load
    const detailPage = new GigDetailPage(page)
    await expect(detailPage.serviceTitle).toBeVisible()
    await expect(detailPage.sellerName).toBeVisible()
    await expect(detailPage.packagePrice).toBeVisible()
  })

  test("switching package tiers updates price and deliverables", async ({ page }) => {
    const detailPage = new GigDetailPage(page)
    await detailPage.goto("srv-1")

    // Default tier is STANDARD ($450)
    await expect(detailPage.packagePrice).toContainText("450")

    // Switch to BASIC tier ($250)
    await detailPage.selectPackageTier("basic")
    await expect(detailPage.packagePrice).toContainText("250")
    await expect(detailPage.orderTotalPrice).toContainText("250")

    // Switch to PREMIUM tier ($850)
    await detailPage.selectPackageTier("premium")
    await expect(detailPage.packagePrice).toContainText("850")
    await expect(detailPage.orderTotalPrice).toContainText("850")
  })

  test("unsupported add-ons cannot change the server-priced order", async ({ page, marketplace }) => {
    const detailPage = new GigDetailPage(page)
    await detailPage.goto('srv-1')
    await detailPage.selectPackageTier('basic')
    await expect(detailPage.orderTotalPrice).toContainText('250')
    await expect(page.locator('[data-testid^="addon-checkbox-"]')).toHaveCount(0)
    await detailPage.openCheckout()
    await detailPage.confirmCheckout()
    await expect(detailPage.checkoutSuccess).toBeVisible()
    expect(marketplace.orders[0]!.amount).toBe('250')
    expect(marketplace.orders[0]!.status).toBe('PENDING')
  })

  test("completing order flow opens checkout drawer and shows success confirmation", async ({ page }) => {
    const detailPage = new GigDetailPage(page)
    await detailPage.goto("srv-1")

    // Select Basic tier ($250)
    await detailPage.selectPackageTier("basic")

    // Open checkout drawer
    await detailPage.openCheckout()
    await expect(detailPage.checkoutDrawer).toBeVisible()

    // Confirm checkout and verify success confirmation banner
    await detailPage.confirmCheckout()
    await expect(detailPage.checkoutSuccess).toBeVisible()
    await expect(detailPage.checkoutSuccess).toContainText(/Order Confirmed Successfully/i)
  })
})

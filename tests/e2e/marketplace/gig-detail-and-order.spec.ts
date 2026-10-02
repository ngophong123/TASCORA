import { test, expect } from "@playwright/test"
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

  test("selecting add-ons dynamically recalculates computed total price", async ({ page }) => {
    const detailPage = new GigDetailPage(page)
    await detailPage.goto("srv-1")

    // Select Basic tier ($250)
    await detailPage.selectPackageTier("basic")
    await expect(detailPage.orderTotalPrice).toContainText("250")

    // Select 24-Hour Express Delivery (+$50)
    await detailPage.toggleAddon("express-delivery")
    await expect(detailPage.orderTotalPrice).toContainText("300")

    // Select Extra Revision (+$35) -> total $335
    await detailPage.toggleAddon("extra-revision")
    await expect(detailPage.orderTotalPrice).toContainText("335")

    // Deselect Express Delivery (-$50) -> total $285
    await detailPage.toggleAddon("express-delivery")
    await expect(detailPage.orderTotalPrice).toContainText("285")
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

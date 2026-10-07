import { test, expect } from "../support/live-fixtures"

test.describe("Responsive Viewports & Adaptive Layouts", () => {
  test("mobile viewport (375x667): collapses navbar to mobile drawer toggle and has no horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // Mobile menu button should be visible
    const mobileToggle = page.getByTestId("mobile-menu-toggle")
    await expect(mobileToggle).toBeVisible()

    // Desktop mega menu trigger should be hidden
    const megaMenuTrigger = page.getByTestId("mega-menu-trigger")
    await expect(megaMenuTrigger).not.toBeVisible()

    // Tapping mobile menu toggle opens drawer
    await mobileToggle.click()
    const mobileDrawer = page.getByTestId("mobile-drawer")
    await expect(mobileDrawer).toBeVisible()

    // Close drawer
    const closeBtn = page.getByTestId("mobile-drawer-close")
    await closeBtn.click()
    await expect(mobileDrawer).not.toBeVisible()

    // Check no horizontal scroll overflow on mobile homepage
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    })
    expect(hasHorizontalOverflow).toBe(false)
  })

  test("tablet viewport (768x1024): services directory adapts layout cleanly", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto("/services")

    // Services gig cards should be visible
    const gigCards = page.getByTestId("gig-card")
    await expect(gigCards.first()).toBeVisible()

    // Check for no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    })
    expect(hasHorizontalOverflow).toBe(false)
  })

  test("desktop viewport (1280x800): renders full navigation bar and multi-column grid", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")

    // Desktop mega menu trigger is visible
    const megaMenuTrigger = page.getByTestId("mega-menu-trigger")
    await expect(megaMenuTrigger).toBeVisible()

    // Mobile hamburger toggle is hidden
    const mobileToggle = page.getByTestId("mobile-menu-toggle")
    await expect(mobileToggle).not.toBeVisible()

    // Check no horizontal overflow on desktop
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    })
    expect(hasHorizontalOverflow).toBe(false)
  })
})

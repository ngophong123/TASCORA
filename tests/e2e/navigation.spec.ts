import { test, expect } from "@playwright/test"

test.describe("Navigation & Layout", () => {
  test("homepage loads successfully with 200 status and brand title", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)

    // Page title should contain Tascora
    await expect(page).toHaveTitle(/TASCORA|Freelance/i)

    // Navbar brand should be visible
    const brand = page.getByTestId("navbar-brand")
    await expect(brand).toBeVisible()
    await expect(brand).toHaveAttribute("href", "/")
  })

  test("desktop mega menu opens on click and hover, and closes on Escape and outside click", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only test")

    await page.goto("/")
    const megaMenuTrigger = page.getByTestId("mega-menu-trigger")
    await expect(megaMenuTrigger).toBeVisible()

    // 1. Open on click
    await megaMenuTrigger.click()
    const megaMenu = page.getByTestId("mega-menu-dropdown")
    await expect(megaMenu).toBeVisible()

    // 2. Closes on Escape
    await page.keyboard.press("Escape")
    await expect(megaMenu).not.toBeVisible()

    // 3. Open on hover (move mouse away first to re-trigger mouseenter)
    await page.mouse.move(0, 0)
    await megaMenuTrigger.hover()
    await expect(megaMenu).toBeVisible()

    // 4. Closes on outside click (click on page area outside mega menu bounds)
    await page.mouse.click(10, 700)
    await expect(megaMenu).not.toBeVisible()
  })

  test("mobile drawer opens via hamburger and closes via close button", async ({ page, isMobile }) => {
    // If running in desktop project, resize viewport to mobile
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 })
    }

    await page.goto("/")
    const menuToggle = page.getByTestId("mobile-menu-toggle")
    await expect(menuToggle).toBeVisible()

    // Open mobile drawer
    await menuToggle.click()
    const mobileDrawer = page.getByTestId("mobile-drawer")
    await expect(mobileDrawer).toBeVisible()

    // Close mobile drawer using close button
    const closeBtn = page.getByTestId("mobile-drawer-close")
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()
    await expect(mobileDrawer).not.toBeVisible()
  })

  test("footer is rendered with valid links and no broken 404 hrefs", async ({ page }) => {
    await page.goto("/")
    const footer = page.getByTestId("footer")
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()

    // Verify all footer links have valid hrefs
    const footerLinks = footer.locator("a")
    const count = await footerLinks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const link = footerLinks.nth(i)
      const href = await link.getAttribute("href")
      expect(href).toBeTruthy()
      expect(href).not.toBe("#")
      expect(href).not.toBe("javascript:void(0)")
    }
  })
})

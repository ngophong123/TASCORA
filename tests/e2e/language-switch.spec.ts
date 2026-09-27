import { test, expect } from "@playwright/test"

test.describe("Language Switching (i18n)", () => {
  test("switches between English and Vietnamese seamlessly", async ({ page }) => {
    await page.goto("/")

    // Find the header language switcher
    const switcher = page.getByTestId("language-switcher").first()
    await expect(switcher).toBeVisible()

    // Initially in English
    await expect(switcher).toContainText("EN")
    await expect(page.locator("body")).toContainText("Explore Services")

    // Open dropdown
    await switcher.click()
    const dropdown = page.getByTestId("language-dropdown").first()
    await expect(dropdown).toBeVisible()

    // Select Tiếng Việt
    const viOption = page.getByTestId("language-option-vi").first()
    await expect(viOption).toBeVisible()
    await viOption.click()

    // Dropdown closes
    await expect(dropdown).not.toBeVisible()

    // URL should reflect /vi locale
    await expect(page).toHaveURL(/\/vi/)

    // Content should now be translated into Vietnamese
    await expect(page.locator("body")).toContainText("Khám phá dịch vụ")
    await expect(switcher).toContainText("VI")

    // Switch back to English
    await switcher.click()
    await expect(dropdown).toBeVisible()

    const enOption = page.getByTestId("language-option-en").first()
    await expect(enOption).toBeVisible()
    await enOption.click()

    await expect(dropdown).not.toBeVisible()

    // URL should no longer have /vi prefix
    await expect(page).toHaveURL(/^(?!.*\/vi).*$/)

    // English text should be restored
    await expect(page.locator("body")).toContainText("Explore Services")
    await expect(switcher).toContainText("EN")
  })

  test("language switcher supports keyboard interactions (Escape to dismiss)", async ({ page }) => {
    await page.goto("/")
    const switcher = page.getByTestId("language-switcher").first()
    await expect(switcher).toBeVisible()

    // Open dropdown
    await switcher.click()
    const dropdown = page.getByTestId("language-dropdown").first()
    await expect(dropdown).toBeVisible()

    // Press Escape to dismiss
    await page.keyboard.press("Escape")
    await expect(dropdown).not.toBeVisible()
  })

  test("preserves current route path when switching locale", async ({ page }) => {
    // Navigate to /services in English
    await page.goto("/services")
    await expect(page).toHaveURL(/\/services/)

    const switcher = page.getByTestId("language-switcher").first()
    await expect(switcher).toBeVisible()

    // Switch to Vietnamese
    await switcher.click()
    const viOption = page.getByTestId("language-option-vi").first()
    await viOption.click()

    // Path should now be /vi/services
    await expect(page).toHaveURL(/\/vi\/services/)
  })
})

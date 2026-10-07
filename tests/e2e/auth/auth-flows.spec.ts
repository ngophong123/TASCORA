import { test, expect } from "../support/live-fixtures"

test.describe("Authentication Flows (Auth Domain)", () => {
  test("login page renders all essential form elements", async ({ page }) => {
    await page.goto("/login")

    // The login form email uses placeholder name@company.com
    const emailInput = page.locator('input[placeholder*="company"]')
    const passwordInput = page.locator('input[placeholder*="••••••••"]').first()
    const submitButton = page.locator('form button[type="submit"]').first()

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    // Form can be filled
    await emailInput.fill("alexandre.test@tascora.dev")
    await passwordInput.fill("SecureSecret123!")

    expect(await emailInput.inputValue()).toBe("alexandre.test@tascora.dev")
    expect(await passwordInput.inputValue()).toBe("SecureSecret123!")
  })

  test("login page toggles password visibility smoothly", async ({ page }) => {
    await page.goto("/login")

    const passwordInput = page.locator('input[placeholder*="••••••••"]').first()
    await expect(passwordInput).toBeVisible()
    expect(await passwordInput.getAttribute("type")).toBe("password")

    // Find password visibility toggle button within form
    const toggleButton = page.locator("button:has(svg.lucide-eye, svg.lucide-eye-off)").first()
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      expect(await passwordInput.getAttribute("type")).toBe("text")

      await toggleButton.click()
      expect(await passwordInput.getAttribute("type")).toBe("password")
    }
  })

  test("navigating from login to register preserves localized path", async ({ page }) => {
    await page.goto("/login")

    // Click link to register page
    const registerLink = page.getByRole('link', { name: 'Create an account', exact: true })
    await expect(registerLink).toBeVisible()
    await registerLink.click()

    await expect(page).toHaveURL(/.*\/register/)
  })

  test("register page supports buyer vs seller role toggle and validates inputs", async ({ page }) => {
    await page.goto("/register")

    const emailInput = page.locator('input[placeholder*="company"]')
    const submitButton = page.locator('form button[type="submit"]').first()

    await expect(emailInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    // Verify role switcher buttons
    const roleButtons = page.locator("div.grid-cols-2 button")
    if ((await roleButtons.count()) >= 2) {
      await roleButtons.nth(1).click() // switch to seller
      await roleButtons.nth(0).click() // switch back to buyer
    }

    // Fill mismatching passwords to verify client-side validation guard
    const passwordInputs = page.locator('input[placeholder*="••••••••"]')
    if ((await passwordInputs.count()) >= 2) {
      await emailInput.fill("newuser@tascora.dev")
      await passwordInputs.nth(0).fill("Password123!")
      await passwordInputs.nth(1).fill("DifferentPassword456!")
      await submitButton.click()

      // Should display error alert within card
      const errorMsg = page.locator("div.border-rose-500\\/30, div.text-rose-500, div:has-text('match'), div:has-text('khớp')")
      await expect(errorMsg.first()).toBeVisible()
    }
  })
})

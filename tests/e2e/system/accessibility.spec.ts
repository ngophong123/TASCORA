import { test, expect } from "../support/live-fixtures"
import AxeBuilder from "@axe-core/playwright"

test.describe("Accessibility (A11y) Audits", () => {
  test("homepage has no critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"]) // Optional contrast rule can be affected by dynamic themes
      .analyze()

    const severeViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    )

    expect(severeViolations).toEqual([])
  })

  test("services directory has no critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/services")
    await page.waitForLoadState("domcontentloaded")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze()

    const severeViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    )

    expect(severeViolations).toEqual([])
  })

  test("gig detail page has no critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/services/srv-1")
    await page.waitForLoadState("domcontentloaded")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze()

    const severeViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    )

    expect(severeViolations).toEqual([])
  })

  test("dashboard has no critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("domcontentloaded")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze()

    const severeViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    )

    expect(severeViolations).toEqual([])
  })
})

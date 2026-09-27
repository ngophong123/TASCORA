import { type Locator, type Page, expect } from "@playwright/test"

export class GigDetailPage {
  readonly page: Page
  readonly serviceTitle: Locator
  readonly sellerName: Locator
  readonly packagePrice: Locator
  readonly packageFeatures: Locator
  readonly orderTotalPrice: Locator
  readonly continueOrderButton: Locator
  readonly checkoutDrawer: Locator
  readonly confirmCheckoutButton: Locator
  readonly checkoutSuccess: Locator

  constructor(page: Page) {
    this.page = page
    this.serviceTitle = page.getByTestId("service-title")
    this.sellerName = page.getByTestId("seller-name")
    this.packagePrice = page.getByTestId("package-price")
    this.packageFeatures = page.getByTestId("package-features")
    this.orderTotalPrice = page.getByTestId("order-total-price")
    this.continueOrderButton = page.getByTestId("continue-order-btn")
    this.checkoutDrawer = page.getByTestId("checkout-drawer")
    this.confirmCheckoutButton = page.getByTestId("confirm-checkout-btn")
    this.checkoutSuccess = page.getByTestId("checkout-success")
  }

  async goto(serviceId: string = "srv-1") {
    await this.page.goto(`/services/${serviceId}`)
    await expect(this.serviceTitle).toBeVisible()
  }

  async selectPackageTier(tier: "basic" | "standard" | "premium") {
    const tab = this.page.getByTestId(`package-tab-${tier}`)
    await tab.click()
  }

  async toggleAddon(addonId: string) {
    const checkbox = this.page.getByTestId(`addon-checkbox-${addonId}`)
    await checkbox.scrollIntoViewIfNeeded()
    await checkbox.click()
  }

  async openCheckout() {
    await this.continueOrderButton.scrollIntoViewIfNeeded()
    await this.continueOrderButton.click()
    await expect(this.checkoutDrawer).toBeVisible()
  }

  async confirmCheckout() {
    await this.confirmCheckoutButton.click()
    await expect(this.checkoutSuccess).toBeVisible()
  }

  async getPriceValue(): Promise<number> {
    const text = await this.packagePrice.innerText()
    const clean = text.replace(/[^0-9.]/g, "")
    return parseFloat(clean)
  }

  async getTotalPriceValue(): Promise<number> {
    const text = await this.orderTotalPrice.innerText()
    const clean = text.replace(/[^0-9.]/g, "")
    return parseFloat(clean)
  }
}

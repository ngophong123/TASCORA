import { type Locator, type Page, expect } from "@playwright/test"

export class ServicesPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly searchClearButton: Locator
  readonly resultCount: Locator
  readonly clearAllFiltersButton: Locator
  readonly gigCards: Locator
  readonly paginationPrev: Locator
  readonly paginationNext: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByTestId("services-search-input")
    this.searchClearButton = page.getByTestId("services-search-clear")
    this.resultCount = page.getByTestId("services-result-count")
    this.clearAllFiltersButton = page.getByTestId("clear-all-filters").first()
    this.gigCards = page.getByTestId("gig-card")
    this.paginationPrev = page.getByTestId("pagination-prev")
    this.paginationNext = page.getByTestId("pagination-next")
  }

  async goto() {
    await this.page.goto("/services")
    await expect(this.searchInput).toBeVisible()
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    // The search input auto-debounces in 350ms, or we can submit via Enter
    await this.searchInput.press("Enter")
  }

  async clearSearch() {
    await this.searchClearButton.click()
  }

  async selectCategory(slug: string) {
    const categoryButton = this.page.getByTestId(`filter-category-${slug}`)
    await categoryButton.scrollIntoViewIfNeeded()
    await categoryButton.click()
  }

  async selectRating(stars: number) {
    const ratingRadio = this.page.getByTestId(`filter-rating-${stars}`)
    await ratingRadio.scrollIntoViewIfNeeded()
    await ratingRadio.click()
  }

  async clearFilters() {
    if (await this.clearAllFiltersButton.isVisible()) {
      await this.clearAllFiltersButton.click()
    }
  }

  getPaginationPage(pageNumber: number): Locator {
    return this.page.getByTestId(`pagination-page-${pageNumber}`)
  }

  async getResultCountNumber(): Promise<number> {
    await expect(this.resultCount).toBeVisible()
    const text = await this.resultCount.innerText()
    const match = text.match(/\d+/)
    return match ? parseInt(match[0], 10) : 0
  }
}

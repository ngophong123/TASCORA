import { describe, it, expect } from "vitest"
import { MOCK_GIGS, type Gig } from "../../apps/web/src/data/gigs"

/**
 * Pure filter function replicating marketplace search logic
 */
export function filterGigs(
  gigs: Gig[],
  filters: {
    q?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    rating?: number
    sort?: "recommended" | "rating_desc" | "newest" | "price_asc" | "price_desc"
  }
): Gig[] {
  let result = [...gigs]

  if (filters.q?.trim()) {
    const term = filters.q.toLowerCase().trim()
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term) ||
        g.seller.name.toLowerCase().includes(term) ||
        g.categoryName.toLowerCase().includes(term) ||
        g.tags.some((t) => t.toLowerCase().includes(term))
    )
  }

  if (filters.category && filters.category !== "all") {
    result = result.filter((g) => g.categorySlug === filters.category)
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((g) => g.startingPrice >= filters.minPrice!)
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((g) => g.startingPrice <= filters.maxPrice!)
  }

  if (filters.rating !== undefined && filters.rating > 0) {
    result = result.filter((g) => g.rating >= filters.rating!)
  }

  if (filters.sort === "price_asc") {
    result.sort((a, b) => a.startingPrice - b.startingPrice)
  } else if (filters.sort === "price_desc") {
    result.sort((a, b) => b.startingPrice - a.startingPrice)
  } else if (filters.sort === "rating_desc") {
    result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
  }

  return result
}

describe("Marketplace Catalog Filtering & Sorting (Unit Tests)", () => {
  it("loads the complete mock gig dataset", () => {
    expect(MOCK_GIGS.length).toBeGreaterThan(10)
  })

  it("filters accurately by keyword search query across title, description, or tags", () => {
    const query = "Next.js"
    const filtered = filterGigs(MOCK_GIGS, { q: query })

    expect(filtered.length).toBeGreaterThan(0)
    for (const gig of filtered) {
      const match =
        gig.title.toLowerCase().includes(query.toLowerCase()) ||
        gig.description.toLowerCase().includes(query.toLowerCase()) ||
        gig.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        gig.categoryName.toLowerCase().includes(query.toLowerCase())
      expect(match).toBe(true)
    }
  })

  it("filters accurately by category slug", () => {
    const filtered = filterGigs(MOCK_GIGS, { category: "programming" })
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((g) => g.categorySlug === "programming")).toBe(true)
  })

  it("filters accurately within min and max price boundaries", () => {
    const min = 50
    const max = 200
    const filtered = filterGigs(MOCK_GIGS, { minPrice: min, maxPrice: max })

    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((g) => g.startingPrice >= min && g.startingPrice <= max)).toBe(true)
  })

  it("filters by minimum rating threshold", () => {
    const minRating = 4.9
    const filtered = filterGigs(MOCK_GIGS, { rating: minRating })

    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((g) => g.rating >= minRating)).toBe(true)
  })

  it("sorts correctly by price ascending", () => {
    const sorted = filterGigs(MOCK_GIGS, { sort: "price_asc" })
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.startingPrice).toBeGreaterThanOrEqual(sorted[i - 1]!.startingPrice)
    }
  })

  it("sorts correctly by price descending", () => {
    const sorted = filterGigs(MOCK_GIGS, { sort: "price_desc" })
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.startingPrice).toBeLessThanOrEqual(sorted[i - 1]!.startingPrice)
    }
  })

  it("combines multiple filters simultaneously (category + price + rating)", () => {
    const filtered = filterGigs(MOCK_GIGS, {
      category: "programming",
      minPrice: 100,
      maxPrice: 600,
      rating: 4.8,
    })

    for (const gig of filtered) {
      expect(gig.categorySlug).toBe("programming")
      expect(gig.startingPrice).toBeGreaterThanOrEqual(100)
      expect(gig.startingPrice).toBeLessThanOrEqual(600)
      expect(gig.rating).toBeGreaterThanOrEqual(4.8)
    }
  })
})

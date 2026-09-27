"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useRouter, usePathname } from "@/i18n/routing"
import { MOCK_GIGS, type SellerLevel } from "@/data/gigs"
import {
  PRICE_BOUNDS,
  FILTER_CATEGORIES,
  DELIVERY_OPTIONS,
  SELLER_LEVEL_OPTIONS,
} from "@/data/serviceFilterOptions"

export interface ServiceFilterState {
  q: string
  category: string
  subCategory: string
  minPrice: number
  maxPrice: number
  delivery: string
  levels: SellerLevel[]
  rating: number
  languages: string[]
  onlineOnly: boolean
  proOnly: boolean
  sort: "recommended" | "rating_desc" | "newest" | "price_asc" | "price_desc"
  view: "grid" | "list"
  page: number
}

export interface ActiveFilterChip {
  id: string
  label: string
  onRemove: () => void
}

const PAGE_SIZE = 12

export function useServiceFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parse filters from URL search params
  const filters: ServiceFilterState = React.useMemo(() => {
    const q = searchParams.get("q") || ""
    const category = searchParams.get("category") || "all"
    const subCategory = searchParams.get("subCategory") || ""
    const minPriceParam = searchParams.get("minPrice")
    const maxPriceParam = searchParams.get("maxPrice")
    const minPrice =
      minPriceParam !== null ? Math.max(PRICE_BOUNDS.min, Number(minPriceParam)) : PRICE_BOUNDS.min
    const maxPrice =
      maxPriceParam !== null ? Math.min(PRICE_BOUNDS.max, Number(maxPriceParam)) : PRICE_BOUNDS.max

    const delivery = searchParams.get("delivery") || "any"

    const levelsParam = searchParams.get("levels")
    const levels: SellerLevel[] = levelsParam
      ? (levelsParam.split(",").filter(Boolean) as SellerLevel[])
      : []

    const ratingParam = searchParams.get("rating")
    const rating = ratingParam ? Number(ratingParam) : 0

    const languagesParam = searchParams.get("languages")
    const languages = languagesParam ? languagesParam.split(",").filter(Boolean) : []

    const onlineOnly = searchParams.get("onlineOnly") === "true"
    const proOnly = searchParams.get("proOnly") === "true"

    const sortParam = searchParams.get("sort") as ServiceFilterState["sort"]
    const sort = ["recommended", "rating_desc", "newest", "price_asc", "price_desc"].includes(
      sortParam
    )
      ? sortParam
      : "recommended"

    const viewParam = searchParams.get("view")
    const view = viewParam === "list" ? "list" : "grid"

    const pageParam = searchParams.get("page")
    const page = pageParam && Number(pageParam) > 0 ? Number(pageParam) : 1

    return {
      q,
      category,
      subCategory,
      minPrice,
      maxPrice,
      delivery,
      levels,
      rating,
      languages,
      onlineOnly,
      proOnly,
      sort,
      view,
      page,
    }
  }, [searchParams])

  // Push URL update helper
  const updateUrl = React.useCallback(
    (
      newParams: Record<string, string | number | boolean | null | undefined | string[]>,
      resetPage = true
    ) => {
      const current = new URLSearchParams(searchParams.toString())

      if (resetPage && !("page" in newParams)) {
        current.delete("page")
      }

      if ("category" in newParams && !("subCategory" in newParams)) {
        current.delete("subCategory")
      }

      Object.entries(newParams).forEach(([key, val]) => {
        if (
          val === null ||
          val === undefined ||
          val === "" ||
          val === "all" ||
          (key === "delivery" && val === "any") ||
          (key === "rating" && val === 0) ||
          (key === "sort" && val === "recommended") ||
          (key === "view" && val === "grid") ||
          (key === "minPrice" && val === PRICE_BOUNDS.min) ||
          (key === "maxPrice" && val === PRICE_BOUNDS.max) ||
          (key === "onlineOnly" && val === false) ||
          (key === "proOnly" && val === false) ||
          (Array.isArray(val) && val.length === 0)
        ) {
          current.delete(key)
        } else if (Array.isArray(val)) {
          current.set(key, val.join(","))
        } else {
          current.set(key, String(val))
        }
      })

      const query = current.toString()
      const targetUrl = query ? `${pathname}?${query}` : pathname
      router.push(targetUrl, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  // Direct filter setters
  const setFilter = React.useCallback(
    <K extends keyof ServiceFilterState>(key: K, value: ServiceFilterState[K]) => {
      updateUrl({ [key]: value }, key !== "page" && key !== "view")
    },
    [updateUrl]
  )

  const toggleLevel = React.useCallback(
    (level: SellerLevel) => {
      const current = filters.levels
      const next = current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level]
      updateUrl({ levels: next })
    },
    [filters.levels, updateUrl]
  )

  const toggleLanguage = React.useCallback(
    (language: string) => {
      const current = filters.languages
      const next = current.includes(language)
        ? current.filter((l) => l !== language)
        : [...current, language]
      updateUrl({ languages: next })
    },
    [filters.languages, updateUrl]
  )

  const clearAllFilters = React.useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [pathname, router])

  // Filter and sort the gigs
  const filteredGigs = React.useMemo(() => {
    let result = [...MOCK_GIGS]

    // Search query
    if (filters.q.trim()) {
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

    // Category
    if (filters.category && filters.category !== "all") {
      result = result.filter((g) => g.categorySlug === filters.category)
    }

    // Subcategory
    if (filters.subCategory) {
      result = result.filter((g) => g.subCategorySlug === filters.subCategory)
    }

    // Price range
    result = result.filter(
      (g) => g.startingPrice >= filters.minPrice && g.startingPrice <= filters.maxPrice
    )

    // Delivery time
    if (filters.delivery && filters.delivery !== "any") {
      const option = DELIVERY_OPTIONS.find((d) => d.id === filters.delivery)
      if (option) {
        result = result.filter((g) => g.deliveryDays <= option.maxDays)
      }
    }

    // Seller levels
    if (filters.levels.length > 0) {
      result = result.filter((g) => filters.levels.includes(g.seller.level))
    }

    // Rating
    if (filters.rating > 0) {
      result = result.filter((g) => g.rating >= filters.rating)
    }

    // Languages
    if (filters.languages.length > 0) {
      result = result.filter((g) => g.seller.languages.some((l) => filters.languages.includes(l)))
    }

    // Toggles
    if (filters.onlineOnly) {
      result = result.filter((g) => g.seller.isOnline)
    }

    if (filters.proOnly) {
      result = result.filter((g) => g.seller.isPro)
    }

    // Sorting
    switch (filters.sort) {
      case "rating_desc":
        result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "price_asc":
        result.sort((a, b) => a.startingPrice - b.startingPrice)
        break
      case "price_desc":
        result.sort((a, b) => b.startingPrice - a.startingPrice)
        break
      case "recommended":
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.rating * b.reviewsCount - a.rating * a.reviewsCount
        })
        break
    }

    return result
  }, [filters])

  // Pagination calculation
  const totalResults = filteredGigs.length
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE))
  const currentPage = Math.min(filters.page, totalPages)

  const paginatedGigs = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredGigs.slice(start, start + PAGE_SIZE)
  }, [filteredGigs, currentPage])

  // Active filter chips
  const activeFilterChips: ActiveFilterChip[] = React.useMemo(() => {
    const chips: ActiveFilterChip[] = []

    if (filters.q) {
      chips.push({
        id: "chip-q",
        label: `"${filters.q}"`,
        onRemove: () => updateUrl({ q: null }),
      })
    }

    if (filters.category && filters.category !== "all") {
      const cat = FILTER_CATEGORIES.find((c) => c.slug === filters.category)
      chips.push({
        id: "chip-cat",
        label: cat ? cat.name : filters.category,
        onRemove: () => updateUrl({ category: null, subCategory: null }),
      })
    }

    if (filters.subCategory) {
      chips.push({
        id: "chip-subcat",
        label: filters.subCategory,
        onRemove: () => updateUrl({ subCategory: null }),
      })
    }

    if (filters.minPrice > PRICE_BOUNDS.min || filters.maxPrice < PRICE_BOUNDS.max) {
      chips.push({
        id: "chip-price",
        label: `$${filters.minPrice} - $${filters.maxPrice}`,
        onRemove: () => updateUrl({ minPrice: null, maxPrice: null }),
      })
    }

    if (filters.delivery && filters.delivery !== "any") {
      const del = DELIVERY_OPTIONS.find((d) => d.id === filters.delivery)
      if (del) {
        chips.push({
          id: "chip-delivery",
          label: del.label,
          onRemove: () => updateUrl({ delivery: null }),
        })
      }
    }

    filters.levels.forEach((lvl) => {
      const lvlOpt = SELLER_LEVEL_OPTIONS.find((s) => s.id === lvl)
      chips.push({
        id: `chip-level-${lvl}`,
        label: lvlOpt ? lvlOpt.label : lvl,
        onRemove: () => toggleLevel(lvl),
      })
    })

    if (filters.rating > 0) {
      chips.push({
        id: "chip-rating",
        label: `${filters.rating}+ Stars`,
        onRemove: () => updateUrl({ rating: null }),
      })
    }

    filters.languages.forEach((lang) => {
      chips.push({
        id: `chip-lang-${lang}`,
        label: lang,
        onRemove: () => toggleLanguage(lang),
      })
    })

    if (filters.onlineOnly) {
      chips.push({
        id: "chip-online",
        label: "Online now",
        onRemove: () => updateUrl({ onlineOnly: null }),
      })
    }

    if (filters.proOnly) {
      chips.push({
        id: "chip-pro",
        label: "Pro verified",
        onRemove: () => updateUrl({ proOnly: null }),
      })
    }

    return chips
  }, [filters, toggleLanguage, toggleLevel, updateUrl])

  return {
    filters,
    setFilter,
    toggleLevel,
    toggleLanguage,
    clearAllFilters,
    filteredGigs,
    paginatedGigs,
    totalResults,
    totalPages,
    currentPage,
    activeFilterChips,
    PAGE_SIZE,
  }
}

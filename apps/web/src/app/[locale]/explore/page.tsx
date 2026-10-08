"use client"

import { requestData, serviceGig, type Service } from "@/lib/marketplace"
import { ApiState } from "@/components/feedback/ApiState"
import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Search, Filter, SlidersHorizontal, Star, Clock, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GigCardSkeleton } from "@/components/ui/GigCardSkeleton"
import { GigCard } from "@/components/ui/GigCard"
import { useDialogFocus } from "@/hooks/useDialogFocus"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { ActiveFilterChips } from "@/components/services/ActiveFilterChips"

export interface ExploreService {
  record: Service
  id: string
  title: string
  description?: string
  tags?: string[]
  category: string
  categoryId: string
  subCategory?: string
  seller: {
    name: string
    title: string
    avatar: string
    level: string
  }
  rating: number
  reviewCount: number
  startingPrice: number
  deliveryDays: number
  coverImage: string
}

const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "Programming & Tech", value: "programming" },
  { label: "Graphics & Design", value: "design" },
  { label: "AI & Automation", value: "ai" },
  { label: "Digital Marketing", value: "marketing" },
  { label: "Writing & Translation", value: "writing" },
  { label: "Business & Consulting", value: "business" },
]

function ExploreContent() {
  const t = useTranslations("explorePage")
  const searchParams = useSearchParams()
  const router = useRouter()

  // State from URL
  const initialQ = searchParams.get("q") || ""
  const initialCategory = searchParams.get("category") || "all"
  const initialSort = searchParams.get("sort") || "newest"
  const initialMinPrice = searchParams.get("minPrice") || ""
  const initialMaxPrice = searchParams.get("maxPrice") || ""
  const initialRating = searchParams.get("rating") || ""
  const initialDeliveryTime = searchParams.get("deliveryTime") || ""

  const [query, setQuery] = React.useState(initialQ)
  const [category, setCategory] = React.useState(initialCategory)
  const [sort, setSort] = React.useState(initialSort)
  const [minPrice, setMinPrice] = React.useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = React.useState(initialMaxPrice)
  const [minRating, setMinRating] = React.useState(initialRating)
  const [deliveryTime, setDeliveryTime] = React.useState(initialDeliveryTime)
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [services, setServices] = React.useState<ExploreService[]>([])
  const [error, setError] = React.useState("")
  const [allServices, setAllServices] = React.useState<ExploreService[]>([])
  const [loadVersion, setLoadVersion] = React.useState(0)
  const drawerRef = React.useRef<HTMLDivElement>(null)
  useDialogFocus(mobileFilterOpen, drawerRef, () => setMobileFilterOpen(false))
  React.useEffect(() => {
    setQuery(initialQ)
    setCategory(initialCategory)
    setSort(initialSort)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setMinRating(initialRating)
    setDeliveryTime(initialDeliveryTime)
  }, [
    initialQ,
    initialCategory,
    initialSort,
    initialMinPrice,
    initialMaxPrice,
    initialRating,
    initialDeliveryTime,
  ])

  // Sync state to URL and fetch
  const applyFilters = React.useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      if (category && category !== "all") params.set("category", category)
      if (sort && sort !== "newest") params.set("sort", sort)
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      if (minRating) params.set("rating", minRating)
      if (deliveryTime) params.set("deliveryTime", deliveryTime)

      Object.entries(newParams).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })

      router.push(`/explore?${params.toString()}`)
    },
    [query, category, sort, minPrice, maxPrice, minRating, deliveryTime, router]
  )

  React.useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError("")
      setServices([])
      try {
        const first = await requestData<{ services: Service[]; totalPages: number }>(
          "/api/v1/services?limit=50",
          { signal: controller.signal }
        )
        const live = [...first.services]
        for (let page = 2; page <= first.totalPages; page++) {
          const more = await requestData<{ services: Service[] }>(
            `/api/v1/services?limit=50&page=${page}`,
            { signal: controller.signal }
          )
          live.push(...more.services)
        }
        const mapped: ExploreService[] = live.map((service) => {
          const gig = serviceGig(service)
          return {
            record: service,
            id: gig.id,
            title: gig.title,
            description: gig.description,
            tags: gig.tags,
            category: gig.categoryName,
            categoryId: gig.categorySlug,
            seller: {
              name: gig.seller.name,
              title: service.seller.professionalTitle || "",
              avatar: gig.seller.avatar || "/favicon.svg",
              level: service.seller.level || "",
            },
            rating: gig.rating,
            reviewCount: gig.reviewsCount,
            startingPrice: gig.startingPrice,
            deliveryDays: gig.deliveryDays,
            coverImage: gig.gallery[0]?.url || "/favicon.svg",
          }
        })
        let result = mapped.filter(
          (item) =>
            (!initialQ ||
              `${item.title} ${item.description} ${item.tags?.join(" ")}`
                .toLowerCase()
                .includes(initialQ.toLowerCase())) &&
            (initialCategory === "all" || item.categoryId === initialCategory) &&
            (!initialMinPrice || item.startingPrice >= Number(initialMinPrice)) &&
            (!initialMaxPrice || item.startingPrice <= Number(initialMaxPrice)) &&
            (!initialRating || item.rating >= Number(initialRating)) &&
            (!initialDeliveryTime || item.deliveryDays <= Number(initialDeliveryTime))
        )
        if (initialSort === "price_asc")
          result = result.sort((a, b) => a.startingPrice - b.startingPrice)
        if (initialSort === "price_desc")
          result = result.sort((a, b) => b.startingPrice - a.startingPrice)
        if (initialSort === "rating") result = result.sort((a, b) => b.rating - a.rating)
        if (initialSort === "popular")
          result = result.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
        if (!controller.signal.aborted) {
          setAllServices(mapped)
          setServices(result)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAllServices([])
          setError(error instanceof Error ? error.message : "Catalog unavailable.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [
    loadVersion,
    initialQ,
    initialCategory,
    initialSort,
    initialMinPrice,
    initialMaxPrice,
    initialRating,
    initialDeliveryTime,
  ])
  const otherCategoryMatches = React.useMemo(
    () =>
      initialQ
        ? allServices.filter((s) => s.title.toLowerCase().includes(initialQ.toLowerCase()))
        : [],
    [allServices, initialQ]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // When submitting search query, search all categories by default to maximize matches
    applyFilters({ q: query, category: "" })
    setCategory("all")
  }

  const resetAllFilters = () => {
    setQuery("")
    setCategory("all")
    setSort("newest")
    setMinPrice("")
    setMaxPrice("")
    setMinRating("")
    setDeliveryTime("")
    router.push("/explore")
  }

  const activeFilterCount = [
    category !== "all",
    minPrice !== "",
    maxPrice !== "",
    minRating !== "",
    deliveryTime !== "",
  ].filter(Boolean).length

  const activeChips = [
    { key: "q", value: initialQ, label: `Search: ${initialQ}` },
    {
      key: "category",
      value: initialCategory !== "all" ? initialCategory : "",
      label: CATEGORIES.find((c) => c.value === initialCategory)?.label || initialCategory,
    },
    { key: "minPrice", value: initialMinPrice, label: `Minimum: $${initialMinPrice}` },
    { key: "maxPrice", value: initialMaxPrice, label: `Maximum: $${initialMaxPrice}` },
    { key: "rating", value: initialRating, label: `${initialRating}+ rating` },
    {
      key: "deliveryTime",
      value: initialDeliveryTime,
      label: `Within ${initialDeliveryTime} days`,
    },
  ]
    .filter((chip) => chip.value)
    .map((chip) => ({
      id: chip.key,
      label: chip.label,
      onRemove: () => applyFilters({ [chip.key]: "" }),
    }))

  return (
    <div className="premium-container py-10 min-h-screen">
      {/* Header & Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
              <Link href="/" className="hover:text-text-primary transition-colors">
                {t("breadcrumbHome")}
              </Link>
              <span>/</span>
              <span className="text-text-primary">{t("breadcrumbExplore")}</span>
            </div>
            <h1 className="premium-title text-[var(--foreground)]">{t("title")}</h1>
          </div>

          {/* Quick Keyword Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="search"
                aria-label={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-xl border border-border bg-[var(--surface)] pl-10 pr-12 py-2 text-sm text-text-primary placeholder:text-text-muted  focus:border-[var(--focus-ring)] transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    applyFilters({ q: "" })
                  }}
                  aria-label="Clear search"
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-text-muted hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            >
              {t("searchButton")}
            </Button>
          </form>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value)
                  applyFilters({ category: cat.value === "all" ? "" : cat.value })
                }}
                aria-pressed={isSelected}
                className={`min-h-11 px-3.5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow"
                    : "bg-[var(--surface)] border border-border text-text-secondary hover:text-text-primary hover:border-[var(--border-hover)]"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="p-5 rounded-xl border border-border bg-[var(--surface)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <span className="font-semibold text-sm text-text-primary flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" />
                {t("filters")}
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-sm text-text-muted hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("reset")}
                </button>
              )}
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                {t("priceRange")}
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  aria-label="Minimum price"
                  placeholder={t("min")}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="min-w-0 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--surface)] dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white  focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)] transition-all duration-200 shadow-xs"
                />
                <span className="text-slate-400 font-mono">-</span>
                <input
                  type="number"
                  aria-label="Maximum price"
                  placeholder={t("max")}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="min-w-0 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--surface)] dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white  focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)] transition-all duration-200 shadow-xs"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => applyFilters({ minPrice, maxPrice })}
                className="w-full mt-2.5 text-sm rounded-lg shadow-xs"
              >
                {t("applyPrice")}
              </Button>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                {t("minRating")}
              </h3>
              <div className="space-y-1 text-sm">
                {[
                  { label: t("rating49"), value: "4.9" },
                  { label: t("rating45"), value: "4.5" },
                  { label: t("rating40"), value: "4.0" },
                  { label: t("ratingAny"), value: "" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={cn(
                      "flex items-center justify-between cursor-pointer py-2.5 px-2.5 rounded-lg text-sm transition-colors duration-150 select-none",
                      minRating === item.value
                        ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === item.value}
                        onChange={() => {
                          setMinRating(item.value)
                          applyFilters({ rating: item.value })
                        }}
                        className="accent-[var(--primary)]"
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.value && (
                      <span className="flex items-center text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Time presets */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                {t("deliveryWindow")}
              </h3>
              <div className="space-y-1 text-sm">
                {[
                  { label: t("delivery24h"), val: 1 },
                  { label: t("delivery3d"), val: 3 },
                  { label: t("delivery7d"), val: 7 },
                  { label: t("deliveryAny"), val: "" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    aria-pressed={deliveryTime === item.val.toString()}
                    onClick={() => {
                      setDeliveryTime(item.val.toString())
                      applyFilters({ deliveryTime: item.val.toString() })
                    }}
                    className={cn(
                      "w-full text-left py-2.5 px-2.5 rounded-lg text-sm transition-colors duration-150 flex items-center justify-between select-none cursor-pointer",
                      deliveryTime === item.val.toString()
                        ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]"
                    )}
                  >
                    <span>{item.label}</span>
                    <Clock className="h-3 w-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Services Results Column */}
        <div className="min-w-0 lg:col-span-3" aria-busy={loading}>
          {/* Top Bar: Count & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="text-sm text-text-muted">
              {t("showingServices", { count: services.length })}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-border bg-[var(--surface)] text-sm text-text-primary"
              >
                <Filter className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>{t("filters")}</span>
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 hidden sm:inline">{t("sortBy")}</span>
                <select
                  aria-label={t("sortBy")}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    applyFilters({ sort: e.target.value })
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--surface)] dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200  hover:border-[var(--border-hover)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)] transition-all duration-200 shadow-xs cursor-pointer"
                >
                  <option value="newest">{t("sortNewest")}</option>
                  <option value="rating">{t("sortRating")}</option>
                  <option value="popular">{t("sortPopular")}</option>
                  <option value="price_asc">{t("sortPriceAsc")}</option>
                  <option value="price_desc">{t("sortPriceDesc")}</option>
                </select>
              </div>
            </div>
          </div>

          <ActiveFilterChips chips={activeChips} onClearAll={resetAllFilters} />

          {/* Loading Skeletons */}
          {error ? (
            <ApiState error={error} retry={() => setLoadVersion((version) => version + 1)} />
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GigCardSkeleton key={i} />
              ))}
            </div>
          ) : services.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border border-border/60 bg-[var(--surface)] p-8 sm:p-12 text-center flex flex-col items-center justify-center my-8">
              <div className="h-12 w-12 rounded-full bg-[var(--primary-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl text-text-primary font-medium mb-2">
                {t("noServicesFound")}
              </h3>
              <p className="text-sm sm:text-sm text-text-muted max-w-md mb-6 leading-relaxed">
                {otherCategoryMatches.length > 0 && initialCategory !== "all"
                  ? `Không tìm thấy dịch vụ nào cho "${initialQ}" trong danh mục "${
                      CATEGORIES.find((c) => c.value === initialCategory)?.label || initialCategory
                    }". Tuy nhiên, TASCORA tìm thấy ${otherCategoryMatches.length} dịch vụ chuyên môn phù hợp trong các danh mục khác!`
                  : t("noServicesSubtext")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {otherCategoryMatches.length > 0 && initialCategory !== "all" && (
                  <Button
                    onClick={() => {
                      setCategory("all")
                      applyFilters({ category: "" })
                    }}
                    size="sm"
                    className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 gap-2 shadow-sm"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Xem {otherCategoryMatches.length} kết quả trong Tất cả danh mục
                  </Button>
                )}
                <Button
                  onClick={resetAllFilters}
                  size="sm"
                  variant="outline"
                  className="rounded-full gap-2 text-text-muted hover:text-text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("clearAllFilters")}
                </Button>
              </div>
            </div>
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <GigCard key={service.id} gig={serviceGig(service.record)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet Drawer */}
      <div>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            {/* Backdrop */}
            <div
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 "
              aria-hidden="true"
            />

            {/* Bottom Sheet Container */}
            <div
              ref={drawerRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={t("filters")}
              className="relative z-10 w-full max-h-[88dvh] bg-[var(--surface)] rounded-t-2xl border-t border-border shadow-[var(--shadow-lg)] overflow-hidden flex flex-col"
            >
              {/* Top Drag Handle & Title */}
              <div className="pt-3 pb-3 px-6 border-b border-border flex flex-col items-center">
                <div className="w-12 h-1.5 rounded-full bg-slate-200 mb-3" />
                <div className="w-full flex items-center justify-between">
                  <span className="font-semibold text-text-primary text-base flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" />
                    {t("filters")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-100 cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body: Category, Price, Rating, Delivery */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Category */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                    Category
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.value
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors cursor-pointer border ${
                            isSelected
                              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                              : "bg-[var(--subtle)] border-border text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {cat.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Price Range */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                    {t("priceRange")}
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <span className="text-xs text-text-muted uppercase mb-1 block">Min ($)</span>
                      <input
                        type="number"
                        aria-label="Minimum price"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full min-h-[44px] rounded-lg border border-border bg-[var(--subtle)] px-3 py-2 text-sm text-text-primary  focus:border-[var(--primary)]"
                      />
                    </div>
                    <span className="text-text-muted pt-4">-</span>
                    <div className="flex-1">
                      <span className="text-xs text-text-muted uppercase mb-1 block">Max ($)</span>
                      <input
                        type="number"
                        aria-label="Maximum price"
                        placeholder="1000+"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full min-h-[44px] rounded-lg border border-border bg-[var(--subtle)] px-3 py-2 text-sm text-text-primary  focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Rating */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                    Seller Rating
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { label: "4.5 & up", val: "4.5" },
                      { label: "4.0 & up", val: "4.0" },
                      { label: "Any Rating", val: "" },
                    ].map((item) => (
                      <label
                        key={item.val}
                        className={`min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          minRating === item.val
                            ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-text-primary"
                            : "border-border bg-[var(--surface)] text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="mobile-rating"
                            checked={minRating === item.val}
                            onChange={() => setMinRating(item.val)}
                            className="accent-[var(--primary)]"
                          />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.val && (
                          <div className="flex items-center text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 4. Delivery Window */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                    {t("deliveryWindow")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Up to 24 hours", val: "1" },
                      { label: "Up to 3 days", val: "3" },
                      { label: "Up to 7 days", val: "7" },
                      { label: "Any Delivery", val: "" },
                    ].map((d) => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => setDeliveryTime(d.val)}
                        className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between border transition-colors cursor-pointer ${
                          deliveryTime === d.val
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--subtle)] border-border text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <span>{d.label}</span>
                        <Clock className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky Action Footer with Safe Area */}
              <div className="p-4 border-t border-border bg-[var(--surface)] flex gap-3 safe-area-bottom">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    resetAllFilters()
                    setMobileFilterOpen(false)
                  }}
                  className="flex-1 min-h-[44px] text-sm font-semibold"
                >
                  {t("reset")}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    applyFilters({
                      category: category === "all" ? "" : category,
                      minPrice,
                      maxPrice,
                      rating: minRating,
                      deliveryTime,
                    })
                    setMobileFilterOpen(false)
                  }}
                  className="flex-1 min-h-[44px] text-sm font-semibold"
                >
                  {t("apply")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const t = useTranslations("explorePage")
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto p-12 text-center text-text-muted">{t("loading")}</div>
      }
    >
      <ExploreContent />
    </React.Suspense>
  )
}

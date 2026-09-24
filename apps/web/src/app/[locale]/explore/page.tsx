"use client"

import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Clock,
  Heart,
  X,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"

// Fallback curated services if backend DB has no records yet
const INITIAL_FALLBACK_SERVICES = [
  {
    id: "srv-1",
    title: "Full-Stack Next.js 15 & Node.js Production Architecture",
    category: "Programming & Tech",
    categoryId: "programming",
    seller: {
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      level: "TOP_RATED",
    },
    rating: 4.98,
    reviewCount: 42,
    startingPrice: 350,
    deliveryDays: 5,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-2",
    title: "Luxury Brand Identity & Editorial Design System",
    category: "Graphics & Design",
    categoryId: "design",
    seller: {
      name: "Helena Rostova",
      title: "Art Director & Brand Strategist",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      level: "LEVEL_2",
    },
    rating: 5.0,
    reviewCount: 38,
    startingPrice: 280,
    deliveryDays: 4,
    coverImage: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-3",
    title: "Autonomous AI Agents & LLM Workflow Integration",
    category: "AI & Automation",
    categoryId: "ai",
    seller: {
      name: "Marcus Vance",
      title: "AI Engineer & Research Lead",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      level: "TOP_RATED",
    },
    rating: 4.95,
    reviewCount: 29,
    startingPrice: 420,
    deliveryDays: 7,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-4",
    title: "High-Converting B2B SaaS Growth & SEO Strategy",
    category: "Digital Marketing",
    categoryId: "marketing",
    seller: {
      name: "Sophia Lindqvist",
      title: "Growth Marketing Consultant",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      level: "LEVEL_2",
    },
    rating: 4.92,
    reviewCount: 51,
    startingPrice: 190,
    deliveryDays: 3,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-5",
    title: "Enterprise Cybersecurity Audit & Penetration Testing",
    category: "Programming & Tech",
    categoryId: "programming",
    seller: {
      name: "Dmitri Volkov",
      title: "Security Engineer & Ethical Hacker",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      level: "TOP_RATED",
    },
    rating: 4.99,
    reviewCount: 64,
    startingPrice: 500,
    deliveryDays: 7,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "srv-6",
    title: "High-End Motion Graphics & 3D Product Renders",
    category: "Graphics & Design",
    categoryId: "design",
    seller: {
      name: "Chloe Dubois",
      title: "3D Motion Designer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      level: "LEVEL_2",
    },
    rating: 4.97,
    reviewCount: 33,
    startingPrice: 320,
    deliveryDays: 4,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
  },
]

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

  const [query, setQuery] = React.useState(initialQ)
  const [category, setCategory] = React.useState(initialCategory)
  const [sort, setSort] = React.useState(initialSort)
  const [minPrice, setMinPrice] = React.useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = React.useState(initialMaxPrice)
  const [minRating, setMinRating] = React.useState(initialRating)
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [services, setServices] = React.useState(INITIAL_FALLBACK_SERVICES)
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({})

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

      Object.entries(newParams).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })

      router.push(`/explore?${params.toString()}`)
    },
    [query, category, sort, minPrice, maxPrice, minRating, router]
  )

  // Fetch from backend API
  React.useEffect(() => {
    async function fetchServices() {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        const params = new URLSearchParams()
        if (initialQ) params.set("q", initialQ)
        if (initialCategory !== "all") params.set("categoryId", initialCategory)
        if (initialSort) params.set("sort", initialSort)
        if (initialMinPrice) params.set("minPrice", initialMinPrice)
        if (initialMaxPrice) params.set("maxPrice", initialMaxPrice)
        if (initialRating) params.set("rating", initialRating)

        const res = await fetch(`${apiUrl}/api/v1/services?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data?.services) && data.data.services.length > 0) {
            const mapped = data.data.services.map((item: any) => ({
              id: item.id,
              title: item.title,
              category: item.category?.name || "Professional Service",
              categoryId: item.categoryId || "other",
              seller: {
                name: item.seller?.user?.profile?.firstName
                  ? `${item.seller.user.profile.firstName} ${item.seller.user.profile.lastName || ""}`.trim()
                  : "Verified Specialist",
                title: item.seller?.title || "Professional Specialist",
                avatar: item.seller?.user?.profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                level: item.seller?.level || "NEW_SELLER",
              },
              rating: item.averageRating || 5.0,
              reviewCount: item.totalReviews || 18,
              startingPrice: item.packages?.[0]?.price || 150,
              deliveryDays: item.packages?.[0]?.deliveryDays || 3,
              coverImage: item.images?.[0] || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
            }))
            setServices(mapped)
            setLoading(false)
            return
          }
        }
      } catch {
        // Fallback filter locally
      }

      // Local filter fallback
      let filtered = [...INITIAL_FALLBACK_SERVICES]
      if (initialQ) {
        filtered = filtered.filter((s) =>
          s.title.toLowerCase().includes(initialQ.toLowerCase())
        )
      }
      if (initialCategory && initialCategory !== "all") {
        filtered = filtered.filter((s) => s.categoryId === initialCategory)
      }
      if (initialMinPrice) {
        filtered = filtered.filter((s) => s.startingPrice >= Number(initialMinPrice))
      }
      if (initialMaxPrice) {
        filtered = filtered.filter((s) => s.startingPrice <= Number(initialMaxPrice))
      }
      if (initialRating) {
        filtered = filtered.filter((s) => s.rating >= Number(initialRating))
      }
      if (initialSort === "price_asc") {
        filtered.sort((a, b) => a.startingPrice - b.startingPrice)
      } else if (initialSort === "price_desc") {
        filtered.sort((a, b) => b.startingPrice - a.startingPrice)
      } else if (initialSort === "rating") {
        filtered.sort((a, b) => b.rating - a.rating)
      }

      setServices(filtered)
      setLoading(false)
    }

    fetchServices()
  }, [initialQ, initialCategory, initialSort, initialMinPrice, initialMaxPrice, initialRating])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ q: query })
  }

  const resetAllFilters = () => {
    setQuery("")
    setCategory("all")
    setSort("newest")
    setMinPrice("")
    setMaxPrice("")
    setMinRating("")
    router.push("/explore")
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const activeFilterCount = [
    category !== "all",
    minPrice !== "",
    maxPrice !== "",
    minRating !== "",
  ].filter(Boolean).length

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
      {/* Header & Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Link href="/" className="hover:text-text-primary transition-colors">{t("breadcrumbHome")}</Link>
              <span>/</span>
              <span className="text-text-primary">{t("breadcrumbExplore")}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-text-primary font-medium">
              {t("title")}
            </h1>
          </div>

          {/* Quick Keyword Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-600/60 transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    applyFilters({ q: "" })
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border border-border text-text-secondary hover:text-text-primary hover:border-blue-600/40"
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
          <div className="p-5 rounded-2xl border border-border bg-white space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <span className="font-semibold text-sm text-text-primary flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                {t("filters")}
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-text-muted hover:text-blue-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("reset")}
                </button>
              )}
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                {t("priceRange")}
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={t("min")}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-xs text-text-primary outline-none focus:border-blue-600/50"
                />
                <span className="text-text-muted">-</span>
                <input
                  type="number"
                  placeholder={t("max")}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-xs text-text-primary outline-none focus:border-blue-600/50"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilters({ minPrice, maxPrice })}
                className="w-full mt-2.5 text-xs rounded-lg border-border"
              >
                {t("applyPrice")}
              </Button>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                {t("minRating")}
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: t("rating49"), value: "4.9" },
                  { label: t("rating45"), value: "4.5" },
                  { label: t("rating40"), value: "4.0" },
                  { label: t("ratingAny"), value: "" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center justify-between cursor-pointer py-1 px-2 rounded hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-colors"
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
                        className="accent-blue-600"
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                {t("deliveryWindow")}
              </h3>
              <div className="space-y-1.5 text-xs text-text-secondary">
                {[
                  { label: t("delivery24h"), val: 1 },
                  { label: t("delivery3d"), val: 3 },
                  { label: t("delivery7d"), val: 7 },
                  { label: t("deliveryAny"), val: "" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyFilters({ deliveryTime: item.val.toString() })}
                    className="w-full text-left py-1.5 px-2.5 rounded-lg hover:bg-slate-50 hover:text-text-primary transition-colors flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <Clock className="h-3 w-3 text-text-muted" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Services Results Column */}
        <main className="lg:col-span-3">
          {/* Top Bar: Count & Sort */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs text-text-muted">
              {t("showingServices", { count: services.length })}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs text-text-primary"
              >
                <Filter className="h-3.5 w-3.5 text-blue-600" />
                <span>{t("filters")}</span>
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted hidden sm:inline">{t("sortBy")}</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    applyFilters({ sort: e.target.value })
                  }}
                  className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-text-primary outline-none hover:border-blue-600/40 transition-colors"
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

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-white p-4 space-y-4">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-border/60 bg-white p-12 text-center flex flex-col items-center justify-center my-8">
              <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl text-text-primary font-medium mb-2">
                {t("noServicesFound")}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted max-w-sm mb-6">
                {t("noServicesSubtext")}
              </p>
              <Button onClick={resetAllFilters} size="sm" variant="outline" className="rounded-full gap-2">
                <RotateCcw className="h-3.5 w-3.5" />
                {t("clearAllFilters")}
              </Button>
            </div>
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const isFav = favorites[service.id] || false
                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="group rounded-2xl border border-border bg-white overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-blue-600/50 hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-1"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <img
                        src={service.coverImage}
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                      <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white">
                        {service.category}
                      </span>

                      <button
                        onClick={(e) => toggleFavorite(service.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                          isFav
                            ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                            : "bg-black/50 text-white/70 hover:text-white border border-white/10"
                        }`}
                        aria-label="Save to favorites"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Seller row */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <img
                            src={service.seller.avatar}
                            alt={service.seller.name}
                            className="h-7 w-7 rounded-full object-cover border border-border"
                          />
                          <div className="truncate text-xs">
                            <p className="font-medium text-text-primary truncate">{service.seller.name}</p>
                            <p className="text-[11px] text-text-muted truncate">{service.seller.title}</p>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-medium text-sm leading-snug text-text-primary line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {service.title}
                        </h3>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-text-muted">
                          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {service.rating}
                            <span className="text-text-muted font-normal">({service.reviewCount})</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-text-muted" />
                            {service.deliveryDays}d
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-text-muted block">{t("fromPrice")}</span>
                          <span className="font-semibold text-text-primary text-base">${service.startingPrice}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs ml-auto h-full bg-white border-l border-border p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-semibold text-text-primary">{t("filters")}</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Filter Controls */}
              <div className="py-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-text-muted mb-2">Category</h4>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      applyFilters({ category: e.target.value === "all" ? "" : e.target.value })
                    }}
                    className="w-full rounded-lg border border-border bg-slate-50 p-2 text-xs text-text-primary"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-text-muted mb-2">{t("priceRange")}</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={t("min")}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 rounded border border-border bg-slate-50 p-1.5 text-xs text-text-primary"
                    />
                    <input
                      type="number"
                      placeholder={t("max")}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 rounded border border-border bg-slate-50 p-1.5 text-xs text-text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetAllFilters()
                  setMobileFilterOpen(false)
                }}
                className="flex-1 text-xs"
              >
                {t("reset")}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  applyFilters({ minPrice, maxPrice })
                  setMobileFilterOpen(false)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                {t("apply")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExplorePage() {
  const t = useTranslations("explorePage")
  return (
    <React.Suspense fallback={<div className="container mx-auto p-12 text-center text-text-muted">{t("loading")}</div>}>
      <ExploreContent />
    </React.Suspense>
  )
}

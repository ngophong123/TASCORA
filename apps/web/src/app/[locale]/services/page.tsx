"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useServiceFilters } from "@/hooks/useServiceFilters"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { GigCard } from "@/components/ui/GigCard"
import { GigCardSkeleton } from "@/components/ui/GigCardSkeleton"
import { ServiceFilterSidebar } from "@/components/services/ServiceFilterSidebar"
import { ServiceToolbar } from "@/components/services/ServiceToolbar"
import { ActiveFilterChips } from "@/components/services/ActiveFilterChips"
import { ServicePagination } from "@/components/services/ServicePagination"
import { ServiceEmptyState } from "@/components/services/ServiceEmptyState"
import { MobileFilterDrawer } from "@/components/services/MobileFilterDrawer"
import { ChevronRight, Home } from "lucide-react"

function ServicesContent() {
  const categories = useApiResource<
    { id: string; name: string; slug: string; parentId: string | null }[]
  >("/api/v1/marketplace/categories")
  const t = useTranslations("services")
  const tCommon = useTranslations("common")
  const tNav = useTranslations("nav")

  const {
    filters,
    loading,
    error,
    reload,
    setFilter,
    toggleLevel,
    toggleLanguage,
    clearAllFilters,
    paginatedGigs,
    totalResults,
    totalPages,
    currentPage,
    activeFilterChips,
    PAGE_SIZE,
  } = useServiceFilters()

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false)
  // Determine current category metadata
  const currentCategory = React.useMemo(() => {
    if (!filters.category || filters.category === "all") return null
    const category = categories.data?.find((c) => c.slug === filters.category)
    return category
      ? {
          ...category,
          subcategories: categories.data?.filter((c) => c.parentId === category.id) || [],
        }
      : null
  }, [filters.category, categories.data])

  // Dynamic header title
  const pageTitle = React.useMemo(() => {
    if (filters.q) {
      return `Search: "${filters.q}"`
    }
    if (currentCategory) {
      if (filters.subCategory) {
        const sub = currentCategory.subcategories.find((s) => s.slug === filters.subCategory)
        if (sub) return `${sub.name}`
      }
      return `${currentCategory.name}`
    }
    return t("titlePrefix") + " " + t("titleHighlight")
  }, [filters.q, filters.subCategory, currentCategory, t])

  const startIndex = totalResults > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalResults)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--background)] py-10 sm:py-14">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{tCommon("home")}</span>
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </li>
              <li>
                <Link
                  href="/services"
                  className={
                    currentCategory
                      ? "hover:text-[var(--primary)] transition-colors"
                      : "text-[var(--primary)] font-semibold"
                  }
                >
                  {tNav("exploreServices")}
                </Link>
              </li>
              {currentCategory && (
                <>
                  <li>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </li>
                  <li className="text-[var(--primary)] font-semibold truncate max-w-[200px]">
                    {currentCategory.name}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Heading and Subtitle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="premium-eyebrow mb-3">Explore independent expertise</p>
              <h1 className="premium-title text-[var(--foreground)]">{pageTitle}</h1>
              <p className="mt-4 text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            {/* Results Live Counter */}
            <div
              className="text-xs sm:text-sm font-medium text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-3.5 py-2 rounded-lg self-start md:self-auto shrink-0"
              aria-live="polite"
            >
              {loading ? (
                <span>{tCommon("loading")}</span>
              ) : error ? (
                <span>Catalog unavailable</span>
              ) : totalResults > 0 ? (
                <span>
                  {t("resultsCount", { count: totalResults })} ({startIndex}-{endIndex})
                </span>
              ) : (
                <span className="text-[var(--text-muted)] font-medium">{t("noResultsTitle")}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sticky Toolbar */}
      <ServiceToolbar
        filters={filters}
        setFilter={setFilter}
        totalResults={totalResults}
        activeFilterCount={activeFilterChips.length}
        onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
      />

      {/* 3. Two-Column Main Content */}
      <div id="services-listing-top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Left Column: Filter Sidebar (Desktop, sticky) */}
          <div className="hidden lg:block w-[280px] shrink-0 sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
            <ServiceFilterSidebar
              filters={filters}
              setFilter={setFilter}
              toggleLevel={toggleLevel}
              toggleLanguage={toggleLanguage}
              clearAllFilters={clearAllFilters}
              hasActiveFilters={activeFilterChips.length > 0}
            />
          </div>

          {/* Right Column: Listing & Results */}
          <div className="flex-1 min-w-0" aria-busy={loading}>
            {/* Active Filter Chips Bar */}
            <ActiveFilterChips chips={activeFilterChips} onClearAll={clearAllFilters} />

            {/* Shimmer Skeleton or Empty State or Active Results */}
            {error ? (
              <ApiState error={error} retry={reload} />
            ) : loading ? (
              <div
                className={
                  filters.view === "list"
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                }
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <GigCardSkeleton key={`skeleton-${i}`} view={filters.view} />
                ))}
              </div>
            ) : totalResults === 0 ? (
              <ServiceEmptyState
                onClearFilters={clearAllFilters}
                onSelectSuggestion={(query) => setFilter("q", query)}
              />
            ) : (
              <>
                {/* Results grid / list */}
                <div
                  className={
                    filters.view === "list"
                      ? "flex flex-col gap-4"
                      : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  }
                >
                  {paginatedGigs.map((gig) => (
                    <div key={gig.id}>
                      <GigCard gig={gig} view={filters.view} />
                    </div>
                  ))}
                </div>

                {/* Numbered Pagination */}
                <ServicePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setFilter("page", p)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Mobile filter dialog */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        filters={filters}
        setFilter={setFilter}
        toggleLevel={toggleLevel}
        toggleLanguage={toggleLanguage}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={activeFilterChips.length > 0}
        totalResults={totalResults}
      />
    </div>
  )
}

export default function ServicesPage() {
  const tCommon = useTranslations("common")

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] shadow-sm text-sm font-medium text-[#4B4B5C]">
            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span>{tCommon("loading")}</span>
          </div>
        </div>
      }
    >
      <ServicesContent />
    </React.Suspense>
  )
}

"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { useServiceFilters } from "@/hooks/useServiceFilters"
import { FILTER_CATEGORIES } from "@/data/serviceFilterOptions"
import { GigCard } from "@/components/ui/GigCard"
import { GigCardSkeleton } from "@/components/ui/GigCardSkeleton"
import { ServiceFilterSidebar } from "@/components/services/ServiceFilterSidebar"
import { ServiceToolbar } from "@/components/services/ServiceToolbar"
import { ActiveFilterChips } from "@/components/services/ActiveFilterChips"
import { ServicePagination } from "@/components/services/ServicePagination"
import { ServiceEmptyState } from "@/components/services/ServiceEmptyState"
import { MobileFilterDrawer } from "@/components/services/MobileFilterDrawer"
import { ChevronRight, Home, Sparkles } from "lucide-react"

import type { Variants } from "framer-motion"

// Staggered motion variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.25, 1, 0.5, 1] as const,
    },
  },
}

function ServicesContent() {
  const t = useTranslations("services")
  const tCommon = useTranslations("common")
  const tNav = useTranslations("nav")

  const {
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
  } = useServiceFilters()

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  // Trigger quick debounced shimmer transition when primary filter criteria change
  const filterKey = React.useMemo(() => {
    return `${filters.q}_${filters.category}_${filters.subCategory}_${filters.minPrice}_${filters.maxPrice}_${filters.delivery}_${filters.levels.join(",")}_${filters.rating}_${filters.onlineOnly}_${filters.proOnly}_${filters.sort}_${filters.page}_${filters.view}`
  }, [filters])

  const initialRender = React.useRef(true)

  React.useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 280)

    return () => clearTimeout(timer)
  }, [filterKey])

  // Determine current category metadata
  const currentCategory = React.useMemo(() => {
    if (!filters.category || filters.category === "all") return null
    return FILTER_CATEGORIES.find((c) => c.slug === filters.category) || null
  }, [filters.category])

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
    <div className="min-h-screen bg-white">
      {/* 1. Page Header with light blue ambient glow */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pb-12 border-b border-[rgba(15,15,30,0.06)] bg-gradient-to-b from-[#FAFAFC] to-white">
        {/* Subtle Ambient Radial Glow Blob */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-blue-200/40 via-sky-100/30 to-teal-100/20 blur-[90px] rounded-full"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-[#6B6B7B]">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{tCommon("home")}</span>
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-[#A1A1B2]" />
              </li>
              <li>
                <Link
                  href="/services"
                  className={
                    currentCategory
                      ? "hover:text-blue-600 transition-colors"
                      : "text-blue-700 font-semibold"
                  }
                >
                  {tNav("exploreServices")}
                </Link>
              </li>
              {currentCategory && (
                <>
                  <li>
                    <ChevronRight className="w-3.5 h-3.5 text-[#A1A1B2]" />
                  </li>
                  <li className="text-blue-700 font-semibold truncate max-w-[200px]">
                    {currentCategory.name}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Heading and Subtitle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{t("badge")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0B0B14]">
                {pageTitle}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#4B4B5C] max-w-2xl leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            {/* Results Live Counter */}
            <div
              className="text-xs sm:text-sm font-medium text-[#6B6B7B] bg-white border border-[rgba(15,15,30,0.08)] px-3.5 py-2 rounded-xl shadow-xs self-start md:self-auto shrink-0"
              aria-live="polite"
            >
              {totalResults > 0 ? (
                <span>
                  {t("resultsCount", { count: totalResults })} ({startIndex}-{endIndex})
                </span>
              ) : (
                <span className="text-amber-600 font-medium">{t("noResultsTitle")}</span>
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
          <main className="flex-1 min-w-0">
            {/* Active Filter Chips Bar */}
            <ActiveFilterChips
              chips={activeFilterChips}
              onClearAll={clearAllFilters}
            />

            {/* Shimmer Skeleton or Empty State or Active Results */}
            {isTransitioning ? (
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
                {/* Results Grid / List with Framer Motion Stagger */}
                <motion.div
                  key={`${filterKey}_loaded`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className={
                    filters.view === "list"
                      ? "flex flex-col gap-4"
                      : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  }
                >
                  {paginatedGigs.map((gig, idx) => (
                    <motion.div
                      key={gig.id}
                      variants={itemVariants}
                      layout
                    >
                      <GigCard
                        gig={gig}
                        view={filters.view}
                        priority={idx < 6}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Numbered Pagination */}
                <ServicePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setFilter("page", p)}
                />
              </>
            )}
          </main>
        </div>
      </div>

      {/* 4. Mobile Filter Drawer (Touch gestures & bottom sheet) */}
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
        <div className="min-h-screen bg-white flex items-center justify-center">
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

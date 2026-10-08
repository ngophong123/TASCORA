"use client"

import * as React from "react"
import {
  FILTER_CATEGORIES,
  DELIVERY_OPTIONS,
  SELLER_LEVEL_OPTIONS,
  RATING_OPTIONS,
  LANGUAGE_OPTIONS,
  PRICE_BOUNDS,
} from "@/data/serviceFilterOptions"
import { type ServiceFilterState } from "@/hooks/useServiceFilters"
import { type SellerLevel } from "@/data/gigs"
import { DualRangeSlider } from "./DualRangeSlider"
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Star,
  SlidersHorizontal,
  Code2,
  Palette,
  Bot,
  Smartphone,
  Cloud,
  Video,
  PenTool,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceFilterSidebarProps {
  filters: ServiceFilterState
  setFilter: <K extends keyof ServiceFilterState>(key: K, value: ServiceFilterState[K]) => void
  toggleLevel: (level: SellerLevel) => void
  toggleLanguage: (language: string) => void
  clearAllFilters: () => void
  hasActiveFilters?: boolean
  className?: string
  onApplyMobile?: () => void
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Code2,
  Palette,
  Bot,
  Smartphone,
  Cloud,
  Video,
  PenTool,
  TrendingUp,
}

import { useApiResource } from "@/hooks/useApiResource"
export function ServiceFilterSidebar({
  filters,
  setFilter,
  toggleLevel,
  toggleLanguage,
  clearAllFilters,
  hasActiveFilters = false,
  className,
  onApplyMobile,
}: ServiceFilterSidebarProps) {
  const categories = useApiResource<
    {
      id: string
      name: string
      slug: string
      parentId: string | null
      _count: { services: number }
    }[]
  >("/api/v1/marketplace/categories")
  const liveCategories = (categories.data || [])
    .filter((c) => !c.parentId)
    .map((c) => ({
      ...c,
      iconName: FILTER_CATEGORIES.find((option) => option.slug === c.slug)?.iconName || "Code2",
      count: c._count.services,
      subcategories: (categories.data || [])
        .filter((child) => child.parentId === c.id)
        .map((child) => ({ ...child, count: child._count.services })),
    }))
  // Collapsible section states
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    categories: true,
    budget: true,
    delivery: true,
    levels: true,
    rating: true,
    languages: false,
    toggles: true,
  })

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside
      className={cn(
        "w-full bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--primary)]" />
          <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
            Filters
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            data-testid="clear-all-filters"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* 2. Categories & Subcategories Accordion */}
        <div className="pb-5 border-b border-[var(--border-subtle)]">
          <button
            type="button"
            aria-expanded={openSections.categories}
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full text-left font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-2"
          >
            <span>Category</span>
            {openSections.categories ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {openSections.categories && (
            <div className="mt-2 space-y-1">
              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => setFilter("category", "all")}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-2.5 rounded-lg text-sm transition-colors",
                  filters.category === "all" || !filters.category
                    ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--subtle)] hover:text-[var(--foreground)]"
                )}
              >
                <span>All Categories</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {(categories.data || []).reduce((sum, c) => sum + c._count.services, 0)}
                </span>
              </button>

              {/* Category Tree */}
              {liveCategories.map((cat) => {
                const isSelected = filters.category === cat.slug
                const IconComponent = CATEGORY_ICONS[cat.iconName] || Code2

                return (
                  <div key={cat.id} className="space-y-1">
                    <button
                      type="button"
                      data-testid={`filter-category-${cat.slug}`}
                      onClick={() => setFilter("category", isSelected ? "all" : cat.slug)}
                      className={cn(
                        "flex items-center justify-between w-full px-2.5 py-2.5 rounded-lg text-sm transition-all",
                        isSelected
                          ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold"
                          : "text-[var(--text-secondary)] hover:bg-[var(--subtle)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <IconComponent
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isSelected ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                          )}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)] ml-2 shrink-0">
                        {cat.count}
                      </span>
                    </button>

                    {/* Subcategories when category is active */}
                    {isSelected && cat.subcategories.length > 0 && (
                      <div className="pl-6 pr-1 space-y-0.5 border-l-2 border-[var(--border)] ml-3.5 my-1">
                        {cat.subcategories.map((sub) => {
                          const isSubSelected = filters.subCategory === sub.slug
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() =>
                                setFilter("subCategory", isSubSelected ? "" : sub.slug)
                              }
                              className={cn(
                                "flex items-center justify-between w-full px-2 py-1 rounded-md text-xs transition-colors",
                                isSubSelected
                                  ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-medium"
                                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--subtle)]"
                              )}
                            >
                              <span className="truncate">{sub.name}</span>
                              <span className="text-xs text-[var(--text-muted)] ml-1">
                                {sub.count}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3. Budget (Dual Range Slider) */}
        <div className="pb-5 border-b border-[var(--border-subtle)]">
          <button
            type="button"
            aria-expanded={openSections.budget}
            onClick={() => toggleSection("budget")}
            className="flex items-center justify-between w-full text-left font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-3"
          >
            <span>Budget</span>
            {openSections.budget ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {openSections.budget && (
            <DualRangeSlider
              min={filters.minPrice}
              max={filters.maxPrice}
              onChange={(minVal, maxVal) => {
                setFilter("minPrice", minVal)
                setFilter("maxPrice", maxVal)
              }}
              step={PRICE_BOUNDS.step}
            />
          )}
        </div>

        {/* 4. Delivery Time */}
        <div className="pb-5 border-b border-[var(--border-subtle)]">
          <button
            type="button"
            aria-expanded={openSections.delivery}
            onClick={() => toggleSection("delivery")}
            className="flex items-center justify-between w-full text-left font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-2"
          >
            <span>Delivery Time</span>
            {openSections.delivery ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {openSections.delivery && (
            <div className="space-y-1 mt-1">
              {DELIVERY_OPTIONS.map((opt) => {
                const isSelected =
                  filters.delivery === opt.id ||
                  (opt.id === "any" && (!filters.delivery || filters.delivery === "any"))
                return (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2.5 rounded-lg text-sm cursor-pointer select-none transition-colors",
                      isSelected
                        ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--subtle)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setFilter("delivery", opt.id)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      <span>{opt.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* 5. Seller Level */}
        <div className="pb-5 border-b border-[var(--border-subtle)]">
          <button
            type="button"
            aria-expanded={openSections.levels}
            onClick={() => toggleSection("levels")}
            className="flex items-center justify-between w-full text-left font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-2"
          >
            <span>Seller Level</span>
            {openSections.levels ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {openSections.levels && (
            <div className="space-y-1 mt-1">
              {SELLER_LEVEL_OPTIONS.map((level) => {
                const isChecked = filters.levels.includes(level.id as SellerLevel)
                return (
                  <label
                    key={level.id}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2.5 rounded-lg text-sm cursor-pointer select-none transition-colors",
                      isChecked
                        ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--subtle)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLevel(level.id as SellerLevel)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      <span>{level.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* 6. Rating */}
        <div className="pb-5 border-b border-[var(--border-subtle)]">
          <button
            type="button"
            aria-expanded={openSections.rating}
            onClick={() => toggleSection("rating")}
            className="flex items-center justify-between w-full text-left font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-2"
          >
            <span>Customer Rating</span>
            {openSections.rating ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {openSections.rating && (
            <div className="space-y-1 mt-1">
              {RATING_OPTIONS.map((opt) => {
                const isSelected =
                  filters.rating === opt.minRating ||
                  (opt.minRating === 0 && (!filters.rating || filters.rating === 0))
                return (
                  <label
                    key={opt.id}
                    data-testid={`filter-rating-${opt.minRating}`}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2.5 rounded-lg text-sm cursor-pointer select-none transition-colors",
                      isSelected
                        ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--subtle)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="rating"
                        value={opt.minRating}
                        checked={isSelected}
                        onChange={() => setFilter("rating", opt.minRating)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      <div className="flex items-center gap-1">
                        {opt.minRating > 0 ? (
                          <>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{opt.minRating.toFixed(1)} & up</span>
                          </>
                        ) : (
                          <span>Any rating</span>
                        )}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* 7. Languages */}
        <div className="pb-2">
          <button
            type="button"
            aria-expanded={openSections.languages}
            onClick={() => toggleSection("languages")}
            className="flex items-center justify-between w-full text-left font-semibold text-sm text-[var(--foreground)] uppercase tracking-wider mb-2"
          >
            <span>Language</span>
            {openSections.languages ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {openSections.languages && (
            <div className="space-y-1 mt-1 max-h-44 overflow-y-auto pr-1">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isChecked = filters.languages.includes(lang)
                return (
                  <label
                    key={lang}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2.5 rounded-lg text-sm cursor-pointer select-none transition-colors",
                      isChecked
                        ? "bg-[var(--primary-subtle)] text-[var(--primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--subtle)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLanguage(lang)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      <span>{lang}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Apply Button */}
      {onApplyMobile && (
        <div className="sticky bottom-0 pt-4 mt-6 bg-[var(--surface)] border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onApplyMobile}
            className="w-full h-11 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl shadow-[var(--shadow-sm)] hover:bg-[var(--primary-hover)] transition-all"
          >
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  )
}

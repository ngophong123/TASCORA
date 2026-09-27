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
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Check,
  Star,
  Zap,
  ShieldCheck,
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
        "w-full bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(15,15,30,0.08)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-[#0B0B14] uppercase tracking-wider">Filters</h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            data-testid="clear-all-filters"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* 1. Quick Toggles: Online Now & Pro Verified */}
        <div className="space-y-2.5 pb-5 border-b border-[rgba(15,15,30,0.06)]">
          {/* Online Now */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-[rgba(15,15,30,0.06)] bg-[#FAFAFC] hover:bg-white hover:border-blue-200 transition-all cursor-pointer select-none">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-[#0B0B14]">Online now</span>
            </div>
            <input
              type="checkbox"
              checked={filters.onlineOnly}
              onChange={(e) => setFilter("onlineOnly", e.target.checked)}
              className="sr-only"
            />
            <div
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                filters.onlineOnly ? "bg-emerald-500" : "bg-[#D1D5DB]"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  filters.onlineOnly ? "translate-x-4" : "translate-x-0"
                )}
              />
            </div>
          </label>

          {/* Pro Verified */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-[rgba(15,15,30,0.06)] bg-[#FAFAFC] hover:bg-white hover:border-blue-200 transition-all cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0B0B14]">Pro Verified</span>
                <span className="text-[10px] text-[#6B6B7B]">Vetted top 1% talent</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={filters.proOnly}
              onChange={(e) => setFilter("proOnly", e.target.checked)}
              className="sr-only"
            />
            <div
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                filters.proOnly ? "bg-blue-600" : "bg-[#D1D5DB]"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  filters.proOnly ? "translate-x-4" : "translate-x-0"
                )}
              />
            </div>
          </label>
        </div>

        {/* 2. Categories & Subcategories Accordion */}
        <div className="pb-5 border-b border-[rgba(15,15,30,0.06)]">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full text-left font-semibold text-xs text-[#0B0B14] uppercase tracking-wider mb-2"
          >
            <span>Category</span>
            {openSections.categories ? (
              <ChevronDown className="w-4 h-4 text-[#6B6B7B]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
            )}
          </button>

          {openSections.categories && (
            <div className="mt-2 space-y-1">
              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => setFilter("category", "all")}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                  filters.category === "all" || !filters.category
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-[#4B4B5C] hover:bg-[#F4F4F8] hover:text-[#0B0B14]"
                )}
              >
                <span>All Categories</span>
                <span className="text-[11px] text-[#6B6B7B]">48</span>
              </button>

              {/* Category Tree */}
              {FILTER_CATEGORIES.map((cat) => {
                const isSelected = filters.category === cat.slug
                const IconComponent = CATEGORY_ICONS[cat.iconName] || Code2

                return (
                  <div key={cat.id} className="space-y-1">
                    <button
                      type="button"
                      data-testid={`filter-category-${cat.slug}`}
                      onClick={() => setFilter("category", isSelected ? "all" : cat.slug)}
                      className={cn(
                        "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs transition-all",
                        isSelected
                          ? "bg-blue-100/70 text-blue-800 font-semibold"
                          : "text-[#4B4B5C] hover:bg-[#F4F4F8] hover:text-[#0B0B14]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <IconComponent
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isSelected ? "text-blue-600" : "text-[#6B6B7B]"
                          )}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[11px] text-[#6B6B7B] ml-2 shrink-0">{cat.count}</span>
                    </button>

                    {/* Subcategories when category is active */}
                    {isSelected && cat.subcategories.length > 0 && (
                      <div className="pl-6 pr-1 space-y-0.5 border-l-2 border-blue-200 ml-3.5 my-1">
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
                                "flex items-center justify-between w-full px-2 py-1 rounded-md text-[11px] transition-colors",
                                isSubSelected
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#F4F4F8]"
                              )}
                            >
                              <span className="truncate">{sub.name}</span>
                              <span className="text-[10px] text-[#9CA3AF] ml-1">{sub.count}</span>
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
        <div className="pb-5 border-b border-[rgba(15,15,30,0.06)]">
          <button
            type="button"
            onClick={() => toggleSection("budget")}
            className="flex items-center justify-between w-full text-left font-semibold text-xs text-[#0B0B14] uppercase tracking-wider mb-3"
          >
            <span>Budget</span>
            {openSections.budget ? (
              <ChevronDown className="w-4 h-4 text-[#6B6B7B]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
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
        <div className="pb-5 border-b border-[rgba(15,15,30,0.06)]">
          <button
            type="button"
            onClick={() => toggleSection("delivery")}
            className="flex items-center justify-between w-full text-left font-semibold text-xs text-[#0B0B14] uppercase tracking-wider mb-2"
          >
            <span>Delivery Time</span>
            {openSections.delivery ? (
              <ChevronDown className="w-4 h-4 text-[#6B6B7B]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
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
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                      isSelected
                        ? "bg-blue-50 text-blue-800 font-medium"
                        : "text-[#4B4B5C] hover:bg-[#F4F4F8] hover:text-[#0B0B14]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setFilter("delivery", opt.id)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors",
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-[rgba(15,15,30,0.2)] bg-white"
                        )}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span>{opt.label}</span>
                    </div>
                    {opt.maxDays === 1 && (
                      <span className="flex items-center text-[10px] text-amber-600 font-semibold">
                        <Zap className="w-3 h-3 mr-0.5 fill-amber-500" /> Fast
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* 5. Seller Level */}
        <div className="pb-5 border-b border-[rgba(15,15,30,0.06)]">
          <button
            type="button"
            onClick={() => toggleSection("levels")}
            className="flex items-center justify-between w-full text-left font-semibold text-xs text-[#0B0B14] uppercase tracking-wider mb-2"
          >
            <span>Seller Level</span>
            {openSections.levels ? (
              <ChevronDown className="w-4 h-4 text-[#6B6B7B]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
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
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                      isChecked
                        ? "bg-blue-50 text-blue-800 font-medium"
                        : "text-[#4B4B5C] hover:bg-[#F4F4F8] hover:text-[#0B0B14]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLevel(level.id as SellerLevel)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          isChecked
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-[rgba(15,15,30,0.2)] bg-white"
                        )}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{level.label}</span>
                    </div>
                    {level.id === "TOP_RATED" && (
                      <Badge variant="gradient" size="sm" className="text-[10px] py-0 px-1.5 h-4">
                        ★ Top
                      </Badge>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* 6. Rating */}
        <div className="pb-5 border-b border-[rgba(15,15,30,0.06)]">
          <button
            type="button"
            onClick={() => toggleSection("rating")}
            className="flex items-center justify-between w-full text-left font-semibold text-xs text-[#0B0B14] uppercase tracking-wider mb-2"
          >
            <span>Customer Rating</span>
            {openSections.rating ? (
              <ChevronDown className="w-4 h-4 text-[#6B6B7B]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
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
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                      isSelected
                        ? "bg-blue-50 text-blue-800 font-medium"
                        : "text-[#4B4B5C] hover:bg-[#F4F4F8] hover:text-[#0B0B14]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="rating"
                        value={opt.minRating}
                        checked={isSelected}
                        onChange={() => setFilter("rating", opt.minRating)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors",
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-[rgba(15,15,30,0.2)] bg-white"
                        )}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
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
            onClick={() => toggleSection("languages")}
            className="flex items-center justify-between w-full text-left font-semibold text-xs text-[#0B0B14] uppercase tracking-wider mb-2"
          >
            <span>Language</span>
            {openSections.languages ? (
              <ChevronDown className="w-4 h-4 text-[#6B6B7B]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6B6B7B]" />
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
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                      isChecked
                        ? "bg-blue-50 text-blue-800 font-medium"
                        : "text-[#4B4B5C] hover:bg-[#F4F4F8] hover:text-[#0B0B14]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLanguage(lang)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          isChecked
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-[rgba(15,15,30,0.2)] bg-white"
                        )}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
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
        <div className="sticky bottom-0 pt-4 mt-6 bg-white border-t border-[rgba(15,15,30,0.08)]">
          <button
            type="button"
            onClick={onApplyMobile}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-sky-600 transition-all"
          >
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  )
}

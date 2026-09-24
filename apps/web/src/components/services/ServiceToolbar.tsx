"use client"

import * as React from "react"
import { SORT_OPTIONS, type SortOption } from "@/data/serviceFilterOptions"
import { type ServiceFilterState } from "@/hooks/useServiceFilters"
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  Check,
  ArrowUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceToolbarProps {
  filters: ServiceFilterState
  setFilter: <K extends keyof ServiceFilterState>(key: K, value: ServiceFilterState[K]) => void
  totalResults: number
  activeFilterCount: number
  onOpenMobileFilters?: () => void
  className?: string
}

export function ServiceToolbar({
  filters,
  setFilter,
  totalResults,
  activeFilterCount,
  onOpenMobileFilters,
  className,
}: ServiceToolbarProps) {
  const [searchInput, setSearchInput] = React.useState(filters.q)
  const [isSortOpen, setIsSortOpen] = React.useState(false)
  const sortRef = React.useRef<HTMLDivElement>(null)

  // Sync search input if filters change from outside (e.g. chip removal)
  React.useEffect(() => {
    setSearchInput(filters.q)
  }, [filters.q])

  // Click outside listener for sort dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSortOpen])

  // Debounced search submit
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.q) {
        setFilter("q", searchInput)
      }
    }, 350)

    return () => clearTimeout(handler)
  }, [searchInput, filters.q, setFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilter("q", searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setFilter("q", "")
  }

  const currentSort = SORT_OPTIONS.find((s) => s.key === filters.sort) || SORT_OPTIONS[0]

  return (
    <div
      className={cn(
        "sticky top-16 z-30 bg-white/85 backdrop-blur-md border-b border-[rgba(15,15,30,0.08)] py-3 transition-all",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Search Bar & Mobile Filter Trigger */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          {/* Mobile Filter Button (< lg) */}
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden relative inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[rgba(15,15,30,0.14)] bg-white text-xs font-medium text-[#0B0B14] hover:bg-[#FAFAFC] active:scale-95 transition-all shrink-0"
            aria-label="Open filter menu"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B7B] pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services, skills, or keywords..."
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] text-xs sm:text-sm text-[#0B0B14] placeholder-[#8B8B9B] focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#8B8B9B] hover:text-[#0B0B14] hover:bg-black/[0.06] transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Right Side: Sort dropdown & Grid/List view toggle */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          {/* Result Count Indicator (Tablet/Desktop) */}
          <div className="hidden sm:block text-xs text-[#6B6B7B] font-medium" aria-live="polite">
            <span className="font-semibold text-[#0B0B14]">{totalResults}</span> results
          </div>

          {/* Custom Sort Dropdown */}
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[rgba(15,15,30,0.12)] bg-white text-xs font-medium text-[#0B0B14] hover:border-[rgba(15,15,30,0.22)] hover:bg-[#FAFAFC] transition-colors"
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6B6B7B]" />
              <span className="text-[#6B6B7B] hidden sm:inline">Sort:</span>
              <span className="font-semibold">{currentSort.label}</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-[#6B6B7B] transition-transform duration-200",
                  isSortOpen && "rotate-180"
                )}
              />
            </button>

            {isSortOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white border border-[rgba(15,15,30,0.12)] p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = filters.sort === opt.key
                  return (
                    <button
                      key={opt.id}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => {
                        setFilter("sort", opt.key)
                        setIsSortOpen(false)
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors",
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-[#4B4B5C] hover:bg-[#F4F4F8] hover:text-[#0B0B14]"
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div
            className="flex items-center p-1 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)]"
            role="group"
            aria-label="View mode toggle"
          >
            <button
              type="button"
              onClick={() => setFilter("view", "grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                filters.view === "grid"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-[#6B6B7B] hover:text-[#0B0B14]"
              )}
              aria-label="Grid view"
              aria-pressed={filters.view === "grid"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFilter("view", "list")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                filters.view === "list"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-[#6B6B7B] hover:text-[#0B0B14]"
              )}
              aria-label="List view"
              aria-pressed={filters.view === "list"}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

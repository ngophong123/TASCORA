"use client"

import * as React from "react"
import { SORT_OPTIONS } from "@/data/serviceFilterOptions"
import { type ServiceFilterState } from "@/hooks/useServiceFilters"
import { Search, X, SlidersHorizontal, LayoutGrid, List } from "lucide-react"
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
  React.useEffect(() => {
    setSearchInput(filters.q)
  }, [filters.q])
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.q) setFilter("q", searchInput)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.q, setFilter])
  return (
    <div
      className={cn(
        "sticky top-16 z-30 border-b border-[var(--border)] bg-[var(--surface)] py-4",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileFilters}
            aria-haspopup="dialog"
            className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm lg:hidden"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" /> Filters{" "}
            {activeFilterCount > 0 && (
              <span className="text-[var(--primary)]">({activeFilterCount})</span>
            )}
          </button>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              setFilter("q", searchInput)
            }}
            className="relative min-w-0 flex-1"
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="search"
              aria-label="Search services, skills or keywords"
              data-testid="services-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services or skills"
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--subtle)] pl-10 pr-11 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                data-testid="services-search-clear"
                aria-label="Clear search query"
                onClick={() => {
                  setSearchInput("")
                  setFilter("q", "")
                }}
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
          <span
            data-testid="services-result-count"
            className="hidden text-sm text-[var(--text-muted)] xl:block"
            aria-live="polite"
          >
            {totalResults} results
          </span>
          <label className="flex min-w-0 items-center gap-2 text-sm text-[var(--text-muted)]">
            <span>Sort</span>
            <select
              data-testid="services-sort-trigger"
              aria-label="Sort services"
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value as ServiceFilterState["sort"])}
              className="h-11 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div role="group" aria-label="View mode toggle" className="flex gap-1">
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={filters.view === "grid"}
              onClick={() => setFilter("view", "grid")}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)]",
                filters.view === "grid" && "bg-[var(--primary-subtle)] text-[var(--primary)]"
              )}
            >
              <LayoutGrid aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={filters.view === "list"}
              onClick={() => setFilter("view", "list")}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)]",
                filters.view === "list" && "bg-[var(--primary-subtle)] text-[var(--primary)]"
              )}
            >
              <List aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

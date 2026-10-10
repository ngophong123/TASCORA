"use client"

import * as React from "react"
import { X, RotateCcw } from "lucide-react"
import { ServiceFilterSidebar } from "./ServiceFilterSidebar"
import { useDialogFocus } from "@/hooks/useDialogFocus"
import { type ServiceFilterState } from "@/hooks/useServiceFilters"
import { type SellerLevel } from "@/data/gigs"
import type { CatalogCategory } from "@/lib/catalog-data"

interface MobileFilterDrawerProps {
  initialCategories?: CatalogCategory[]
  isOpen: boolean
  onClose: () => void
  filters: ServiceFilterState
  setFilter: <K extends keyof ServiceFilterState>(key: K, value: ServiceFilterState[K]) => void
  toggleLevel: (level: SellerLevel) => void
  toggleLanguage: (language: string) => void
  clearAllFilters: () => void
  hasActiveFilters: boolean
  totalResults: number
}
export function MobileFilterDrawer({
  initialCategories,
  isOpen,
  onClose,
  filters,
  setFilter,
  toggleLevel,
  toggleLanguage,
  clearAllFilters,
  hasActiveFilters,
  totalResults,
}: MobileFilterDrawerProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)
  useDialogFocus(isOpen, dialogRef, onClose)
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-xl bg-[var(--surface)] shadow-[var(--shadow-lg)] sm:max-h-full sm:max-w-md sm:rounded-none"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <h2 id="mobile-filter-title" className="text-lg font-medium">
            Filter services
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters drawer"
            className="flex h-11 w-11 items-center justify-center rounded-lg"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          <ServiceFilterSidebar
            initialCategories={initialCategories}
            filters={filters}
            setFilter={setFilter}
            toggleLevel={toggleLevel}
            toggleLanguage={toggleLanguage}
            clearAllFilters={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
            className="rounded-none border-none p-0"
          />
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--border)] p-4">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white"
          >
            Show {totalResults} results
          </button>
        </div>
      </div>
    </div>
  )
}

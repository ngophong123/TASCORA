"use client"

import * as React from "react"
import { type ActiveFilterChip } from "@/hooks/useServiceFilters"
import { X, RotateCcw } from "lucide-react"

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[]
  onClearAll: () => void
  className?: string
}

export function ActiveFilterChips({ chips, onClearAll, className }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 mb-6 ${className || ""}`}>
      <span className="text-sm font-medium text-[var(--text-muted)] mr-1">Active filters:</span>

      <div className="contents">
        {chips.map((chip) => (
          <div
            key={chip.id}
            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border)] shadow-sm select-none"
          >
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--accent)] text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
              aria-label={`Remove filter ${chip.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="clear-all-filters"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary)] hover:underline min-h-11 px-2 py-1 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Clear all
      </button>
    </div>
  )
}

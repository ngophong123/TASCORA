"use client"

import * as React from "react"
import { SearchX, RotateCcw } from "lucide-react"

interface ServiceEmptyStateProps {
  onClearFilters: () => void
  onSelectSuggestion: (query: string) => void
}

export function ServiceEmptyState({ onClearFilters, onSelectSuggestion }: ServiceEmptyStateProps) {
  const suggestions = ["Next.js", "Mobile App", "AI Chatbot", "Figma UI", "Logo Design", "SEO"]

  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-[0_2px_12px_rgba(0,0,0,0.02)] my-4">
      {/* Visual illustration badge */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-xl bg-[var(--primary-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shadow-inner">
          <SearchX className="w-8 h-8" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        No matching services found
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
        We couldn’t find any gigs matching your exact combination of filters. Try broadening your
        budget, changing delivery time, or clearing some keywords.
      </p>

      {/* Action button */}
      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold shadow-[var(--shadow-sm)] hover:bg-[var(--primary-hover)]  transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Clear all filters
      </button>

      {/* Popular suggestions */}
      <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] w-full max-w-md">
        <span className="text-sm font-medium text-[var(--text-muted)] block mb-2.5">
          Try a different search:
        </span>
        <div className="flex flex-wrap justify-center gap-1.5">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelectSuggestion(item)}
              className="text-sm px-2.5 py-2.5 rounded-lg bg-[var(--subtle)] hover:bg-[var(--primary-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] border border-[var(--border)] hover:border-[var(--border)] transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { SearchX, RotateCcw, Sparkles } from "lucide-react"

interface ServiceEmptyStateProps {
  onClearFilters: () => void
  onSelectSuggestion: (query: string) => void
}

export function ServiceEmptyState({
  onClearFilters,
  onSelectSuggestion,
}: ServiceEmptyStateProps) {
  const suggestions = ["Next.js", "Mobile App", "AI Chatbot", "Figma UI", "Logo Design", "SEO"]

  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.02)] my-4">
      {/* Visual illustration badge */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-inner">
          <SearchX className="w-8 h-8" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-600">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
      </div>

      <h3 className="text-lg font-semibold text-[#0B0B14] mb-2">
        No matching services found
      </h3>
      <p className="text-sm text-[#6B6B7B] max-w-md mb-6 leading-relaxed">
        We couldn’t find any gigs matching your exact combination of filters. Try broadening your budget, changing delivery time, or clearing some keywords.
      </p>

      {/* Action button */}
      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-semibold shadow-md hover:from-blue-700 hover:to-sky-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Clear all filters
      </button>

      {/* Popular suggestions */}
      <div className="mt-8 pt-6 border-t border-[rgba(15,15,30,0.06)] w-full max-w-md">
        <span className="text-xs font-medium text-[#6B6B7B] block mb-2.5">
          Or try popular categories:
        </span>
        <div className="flex flex-wrap justify-center gap-1.5">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelectSuggestion(item)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#FAFAFC] hover:bg-blue-50 text-[#4B4B5C] hover:text-blue-700 border border-[rgba(15,15,30,0.08)] hover:border-blue-200 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { type ActiveFilterChip } from "@/hooks/useServiceFilters"
import { X, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[]
  onClearAll: () => void
  className?: string
}

export function ActiveFilterChips({
  chips,
  onClearAll,
  className,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 mb-6 ${className || ""}`}>
      <span className="text-xs font-medium text-[#6B6B7B] mr-1">Active filters:</span>

      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.div
            key={chip.id}
            layout
            initial={{ opacity: 0, scale: 0.85, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80 shadow-sm select-none"
          >
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="p-0.5 rounded-full hover:bg-blue-200/60 text-blue-600 hover:text-blue-900 transition-colors"
              aria-label={`Remove filter ${chip.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Clear all
      </button>
    </div>
  )
}

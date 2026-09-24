"use client"

import * as React from "react"
import { X, SlidersHorizontal, RotateCcw } from "lucide-react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { ServiceFilterSidebar } from "./ServiceFilterSidebar"
import { type ServiceFilterState } from "@/hooks/useServiceFilters"
import { type SellerLevel } from "@/data/gigs"

interface MobileFilterDrawerProps {
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
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  // Prevent background body scrolling when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      // Focus management
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 50)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Drag down to close handler for mobile gesture
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 400) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end items-end sm:items-stretch">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Bottom sheet on mobile (< sm), Slide drawer on tablet (sm to lg) */}
          <motion.div
            initial={{ y: "100%", opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="relative w-full sm:max-w-md h-[90vh] sm:h-full bg-white rounded-t-3xl sm:rounded-t-none shadow-2xl flex flex-col z-10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
          >
            {/* Visual Touch Drag Handle Indicator */}
            <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors" />
            </div>

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 id="mobile-filter-title" className="font-semibold text-sm text-[#0B0B14]">
                  Filter Services
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-black/[0.05] text-[#6B6B7B] hover:text-[#0B0B14] transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                aria-label="Close filters drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body: Sidebar contents */}
            <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
              <ServiceFilterSidebar
                filters={filters}
                setFilter={setFilter}
                toggleLevel={toggleLevel}
                toggleLanguage={toggleLanguage}
                clearAllFilters={clearAllFilters}
                hasActiveFilters={hasActiveFilters}
                onApplyMobile={onClose}
                className="border-none shadow-none p-0 rounded-none"
              />
            </div>

            {/* Drawer Footer with Results count & Apply button */}
            <div className="p-4 border-t border-[rgba(15,15,30,0.08)] bg-white flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="h-11 px-3.5 rounded-xl border border-[rgba(15,15,30,0.12)] text-xs font-semibold text-[#4B4B5C] hover:bg-[#FAFAFC] transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-semibold rounded-xl shadow-md hover:from-blue-700 hover:to-sky-600 transition-all flex items-center justify-center gap-2"
              >
                <span>Apply Filters</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {totalResults} results
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServicePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function ServicePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: ServicePaginationProps) {
  if (totalPages <= 1) return null

  const handlePageClick = (page: number) => {
    onPageChange(page)
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth"
    // Scroll smoothly back to top of the services container
    const headerElement = document.getElementById("services-listing-top")
    if (headerElement) {
      headerElement.scrollIntoView({ behavior, block: "start" })
    } else {
      window.scrollTo({ top: 250, behavior })
    }
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }

    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  const pages = getPageNumbers()

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 mt-10 pt-6 border-t border-[var(--border)]",
        className
      )}
    >
      {/* Previous Button */}
      <button
        type="button"
        data-testid="pagination-prev"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center h-11 px-3 sm:px-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm sm:text-sm font-medium text-[var(--foreground)] hover:bg-[var(--subtle)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 sm:w-10 text-center text-[var(--text-muted)] text-sm font-mono select-none"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <button
              key={pageNum}
              type="button"
              data-testid={`pagination-page-${pageNum}`}
              onClick={() => handlePageClick(pageNum)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to page ${pageNum}`}
              className={cn(
                "h-11 min-w-9 sm:min-w-11 px-2 rounded-xl text-sm sm:text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--primary)] text-white font-semibold "
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)]"
              )}
            >
              {pageNum}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        data-testid="pagination-next"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center h-11 px-3 sm:px-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm sm:text-sm font-medium text-[var(--foreground)] hover:bg-[var(--subtle)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </nav>
  )
}

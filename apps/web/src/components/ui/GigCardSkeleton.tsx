"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GigCardSkeletonProps {
  view?: "grid" | "list"
  className?: string
}

export function GigCardSkeleton({ view = "grid", className }: GigCardSkeletonProps) {
  if (view === "list") {
    return (
      <div
        className={cn(
          "rounded-lg border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-5",
          className
        )}
      >
        {/* Cover Preview Skeleton with Shimmer */}
        <div className="w-full sm:w-60 h-44 sm:h-38 rounded-md animate-shimmer shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
          <div>
            {/* Category / Level Header */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="h-3 w-20 rounded animate-shimmer" />
              <div className="h-4 w-16 rounded animate-shimmer" />
            </div>

            {/* Title lines */}
            <div className="space-y-2 mb-3">
              <div className="h-4 w-4/5 rounded animate-shimmer" />
              <div className="h-4 w-3/5 rounded animate-shimmer" />
            </div>

            {/* Seller info row */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-md animate-shimmer" />
              <div className="h-3 w-24 rounded animate-shimmer" />
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-12 rounded animate-shimmer" />
              <div className="h-4 w-16 rounded animate-shimmer" />
              <div className="h-4 w-14 rounded animate-shimmer" />
            </div>
          </div>

          {/* Footer stats, escrow and price */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
            <div className="h-3.5 w-24 rounded animate-shimmer" />
            <div className="h-4 w-20 rounded animate-shimmer hidden sm:block" />
            <div className="flex flex-col items-end gap-1">
              <div className="h-2.5 w-8 rounded animate-shimmer" />
              <div className="h-4 w-14 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view skeleton
  return (
    <div
      className={cn(
        "rounded-lg border border-[#E2E8F0] bg-white overflow-hidden shadow-xs flex flex-col justify-between",
        className
      )}
    >
      {/* Cover Image Skeleton */}
      <div className="relative aspect-[16/10] w-full animate-shimmer" />

      {/* Body Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Level */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="h-3 w-16 rounded animate-shimmer" />
            <div className="h-4 w-14 rounded animate-shimmer" />
          </div>

          {/* Title lines */}
          <div className="space-y-2 mb-3">
            <div className="h-3.5 w-full rounded animate-shimmer" />
            <div className="h-3.5 w-3/4 rounded animate-shimmer" />
          </div>

          {/* Seller row */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md animate-shimmer" />
            <div className="h-3 w-20 rounded animate-shimmer" />
          </div>
        </div>

        {/* Footer info: Rating + Escrow + Price */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
          <div className="h-3 w-16 rounded animate-shimmer" />
          <div className="h-4 w-12 rounded animate-shimmer" />
          <div className="flex flex-col items-end gap-0.5">
            <div className="h-2 w-6 rounded animate-shimmer" />
            <div className="h-4 w-12 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

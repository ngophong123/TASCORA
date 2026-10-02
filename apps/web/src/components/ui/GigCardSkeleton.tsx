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
          "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-5",
          className
        )}
      >
        {/* Cover Preview Skeleton with Shimmer */}
        <div className="w-full sm:w-60 h-44 sm:h-38 rounded-xl animate-shimmer shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
          <div>
            {/* Seller info row */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full animate-shimmer" />
                <div className="space-y-1">
                  <div className="h-3 w-24 rounded-md animate-shimmer" />
                  <div className="h-2.5 w-16 rounded-md animate-shimmer" />
                </div>
              </div>
              <div className="h-5 w-16 rounded-full animate-shimmer" />
            </div>

            {/* Title lines */}
            <div className="space-y-2">
              <div className="h-4 w-4/5 rounded-md animate-shimmer" />
              <div className="h-4 w-3/5 rounded-md animate-shimmer" />
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="h-4 w-12 rounded-md animate-shimmer" />
              <div className="h-4 w-16 rounded-md animate-shimmer" />
              <div className="h-4 w-14 rounded-md animate-shimmer" />
            </div>
          </div>

          {/* Footer stats and price */}
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(15,15,30,0.06)]">
            <div className="h-3.5 w-20 rounded-md animate-shimmer" />
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-10 rounded-md animate-shimmer" />
              <div className="h-5 w-14 rounded-md animate-shimmer" />
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
        "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white overflow-hidden shadow-xs flex flex-col",
        className
      )}
    >
      {/* Cover Image Skeleton */}
      <div className="relative aspect-[16/10] w-full animate-shimmer" />

      {/* Body Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Seller row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full animate-shimmer" />
              <div className="h-3 w-20 rounded-md animate-shimmer" />
            </div>
            <div className="h-4 w-14 rounded-full animate-shimmer" />
          </div>

          {/* Title lines */}
          <div className="space-y-2 mb-3">
            <div className="h-3.5 w-full rounded-md animate-shimmer" />
            <div className="h-3.5 w-3/4 rounded-md animate-shimmer" />
          </div>

          {/* Rating */}
          <div className="h-3 w-24 rounded-md animate-shimmer" />
        </div>

        {/* Footer info: Delivery + Price */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(15,15,30,0.06)]">
          <div className="h-3 w-16 rounded-md animate-shimmer" />
          <div className="flex items-center gap-1">
            <div className="h-3 w-8 rounded-md animate-shimmer" />
            <div className="h-5 w-12 rounded-md animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

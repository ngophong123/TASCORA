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
          "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-5 animate-pulse",
          className
        )}
      >
        {/* Cover Preview Skeleton */}
        <div className="w-full sm:w-60 h-44 sm:h-38 rounded-xl bg-gradient-to-r from-gray-100 via-gray-200/70 to-gray-100 shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
          <div>
            {/* Seller info row */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-gray-200 rounded-md" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded-md" />
                </div>
              </div>
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>

            {/* Title lines */}
            <div className="space-y-2">
              <div className="h-4 w-4/5 bg-gray-200 rounded-md" />
              <div className="h-4 w-3/5 bg-gray-100 rounded-md" />
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="h-4 w-12 bg-gray-100 rounded-md" />
              <div className="h-4 w-16 bg-gray-100 rounded-md" />
              <div className="h-4 w-14 bg-gray-100 rounded-md" />
            </div>
          </div>

          {/* Footer stats and price */}
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(15,15,30,0.06)]">
            <div className="h-3.5 w-20 bg-gray-200 rounded-md" />
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-10 bg-gray-100 rounded-md" />
              <div className="h-5 w-14 bg-gray-200 rounded-md" />
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
        "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white overflow-hidden shadow-xs flex flex-col animate-pulse",
        className
      )}
    >
      {/* Cover Image Skeleton */}
      <div className="relative aspect-[16/10] w-full bg-gradient-to-r from-gray-100 via-gray-200/70 to-gray-100" />

      {/* Body Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Seller row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200" />
              <div className="h-3 w-20 bg-gray-200 rounded-md" />
            </div>
            <div className="h-4 w-14 bg-gray-100 rounded-full" />
          </div>

          {/* Title lines */}
          <div className="space-y-2 mb-3">
            <div className="h-3.5 w-full bg-gray-200 rounded-md" />
            <div className="h-3.5 w-3/4 bg-gray-100 rounded-md" />
          </div>

          {/* Rating */}
          <div className="h-3 w-24 bg-gray-100 rounded-md" />
        </div>

        {/* Footer info: Delivery + Price */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(15,15,30,0.06)]">
          <div className="h-3 w-16 bg-gray-100 rounded-md" />
          <div className="flex items-center gap-1">
            <div className="h-3 w-8 bg-gray-100 rounded-md" />
            <div className="h-5 w-12 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

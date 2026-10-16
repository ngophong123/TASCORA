"use client"

import { cn } from "@/lib/utils"

interface GigCardSkeletonProps {
  view?: "grid" | "list"
  className?: string
}

export function GigCardSkeleton({ view = "grid", className }: GigCardSkeletonProps) {
  const list = view === "list"
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]",
        list ? "flex-col sm:flex-row" : "flex-col",
        className
      )}
    >
      <div
        className={cn(
          "shrink-0 bg-[var(--muted-panel)] animate-pulse motion-reduce:animate-none",
          list ? "aspect-[16/10] w-full sm:aspect-auto sm:w-60" : "aspect-[16/10] w-full"
        )}
      />
      <div className="flex-1 space-y-4 p-5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-[var(--muted-panel)]" />
          <div className="h-3 w-28 rounded bg-[var(--muted-panel)]" />
        </div>
        <div className="h-3 w-24 rounded bg-[var(--muted-panel)]" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-[var(--muted-panel)]" />
          <div className="h-4 w-3/4 rounded bg-[var(--muted-panel)]" />
        </div>
        {list && <div className="h-4 w-4/5 rounded bg-[var(--muted-panel)]" />}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
          <div className="h-4 w-20 rounded bg-[var(--muted-panel)]" />
          <div className="h-5 w-24 rounded bg-[var(--muted-panel)]" />
        </div>
      </div>
    </div>
  )
}

"use client"
import { type OverviewStatCardData } from "@/data/dashboard/overview"
import { ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
export function StatCard({ data, className }: { data: OverviewStatCardData; className?: string }) {
  return (
    <div
      data-testid={`stat-card-${data.id}`}
      className={cn("rounded-xl border border-border-default bg-bg-surface p-5", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-text-secondary">{data.label}</span>
        <ShoppingBag aria-hidden="true" className="h-4 w-4 text-primary" />
      </div>
      <p
        data-testid="stat-card-value"
        className={`mt-4 font-medium tracking-tight text-foreground ${data.value === "Unavailable" ? "text-base text-text-muted" : "text-3xl tabular-nums"}`}
      >
        {data.value}
      </p>
      {(data.delta || data.subtext) && (
        <p className="mt-3 text-xs text-text-secondary">
          {data.delta} {data.subtext}
        </p>
      )}
    </div>
  )
}

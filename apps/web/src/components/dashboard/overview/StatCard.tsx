"use client"

import * as React from "react"
import { type OverviewStatCardData } from "@/data/dashboard/overview"
import {
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Star,
  Briefcase,
  CreditCard,
  Clock,
  Bookmark,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STAT_ICON_MAP: Record<string, React.ElementType> = {
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Star,
  Briefcase,
  CreditCard,
  Clock,
  Bookmark,
}

interface StatCardProps {
  data: OverviewStatCardData
  className?: string
}

export function StatCard({ data, className }: StatCardProps) {
  const Icon = STAT_ICON_MAP[data.iconName] || DollarSign

  // Generate lightweight SVG path for sparkline
  const points = data.sparkline
  const minVal = Math.min(...points)
  const maxVal = Math.max(...points)
  const range = maxVal - minVal || 1

  const width = 80
  const height = 28
  const step = width / (points.length - 1)

  const pathPoints = points.map((val, idx) => {
    const x = idx * step
    const y = height - ((val - minVal) / range) * (height - 6) - 3
    return `${x},${y}`
  })

  const pathD = `M ${pathPoints.join(" L ")}`
  const areaD = `M 0,${height} L ${pathPoints.join(" L ")} L ${width},${height} Z`

  return (
    <div
      data-testid={`stat-card-${data.id}`}
      className={cn(
        "relative p-5 rounded-2xl bg-white border border-[rgba(15,15,30,0.08)] shadow-xs hover:border-[rgba(15,15,30,0.16)] hover:shadow-sm transition-all duration-200 flex flex-col justify-between group overflow-hidden",
        className
      )}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B7B]">
          {data.label}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105",
            data.iconColor
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Middle row: Big Value & Sparkline */}
      <div className="flex items-end justify-between gap-3 mt-4">
        <div>
          <span
            data-testid="stat-card-value"
            className="text-2xl sm:text-3xl font-extrabold text-[#0B0B14] font-mono tracking-tight"
          >
            {data.value}
          </span>
        </div>

        {/* Mini Sparkline */}
        <div className="w-20 h-7 shrink-0" aria-hidden="true">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${data.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad-${data.id})`} />
            <path
              d={pathD}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom row: Delta badge & Subtext */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(15,15,30,0.06)] text-[11px]">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold shrink-0",
            data.isPositive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-amber-50 text-amber-800 border border-amber-200/60"
          )}
        >
          {data.isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{data.delta}</span>
        </span>
        <span className="text-[#6B6B7B] truncate">{data.subtext}</span>
      </div>
    </div>
  )
}

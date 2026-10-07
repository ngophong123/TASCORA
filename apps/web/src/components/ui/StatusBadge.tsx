"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type OrderOrGigStatus =
  | "active"
  | "completed"
  | "in_progress"
  | "pending"
  | "delivered"
  | "cancelled"
  | "draft"
  | "paused"

interface StatusBadgeProps {
  status: OrderOrGigStatus | string
  className?: string
  size?: "sm" | "md"
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  active: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-[#F4F3FF]",
    text: "text-[#4F46E5]",
    dot: "bg-[#635BFF]",
    border: "border-[#635BFF]/25",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    border: "border-sky-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
  draft: {
    label: "Draft",
    bg: "bg-gray-50",
    text: "text-gray-700",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
  paused: {
    label: "Paused",
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    dot: "bg-zinc-400",
    border: "border-zinc-200",
  },
}

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().replace(/[\s-]/g, "_")
  const config = STATUS_CONFIG[normalized] || {
    label: status,
    bg: "bg-gray-50",
    text: "text-gray-700",
    dot: "bg-gray-400",
    border: "border-gray-200",
  }

  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-[11px] gap-1.5" : "px-3 py-1 text-xs gap-2"

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors select-none",
        config.bg,
        config.text,
        config.border,
        sizeClasses,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      <span>{config.label}</span>
    </span>
  )
}

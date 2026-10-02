"use client"

import * as React from "react"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

/**
 * Reusable Feedback Empty State Component
 */
export function EmptyState({
  title = "Không tìm thấy kết quả",
  message = "Thử điều chỉnh bộ lọc tìm kiếm hoặc từ khóa để tìm dịch vụ phù hợp.",
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white max-w-md mx-auto my-6 animate-in fade-in duration-200",
        className
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shrink-0 border border-blue-100">
        {icon || <SearchX className="h-7 w-7 stroke-[1.5]" />}
      </div>

      <h3 className="font-semibold text-base text-[#0B0B14] mb-1.5">{title}</h3>
      <p className="text-xs text-[#6B6B7B] max-w-xs mb-6 leading-relaxed">{message}</p>

      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

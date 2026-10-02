"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  message?: string
  retryText?: string
  onRetry?: () => void | Promise<void>
  className?: string
}

/**
 * Reusable Feedback Error State Component
 */
export function ErrorState({
  title = "Đã xảy ra lỗi",
  message = "Không thể tải dữ liệu vào lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.",
  retryText = "Thử lại",
  onRetry,
  className,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-rose-200/80 bg-rose-50/40 max-w-md mx-auto my-6 animate-in fade-in duration-200",
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shrink-0">
        <AlertCircle className="h-6 w-6 stroke-[2]" />
      </div>

      <h3 className="font-semibold text-base text-[#0B0B14] mb-1.5">{title}</h3>
      <p className="text-xs text-[#6B6B7B] max-w-sm mb-6 leading-relaxed">{message}</p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          isLoading={isRetrying}
          loadingText="Đang thử lại..."
          onClick={handleRetry}
          className="border-rose-200 hover:border-rose-300 text-rose-700 bg-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{retryText}</span>
        </Button>
      )}
    </div>
  )
}

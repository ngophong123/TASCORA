import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * Reusable Minimalist Loading Spinner with TASCORA blue accent
 */
export function LoadingSpinner({ size = "md", className, ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-9 w-9",
  }[size]

  return (
    <svg
      role="status"
      aria-label="Đang tải..."
      className={cn("animate-spin text-blue-600 shrink-0", sizeClasses, className)}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        className="opacity-100"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface SuccessAnimationProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

/**
 * Success Micro-Animation: scale(0.7) -> scale(1.1) -> scale(1)
 */
export function SuccessAnimation({ className, size = "md" }: SuccessAnimationProps) {
  const sizeMap = {
    sm: "h-6 w-6 p-1",
    md: "h-9 w-9 p-1.5",
    lg: "h-14 w-14 p-2.5",
  }[size]

  return (
    <div
      role="status"
      aria-label="Thành công"
      className={cn(
        "rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-check-pop",
        sizeMap,
        className
      )}
    >
      <Check className="w-full h-full stroke-[2.5]" />
    </div>
  )
}

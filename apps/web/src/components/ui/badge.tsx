"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "secondary" | "outline" | "success" | "warning" | "cyan" | "luxury"
  size?: "sm" | "md"
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs sm:text-sm",
  }[size]

  const variantStyles = {
    default:
      "bg-blue-50 border-blue-200/80 text-blue-700 hover:bg-blue-100/70",
    gradient:
      "bg-gradient-to-r from-blue-50 via-sky-50 to-teal-50 border-blue-200 text-blue-800",
    luxury:
      "bg-gradient-to-r from-blue-100/70 via-sky-50 to-teal-50 border-blue-200 text-blue-900 shadow-sm",
    secondary:
      "bg-[#F4F4F8] border-[rgba(15,15,30,0.08)] text-[#4B4B5C] hover:bg-[#EAEAF0]",
    outline:
      "bg-transparent border-[rgba(15,15,30,0.14)] text-[#0B0B14] hover:border-blue-400",
    success:
      "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning:
      "bg-amber-50 border-amber-200 text-amber-800",
    cyan:
      "bg-sky-50 border-sky-200 text-sky-700",
  }[variant]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none",
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

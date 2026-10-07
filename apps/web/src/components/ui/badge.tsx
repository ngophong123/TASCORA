"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    "default" | "gradient" | "secondary" | "outline" | "success" | "warning" | "cyan" | "luxury"
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
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  }[size]

  const variantStyles = {
    default: "bg-[#635BFF]/10 border-[#635BFF]/25 text-[#635BFF]",
    gradient: "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] font-medium",
    luxury: "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] font-medium",
    secondary: "bg-[#F1F5F9] border-[#E2E8F0] text-[#334155]",
    outline:
      "bg-transparent border-[#CBD5E1] text-[#0F172A] hover:border-[#635BFF] hover:text-[#635BFF]",
    success: "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]",
    warning: "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]",
    cyan: "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]",
  }[variant]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md border transition-colors select-none",
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

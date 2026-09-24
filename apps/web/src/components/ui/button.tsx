"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link"
  size?: "sm" | "md" | "lg"
  pill?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      pill = true,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 overflow-hidden group active:scale-[0.97] will-change-transform"

    const sizeStyles = {
      sm: "h-9 px-4 text-xs gap-1.5",
      md: "h-11 px-6 text-sm gap-2",
      lg: "h-13 px-8 text-base gap-2.5",
    }[size]

    const radiusStyles = pill ? "rounded-full" : "rounded-xl"

    const variantStyles = {
      primary:
        "text-white bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 hover:from-blue-700 hover:via-blue-600 hover:to-sky-500 shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.45)] hover:scale-[1.02]",
      secondary:
        "text-[#0B0B14] bg-white border border-[rgba(15,15,30,0.12)] hover:border-[rgba(15,15,30,0.22)] hover:bg-[#F4F4F8] shadow-sm hover:scale-[1.01]",
      outline:
        "text-[#0B0B14] bg-transparent border border-[rgba(15,15,30,0.14)] hover:border-blue-600 hover:bg-blue-50/60 hover:text-blue-700",
      ghost:
        "text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-black/[0.04]",
      link:
        "text-blue-600 hover:text-blue-800 p-0 h-auto underline-offset-4 hover:underline",
    }[variant]

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, sizeStyles, radiusStyles, variantStyles, className)}
        {...props}
      >
        {/* Subtle shine sweep on primary hover */}
        {variant === "primary" && (
          <span
            className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none will-change-transform"
            aria-hidden="true"
          />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    )

  }
)

Button.displayName = "Button"

"use client"

import * as React from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link"
  size?: "sm" | "md" | "lg"
  pill?: boolean
  isLoading?: boolean
  loadingText?: React.ReactNode
  isSuccess?: boolean
  successText?: React.ReactNode
  isError?: boolean
  errorText?: React.ReactNode
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
      isLoading = false,
      loadingText,
      isSuccess = false,
      successText,
      isError = false,
      errorText,
      ...props
    },
    ref
  ) => {
    const isBusy = isLoading || isSuccess || isError

    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-180 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-55 overflow-hidden group active:translate-y-0 active:scale-[0.98] will-change-transform"

    const sizeStyles = {
      sm: "h-9 px-4 text-xs gap-1.5",
      md: "h-11 px-6 text-sm gap-2",
      lg: "h-13 px-8 text-base gap-2.5",
    }[size]

    const radiusStyles = pill ? "rounded-full" : "rounded-xl"

    const variantStyles = {
      primary:
        "text-white bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 hover:from-blue-700 hover:via-blue-600 hover:to-sky-500 shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.45)] hover:-translate-y-0.5",
      secondary:
        "text-[#0B0B14] bg-white border border-[rgba(15,15,30,0.12)] hover:border-[rgba(15,15,30,0.22)] hover:bg-[#F4F4F8] shadow-xs hover:-translate-y-0.5",
      outline:
        "text-[#0B0B14] bg-transparent border border-[rgba(15,15,30,0.14)] hover:border-blue-600 hover:bg-blue-50/60 hover:text-blue-700 hover:-translate-y-0.5",
      ghost: "text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-black/[0.04]",
      link: "text-blue-600 hover:text-blue-800 p-0 h-auto underline-offset-4 hover:underline",
    }[variant]

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading || isSuccess}
        aria-busy={isLoading ? "true" : undefined}
        className={cn(
          baseStyles,
          sizeStyles,
          radiusStyles,
          variantStyles,
          isError && "animate-micro-shake border-red-500 text-red-600",
          className
        )}
        {...props}
      >
        {/* Subtle shine sweep on primary hover */}
        {variant === "primary" && !isBusy && (
          <span
            className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none will-change-transform"
            aria-hidden="true"
          />
        )}

        {/* Natural layout keeper: preserves exact button width/height to avoid layout shifts */}
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center gap-2 transition-opacity duration-150",
            isBusy ? "invisible select-none pointer-events-none" : "opacity-100"
          )}
          aria-hidden={isBusy}
        >
          {children}
        </span>

        {/* Overlay for Loading / Success / Error state */}
        {isBusy && (
          <span
            className="absolute inset-0 z-20 flex items-center justify-center gap-2 px-3 text-center whitespace-nowrap"
            aria-live="polite"
          >
            {isLoading && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-current" />
                <span className="font-medium">{loadingText || children}</span>
              </>
            )}
            {isSuccess && !isLoading && (
              <>
                <Check className="h-4 w-4 shrink-0 text-current animate-check-pop stroke-[2.5]" />
                <span className="font-medium">{successText || "Thành công"}</span>
              </>
            )}
            {isError && !isLoading && !isSuccess && (
              <>
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-current" />
                <span className="font-medium">{errorText || "Thử lại"}</span>
              </>
            )}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

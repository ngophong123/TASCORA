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
      pill = false,
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
      "group relative inline-flex items-center justify-center font-medium transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 overflow-hidden active:scale-[0.975] will-change-transform [&>svg]:transition-transform [&>svg]:duration-200 [&>svg]:ease-out hover:[&>svg:last-child]:translate-x-1"

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-xs sm:text-sm gap-2",
      lg: "h-12 px-6 text-sm sm:text-base gap-2.5",
    }[size]

    const radiusStyles = pill ? "rounded-full" : "rounded-lg"

    const variantStyles = {
      primary:
        "text-white bg-gradient-to-r from-[#635BFF] via-[#564EF5] to-[#7C3AED] hover:brightness-[1.05] active:brightness-[0.96] border border-[#635BFF]/80 shadow-xs hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_8px_22px_-6px_rgba(99,91,255,0.40)]",
      secondary:
        "text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#635BFF]/30 hover:bg-[#635BFF]/[0.04] dark:hover:bg-[#635BFF]/[0.12] hover:text-[#635BFF] dark:hover:text-indigo-400 hover:-translate-y-px hover:shadow-xs active:scale-[0.98]",
      outline:
        "text-slate-700 dark:text-slate-300 bg-transparent border border-slate-200/90 dark:border-slate-800 hover:border-[#635BFF]/40 hover:text-[#635BFF] dark:hover:text-indigo-400 hover:bg-[#635BFF]/[0.04] dark:hover:bg-[#635BFF]/[0.10] hover:-translate-y-px active:scale-[0.98]",
      ghost:
        "text-slate-600 dark:text-slate-400 hover:text-[#635BFF] dark:hover:text-indigo-400 hover:bg-[#635BFF]/[0.06] dark:hover:bg-[#635BFF]/[0.12] active:scale-[0.97]",
      link: "text-[#635BFF] hover:text-[#4F46E5] p-0 h-auto underline-offset-4 hover:underline",
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

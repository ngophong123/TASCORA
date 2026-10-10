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
      "group relative inline-flex items-center justify-center font-medium transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden active:scale-[0.99] motion-reduce:transform-none"

    const sizeStyles = {
      sm: "min-h-11 px-3 text-sm gap-1.5",
      md: "min-h-11 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-sm sm:text-base gap-2.5",
    }[size]

    const radiusStyles = pill ? "rounded-full" : "rounded-lg"

    const variantStyles = {
      primary:
        "text-white bg-primary hover:bg-primary-hover active:bg-primary-active border border-transparent shadow-sm dark:text-[#202329]",
      secondary:
        "text-text-primary bg-bg-surface border border-border-default hover:bg-bg-subtle hover:border-border-hover",
      outline:
        "text-text-primary bg-transparent border border-border-default hover:bg-bg-subtle hover:border-border-hover",
      ghost: "text-text-secondary hover:text-primary hover:bg-primary-subtle",
      link: "text-primary hover:text-primary-hover p-0 underline-offset-4 hover:underline",
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

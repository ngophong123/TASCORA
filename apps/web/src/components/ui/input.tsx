"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isError, errorMessage, id, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined

    return (
      <div className="w-full space-y-1.5">
        <input
          id={id}
          type={type}
          aria-invalid={isError ? "true" : undefined}
          aria-describedby={isError && errorMessage ? errorId : undefined}
          className={cn(
            "flex min-h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3.5 py-2 text-base text-text-primary placeholder:text-text-muted",
            "outline-none transition-[border-color,box-shadow,background-color] duration-180 ease-out",
            "focus:border-primary focus:ring-2 focus:ring-focus-ring/20",
            isError
              ? "border-status-danger focus:border-status-danger focus:ring-status-danger/20"
              : "hover:border-border-hover",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-subtle",
            className
          )}
          ref={ref}
          {...props}
        />
        {isError && errorMessage && (
          <p id={errorId} role="alert" className="text-sm text-status-danger font-medium">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

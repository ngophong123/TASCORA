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
            "flex h-10 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-[#0B0B14] placeholder:text-[#6B6B7B]",
            "outline-none transition-[border-color,box-shadow,background-color] duration-180 ease-out",
            "focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20",
            isError
              ? "border-rose-500 focus:border-rose-600 focus:ring-rose-500/20 animate-micro-shake"
              : "hover:border-[rgba(15,15,30,0.18)]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F4F4F8]",
            className
          )}
          ref={ref}
          {...props}
        />
        {isError && errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

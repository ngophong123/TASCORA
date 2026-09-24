"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "elevated" | "glass"
  size?: "default" | "panel"
  spotlight?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "surface",
      size = "default",
      spotlight = false,
      children,
      onMouseMove,
      ...props
    },
    ref
  ) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = React.useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!spotlight) return
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      if (onMouseMove) onMouseMove(e)
    }

    const variantStyles = {
      surface: "bg-white border border-[rgba(15,15,30,0.08)] shadow-sm hover:border-[rgba(15,15,30,0.16)] hover:shadow-md",
      elevated: "bg-[#FAFAFC] border border-[rgba(15,15,30,0.1)] shadow-md hover:border-[rgba(15,15,30,0.18)]",
      glass: "bg-white/85 backdrop-blur-xl border border-[rgba(15,15,30,0.08)] shadow-sm hover:border-[rgba(15,15,30,0.16)]",
    }[variant]

    const sizeStyles = {
      default: "rounded-[12px] p-6",
      panel: "rounded-[20px] p-8 sm:p-10",
    }[size]

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative transition-all duration-300 overflow-hidden",
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      >
        {/* Cursor spotlight radial gradient */}
        {spotlight && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.08), transparent 80%)`,
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    )
  }
)

Card.displayName = "Card"

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AccentColor, getAccentTheme } from "@/lib/gradients"

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  accent?: AccentColor
  spotlightColor?: string
  spotlightBorderColor?: string
  className?: string
}

export function SpotlightCard({
  children,
  accent,
  spotlightColor,
  spotlightBorderColor,
  className,
  ...props
}: SpotlightCardProps) {
  const theme = accent ? getAccentTheme(accent) : undefined
  const resolvedSpotlightColor = spotlightColor ?? theme?.spotlightSurface ?? "rgba(37, 99, 235, 0.08)"
  const resolvedSpotlightBorderColor = spotlightBorderColor ?? theme?.spotlightBorder ?? "rgba(37, 99, 235, 0.25)"

  const divRef = React.useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = React.useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setIsFocused(true)
    setOpacity(1)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm group",
        theme
          ? cn(theme.hoverBorderClass, theme.hoverShadowClass)
          : "hover:border-blue-200 hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.12),0_4px_12px_rgba(15,15,30,0.04)]",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial (Surface) */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${resolvedSpotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Dynamic Cursor Spotlight Border Glow */}
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(320px circle at ${position.x}px ${position.y}px, ${resolvedSpotlightBorderColor}, transparent 75%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  )
}


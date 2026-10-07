"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AccentColor, getAccentTheme } from "@/lib/gradients"

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  accent?: AccentColor
  spotlightColor?: string
  className?: string
}

export function SpotlightCard({
  children,
  accent,
  spotlightColor,
  className,
  ...props
}: SpotlightCardProps) {
  const theme = accent ? getAccentTheme(accent) : undefined
  const resolvedSpotlightColor =
    spotlightColor ?? theme?.spotlightSurface ?? "rgba(99, 91, 255, 0.08)"

  const divRef = React.useRef<HTMLDivElement>(null)
  const rafId = React.useRef<number | null>(null)

  React.useEffect(() => {
    const el = divRef.current
    if (!el) return

    const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!isDesktop || prefersReducedMotion) return

    const handlePointerMove = (e: PointerEvent) => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        el.style.setProperty("--mouse-x", `${x}px`)
        el.style.setProperty("--mouse-y", `${y}px`)
        el.style.setProperty("--mouse-opacity", "1")
      })
    }

    const handlePointerEnter = () => {
      el.style.setProperty("--mouse-opacity", "1")
    }

    const handlePointerLeave = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
      el.style.setProperty("--mouse-opacity", "0")
    }

    el.addEventListener("pointermove", handlePointerMove, { passive: true })
    el.addEventListener("pointerenter", handlePointerEnter, { passive: true })
    el.addEventListener("pointerleave", handlePointerLeave, { passive: true })

    return () => {
      el.removeEventListener("pointermove", handlePointerMove)
      el.removeEventListener("pointerenter", handlePointerEnter)
      el.removeEventListener("pointerleave", handlePointerLeave)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  return (
    <div
      ref={divRef}
      className={cn(
        "card-hover-gradient mouse-light-card relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 shadow-xs hover:shadow-[0_14px_34px_-8px_rgba(15,23,42,0.12)] group will-change-transform",
        theme ? cn(theme.hoverBorderClass) : "hover:border-[#635BFF]/35",
        className
      )}
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          "--mouse-opacity": "0",
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial (Surface) - 240px circle */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-280 ease-out z-[2]"
        style={{
          opacity: "var(--mouse-opacity, 0)",
          background: `radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${resolvedSpotlightColor}, transparent 65%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  )
}

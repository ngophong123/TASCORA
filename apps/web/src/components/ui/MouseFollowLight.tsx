"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface MouseFollowLightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  enableTilt?: boolean
  maxTiltDeg?: number
  spotlightColor?: string
}

/**
 * High-performance mouse-follow light & optional subtle 3D tilt (2-3 deg max)
 * - Pure CSS variable updates via RAF (zero React re-renders on mousemove)
 * - Desktop-only (@media (hover: hover) and (pointer: fine))
 * - Automatically disabled with prefers-reduced-motion
 */
export function MouseFollowLight({
  children,
  className,
  enableTilt = false,
  maxTiltDeg = 2.5,
  spotlightColor = "rgba(99, 91, 255, 0.08)",
  ...props
}: MouseFollowLightProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const rafId = React.useRef<number | null>(null)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Desktop hover & fine pointer detection
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

        if (enableTilt) {
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          const rotateX = Math.max(
            -maxTiltDeg,
            Math.min(maxTiltDeg, ((y - centerY) / centerY) * -maxTiltDeg)
          )
          const rotateY = Math.max(
            -maxTiltDeg,
            Math.min(maxTiltDeg, ((x - centerX) / centerX) * maxTiltDeg)
          )

          el.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
        }
      })
    }

    const handlePointerEnter = () => {
      el.style.setProperty("--mouse-opacity", "1")
      if (enableTilt) {
        el.style.transition = "transform 0.15s ease-out, box-shadow 0.25s ease-out"
      }
    }

    const handlePointerLeave = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
      el.style.setProperty("--mouse-opacity", "0")
      if (enableTilt) {
        el.style.transition =
          "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease-out"
        el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)"
      }
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
  }, [enableTilt, maxTiltDeg])

  return (
    <div
      ref={containerRef}
      className={cn("mouse-light-card relative will-change-transform", className)}
      style={
        {
          // Fallback CSS variables
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          "--mouse-opacity": "0",
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Subtle Mouse-Follow Highlight Layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-280 ease-out z-[1]"
        style={{
          opacity: "var(--mouse-opacity, 0)",
          background: `radial-gradient(240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${spotlightColor}, transparent 65%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-[2] h-full w-full">{children}</div>
    </div>
  )
}

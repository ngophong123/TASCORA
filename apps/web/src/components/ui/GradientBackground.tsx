"use client"

import * as React from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GradientBackgroundProps {
  className?: string
  children?: React.ReactNode
  showDiagonalBand?: boolean
}

export function GradientBackground({
  className,
  children,
  showDiagonalBand = true,
}: GradientBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const shouldReduceMotion = useReducedMotion()

  // Subtle scroll-driven drift and scale for the ambient mesh blobs (disabled on reduced motion)
  const blobsY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 50])
  const blobsScale = useTransform(scrollYProgress, [0, 1], [1, shouldReduceMotion ? 1 : 1.05])

  return (
    <div ref={containerRef} className={cn("relative w-full overflow-hidden bg-white", className)}>
      {/* 1. Subtle Ambient Lighting with Signature Stripe Multi-Color Flowing Mesh */}
      <motion.div
        style={{ y: blobsY, scale: blobsScale }}
        className="pointer-events-none absolute inset-0 overflow-hidden will-change-transform"
        aria-hidden="true"
      >
        {/* Layer 1: Signature Multi-Hue Flowing Gradient Ribbon (Top Right) */}
        <div
          className={cn(
            "absolute -top-[18%] right-[-15%] sm:right-[-5%] w-[650px] sm:w-[950px] h-[450px] sm:h-[600px] rounded-full blur-[130px] opacity-[0.24] pointer-events-none transform -rotate-12",
            !shouldReduceMotion && "animate-ambient-mesh"
          )}
          style={{
            background:
              "linear-gradient(135deg, #4f46e5 0%, #7c3aed 28%, #ec4899 65%, #f97316 100%)",
          }}
        />

        {/* Layer 2: Soft Indigo/Sky Support Bloom (Top Left) */}
        <div
          className={cn(
            "absolute -top-[25%] -left-[12%] w-[500px] sm:w-[750px] h-[400px] sm:h-[550px] rounded-full blur-[140px] opacity-[0.14] pointer-events-none",
            !shouldReduceMotion && "animate-ambient-mesh-slow"
          )}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.45) 0%, rgba(99, 91, 255, 0.25) 50%, transparent 75%)",
          }}
        />

        {/* Layer 3: Architectural Dotted Grid (subtle 3% opacity) */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.6) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Layer 4: Smooth bottom fade to white */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10">{children}</div>

      {/* 4. Subtle Hairline Bottom Divider */}
      {showDiagonalBand && (
        <div className="relative w-full h-px bg-[#E2E8F0] pointer-events-none" aria-hidden="true" />
      )}
    </div>
  )
}

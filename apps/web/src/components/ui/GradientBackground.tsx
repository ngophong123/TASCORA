"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
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

  // Subtle scroll-driven drift and scale for the ambient mesh blobs
  const blobsY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const blobsScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  // Subtle parallax for the Stripe-style diagonal band (moves slightly slower than scroll)
  const bandY = useTransform(scrollYProgress, [0, 1], [0, 20])

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden bg-white", className)}
    >
      {/* 1. Animated Radial Mesh Gradient Blobs with Scroll Response */}
      <motion.div
        style={{ y: blobsY, scale: blobsScale }}
        className="pointer-events-none absolute inset-0 overflow-hidden will-change-transform"
        aria-hidden="true"
      >
        {/* Blob 1: Soft Light Blue (#93C5FD) - Top Left (Brand Dominant) */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full bg-[#93C5FD]/45 blur-[110px] animate-blob-1 will-change-transform"
        />

        {/* Blob 2: Rich Violet Accent (#A855F7) - Center Right Edge for depth */}
        <div
          className="absolute top-[10%] -right-[15%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full bg-[#A855F7]/30 blur-[130px] animate-blob-2 will-change-transform"
        />

        {/* Blob 3: Vibrant Sky Blue (#38BDF8) - Bottom Center */}
        <div
          className="absolute top-[40%] left-[20%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-[#38BDF8]/35 blur-[110px] animate-blob-3 will-change-transform"
        />

        {/* 2. Faint Dotted Grid (opacity ~5%) */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(15, 15, 30, 0.4) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* 3. Smooth bottom fade to white */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10">{children}</div>

      {/* 4. Stripe-style diagonal skewed gradient separator band (Blue-Violet journey) */}
      {showDiagonalBand && (
        <motion.div
          style={{ y: bandY }}
          className="relative w-full h-16 pointer-events-none overflow-hidden -mt-8 will-change-transform"
          aria-hidden="true"
        >
          <div
            className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 via-indigo-500/40 to-transparent transform -skew-y-1 shadow-[0_2px_12px_rgba(99,102,241,0.25)]"
          />
        </motion.div>
      )}
    </div>
  )
}

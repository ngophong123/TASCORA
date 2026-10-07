"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface LoadingOverlayProps {
  isVisible: boolean
  title?: string
  subtext?: string
  className?: string
}

/**
 * Premium Full-Page Loading Overlay
 * Reserved strictly for heavyweight actions: Checkout, Payment, Auth redirects, Large uploads.
 * Features blurred backdrop, animated multi-phase ring, and brand-aligned typography.
 */
export function LoadingOverlay({
  isVisible,
  title = "Đang xử lý yêu cầu...",
  subtext = "Vui lòng đợi trong giây lát",
  className,
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="alert"
          aria-busy="true"
          aria-live="assertive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md select-none",
            className
          )}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          {/* Central Card Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center p-8 rounded-3xl bg-white/90 border border-[rgba(15,15,30,0.08)] shadow-[0_20px_50px_rgba(15,15,30,0.08)] text-center max-w-xs w-full mx-4"
          >
            {/* Multi-Phase Animated Brand Ring (○ -> ◔ -> ◑ -> ◕ -> ○) */}
            <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
              {/* Outer static ring track */}
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="rgba(37,99,235,0.12)"
                  strokeWidth="3.5"
                />
                {/* Orbiting animated arc */}
                <motion.circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="url(#tascora-loading-gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="163"
                  animate={{
                    strokeDashoffset: [140, 40, 140],
                    rotate: [0, 360],
                  }}
                  transition={{
                    strokeDashoffset: {
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                  style={{ transformOrigin: "32px 32px" }}
                />
                <defs>
                  <linearGradient id="tascora-loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central TASCORA "T" Badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-base bg-gradient-to-r from-blue-600 via-sky-500 to-violet-600 bg-clip-text text-transparent">
                  T
                </span>
              </div>
            </div>

            {/* Typography */}
            <h3 className="font-medium text-sm text-[#0A0A23] tracking-tight">{title}</h3>
            <p className="text-xs text-[#6B6B7B] mt-1.5">{subtext}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

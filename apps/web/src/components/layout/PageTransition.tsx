"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Global Page Transition Wrapper
 * Applies subtle fade + translateY (8px) on route change without layout shift.
 * Duration: 280ms, easing: expo out curve.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: reducedMotion ? 1 : 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.16,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

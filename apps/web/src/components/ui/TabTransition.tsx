"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TabTransitionProps {
  tabKey: string | number
  children: React.ReactNode
  className?: string
}

/**
 * Tab Content Transition Container
 * Fades in with subtle 4px vertical rise over 200ms without layout jumps.
 */
export function TabTransition({ tabKey, children, className }: TabTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn("w-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

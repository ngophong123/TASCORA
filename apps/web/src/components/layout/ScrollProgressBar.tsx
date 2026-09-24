"use client"

import * as React from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()

  // Spring physics for buttery progress bar fill without jarring jumps
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 35,
    restDelta: 0.001,
  })

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full origin-left bg-gradient-to-r from-blue-600 via-sky-500 to-sky-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        style={{ scaleX }}
      />
    </div>
  )
}

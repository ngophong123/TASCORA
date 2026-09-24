"use client"

import * as React from "react"
import { useInView, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2.2,
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0)
  const [isFinished, setIsFinished] = React.useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)
  
  // Triggers precisely when cards enter the reading view
  const isInView = useInView(ref, { once: false, margin: "-40px 0px -40px 0px" })

  React.useEffect(() => {
    if (!isInView) {
      setCount(0)
      setIsFinished(false)
      return
    }

    let startTime: number | null = null
    let animationFrameId: number
    const startValue = 0
    const endValue = value

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / (duration * 1000)
      const progress = Math.min(elapsed, 1)

      // Cubic ease-out curve: 1 - (1 - progress)^3
      // Provides a smooth, highly visible number progression that doesn't jump prematurely
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      setCount(Math.floor(startValue + (endValue - startValue) * easeProgress))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setCount(endValue)
        setIsFinished(true)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [isInView, value, duration])

  return (
    <motion.span
      ref={ref}
      className={cn("inline-flex items-center font-mono tabular-nums select-none", className)}
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="shrink-0">{prefix}</span>
      <motion.span
        key={isFinished ? "finished" : "counting"}
        animate={isFinished ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {count}
      </motion.span>
      <span className="shrink-0">{suffix}</span>
    </motion.span>
  )
}

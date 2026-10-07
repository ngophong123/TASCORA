"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { EASE_OUT_EXPO } from "@/lib/motion"

/* -------------------------------------------------------------------------- */
/* REVEAL PRIMITIVE                                                          */
/* Viewport-triggered entrance reveal (run once, 500-750ms, ease-out-expo)  */
/* -------------------------------------------------------------------------- */

export interface RevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right" | "fade"
  delay?: number
  duration?: number
  distance?: number
  className?: string
  once?: boolean
  amount?: number
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.65,
  distance = 24,
  className,
  once = true,
  amount = 0.2,
  ...props
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion()

  const getOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 }
    switch (direction) {
      case "up":
        return { x: 0, y: distance }
      case "down":
        return { x: 0, y: -distance }
      case "left":
        return { x: distance, y: 0 }
      case "right":
        return { x: -distance, y: 0 }
      case "fade":
      default:
        return { x: 0, y: 0 }
    }
  }

  const offset = getOffset()

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        filter: shouldReduceMotion ? "none" : "blur(4px)",
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once, amount }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* STAGGER CONTAINER & ITEM PRIMITIVES                                        */
/* Orchestrates staggered cascade for cards, grid items, and lists           */
/* -------------------------------------------------------------------------- */

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  staggerDelay?: number
  delayChildren?: number
  className?: string
  once?: boolean
  amount?: number
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  className,
  once = true,
  amount = 0.15,
  ...props
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
            delayChildren: shouldReduceMotion ? 0 : delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  yOffset?: number
}

export function StaggerItem({ children, className, yOffset = 20, ...props }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: shouldReduceMotion ? 0 : yOffset,
          scale: shouldReduceMotion ? 1 : 0.98,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: shouldReduceMotion ? 0.01 : 0.55,
            ease: EASE_OUT_EXPO,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* HOVER CARD PRIMITIVE                                                       */
/* Smooth physical elevation hover: translateY(-4px), border, shadow          */
/* -------------------------------------------------------------------------- */

export interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  lift?: number
  className?: string
}

export function HoverCard({ children, lift = -4, className, ...props }: HoverCardProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: lift,
              transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
            }
      }
      className={cn("stripe-card stripe-card-hover", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/* ANIMATED GRADIENT PRIMITIVE                                                */
/* Slow ambient flowing mesh (12-18s) with prefers-reduced-motion fallback    */
/* -------------------------------------------------------------------------- */

export interface AnimatedGradientProps {
  className?: string
  variant?: "hero" | "dark" | "ambient" | "custom"
  customGradient?: string
  children?: React.ReactNode
}

export function AnimatedGradient({
  className,
  variant = "hero",
  customGradient,
  children,
}: AnimatedGradientProps) {
  const shouldReduceMotion = useReducedMotion()

  const gradientStyle = React.useMemo(() => {
    if (customGradient) return customGradient
    switch (variant) {
      case "hero":
        return "linear-gradient(135deg, rgba(99, 91, 255, 0.22) 0%, rgba(124, 58, 237, 0.18) 32%, rgba(236, 72, 153, 0.16) 68%, rgba(249, 115, 22, 0.14) 100%)"
      case "dark":
        return "linear-gradient(135deg, rgba(99, 91, 255, 0.35) 0%, rgba(124, 58, 237, 0.3) 35%, rgba(236, 72, 153, 0.25) 70%, rgba(249, 115, 22, 0.2) 100%)"
      case "ambient":
      default:
        return "radial-gradient(ellipse at 50% 50%, rgba(99, 91, 255, 0.18) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 75%)"
    }
  }, [variant, customGradient])

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div
        className={cn(
          "w-full h-full rounded-full blur-[110px] transform-gpu",
          !shouldReduceMotion && "animate-ambient-mesh"
        )}
        style={{ background: gradientStyle }}
      />
      {children}
    </div>
  )
}

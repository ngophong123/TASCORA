import type { Variants, Transition } from "framer-motion"

/**
 * Standardized easing curves across TASCORA.
 * High-precision cubic-bezier curves matching Stripe & Linear design systems.
 */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT_EXPO = [0.65, 0, 0.35, 1] as const

/**
 * Shared Spring presets for interactive physics.
 */
export const SPRING_TACTILE: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
}

export const SPRING_CARD: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
}

export const SPRING_POP: Transition = {
  type: "spring",
  stiffness: 450,
  damping: 22,
}

/**
 * Viewport trigger configuration for entrance reveals.
 */
export const VIEWPORT_ONCE = {
  once: true,
  amount: 0.25,
} as const

export const VIEWPORT_STRICT = {
  once: true,
  amount: 0.4,
} as const

/* -------------------------------------------------------------------------- */
/* REUSABLE MOTION VARIANTS                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Standard content fade + translateY reveal (for subheadings, body text, buttons).
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: customDelay,
      ease: EASE_OUT_EXPO,
    },
  }),
}

/**
 * Editorial headline reveal with subtle blur-to-sharp filter and slight translateY.
 */
export const fadeUpBlurVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(6px)",
  },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      delay: customDelay,
      ease: EASE_OUT_EXPO,
    },
  }),
}

/**
 * Pure opacity fade-in.
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: customDelay,
      ease: EASE_OUT_EXPO,
    },
  }),
}

/**
 * Container orchestrator that staggers its children items.
 */
export const createStaggerContainer = (
  staggerChildren: number = 0.07,
  delayChildren: number = 0.1
): Variants => ({
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

export const staggerContainerVariants: Variants = createStaggerContainer(0.07, 0.1)

/**
 * Card / grid item variant: combines subtle scale (0.96 -> 1), translateY, and opacity.
 */
export const staggerChildCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: EASE_OUT_EXPO,
    },
  },
}

/**
 * Mockup card landing animation: slight 3D rotateX perspective landing into place.
 */
export const landingCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    rotateX: 4,
  },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.75,
      delay: customDelay,
      ease: EASE_OUT_EXPO,
    },
  }),
}

/**
 * Micro-interaction tap effect for interactive buttons.
 */
export const buttonTapMotion = {
  whileTap: { scale: 0.97, transition: SPRING_TACTILE },
}

/**
 * Spring-based card hover micro-interaction.
 */
export const cardHoverMotion = {
  whileHover: {
    y: -5,
    transition: SPRING_CARD,
  },
}

/**
 * Chips and small badge hover pop.
 */
export const chipHoverMotion = {
  whileHover: {
    scale: 1.03,
    transition: SPRING_POP,
  },
  whileTap: {
    scale: 0.97,
    transition: SPRING_TACTILE,
  },
}

/**
 * Safe fallback variants when prefers-reduced-motion is true.
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
}

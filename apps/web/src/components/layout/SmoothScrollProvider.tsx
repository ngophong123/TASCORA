"use client"

import * as React from "react"
import Lenis from "lenis"
import { usePathname } from "next/navigation"

interface SmoothScrollContextValue {
  lenis: Lenis | null
}

const SmoothScrollContext = React.createContext<SmoothScrollContextValue>({
  lenis: null,
})

export function useLenis() {
  return React.useContext(SmoothScrollContext).lenis
}

interface SmoothScrollProviderProps {
  children: React.ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = React.useState<Lenis | null>(null)
  const pathname = usePathname()
  const nativeScroll = /(^|\/)dashboard(\/|$)/.test(pathname)
  const lenisRef = React.useRef<Lenis | null>(null)

  React.useEffect(() => {
    // Workspace forms, drawers and message panes use native scrolling.
    if (nativeScroll) {
      const previous = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = "auto"
      return () => {
        document.documentElement.style.scrollBehavior = previous
      }
    }
    // 1. Accessibility guardrail: Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (prefersReducedMotion.matches) {
      // Respect user choice: disable Lenis, use native browser scrolling
      return
    }

    // 2. Initialize Lenis with refined parameters for smooth, natural momentum
    const lenis = new Lenis({
      lerp: 0.085, // Smooth inertia without feeling sluggish
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    })

    lenisRef.current = lenis
    setLenisInstance(lenis)

    // 3. RAF Animation Loop
    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // 4. Listen to preference change dynamically
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        cancelAnimationFrame(rafId)
        lenis.destroy()
        lenisRef.current = null
        setLenisInstance(null)
      }
    }

    prefersReducedMotion.addEventListener("change", handleMotionChange)

    return () => {
      prefersReducedMotion.removeEventListener("change", handleMotionChange)
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
      setLenisInstance(null)
    }
  }, [nativeScroll])

  // Handle route change and hash scrolling
  React.useEffect(() => {
    if (!lenisRef.current) return

    const hash = window.location.hash
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash)
        if (target) {
          lenisRef.current?.scrollTo(target as HTMLElement, { offset: -80, duration: 1.1 })
        } else {
          lenisRef.current?.scrollTo(0, { immediate: true })
        }
      }, 150)
    } else {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
  }, [pathname])

  // Listen to hashchange events so Lenis scrolls smoothly to any hash target
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash && lenisRef.current) {
        const target = document.querySelector(hash)
        if (target) {
          lenisRef.current.scrollTo(target as HTMLElement, { offset: -80, duration: 1.1 })
        }
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

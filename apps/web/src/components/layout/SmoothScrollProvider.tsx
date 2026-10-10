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
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let dispose: (() => void) | undefined
    const synchronize = () => {
      dispose?.()
      dispose = undefined
      if (preference.matches) return
      const lenis = new Lenis({
        lerp: 0.085,
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
      })
      lenisRef.current = lenis
      setLenisInstance(lenis)
      let rafId: number | null = null
      const wake = () => {
        if (rafId === null && !document.hidden) rafId = requestAnimationFrame(frame)
      }
      const frame = (time: number) => {
        rafId = null
        lenis.raf(time)
        if (lenis.isScrolling === "smooth") wake()
      }
      // virtual-scroll is emitted before Lenis initializes its animation.
      const offWheel = lenis.on("virtual-scroll", wake)
      const offScroll = lenis.on("scroll", () => {
        if (lenis.isScrolling === "smooth") wake()
      })
      const scrollTo = lenis.scrollTo.bind(lenis)
      lenis.scrollTo = (...args: Parameters<Lenis["scrollTo"]>) => {
        scrollTo(...args)
        if (lenis.isScrolling === "smooth") wake()
      }
      const visibility = () => {
        if (document.hidden) {
          if (rafId !== null) cancelAnimationFrame(rafId)
          rafId = null
          // Finish at the currently visible position, not a stale offscreen target.
          scrollTo(lenis.scroll, { immediate: true })
        }
      }
      document.addEventListener("visibilitychange", visibility)
      dispose = () => {
        if (rafId !== null) cancelAnimationFrame(rafId)
        offWheel()
        offScroll()
        document.removeEventListener("visibilitychange", visibility)
        lenis.destroy()
        lenisRef.current = null
        setLenisInstance(null)
      }
    }
    synchronize()
    preference.addEventListener("change", synchronize)
    return () => {
      preference.removeEventListener("change", synchronize)
      dispose?.()
    }
  }, [nativeScroll])

  // Handle route change and hash scrolling
  React.useEffect(() => {
    if (!lenisRef.current) return

    const hash = window.location.hash
    if (hash) {
      const timer = setTimeout(() => {
        const target = document.querySelector(hash)
        if (target) {
          lenisRef.current?.scrollTo(target as HTMLElement, { offset: -80, duration: 1.1 })
        } else {
          lenisRef.current?.scrollTo(0, { immediate: true })
        }
      }, 150)
      return () => clearTimeout(timer)
    } else {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    return undefined
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

"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Native route fade. Initial/server content stays visible; no global motion
 * dependency is needed for this single opacity animation.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const element = React.useRef<HTMLDivElement>(null)
  const previousPath = React.useRef<string | null>(null)

  React.useEffect(() => {
    const changed = previousPath.current !== null && previousPath.current !== pathname
    previousPath.current = pathname
    if (!changed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const animation = element.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 160,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    })
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const stop = () => {
      if (preference.matches) animation?.cancel()
    }
    preference.addEventListener("change", stop)
    return () => {
      preference.removeEventListener("change", stop)
      animation?.cancel()
    }
  }, [pathname])

  return (
    <div key={pathname} ref={element} className="w-full flex-1 flex flex-col">
      {children}
    </div>
  )
}

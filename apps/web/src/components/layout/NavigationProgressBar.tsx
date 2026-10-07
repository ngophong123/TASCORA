"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Global Ultra-Slim Top Progress Bar
 * Triggers on internal navigation:
 * 0% -> ~70% during route resolution, then 100% -> fade out upon completion.
 * Includes delay threshold to avoid flashing on instant cached routes.
 */
function NavigationProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [status, setStatus] = React.useState<"idle" | "loading" | "finishing">("idle")
  const [progress, setProgress] = React.useState(0)
  const [visible, setVisible] = React.useState(false)

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeNavigationRef = React.useRef(false)

  // Start progress
  const startProgress = React.useCallback(() => {
    if (activeNavigationRef.current) return
    activeNavigationRef.current = true

    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current)
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current)

    // Slight delay (80ms) before showing the bar to prevent jarring flicker on instant navigations
    timerRef.current = setTimeout(() => {
      if (!activeNavigationRef.current) return
      setVisible(true)
      setStatus("loading")
      setProgress(25)

      // Creep up to ~70%
      timerRef.current = setTimeout(() => {
        if (!activeNavigationRef.current) return
        setProgress(72)
      }, 160)
    }, 80)
  }, [])

  // Finish progress
  const finishProgress = React.useCallback(() => {
    activeNavigationRef.current = false
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // If visible, advance to 100% and fade out
    if (visible) {
      setStatus("finishing")
      setProgress(100)

      finishTimerRef.current = setTimeout(() => {
        setVisible(false)
        finishTimerRef.current = setTimeout(() => {
          setProgress(0)
          setStatus("idle")
        }, 200)
      }, 250)
    } else {
      setProgress(0)
      setStatus("idle")
    }
  }, [visible])

  // Complete progress whenever pathname or searchParams changes
  React.useEffect(() => {
    finishProgress()
  }, [pathname, searchParams, finishProgress])

  // Listen for global link clicks
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Ignore modified clicks (Ctrl, Cmd, Shift, Alt, middle click)
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      // Find closest anchor tag
      const anchor = (e.target as HTMLElement).closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return

      // Ignore external, hash-only, mailto, tel, target="_blank", or download links
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href)
        const currentUrl = new URL(window.location.href)

        // Ignore if external origin
        if (targetUrl.origin !== currentUrl.origin) return

        // Ignore if same path and search query (e.g. clicking current active link)
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
          return
        }

        // Navigation will occur: trigger progress bar
        startProgress()
      } catch {
        // Fallback: ignore malformed URLs
      }
    }

    document.addEventListener("click", handleClick, { capture: true })
    return () => {
      document.removeEventListener("click", handleClick, { capture: true })
    }
  }, [startProgress])

  if (!visible && status === "idle") {
    return null
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-[99999] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#635BFF] shadow-[0_0_8px_rgba(99,91,255,0.4)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition:
            status === "finishing"
              ? "width 200ms ease-out, opacity 250ms ease-out 100ms"
              : "width 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-in",
        }}
      />
    </div>
  )
}

export function NavigationProgressBar() {
  return (
    <React.Suspense fallback={null}>
      <NavigationProgressBarInner />
    </React.Suspense>
  )
}

"use client"

import * as React from "react"
import { useDashboard } from "@/context/DashboardContext"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { toast, dismissToast } = useDashboard()
  const reduced = useReducedMotion()

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-status-success shrink-0" />,
    error: <AlertCircle aria-hidden="true" className="w-5 h-5 text-status-danger shrink-0" />,
    warning: <AlertTriangle aria-hidden="true" className="w-5 h-5 text-status-warning shrink-0" />,
    info: <Info aria-hidden="true" className="w-5 h-5 text-primary shrink-0" />,
  }

  const borderColors = {
    success: "border-border-default bg-bg-surface",
    error: "border-status-danger/30 bg-bg-surface",
    warning: "border-status-warning/30 bg-bg-surface",
    info: "border-border-default bg-bg-surface",
  }

  const type = toast.type || "success"

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 left-4 right-4 z-50 pointer-events-none flex flex-col items-end sm:left-auto sm:right-6"
    >
      <AnimatePresence>
        <motion.div
          key={toast.id}
          role="status"
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.16 }}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full",
            borderColors[type]
          )}
        >
          {icons[type]}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
            {toast.message && (
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">{toast.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-subtle transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

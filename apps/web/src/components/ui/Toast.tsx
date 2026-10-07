"use client"

import * as React from "react"
import { useDashboard } from "@/context/DashboardContext"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { toast, dismissToast } = useDashboard()

  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#635BFF] shrink-0" />,
  }

  const borderColors = {
    success: "border-emerald-200 bg-white",
    error: "border-rose-200 bg-white",
    warning: "border-amber-200 bg-white",
    info: "border-[#635BFF]/30 bg-white",
  }

  const type = toast.type || "success"

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end"
    >
      <AnimatePresence>
        <motion.div
          key={toast.id}
          role="status"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl max-w-sm w-full",
            borderColors[type]
          )}
        >
          {icons[type]}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-[#0A0A23]">{toast.title}</h4>
            {toast.message && (
              <p className="text-[11px] text-[#6B6B7B] mt-0.5 leading-relaxed">{toast.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="p-1 rounded-lg text-[#6B6B7B] hover:text-[#0A0A23] hover:bg-black/[0.04] transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

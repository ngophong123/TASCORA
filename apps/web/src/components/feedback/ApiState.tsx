"use client"
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react"
export function ApiState({
  loading,
  error,
  empty,
  retry,
}: {
  loading?: boolean
  error?: string
  empty?: string
  retry?: () => void
}) {
  if (loading)
    return (
      <p
        role="status"
        className="premium-panel flex items-center gap-3 p-6 text-sm text-text-secondary"
      >
        <LoaderCircle
          aria-hidden="true"
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
        />{" "}
        Loading…
      </p>
    )
  if (error)
    return (
      <div
        role="alert"
        className="premium-panel flex flex-wrap items-center gap-3 p-6 text-sm text-text-primary"
      >
        <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-status-danger" />
        <span className="flex-1 min-w-0">{error}</span>
        {retry && (
          <button type="button" className="premium-link shrink-0" onClick={retry}>
            Retry <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  return empty ? (
    <p role="status" className="premium-panel p-6 text-sm text-text-secondary">
      {empty}
    </p>
  ) : null
}

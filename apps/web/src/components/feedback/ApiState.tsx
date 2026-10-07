"use client"
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
      <p role="status" className="rounded-xl border border-slate-200 p-5 text-sm">
        Loading…
      </p>
    )
  if (error)
    return (
      <div role="alert" className="rounded-xl border border-rose-200 p-5 text-sm">
        {error}
        {retry && (
          <button className="ml-3 underline" onClick={retry}>
            Retry
          </button>
        )}
      </div>
    )
  return empty ? <p className="rounded-xl border border-slate-200 p-5 text-sm">{empty}</p> : null
}

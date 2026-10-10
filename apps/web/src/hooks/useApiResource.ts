"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { requestData } from "@/lib/marketplace"
export function useApiResource<T>(path: string | null, initialData?: T) {
  const initialPath = useRef(path)
  const [state, setState] = useState<{
    path: string | null
    data: T | null
    error: string
    loading: boolean
  }>({ path, data: initialData ?? null, error: "", loading: initialData === undefined })
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, data: null, error: "", loading: true }))
    setRevision((n) => n + 1)
  }, [])
  useEffect(() => {
    if (initialData !== undefined && revision === 0 && initialPath.current === path) return
    const controller = new AbortController()
    if (!path) return () => controller.abort()
    setState({ path, data: null, error: "", loading: true })
    requestData<T>(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ path, data, error: "", loading: false })
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted)
          setState({ path, data: null, error: error.message, loading: false })
      })
    return () => controller.abort()
  }, [path, revision, initialData])
  return {
    data: state.path === path ? state.data : null,
    error: state.path === path ? state.error : "",
    loading: state.path !== path || state.loading,
    reload,
  }
}

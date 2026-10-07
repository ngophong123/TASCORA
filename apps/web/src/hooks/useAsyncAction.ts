"use client"

import * as React from "react"

export interface UseAsyncActionOptions<T> {
  /**
   * Milliseconds to wait before showing the loading spinner.
   * If the operation completes within this threshold, no loading state is shown.
   * Prevents annoying UI flicker on near-instant actions. Default: 180ms.
   */
  delayThreshold?: number
  /**
   * Minimum duration (ms) the loading state remains visible once shown.
   * Ensures the transition feels deliberate and not like an error flash. Default: 350ms.
   */
  minDuration?: number
  /**
   * Duration (ms) to keep isSuccess true before auto-clearing. Default: 900ms.
   * Set to 0 to keep until next action.
   */
  successDuration?: number
  /**
   * Callback fired on successful resolution.
   */
  onSuccess?: (data: T) => void
  /**
   * Callback fired on rejection.
   */
  onError?: (error: Error) => void
}

export interface UseAsyncActionReturn<TArgs extends unknown[], TReturn> {
  execute: (...args: TArgs) => Promise<TReturn | undefined>
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  error: Error | null
  reset: () => void
}

export function useAsyncAction<TArgs extends unknown[], TReturn>(
  action: (...args: TArgs) => Promise<TReturn>,
  options: UseAsyncActionOptions<TReturn> = {}
): UseAsyncActionReturn<TArgs, TReturn> {
  const {
    delayThreshold = 180,
    minDuration = 350,
    successDuration = 900,
    onSuccess,
    onError,
  } = options

  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const isPendingRef = React.useRef(false)
  const shownAtRef = React.useRef<number | null>(null)
  const delayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const successTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Store latest callbacks to prevent stale closures without mutating refs during render
  const actionRef = React.useRef(action)
  const onSuccessRef = React.useRef(onSuccess)
  const onErrorRef = React.useRef(onError)

  React.useEffect(() => {
    actionRef.current = action
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  })

  const clearTimers = React.useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current)
      delayTimerRef.current = null
    }
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const reset = React.useCallback(() => {
    clearTimers()
    isPendingRef.current = false
    shownAtRef.current = null
    setIsLoading(false)
    setIsSuccess(false)
    setIsError(false)
    setError(null)
  }, [clearTimers])

  const execute = React.useCallback(
    async (...args: TArgs): Promise<TReturn | undefined> => {
      // Prevent double submission if already active
      if (isPendingRef.current) {
        return undefined
      }

      isPendingRef.current = true
      clearTimers()
      setIsSuccess(false)
      setIsError(false)
      setError(null)
      shownAtRef.current = null

      // Start delay threshold timer: only turn on isLoading if operation takes longer than delayThreshold
      delayTimerRef.current = setTimeout(() => {
        if (isPendingRef.current) {
          shownAtRef.current = Date.now()
          setIsLoading(true)
        }
      }, delayThreshold)

      try {
        const result = await actionRef.current(...args)

        // Cancel threshold timer if not fired yet
        if (delayTimerRef.current) {
          clearTimeout(delayTimerRef.current)
          delayTimerRef.current = null
        }

        // If loading state was shown, enforce minDuration
        if (shownAtRef.current) {
          const elapsed = Date.now() - shownAtRef.current
          if (elapsed < minDuration) {
            await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed))
          }
        }

        setIsLoading(false)
        setIsSuccess(true)
        isPendingRef.current = false
        onSuccessRef.current?.(result)

        if (successDuration > 0) {
          successTimerRef.current = setTimeout(() => {
            setIsSuccess(false)
          }, successDuration)
        }

        return result
      } catch (err: unknown) {
        const parsedError = err instanceof Error ? err : new Error(String(err))

        if (delayTimerRef.current) {
          clearTimeout(delayTimerRef.current)
          delayTimerRef.current = null
        }

        if (shownAtRef.current) {
          const elapsed = Date.now() - shownAtRef.current
          if (elapsed < minDuration) {
            await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed))
          }
        }

        setIsLoading(false)
        setIsError(true)
        setError(parsedError)
        isPendingRef.current = false
        onErrorRef.current?.(parsedError)
        return undefined
      }
    },
    [clearTimers, delayThreshold, minDuration, successDuration]
  )

  return {
    execute,
    isLoading,
    isSuccess,
    isError,
    error,
    reset,
  }
}

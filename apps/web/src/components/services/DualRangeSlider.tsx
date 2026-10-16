"use client"

import * as React from "react"
import { PRICE_BOUNDS } from "@/data/serviceFilterOptions"

interface DualRangeSliderProps {
  min: number
  max: number
  onChange: (min: number, max: number) => void
  step?: number
}

export function DualRangeSlider({ min, max, onChange, step = 10 }: DualRangeSliderProps) {
  const inputId = React.useId()
  const [localMin, setLocalMin] = React.useState(min)
  const [localMax, setLocalMax] = React.useState(max)

  // Keep in sync with parent when props change from external resets
  React.useEffect(() => {
    setLocalMin(min)
  }, [min])

  React.useEffect(() => {
    setLocalMax(max)
  }, [max])

  const minLimit = PRICE_BOUNDS.min
  const maxLimit = PRICE_BOUNDS.max

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), localMax - step)
    setLocalMin(value)
  }

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), localMin + step)
    setLocalMax(value)
  }

  const commitMin = (val: number) => {
    const clamped = Math.max(minLimit, Math.min(val, localMax - step))
    setLocalMin(clamped)
    onChange(clamped, localMax)
  }

  const commitMax = (val: number) => {
    const clamped = Math.min(maxLimit, Math.max(val, localMin + step))
    setLocalMax(clamped)
    onChange(localMin, clamped)
  }

  const handleSliderCommit = () => {
    onChange(localMin, localMax)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm text-[var(--text-secondary)]">
          Minimum budget
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={localMin}
            onChange={handleMinSliderChange}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            onKeyUp={handleSliderCommit}
            aria-label="Minimum budget"
            aria-valuemin={minLimit}
            aria-valuemax={localMax - step}
            aria-valuenow={localMin}
            aria-valuetext={`$${localMin}`}
            className="block h-11 w-full cursor-pointer accent-[var(--primary)]"
          />
        </label>
        <label className="block text-sm text-[var(--text-secondary)]">
          Maximum budget
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={localMax}
            onChange={handleMaxSliderChange}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            onKeyUp={handleSliderCommit}
            aria-label="Maximum budget"
            aria-valuemin={localMin + step}
            aria-valuemax={maxLimit}
            aria-valuenow={localMax}
            aria-valuetext={`$${localMax}`}
            className="block h-11 w-full cursor-pointer accent-[var(--primary)]"
          />
        </label>
      </div>

      {/* Numeric inputs row */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label
            htmlFor={`${inputId}-min`}
            className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] block mb-1"
          >
            Min ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--text-muted)]">
              $
            </span>
            <input
              id={`${inputId}-min`}
              aria-label="Minimum price"
              type="number"
              min={minLimit}
              max={localMax - step}
              step={step}
              value={localMin}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              onBlur={(e) => commitMin(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitMin(Number((e.target as HTMLInputElement).value))
                }
              }}
              className="w-full h-11 pl-7 pr-2 rounded-lg border border-[var(--border)] bg-[var(--subtle)] text-sm font-mono text-[var(--foreground)] focus:border-[var(--focus-ring)] focus:bg-white  transition-colors"
            />
          </div>
        </div>

        <span className="text-[var(--text-muted)] text-sm font-medium self-end mb-2">—</span>

        <div className="flex-1">
          <label
            htmlFor={`${inputId}-max`}
            className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] block mb-1"
          >
            Max ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--text-muted)]">
              $
            </span>
            <input
              id={`${inputId}-max`}
              aria-label="Maximum price"
              type="number"
              min={localMin + step}
              max={maxLimit}
              step={step}
              value={localMax}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              onBlur={(e) => commitMax(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitMax(Number((e.target as HTMLInputElement).value))
                }
              }}
              className="w-full h-11 pl-7 pr-2 rounded-lg border border-[var(--border)] bg-[var(--subtle)] text-sm font-mono text-[var(--foreground)] focus:border-[var(--focus-ring)] focus:bg-white  transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

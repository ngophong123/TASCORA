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

  const minPercent = Math.max(
    0,
    Math.min(100, ((localMin - minLimit) / (maxLimit - minLimit)) * 100)
  )
  const maxPercent = Math.max(
    0,
    Math.min(100, ((localMax - minLimit) / (maxLimit - minLimit)) * 100)
  )

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
      {/* Visual Dual Slider Track */}
      <div className="relative pt-2 pb-2">
        <div className="relative h-2 w-full rounded-full bg-[#EAEAF0]">
          {/* Active highlighted range bar */}
          <div
            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-600 to-sky-500"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
        </div>

        {/* Dual overlapping range inputs */}
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
          className="pointer-events-none absolute inset-0 h-2 w-full appearance-none bg-transparent accent-blue-600 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(37,99,235,0.4)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(37,99,235,0.4)]"
        />
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
          className="pointer-events-none absolute inset-0 h-2 w-full appearance-none bg-transparent accent-blue-600 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(37,99,235,0.4)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(37,99,235,0.4)]"
        />
      </div>

      {/* Numeric inputs row */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label
            htmlFor="min-price-input"
            className="text-[11px] font-medium uppercase tracking-wider text-[#6B6B7B] block mb-1"
          >
            Min ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#6B6B7B]">
              $
            </span>
            <input
              id="min-price-input"
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
              className="w-full h-9 pl-7 pr-2 rounded-lg border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] text-xs font-mono text-[#0A0A23] focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <span className="text-[#9CA3AF] text-sm font-medium self-end mb-2">—</span>

        <div className="flex-1">
          <label
            htmlFor="max-price-input"
            className="text-[11px] font-medium uppercase tracking-wider text-[#6B6B7B] block mb-1"
          >
            Max ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#6B6B7B]">
              $
            </span>
            <input
              id="max-price-input"
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
              className="w-full h-9 pl-7 pr-2 rounded-lg border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] text-xs font-mono text-[#0A0A23] focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

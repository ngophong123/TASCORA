"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { type ChartDataPoint } from "@/data/dashboard/overview"
import { cn } from "@/lib/utils"

interface RevenueAreaChartProps {
  title: string
  subtitle?: string
  dataByRange: Record<"7d" | "30d" | "90d" | "12m", ChartDataPoint[]>
  currencyPrefix?: string
  badgeText?: string
  className?: string
}

export function RevenueAreaChart({
  title,
  subtitle,
  dataByRange,
  currencyPrefix = "$",
  badgeText,
  className,
}: RevenueAreaChartProps) {
  const [range, setRange] = React.useState<"7d" | "30d" | "90d" | "12m">("30d")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentData = dataByRange[range] || dataByRange["30d"]

  // Calculate total in current view
  const totalAmount = React.useMemo(() => {
    return currentData.reduce((acc, item) => acc + item.amount, 0)
  }, [currentData])

  return (
    <div
      className={cn(
        "p-5 sm:p-6 rounded-2xl bg-white border border-[rgba(15,15,30,0.08)] shadow-xs flex flex-col justify-between",
        className
      )}
    >
      {/* Top Header: Title, Total & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[rgba(15,15,30,0.06)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0A0A23] tracking-tight">{title}</h3>
            {badgeText && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                {badgeText}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-[#0A0A23] font-mono">
              {currencyPrefix}
              {totalAmount.toLocaleString()}
            </span>
            <span className="text-xs text-[#6B6B7B]">{subtitle || `total in selected period`}</span>
          </div>
        </div>

        {/* Range Tabs */}
        <div
          className="flex items-center p-1 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] self-start sm:self-auto"
          role="tablist"
          aria-label="Chart time range"
        >
          {(["7d", "30d", "90d", "12m"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={range === tab}
              onClick={() => setRange(tab)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                range === tab
                  ? "bg-white text-blue-900 shadow-2xs font-bold"
                  : "text-[#6B6B7B] hover:text-[#0A0A23]"
              )}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="w-full h-64 sm:h-72 mt-6">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,15,30,0.06)" />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#8B8B9B" }}
                dy={6}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#8B8B9B" }}
                tickFormatter={(val) => `${currencyPrefix}${val >= 1000 ? `${val / 1000}k` : val}`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  const firstPayload = payload?.[0]
                  if (active && firstPayload) {
                    const data = firstPayload.payload as ChartDataPoint
                    return (
                      <div className="bg-white p-3 rounded-xl border border-[rgba(15,15,30,0.12)] shadow-xl text-xs space-y-1">
                        <span className="font-semibold text-[#6B6B7B] block">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span className="font-mono font-bold text-sm text-[#0A0A23]">
                            {currencyPrefix}
                            {data.amount.toLocaleString()}
                          </span>
                        </div>
                        {data.secondary !== undefined && (
                          <span className="text-[11px] text-[#6B6B7B] block font-medium">
                            {data.secondary} milestone orders
                          </span>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Area
                type="monotone"
                dataKey="amount"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartGradient)"
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full rounded-xl bg-gray-50 animate-pulse flex items-center justify-center text-xs text-[#8B8B9B]">
            Loading chart analytics...
          </div>
        )}
      </div>

      {/* Screen Reader Accessible Summary Table */}
      <table className="sr-only">
        <caption>{title} data table summary</caption>
        <thead>
          <tr>
            <th>Period</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>${d.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

"use client"

import * as React from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { TrendingUp, BarChart3 } from "lucide-react"
import { type RevenueMonthPoint } from "@/data/dashboard/payments"
import { cn } from "@/lib/utils"

interface RevenueBarChartProps {
  data: RevenueMonthPoint[]
  className?: string
}

export function RevenueBarChart({ data, className }: RevenueBarChartProps) {
  const [mounted, setMounted] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"6m" | "1y" | "all">("6m")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate stats
  const totalGross = React.useMemo(() => data.reduce((acc, d) => acc + d.gross, 0), [data])
  const avgMonthly = Math.round(totalGross / (data.length || 1))
  const bestMonth = data.reduce(
    (max, d) => (d.gross > max.gross ? d : max),
    data[0] || { month: "Aug", gross: 0 }
  )

  return (
    <div
      className={cn(
        "p-5 sm:p-6 rounded-2xl bg-white border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[rgba(15,15,30,0.06)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold text-[#0A0A23] tracking-tight">
              Monthly Revenue Performance
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="h-3 w-3" />
              +24.5% MoM
            </span>
          </div>
          <p className="text-xs text-[#6B6B7B] mt-1">
            Cleared revenue and net payouts across completed contract milestones.
          </p>
        </div>

        {/* Range Selector & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-[#6B6B7B] mr-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
              <span>Gross Cleared</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-200" />
              <span>Net Payout</span>
            </div>
          </div>

          {/* Time range buttons */}
          <div className="flex items-center gap-1 bg-[#F4F4F8] p-1 rounded-xl">
            {(
              [
                { key: "6m", label: "Last 6 Mo" },
                { key: "1y", label: "2026 YTD" },
                { key: "all", label: "All Time" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-[#0A0A23] shadow-xs"
                    : "text-[#6B6B7B] hover:text-[#0A0A23]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights strip */}
      <div className="grid grid-cols-3 gap-3 py-4 border-b border-[rgba(15,15,30,0.06)] bg-[#FAFAFC]/60 -mx-5 px-5 sm:-mx-6 sm:px-6">
        <div>
          <span className="text-[11px] text-[#6B6B7B] block">Total Cleared (6 Mo)</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#0A0A23]">
            ${totalGross.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#6B6B7B] block">Avg. Monthly Volume</span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#0A0A23]">
            ${avgMonthly.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#6B6B7B] block">Peak Record Month</span>
          <span className="text-base sm:text-lg font-bold font-mono text-blue-700">
            ${bestMonth?.gross.toLocaleString()} ({bestMonth?.month})
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full pt-4">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,15,30,0.06)" />
              <XAxis
                dataKey="month"
                stroke="#6B6B7B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#6B6B7B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
                dx={-4}
              />
              <Tooltip
                content={({ active, payload }) => {
                  const firstPayload = payload?.[0]
                  if (active && firstPayload) {
                    const d = firstPayload.payload as RevenueMonthPoint
                    return (
                      <div className="bg-white p-3 rounded-xl border border-[rgba(15,15,30,0.12)] shadow-lg space-y-1.5 min-w-[170px]">
                        <div className="flex items-center justify-between pb-1 border-b border-[rgba(15,15,30,0.06)]">
                          <span className="text-xs font-semibold text-[#0A0A23]">
                            {d.month} 2026
                          </span>
                          <span className="text-[10px] text-[#6B6B7B]">
                            {d.ordersCount} projects
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-[#4B4B5C]">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            Gross Cleared:
                          </span>
                          <span className="font-mono font-bold text-[#0A0A23]">
                            ${d.gross.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-[#6B6B7B]">
                            <span className="h-2 w-2 rounded-full bg-blue-300" />
                            Net Deposited:
                          </span>
                          <span className="font-mono font-medium text-[#4B4B5C]">
                            ${d.net.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="gross" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="net" fill="#BFDBFE" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[#FAFAFC] rounded-xl text-xs text-[#6B6B7B]">
            Loading revenue analytics...
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useDashboard } from "@/context/DashboardContext"
import {
  FREELANCER_STATS,
  CLIENT_STATS,
  FREELANCER_CHART_DATA,
  CLIENT_CHART_DATA,
  FREELANCER_ACTIVE_ORDERS,
  CLIENT_ACTIVE_ORDERS,
  RECENT_ACTIVITIES,
  PROFILE_CHECKLIST,
  RECOMMENDED_SPECIALISTS,
} from "@/data/dashboard/overview"
import { StatCard } from "@/components/dashboard/overview/StatCard"
import { RevenueAreaChart } from "@/components/dashboard/overview/RevenueAreaChart"
import { ActiveOrdersTable } from "@/components/dashboard/overview/ActiveOrdersTable"
import { ActivityFeed } from "@/components/dashboard/overview/ActivityFeed"
import { ProfileStrengthCard } from "@/components/dashboard/overview/ProfileStrengthCard"
import { RecommendedSpecialists } from "@/components/dashboard/overview/RecommendedSpecialists"
import { Sparkles, PlusCircle, Compass } from "lucide-react"

export default function DashboardOverviewPage() {
  const { role } = useDashboard()

  const isFreelancer = role === "FREELANCER"
  const stats = isFreelancer ? FREELANCER_STATS : CLIENT_STATS
  const chartData = isFreelancer ? FREELANCER_CHART_DATA : CLIENT_CHART_DATA
  const orders = isFreelancer ? FREELANCER_ACTIVE_ORDERS : CLIENT_ACTIVE_ORDERS

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(15,15,30,0.06)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{isFreelancer ? "Creator Studio" : "Client Workspace"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B0B14] tracking-tight">
            Welcome back, Alexandre
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B7B] mt-1 leading-relaxed max-w-2xl">
            {isFreelancer
              ? "Track your revenue growth, fulfill active milestone orders on schedule, and monitor your delivery metrics."
              : "Review incoming milestone deliverables, approve escrow payment releases, and manage your hired specialists."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isFreelancer ? (
            <Link
              href="/dashboard/gigs"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-semibold shadow-md hover:from-blue-700 hover:to-sky-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Gig</span>
            </Link>
          ) : (
            <Link
              href="/services"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-semibold shadow-md hover:from-blue-700 hover:to-sky-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span>Hire Specialists</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Stat Cards Grid (4 Cards with Sparklines & Delta Badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <StatCard key={item.id} data={item} />
        ))}
      </div>

      {/* 3. Main Revenue / Spending Area Chart (Recharts) */}
      <RevenueAreaChart
        title={isFreelancer ? "Earnings Analytics" : "Escrow Spending Analytics"}
        subtitle={isFreelancer ? "gross revenue in selected period" : "milestone disbursements"}
        dataByRange={chartData}
        badgeText={isFreelancer ? "Gross Revenue" : "Escrow Cleared"}
      />

      {/* 4. Two-Column Row: Active Orders Table & Sidebar (Activity / Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active Orders Table (2/3 width) */}
        <div className="lg:col-span-2">
          <ActiveOrdersTable orders={orders} role={role} />
        </div>

        {/* Right Side Column (1/3 width): Profile Strength or Activity Feed */}
        <div className="space-y-6">
          {isFreelancer && <ProfileStrengthCard checklist={PROFILE_CHECKLIST} />}
          <ActivityFeed activities={RECENT_ACTIVITIES} />
        </div>
      </div>

      {/* 5. Client Mode Only: Recommended Specialists Showcase */}
      {!isFreelancer && <RecommendedSpecialists specialists={RECOMMENDED_SPECIALISTS} />}
    </div>
  )
}

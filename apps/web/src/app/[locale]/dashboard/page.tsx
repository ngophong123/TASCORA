"use client"

import * as React from "react"
import { AccountOnboardingPanel } from "@/components/dashboard/AccountOnboardingPanel"
import { Link } from "@/i18n/routing"
import { useDashboard } from "@/context/DashboardContext"
import type { OverviewStatCardData, ActiveOrderRow, ActivityItem } from "@/data/dashboard/overview"
import { profileName, imageUrl, type Service } from "@/lib/marketplace"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { StatCard } from "@/components/dashboard/overview/StatCard"
import { ActiveOrdersTable } from "@/components/dashboard/overview/ActiveOrdersTable"
import { ActivityFeed } from "@/components/dashboard/overview/ActivityFeed"
import { PlusCircle, Compass } from "lucide-react"

export default function DashboardOverviewPage() {
  const { role, rawOrders, ordersLoading, ordersError, reloadOrders, account } = useDashboard()
  const isFreelancer = role === "FREELANCER"
  const services = useApiResource<Service[]>(
    isFreelancer && account ? "/api/v1/services/seller/me" : null
  )
  const stat = (id: string, label: string, value: string): OverviewStatCardData => ({
    id,
    label,
    value,
    delta: "",
    isPositive: true,
    sparkline: [],
    subtext: "",
    iconName: "ShoppingBag",
    iconColor: "text-blue-600 bg-blue-50",
  })
  const stats = [
    stat(
      "active",
      "Active orders",
      String(rawOrders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status)).length)
    ),
    stat(
      "completed",
      "Completed orders",
      String(rawOrders.filter((o) => o.status === "COMPLETED").length)
    ),
    stat(
      "services",
      isFreelancer ? "Your services" : "Purchases",
      isFreelancer
        ? services.data
          ? String(services.data.length)
          : "Unavailable"
        : String(rawOrders.length)
    ),
  ]
  const orders: ActiveOrderRow[] = rawOrders.map((o) => ({
    id: o.id,
    title: o.service.title,
    counterpartName: profileName(isFreelancer ? o.buyer?.buyerProfile : o.seller),
    counterpartAvatar: imageUrl(isFreelancer ? o.buyer?.buyerProfile?.avatar : o.seller?.avatar),
    counterpartRole: isFreelancer ? "Customer" : "Seller",
    amount: `$${o.amount}`,
    status:
      o.status === "COMPLETED"
        ? "completed"
        : o.status === "DELIVERED"
          ? "delivered"
          : o.status === "PENDING"
            ? "pending"
            : "in_progress",
    dueDate: o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : "Not scheduled",
    progressPercent: 0,
    currentMilestone: o.status,
    totalMilestones: 0,
  }))
  const activities: ActivityItem[] = rawOrders.flatMap((o) =>
    (o.activities || []).map((a) => ({
      id: a.id,
      type: "order" as const,
      title: o.service.title,
      description: a.description,
      timestamp: new Date(a.createdAt).toLocaleString(),
      user: {
        name: profileName(isFreelancer ? o.buyer?.buyerProfile : o.seller),
        avatar: imageUrl(isFreelancer ? o.buyer?.buyerProfile?.avatar : o.seller?.avatar),
      },
    }))
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {account?.role === "ADMIN" && (
        <Link href="/dashboard/admin" className="underline">
          Marketplace review
        </Link>
      )}
      <ApiState loading={ordersLoading} error={ordersError} retry={reloadOrders} />
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-default">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold mb-3">
            <span>{isFreelancer ? "Creator Studio" : "Client Workspace"}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-foreground tracking-tight">
            Welcome back, {profileName(account?.sellerProfile || account?.buyerProfile)}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed max-w-2xl">
            {isFreelancer
              ? "Manage your services and fulfill orders on schedule, and monitor your delivery metrics."
              : "Review deliveries, track your orders, and work with your specialists."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isFreelancer ? (
            <Link
              href="/dashboard/gigs"
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors motion-reduce:transition-none"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Manage Services</span>
            </Link>
          ) : (
            <Link
              href="/services"
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors motion-reduce:transition-none"
            >
              <Compass className="w-4 h-4" />
              <span>Hire Specialists</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Stat Cards Grid (4 Cards with Sparklines & Delta Badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!ordersLoading &&
          !ordersError &&
          stats.map((item) => <StatCard key={item.id} data={item} />)}
      </div>

      {/* 3. Main Revenue / Spending Area Chart (Recharts) */}
      <section className="rounded-lg border border-border-default bg-bg-subtle p-4 text-sm leading-6 text-text-secondary">
        Earnings and settlement analytics are unavailable until financial release and payout
        workflows are implemented.
      </section>

      {/* 4. Two-Column Row: Active Orders Table & Sidebar (Activity / Checklist) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Active Orders Table (2/3 width) */}
        <div className="xl:col-span-2">
          <ActiveOrdersTable orders={orders} role={role} />
        </div>

        {/* Right Side Column (1/3 width): Profile Strength or Activity Feed */}
        <div className="space-y-6">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      <AccountOnboardingPanel mode={role} />
    </div>
  )
}

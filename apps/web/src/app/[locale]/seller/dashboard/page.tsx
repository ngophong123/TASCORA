"use client"

import { apiFetch } from "@/lib/auth-client"
import { AccountOnboardingPanel } from "@/components/dashboard/AccountOnboardingPanel"
import { SellerFinancialOverview } from "@/components/dashboard/payments/SellerFinancialOverview"
import * as React from "react"
import { Link } from "@/i18n/routing"
import { DollarSign, ShoppingBag, Star, Plus, CheckCircle2, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SellerDashboard() {
  const [metrics, setMetrics] = React.useState<{
    totalEarnings: number | null
    activeOrdersCount: number
    completedOrdersCount: number
    averageRating: number
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  React.useEffect(() => {
    let active = true
    async function loadMetrics() {
      try {
        if (!localStorage.getItem("user"))
          throw new Error("Sign in with a verified seller account to load your metrics.")
        const response = await apiFetch("/api/v1/analytics/seller/dashboard")
        if (!response.ok)
          throw new Error("Sign in with a verified seller account to load your metrics.")
        const result = await response.json()
        if (active) setMetrics(result.data)
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Metrics unavailable.")
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadMetrics()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
      <AccountOnboardingPanel />
      <SellerFinancialOverview />
      {loading && <p role="status">Loading account metrics?</p>}
      {error && <p role="alert">{error}</p>}
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <Link href="/" className="hover:text-text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Seller Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl text-text-primary font-medium">
              Freelancer Operations Hub
            </h1>
            <Badge variant="luxury" className="hidden sm:inline-flex gap-1">
              <Award className="h-3 w-3 text-accent" />
              Seller Studio
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage your service packages, delivery pipelines, earnings, and client ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/gigs/new">
            <Button
              size="sm"
              className="rounded-full bg-accent hover:bg-accent-hover text-white gap-1.5 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Service</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-border bg-surface text-xs text-text-secondary hover:text-text-primary"
            >
              Switch to Client Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
        {[
          {
            label: "Available earnings",
            value: "Unavailable",
            sub: "Financial settlement is unavailable",
            icon: DollarSign,
            color: "text-emerald-500",
          },
          {
            label: "Active In Pipeline",
            value: metrics ? `${metrics.activeOrdersCount} orders` : "?",
            sub: "Active order count",
            icon: ShoppingBag,
            color: "text-accent",
          },
          {
            label: "Orders Delivered",
            value: metrics ? `${metrics.completedOrdersCount}` : "?",
            sub: "Completed order count",
            icon: CheckCircle2,
            color: "text-blue-500",
          },
          {
            label: "Client Rating Score",
            value: metrics ? metrics.averageRating.toFixed(2) : "?",
            sub: "Recorded seller rating",
            icon: Star,
            color: "text-amber-500",
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <span className="font-sans text-3xl font-bold text-text-primary tracking-tight">
                  {stat.value}
                </span>
                <p className="text-[11px] text-text-secondary mt-1">{stat.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      <section className="rounded-xl border p-5">
        <Link href="/dashboard/orders" className="underline">
          View your live sales and order management
        </Link>
      </section>
    </div>
  )
}

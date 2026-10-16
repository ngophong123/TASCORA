"use client"

import { apiFetch } from "@/lib/auth-client"
import { AccountOnboardingPanel } from "@/components/dashboard/AccountOnboardingPanel"
import { SellerFinancialOverview } from "@/components/dashboard/payments/SellerFinancialOverview"
import * as React from "react"
import { Link } from "@/i18n/routing"
import { ShoppingBag, Star, Plus, CheckCircle2, ArrowRight } from "lucide-react"

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
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-5 border-b border-border-default pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="premium-eyebrow mb-3">Seller Studio</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Your work, in focus.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
            Manage your services, review orders, and keep client conversations moving.
          </p>
        </div>
        <Link
          href="/dashboard/gigs/new"
          className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          <span>Create New Service</span>
        </Link>
      </div>
      {loading && (
        <p role="status" className="text-sm text-text-secondary">
          Loading account metrics…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-status-danger/30 bg-status-danger/5 p-4 text-sm text-status-danger"
        >
          {error}
        </p>
      )}
      {metrics && (
        <section aria-label="Seller metrics" className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active orders", value: String(metrics.activeOrdersCount), icon: ShoppingBag },
            {
              label: "Completed orders",
              value: String(metrics.completedOrdersCount),
              icon: CheckCircle2,
            },
            {
              label: "Average rating",
              value:
                metrics.averageRating > 0 ? metrics.averageRating.toFixed(2) : "No ratings yet",
              icon: Star,
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border-default bg-bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-normal text-text-secondary">{stat.label}</h2>
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                </div>
                <p
                  className={`mt-4 font-medium tracking-tight ${stat.value === "No ratings yet" ? "text-base text-text-muted" : "text-3xl tabular-nums"}`}
                >
                  {stat.value}
                </p>
              </div>
            )
          })}
        </section>
      )}
      <nav aria-label="Seller workspace" className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/dashboard/gigs",
            title: "Your services",
            detail: "Review your listings and service packages.",
          },
          {
            href: "/dashboard/orders",
            title: "View your live sales and order management",
            detail: "Check orders and delivery updates.",
          },
          {
            href: "/dashboard/messages",
            title: "Messages",
            detail: "Continue conversations with your clients.",
          },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-border-default bg-bg-surface p-5 hover:border-border-hover"
          >
            <div className="flex min-h-11 items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">{link.title}</h2>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{link.detail}</p>
          </Link>
        ))}
      </nav>
      <SellerFinancialOverview />
      <AccountOnboardingPanel />
    </div>
  )
}

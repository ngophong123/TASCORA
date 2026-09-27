"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import {
  DollarSign,
  ShoppingBag,
  Star,
  Plus,
  CheckCircle2,
  Eye,
  Award,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SellerDashboard() {
  const [metrics, setMetrics] = React.useState({
    totalEarnings: 3850,
    activeOrders: 3,
    completedOrders: 28,
    profileViews: 412,
    conversionRate: 6.8,
  })
  const [, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadMetrics() {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
          const res = await fetch(`${apiUrl}/api/v1/analytics/seller/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.data) {
              setMetrics((prev) => ({ ...prev, ...data.data }))
            }
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    void loadMetrics()
  }, [])

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
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
              Level 2 Specialist
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage your service packages, delivery pipelines, earnings, and client ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/seller/services/new">
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
            label: "Total Net Revenue",
            value: `$${metrics.totalEarnings.toLocaleString()}`,
            sub: "+14.2% from last cycle",
            icon: DollarSign,
            color: "text-emerald-500",
          },
          {
            label: "Active In Pipeline",
            value: `${metrics.activeOrders} orders`,
            sub: "1 due in next 24h",
            icon: ShoppingBag,
            color: "text-accent",
          },
          {
            label: "Orders Delivered",
            value: `${metrics.completedOrders}`,
            sub: "99.2% on-time rate",
            icon: CheckCircle2,
            color: "text-blue-500",
          },
          {
            label: "Client Rating Score",
            value: "4.98 ★",
            sub: "From 42 verified reviews",
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

      {/* Level Progress Banner */}
      <div className="rounded-2xl border border-accent/25 bg-surface p-6 my-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="font-display text-lg text-text-primary font-medium">
                Progress to Top Rated Status
              </h3>
            </div>
            <p className="text-xs text-text-muted max-w-xl">
              Maintain a 4.9+ rating and complete 2 more escrow deliveries to qualify for Top Rated
              badge and priority marketplace placement.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-text-primary">85% Complete</span>
              <span className="text-[10px] text-text-muted block">Next tier: Top Rated</span>
            </div>
            <div className="w-32 h-2 rounded-full bg-surface-elevated overflow-hidden border border-border">
              <div className="h-full bg-accent rounded-full w-[85%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections: Orders Pipeline & Published Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Delivery Pipeline (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl text-text-primary font-medium">
                  Order Execution Pipeline
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Manage deliverables and submit revisions to clients
                </p>
              </div>
              <Badge variant="luxury">3 Active</Badge>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "ORD-9481",
                  service: "Full-Stack Next.js 15 & Node.js Production Architecture",
                  client: "Marcus Thorne (Fintech UK)",
                  price: "$350.00",
                  deadline: "Tomorrow at 18:00 UTC",
                  status: "IN_PROGRESS",
                  statusLabel: "In Production",
                  badgeVariant: "warning",
                },
                {
                  id: "ORD-8923",
                  service: "Autonomous AI Agents & Workflow Automation",
                  client: "Sarah Lin (Acro Bio)",
                  price: "$250.00",
                  deadline: "Delivered (Awaiting Approval)",
                  status: "DELIVERED",
                  statusLabel: "Delivered",
                  badgeVariant: "luxury",
                },
                {
                  id: "ORD-8710",
                  service: "High-Converting B2B SaaS Growth & Funnel Strategy",
                  client: "David Chen (Scale AI)",
                  price: "$190.00",
                  deadline: "3 days remaining",
                  status: "IN_PROGRESS",
                  statusLabel: "Requirements Approved",
                  badgeVariant: "default",
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-accent/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent">{order.id}</span>
                      <Badge
                        variant={
                          order.badgeVariant as
                            | "default"
                            | "secondary"
                            | "outline"
                            | "success"
                            | "warning"
                            | "luxury"
                            | "cyan"
                            | "gradient"
                        }
                      >
                        {order.statusLabel}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm text-text-primary line-clamp-1">
                      {order.service}
                    </h4>
                    <p className="text-xs text-text-muted">
                      Client: <span className="text-text-primary font-medium">{order.client}</span>{" "}
                      • <span className="text-emerald-600 font-semibold">{order.price}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-text-muted uppercase block">Deadline</span>
                      <span className="text-xs text-text-primary font-medium">
                        {order.deadline}
                      </span>
                    </div>
                    <Link href={`/dashboard/messages?orderId=${order.id}`}>
                      <Button size="sm" variant="outline" className="text-xs border-border">
                        Message
                      </Button>
                    </Link>
                    {order.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        className="text-xs bg-accent hover:bg-accent-hover text-white"
                      >
                        Deliver Work
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Published Services (1/3) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-text-primary font-medium">
                My Active Services
              </h3>
              <Link
                href="/seller/services/new"
                className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="h-3 w-3" />
                New
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Full-Stack Next.js 15 & Node.js Production Architecture",
                  startingPrice: "$250",
                  views: 184,
                  orders: 14,
                  status: "Active",
                },
                {
                  title: "Autonomous AI Agents & LLM Workflow Integration",
                  startingPrice: "$350",
                  views: 228,
                  orders: 12,
                  status: "Active",
                },
              ].map((srv, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface-elevated border border-border space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-medium text-text-primary line-clamp-2 leading-snug">
                      {srv.title}
                    </h4>
                    <Badge variant="success" className="text-[10px]">
                      Published
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-border/40">
                    <span>
                      From <strong className="text-text-primary">{srv.startingPrice}</strong>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {srv.views}
                      </span>
                      <span>•</span>
                      <span>{srv.orders} sold</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/seller/services" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs border-border">
                Manage All Services
              </Button>
            </Link>
          </div>

          {/* Quick Guidance */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-3 text-xs shadow-sm">
            <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
              Seller Protection
            </h4>
            <p className="text-text-muted leading-relaxed">
              All deliveries require client confirmation or auto-complete after 72 hours under Phase
              26 automated worker rules. Escrow payments guarantee your payout.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import {
  Search,
  Plus,
  Edit3,
  PauseCircle,
  PlayCircle,
  Trash2,
  Star,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { type DashboardGig } from "@/data/dashboard/gigs"
import { useDashboard } from "@/context/DashboardContext"

interface GigsListProps {
  initialGigs: DashboardGig[]
}

export function GigsList({ initialGigs }: GigsListProps) {
  const { showToast } = useDashboard()
  const [gigs, setGigs] = React.useState<DashboardGig[]>(initialGigs)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "draft" | "paused">(
    "all"
  )

  const handleToggleStatus = (gigId: string) => {
    setGigs((prev) =>
      prev.map((g) => {
        if (g.id === gigId) {
          const newStatus = g.status === "active" ? "paused" : "active"
          showToast({
            title: `Gig ${newStatus === "active" ? "Activated" : "Paused"}`,
            message: `"${g.title}" is now ${newStatus}.`,
            type: "success",
          })
          return { ...g, status: newStatus }
        }
        return g
      })
    )
  }

  const handleDelete = (gigId: string, title: string) => {
    setGigs((prev) => prev.filter((g) => g.id !== gigId))
    showToast({
      title: "Gig Removed",
      message: `"${title}" has been removed from your active catalog.`,
      type: "info",
    })
  }

  const filteredGigs = gigs.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))

    if (statusFilter === "all") return matchesSearch
    return matchesSearch && g.status === statusFilter
  })

  // Summary counts
  const totalOrders = gigs.reduce((acc, g) => acc + g.stats.orders, 0)
  const totalRevenue = gigs.reduce((acc, g) => acc + g.stats.revenue, 0)
  const totalImpressions = gigs.reduce((acc, g) => acc + g.stats.impressions, 0)

  return (
    <div className="space-y-6">
      {/* Top Stat Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6B6B7B] block font-medium">Total Gig Orders</span>
            <span className="text-2xl font-bold font-mono text-[#0B0B14] mt-1 block">
              {totalOrders}
            </span>
          </div>
          <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <ShoppingBag className="h-5 w-5" />
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6B6B7B] block font-medium">
              Lifetime Catalog Revenue
            </span>
            <span className="text-2xl font-bold font-mono text-[#0B0B14] mt-1 block">
              ${totalRevenue.toLocaleString()}
            </span>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <DollarSign className="h-5 w-5" />
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6B6B7B] block font-medium">
              Marketplace Impressions
            </span>
            <span className="text-2xl font-bold font-mono text-[#0B0B14] mt-1 block">
              {totalImpressions.toLocaleString()}
            </span>
          </div>
          <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <TrendingUp className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Gigs Table Container */}
      <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[rgba(15,15,30,0.06)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#0B0B14] tracking-tight">
              Published Gigs & Services
            </h3>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#F4F4F8] text-[#4B4B5C]">
              {gigs.length} Total
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B7B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gigs or tags..."
                className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] pl-8.5 pr-3 py-1.5 text-xs text-[#0B0B14] placeholder:text-[#6B6B7B] outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Create New Gig CTA */}
            <Link href="/dashboard/gigs/new">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-medium text-xs shadow-sm h-8.5 px-3.5 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Gig</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#FAFAFC]/60 border-b border-[rgba(15,15,30,0.06)] flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: "all", label: `All Gigs (${gigs.length})` },
              {
                id: "active",
                label: `Active (${gigs.filter((g) => g.status === "active").length})`,
              },
              {
                id: "paused",
                label: `Paused (${gigs.filter((g) => g.status === "paused").length})`,
              },
              { id: "draft", label: `Draft (${gigs.filter((g) => g.status === "draft").length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-blue-700 shadow-xs border border-[rgba(15,15,30,0.08)]"
                  : "text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#F4F4F8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gigs List */}
        <div className="divide-y divide-[rgba(15,15,30,0.04)]">
          {filteredGigs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-[#6B6B7B]">No gigs found matching your filter criteria.</p>
              <Link href="/dashboard/gigs/new">
                <Button variant="outline" size="sm" className="text-xs text-blue-700">
                  Create your first gig
                </Button>
              </Link>
            </div>
          ) : (
            filteredGigs.map((gig) => (
              <div
                key={gig.id}
                className="p-4 sm:p-5 hover:bg-[#FAFAFC]/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Title */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <img
                    src={gig.coverImage}
                    alt={gig.title}
                    className="h-16 w-24 rounded-xl object-cover border border-[rgba(15,15,30,0.08)] shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {gig.category}
                      </span>
                      <StatusBadge status={gig.status} size="sm" />
                      <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {gig.rating} ({gig.reviewsCount})
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-[#0B0B14] hover:text-blue-600 transition-colors line-clamp-1">
                      {gig.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B6B7B]">
                      <span>
                        Starting at{" "}
                        <strong className="font-mono text-[#0B0B14] font-bold">
                          ${gig.startingPrice}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>Updated {gig.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Analytics Metrics */}
                <div className="grid grid-cols-4 gap-4 px-2 md:px-6 py-2 md:py-0 border-y md:border-y-0 md:border-x border-[rgba(15,15,30,0.06)] text-center shrink-0">
                  <div>
                    <span className="text-[10px] text-[#6B6B7B] block uppercase tracking-wider">
                      Impressions
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#0B0B14]">
                      {gig.stats.impressions.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B6B7B] block uppercase tracking-wider">
                      Clicks
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#0B0B14]">
                      {gig.stats.clicks.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B6B7B] block uppercase tracking-wider">
                      Orders
                    </span>
                    <span className="font-mono text-xs font-semibold text-blue-700">
                      {gig.stats.orders}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B6B7B] block uppercase tracking-wider">
                      Revenue
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600">
                      ${gig.stats.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-1.5 shrink-0">
                  <Link href={`/dashboard/gigs/new?edit=${gig.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] flex items-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </Link>

                  <Button
                    onClick={() => handleToggleStatus(gig.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] flex items-center gap-1"
                    title={gig.status === "active" ? "Pause gig" : "Activate gig"}
                  >
                    {gig.status === "active" ? (
                      <>
                        <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Activate</span>
                      </>
                    )}
                  </Button>

                  <Link href={`/services/${gig.slug}`} target="_blank">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[#6B6B7B] hover:text-[#0B0B14]"
                      title="View Public Service Page"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleDelete(gig.id, gig.title)}
                    className="p-2 text-[#6B6B7B] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete gig"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

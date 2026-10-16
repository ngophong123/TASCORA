"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { Search, Plus, Edit3, PauseCircle, PlayCircle, Star, ArrowUpRight } from "lucide-react"
import { UploadImage } from "@/components/ui/UploadImage"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { type DashboardGig } from "@/data/dashboard/gigs"
import { requestData, jsonRequest } from "@/lib/marketplace"
import { useDashboard } from "@/context/DashboardContext"

type SellerGig = DashboardGig & { serverStatus?: string }

interface GigsListProps {
  initialGigs: SellerGig[]
}

export function GigsList({ initialGigs }: GigsListProps) {
  const { showToast } = useDashboard()
  const [gigs, setGigs] = React.useState<SellerGig[]>(initialGigs)
  React.useEffect(() => setGigs(initialGigs), [initialGigs])
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "draft" | "paused">(
    "all"
  )

  const handleToggleStatus = async (gigId: string) => {
    const current = gigs.find((g) => g.id === gigId)
    if (!current) return
    const status = current.status === "active" ? "PAUSED" : "DRAFT"
    try {
      await requestData(
        `/api/v1/marketplace/services/${gigId}/status`,
        jsonRequest("PUT", { status })
      )
      setGigs((prev) =>
        prev.map((g) =>
          g.id === gigId
            ? { ...g, serverStatus: status, status: status === "PAUSED" ? "paused" : "draft" }
            : g
        )
      )
      showToast({
        title: status === "PAUSED" ? "Service paused" : "Draft awaiting administrator review",
        type: "success",
      })
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "Status update failed",
        type: "error",
      })
    }
  }
  const handleDelete = async (gigId: string, title: string) => {
    void title
    try {
      await requestData(
        `/api/v1/marketplace/services/${gigId}/status`,
        jsonRequest("PUT", { status: "PAUSED" })
      )
      setGigs((prev) =>
        prev.map((g) => (g.id === gigId ? { ...g, serverStatus: "PAUSED", status: "paused" } : g))
      )
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "Unable to pause service",
        type: "error",
      })
    }
  }

  const filteredGigs = gigs.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))

    if (statusFilter === "all") return matchesSearch
    return matchesSearch && g.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Services", count: gigs.length },
          { label: "Published", count: gigs.filter((gig) => gig.status === "active").length },
          {
            label: "Drafts",
            count: gigs.filter((gig) =>
              gig.serverStatus ? gig.serverStatus === "DRAFT" : gig.status === "draft"
            ).length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
          >
            <p className="text-sm text-[var(--text-muted)]">{item.label}</p>
            <p className="mt-2 text-2xl font-medium tabular-nums">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Gigs Table Container */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)]  overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--foreground)] tracking-tight">
              Your service catalog
            </h3>
            <span className="text-sm tabular-nums font-medium px-2 py-0.5 rounded-full bg-[var(--subtle)] text-[var(--text-secondary)]">
              {gigs.length} Total
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="search"
                aria-label="Search your services or tags"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gigs or tags..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--subtle)] pl-8.5 pr-3 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)]  focus:bg-[var(--surface)] focus:border-[var(--focus-ring)] focus:ring-1 focus:ring-[var(--focus-ring)] transition-colors motion-reduce:transition-none"
              />
            </div>

            {/* Create New Gig CTA */}
            <Link href="/dashboard/gigs/new">
              <Button
                size="sm"
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm shadow-sm h-11 px-3.5 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Gig</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="px-4 sm:px-5 py-2.5 bg-[var(--subtle)] border-b border-[var(--border-subtle)] flex items-center gap-1 overflow-x-auto">
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
              type="button"
              aria-pressed={statusFilter === tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-11 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors motion-reduce:transition-none ${
                statusFilter === tab.id
                  ? "bg-[var(--surface)] text-[var(--primary)] shadow-xs border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--subtle)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gigs List */}
        <div className="divide-y divide-[var(--border-subtle)]">
          {filteredGigs.length === 0 ? (
            <div className="px-4 py-12 text-center space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                No services match your search or status filter.
              </p>
              <Link href="/dashboard/gigs/new">
                <Button variant="outline" size="sm" className="text-sm text-[var(--primary)]">
                  Create a service
                </Button>
              </Link>
            </div>
          ) : (
            filteredGigs.map((gig) => (
              <div
                key={gig.id}
                className="p-4 sm:p-5 hover:bg-[var(--subtle)] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Title */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <UploadImage
                    source={gig.coverImage}
                    alt={gig.title}
                    className="h-16 w-24 rounded-xl object-cover border border-[var(--border)] shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border)]">
                        {gig.category}
                      </span>
                      <StatusBadge status={gig.serverStatus || gig.status} size="sm" />
                      {gig.reviewsCount > 0 ? (
                        <span className="flex items-center gap-1 text-sm text-[var(--foreground)]">
                          <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                          {gig.rating} ({gig.reviewsCount})
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--text-muted)]">No reviews yet</span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-2">
                      {gig.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>
                        Starting at{" "}
                        <strong className="tabular-nums text-[var(--foreground)] font-semibold">
                          ${gig.startingPrice}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>Updated {new Date(gig.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-muted)]">
                  {Object.values(gig.tiers).filter((tier) => tier.title).length} packages
                </p>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-1.5 shrink-0">
                  <Link href={`/dashboard/gigs/${gig.id}/edit`}>
                    <Button
                      aria-label={`Edit ${gig.title}`}
                      variant="outline"
                      size="sm"
                      className="h-11 px-3 text-sm text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--subtle)] flex items-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </Link>

                  <Button
                    onClick={() => void handleToggleStatus(gig.id)}
                    variant="outline"
                    size="sm"
                    className="h-11 px-3 text-sm text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--subtle)] flex items-center gap-1"
                    aria-label={
                      gig.status === "active"
                        ? `Pause ${gig.title}`
                        : `Request review for ${gig.title}`
                    }
                    title={gig.status === "active" ? "Pause gig" : "Request review"}
                  >
                    {gig.status === "active" ? (
                      <>
                        <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Request review</span>
                      </>
                    )}
                  </Button>

                  <Link href={`/services/${gig.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 p-0 text-[var(--text-muted)] hover:text-[var(--foreground)]"
                      aria-label={`View ${gig.title} in a new tab`}
                      title="View Public Service Page"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  <button
                    type="button"
                    aria-label={`Pause service ${gig.title}`}
                    onClick={() => void handleDelete(gig.id, gig.title)}
                    className="flex h-11 w-11 items-center justify-center text-[var(--text-muted)] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Pause service"
                  >
                    <PauseCircle aria-hidden="true" className="h-4 w-4" />
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

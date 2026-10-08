"use client"

import * as React from "react"
import { useDashboard } from "@/context/DashboardContext"
import { type DashboardOrder } from "@/data/dashboard/orders"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { Search, X, Clock, ArrowRight, Eye, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrdersTableProps {
  onSelectOrder: (order: DashboardOrder) => void
}

type OrderStatusTab = "all" | "active" | "delivered" | "completed" | "cancelled"

export function OrdersTable({ onSelectOrder }: OrdersTableProps) {
  const { orders, role } = useDashboard()
  const isClient = role === "CLIENT"

  const [activeTab, setActiveTab] = React.useState<OrderStatusTab>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"newest" | "amount_desc" | "amount_asc">("newest")
  const [currentPage, setCurrentPage] = React.useState(1)
  const PAGE_SIZE = 6

  // Tab counts
  const tabCounts = React.useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter((o) => o.status === "active").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }
  }, [orders])

  // Filtered and sorted orders
  const filteredOrders = React.useMemo(() => {
    let result = [...orders]

    // Status Tab filter
    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab)
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          o.client.name.toLowerCase().includes(q) ||
          o.freelancer.name.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q)
      )
    }

    // Sorting
    switch (sortBy) {
      case "amount_desc":
        result.sort((a, b) => b.totalAmount - a.totalAmount)
        break
      case "amount_asc":
        result.sort((a, b) => a.totalAmount - b.totalAmount)
        break
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [orders, activeTab, searchQuery, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const paginatedOrders = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredOrders.slice(start, start + PAGE_SIZE)
  }, [filteredOrders, currentPage])

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, sortBy])

  const tabs: { id: OrderStatusTab; label: string; count: number }[] = [
    { id: "all", label: "All Orders", count: tabCounts.all },
    { id: "active", label: "Active", count: tabCounts.active },
    { id: "delivered", label: "Delivered", count: tabCounts.delivered },
    { id: "completed", label: "Completed", count: tabCounts.completed },
    { id: "cancelled", label: "Cancelled", count: tabCounts.cancelled },
  ]

  return (
    <div className="space-y-5">
      {/* 1. Status filters */}
      <div
        role="group"
        aria-label="Filter orders by status"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border-subtle)] no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              data-testid={`order-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-3.5 min-h-11 py-2 rounded-lg text-sm font-semibold transition-colors motion-reduce:transition-none whitespace-nowrap select-none",
                isActive
                  ? "text-[var(--primary)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--subtle)]"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs tabular-nums font-semibold transition-colors",
                  isActive
                    ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                    : "bg-[var(--subtle)] text-[var(--text-muted)]"
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 2. Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="search"
            aria-label="Search orders by ID, title or counterparty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, title, or counterparty..."
            className="w-full h-11 pl-10 pr-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:border-[var(--focus-ring)]  focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors motion-reduce:transition-none "
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear order search"
              onClick={() => setSearchQuery("")}
              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-[var(--text-muted)] font-medium hidden sm:inline">
            Sort by:
          </span>
          <select
            aria-label="Sort orders"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "amount_desc" | "amount_asc")}
            className="h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--foreground)] focus:border-[var(--focus-ring)]   cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* 3. Orders Content: Desktop Table & Mobile Stacked Cards */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]  overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">No orders found</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
              No orders match your selected filters or search query.
            </p>
            {(activeTab !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all")
                  setSearchQuery("")
                }}
                className="text-sm font-semibold text-[var(--primary)] hover:underline inline-flex min-h-11 items-center pt-1"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table data-testid="orders-table" className="min-w-[900px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--subtle)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <th scope="col" className="py-3 px-4">
                      Order ID & Scope
                    </th>
                    <th scope="col" className="py-3 px-4">
                      {isClient ? "Specialist" : "Client"}
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Tier
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Delivery
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      Order Amount
                    </th>
                    <th scope="col" className="py-3 px-4 text-center">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {paginatedOrders.map((order) => {
                    const counterpart = isClient ? order.freelancer : order.client

                    return (
                      <tr
                        key={order.id}
                        data-testid={`order-row-${order.id}`}
                        onClick={() => onSelectOrder(order)}
                        className="hover:bg-[var(--subtle)] transition-colors cursor-pointer group"
                      >
                        {/* Order ID & Scope */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="space-y-1">
                            <span className="tabular-nums text-sm font-semibold text-[var(--foreground)] break-all">
                              {order.id}
                            </span>
                            <h4 className="font-semibold text-sm text-[var(--foreground)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                              {order.title}
                            </h4>
                            <span className="text-xs text-[var(--text-muted)] block">
                              {order.category}
                            </span>
                          </div>
                        </td>

                        {/* Counterpart */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <AvatarImage
                              src={counterpart.avatar}
                              name={counterpart.name}
                              size={32}
                              rounded="full"
                              alt={counterpart.name}
                            />
                            <div className="truncate max-w-[130px]">
                              <span className="font-semibold text-sm text-[var(--foreground)] block truncate">
                                {counterpart.name}
                              </span>
                              <span className="text-xs text-[var(--text-muted)] block truncate">
                                {"title" in counterpart
                                  ? counterpart.title
                                  : "company" in counterpart
                                    ? counterpart.company
                                    : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border)]">
                            {order.tier}
                          </span>
                        </td>

                        {/* Delivery */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                              <span>{order.deliveryDate}</span>
                            </span>
                          </div>
                        </td>

                        {/* Escrow Amount */}
                        <td className="py-4 px-4 text-right">
                          <span className="tabular-nums font-semibold text-sm text-[var(--foreground)]">
                            ${Number(order.totalAmount).toFixed(2)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 text-center">
                          <StatusBadge status={order.serverStatus || order.status} />
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            aria-label={`View details for order ${order.id}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectOrder(order)
                            }}
                            className="inline-flex items-center gap-1 min-h-11 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] group-hover:bg-[var(--primary-subtle)] group-hover:border-[var(--border-hover)] group-hover:text-[var(--primary)] text-sm font-semibold text-[var(--foreground)] transition-colors motion-reduce:transition-none "
                          >
                            <span>Details</span>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards (< md) */}
            <div className="md:hidden divide-y divide-[var(--border-subtle)] p-2">
              {paginatedOrders.map((order) => {
                const counterpart = isClient ? order.freelancer : order.client
                return (
                  <div
                    key={order.id}
                    data-testid={`order-card-${order.id}`}
                    onClick={() => onSelectOrder(order)}
                    className="p-3.5 space-y-3 hover:bg-[var(--subtle)] rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="tabular-nums text-sm font-semibold text-[var(--foreground)] break-all">
                          {order.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--border)]">
                          {order.tier}
                        </span>
                      </div>
                      <StatusBadge status={order.serverStatus || order.status} />
                    </div>

                    <h4 className="text-sm font-semibold text-[var(--foreground)] leading-snug">
                      {order.title}
                    </h4>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm pt-1">
                      <div className="flex items-center gap-2">
                        <AvatarImage
                          src={counterpart.avatar}
                          name={counterpart.name}
                          size={24}
                          rounded="full"
                          alt={counterpart.name}
                        />
                        <span className="font-semibold text-[var(--foreground)]">
                          {counterpart.name}
                        </span>
                      </div>
                      <span className="tabular-nums font-semibold text-sm text-[var(--foreground)]">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)] pt-1">
                      <span>{order.deliveryDate}</span>
                      <button
                        type="button"
                        aria-label={`View details for order ${order.id}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectOrder(order)
                        }}
                        className="flex min-h-11 items-center gap-1.5 font-semibold text-[var(--primary)]"
                      >
                        <span>Details</span>
                        <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--subtle)] text-sm">
                <span className="text-[var(--text-muted)]">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] disabled:opacity-40 hover:bg-[var(--subtle)]"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="tabular-nums font-semibold px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] disabled:opacity-40 hover:bg-[var(--subtle)]"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

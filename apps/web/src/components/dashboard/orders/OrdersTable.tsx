"use client"

import * as React from "react"
import { useDashboard } from "@/context/DashboardContext"
import { type DashboardOrder } from "@/data/dashboard/orders"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { motion } from "framer-motion"
import {
  Search,
  X,
  ArrowUpDown,
  Clock,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Package,
} from "lucide-react"
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
      {/* 1. Status Tabs with Animated Indicator */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[rgba(15,15,30,0.06)] no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap select-none",
                isActive
                  ? "text-blue-900 font-bold"
                  : "text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#FAFAFC]"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-800"
                    : "bg-[#F4F4F8] text-[#8B8B9B]"
                )}
              >
                {tab.count}
              </span>

              {isActive && (
                <motion.div
                  layoutId="order-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* 2. Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B9B] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, title, or counterparty..."
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-[rgba(15,15,30,0.12)] bg-white text-xs text-[#0B0B14] placeholder-[#8B8B9B] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B9B] hover:text-[#0B0B14]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#6B6B7B] font-medium hidden sm:inline">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-[rgba(15,15,30,0.12)] bg-white text-xs font-semibold text-[#0B0B14] focus:border-blue-600 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* 3. Orders Content: Desktop Table & Mobile Stacked Cards */}
      <div className="rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0B0B14]">No orders found</h3>
            <p className="text-xs text-[#6B6B7B] max-w-sm mx-auto">
              No milestone orders match your selected filters or search query.
            </p>
            {(activeTab !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all")
                  setSearchQuery("")
                }}
                className="text-xs font-semibold text-blue-600 hover:underline inline-block pt-1"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[rgba(15,15,30,0.06)] bg-[#FAFAFC] text-[11px] font-semibold text-[#6B6B7B] uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID & Scope</th>
                    <th className="py-3 px-4">{isClient ? "Specialist" : "Client"}</th>
                    <th className="py-3 px-4">Tier</th>
                    <th className="py-3 px-4">Milestones / Delivery</th>
                    <th className="py-3 px-4 text-right">Escrow Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(15,15,30,0.05)]">
                  {paginatedOrders.map((order) => {
                    const counterpart = isClient ? order.freelancer : order.client
                    const approvedCount = order.milestones.filter((m) => m.status === "completed").length

                    return (
                      <tr
                        key={order.id}
                        onClick={() => onSelectOrder(order)}
                        className="hover:bg-[#FAFAFC] transition-colors cursor-pointer group"
                      >
                        {/* Order ID & Scope */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-bold text-[#0B0B14]">
                              {order.id}
                            </span>
                            <h4 className="font-semibold text-xs text-[#0B0B14] line-clamp-1 group-hover:text-blue-700 transition-colors">
                              {order.title}
                            </h4>
                            <span className="text-[10px] text-[#8B8B9B] block">
                              {order.category}
                            </span>
                          </div>
                        </td>

                        {/* Counterpart */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={counterpart.avatar}
                              alt={counterpart.name}
                              className="w-8 h-8 rounded-full object-cover border border-[rgba(15,15,30,0.1)] shrink-0"
                            />
                            <div className="truncate max-w-[130px]">
                              <span className="font-bold text-xs text-[#0B0B14] block truncate">
                                {counterpart.name}
                              </span>
                              <span className="text-[10px] text-[#6B6B7B] block truncate">
                                {"title" in counterpart ? counterpart.title : ("company" in counterpart ? counterpart.company : "")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
                            {order.tier}
                          </span>
                        </td>

                        {/* Milestones / Delivery */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#4B4B5C] font-medium">
                              <span>
                                {approvedCount}/{order.milestones.length} milestones
                              </span>
                            </div>
                            <span className="text-[10px] text-[#8B8B9B] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#8B8B9B]" />
                              <span>{order.deliveryDate}</span>
                            </span>
                          </div>
                        </td>

                        {/* Escrow Amount */}
                        <td className="py-4 px-4 text-right">
                          <span className="font-mono font-bold text-sm text-[#0B0B14]">
                            ${order.totalAmount}.00
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 text-center">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectOrder(order)
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[rgba(15,15,30,0.12)] bg-white group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 text-xs font-semibold text-[#0B0B14] transition-all shadow-2xs"
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
            <div className="md:hidden divide-y divide-[rgba(15,15,30,0.06)] p-2">
              {paginatedOrders.map((order) => {
                const counterpart = isClient ? order.freelancer : order.client
                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="p-3.5 space-y-3 hover:bg-[#FAFAFC] rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0B0B14]">
                          {order.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                          {order.tier}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <h4 className="text-xs font-bold text-[#0B0B14] leading-snug">
                      {order.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={counterpart.avatar}
                          alt={counterpart.name}
                          className="w-6 h-6 rounded-full object-cover border"
                        />
                        <span className="font-semibold text-[#0B0B14]">
                          {counterpart.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#0B0B14]">
                        ${order.totalAmount}.00
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8B8B9B] pt-1">
                      <span>{order.deliveryDate}</span>
                      <span className="font-semibold text-blue-700 flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(15,15,30,0.06)] bg-[#FAFAFC] text-xs">
                <span className="text-[#6B6B7B]">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[rgba(15,15,30,0.1)] bg-white disabled:opacity-40 hover:bg-[#FAFAFC]"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-semibold px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[rgba(15,15,30,0.1)] bg-white disabled:opacity-40 hover:bg-[#FAFAFC]"
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

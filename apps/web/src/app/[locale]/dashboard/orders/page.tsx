"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useDashboard } from "@/context/DashboardContext"
import { type DashboardOrder } from "@/data/dashboard/orders"
import { OrdersTable } from "@/components/dashboard/orders/OrdersTable"
import { OrderDetailDrawer } from "@/components/dashboard/orders/OrderDetailDrawer"
import { ShoppingBag, ShieldCheck, ChevronRight, Home, PlusCircle, Compass } from "lucide-react"

export default function DashboardOrdersPage() {
  const { role, orders, selectedOrderId, setSelectedOrderId } = useDashboard()
  const isClient = role === "CLIENT"

  const [selectedOrder, setSelectedOrder] = React.useState<DashboardOrder | null>(null)

  // Keep selectedOrder in sync with context if id set or orders updated
  React.useEffect(() => {
    if (selectedOrderId) {
      const match = orders.find((o) => o.id === selectedOrderId)
      if (match) setSelectedOrder(match)
    }
  }, [selectedOrderId, orders])

  const handleSelectOrder = (order: DashboardOrder) => {
    setSelectedOrder(order)
    setSelectedOrderId(order.id)
  }

  const handleCloseDrawer = () => {
    setSelectedOrder(null)
    setSelectedOrderId(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(15,15,30,0.06)]">
        <div>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1.5 text-xs text-[#8B8B9B]">
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-blue-700 font-semibold">Orders</li>
            </ol>
          </nav>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B0B14] tracking-tight">
              {isClient ? "My Milestone Contracts" : "Order Management"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              {orders.length} total
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6B7B] mt-1 leading-relaxed">
            {isClient
              ? "Track milestone progress, inspect delivered assets, and authorize escrow disbursements."
              : "Manage active client orders, submit completed milestone packages, and review feedback."}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {isClient ? (
            <Link
              href="/services"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-semibold shadow-md hover:from-blue-700 hover:to-sky-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span>Hire New Specialist</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/gigs"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-semibold shadow-md hover:from-blue-700 hover:to-sky-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Gig</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Main Orders Table */}
      <OrdersTable onSelectOrder={handleSelectOrder} />

      {/* 3. Order Detail Side Drawer with Confirm Actions */}
      <OrderDetailDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={handleCloseDrawer}
        order={selectedOrder}
      />
    </div>
  )
}

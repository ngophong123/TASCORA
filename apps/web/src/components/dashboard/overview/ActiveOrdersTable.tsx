"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { type ActiveOrderRow } from "@/data/dashboard/overview"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActiveOrdersTableProps {
  orders: ActiveOrderRow[]
  role: "CLIENT" | "FREELANCER"
  onActionClick?: (orderId: string, actionName: string) => void
  className?: string
}

export function ActiveOrdersTable({ orders, role, className }: ActiveOrdersTableProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.06)] mb-4">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-[#0A0A23]">
              {role === "CLIENT" ? "Active Milestone Contracts" : "Active Orders & Deliveries"}
            </h3>
            <p className="text-xs text-[#6B6B7B]">
              {role === "CLIENT"
                ? "Manage escrow milestones, review deliverable files, and approve releases."
                : "Deliver milestone files on time to maintain your 99.4% completion rating."}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/orders"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 shrink-0"
        >
          <span>View all ({orders.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Desktop Table View (hidden on mobile < md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[rgba(15,15,30,0.06)] text-[11px] font-semibold text-[#6B6B7B] uppercase tracking-wider">
              <th className="py-3 px-3">Order / Title</th>
              <th className="py-3 px-3">{role === "CLIENT" ? "Specialist" : "Client"}</th>
              <th className="py-3 px-3">Milestone Progress</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(15,15,30,0.04)]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#FAFAFC] transition-colors group">
                {/* Order ID & Service */}
                <td className="py-3.5 px-3 max-w-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-[#0A0A23]">{order.id}</span>
                    <p className="text-xs font-semibold text-[#4B4B5C] truncate block">
                      {order.title}
                    </p>
                    <span className="text-[10px] text-[#8B8B9B] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#8B8B9B]" />
                      <span>{order.dueDate}</span>
                    </span>
                  </div>
                </td>

                {/* Counterpart */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <AvatarImage
                      src={order.counterpartAvatar}
                      name={order.counterpartName}
                      id={order.id}
                      size={28}
                      rounded="full"
                      alt={order.counterpartName}
                    />
                    <div className="truncate max-w-[140px]">
                      <span className="font-semibold text-xs text-[#0A0A23] block truncate">
                        {order.counterpartName}
                      </span>
                      <span className="text-[10px] text-[#6B6B7B] block truncate">
                        {order.counterpartRole}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Progress bar */}
                <td className="py-3.5 px-3 w-44">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#6B6B7B] truncate max-w-[100px]">
                        {order.currentMilestone}
                      </span>
                      <span className="font-mono font-bold text-blue-700">
                        {order.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EAEAF0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-500"
                        style={{ width: `${order.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="py-3.5 px-3 text-right">
                  <span className="font-mono font-bold text-sm text-[#0A0A23]">{order.amount}</span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 text-center">
                  <StatusBadge status={order.status} />
                </td>

                {/* Action button */}
                <td className="py-3.5 px-3 text-right">
                  <Link
                    href={`/dashboard/orders`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[rgba(15,15,30,0.12)] bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs font-semibold text-[#0A0A23] transition-all shadow-2xs"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (visible on < md) */}
      <div className="md:hidden divide-y divide-[rgba(15,15,30,0.06)]">
        {orders.map((order) => (
          <div key={order.id} className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0A0A23]">{order.id}</span>
              <StatusBadge status={order.status} />
            </div>

            <h4 className="text-xs font-bold text-[#0A0A23]">{order.title}</h4>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AvatarImage
                  src={order.counterpartAvatar}
                  name={order.counterpartName}
                  id={order.id}
                  size={24}
                  rounded="full"
                  alt={order.counterpartName}
                />
                <span className="font-semibold text-xs text-[#0A0A23]">
                  {order.counterpartName}
                </span>
              </div>
              <span className="font-mono font-bold text-sm text-[#0A0A23]">{order.amount}</span>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#6B6B7B]">
                <span>{order.currentMilestone}</span>
                <span className="font-mono font-bold text-blue-700">{order.progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAEAF0] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500"
                  style={{ width: `${order.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#8B8B9B] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{order.dueDate}</span>
              </span>
              <Link
                href="/dashboard/orders"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Order Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"
import { Link } from "@/i18n/routing"
import { type ActiveOrderRow } from "@/data/dashboard/overview"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { ArrowRight } from "lucide-react"
export function ActiveOrdersTable({
  orders,
  role,
}: {
  orders: ActiveOrderRow[]
  role: "CLIENT" | "FREELANCER"
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border-default bg-bg-surface p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-4">
        <h2 className="text-lg font-semibold">Your orders</h2>
        <Link
          href="/dashboard/orders"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
        >
          View all ({orders.length})<ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      {!orders.length ? (
        <p className="py-8 text-sm text-text-secondary">
          No orders yet. Your orders will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-border-default">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-start"
            >
              <div className="min-w-0 flex-1">
                <p className="break-all text-xs text-text-muted">{order.id}</p>
                <h3 className="mt-1 text-sm font-semibold leading-6">{order.title}</h3>
                <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                  <AvatarImage
                    src={order.counterpartAvatar}
                    name={order.counterpartName}
                    size={28}
                    rounded="full"
                    alt={order.counterpartName}
                  />
                  <span>
                    {role === "CLIENT" ? "Seller" : "Customer"}: {order.counterpartName}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-muted">Delivery: {order.dueDate}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:w-32 sm:shrink-0 sm:flex-col sm:items-end">
                <span className="text-base font-semibold tabular-nums">{order.amount}</span>
                <StatusBadge status={order.status} />
                <Link
                  href="/dashboard/orders"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-default px-3 text-sm hover:bg-bg-subtle"
                  aria-label={`View order ${order.id}`}
                >
                  View
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

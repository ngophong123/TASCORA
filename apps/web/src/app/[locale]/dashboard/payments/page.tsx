"use client"
import { useDashboard } from "@/context/DashboardContext"
import { ApiState } from "@/components/feedback/ApiState"
export default function PaymentsPage() {
  const { rawOrders, ordersLoading, ordersError, reloadOrders } = useDashboard()
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        Payments & Billing
      </h1>
      <ApiState loading={ordersLoading} error={ordersError} retry={reloadOrders} />
      <p>
        Payment and refund states are server confirmed. Stored payment methods and invoices are
        unavailable.
      </p>
      {rawOrders.map((order) => (
        <article
          key={order.id}
          className="rounded-xl border border-[var(--border)] p-5 bg-[var(--surface)] break-words"
        >
          <h2>{order.purchaseSnapshot?.serviceTitle || order.service.title}</h2>
          <p>
            {order.id} · USD {order.amount} · {order.status}
          </p>
          {order.refunds?.map((refund) => (
            <p key={refund.id}>
              Refund USD {refund.amount} · {refund.status}
            </p>
          ))}
        </article>
      ))}
      {!ordersLoading && !ordersError && !rawOrders.length && <p>No payment orders yet.</p>}
    </div>
  )
}

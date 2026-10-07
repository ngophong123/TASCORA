"use client"
import { useRef, useState } from "react"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { requestData, jsonRequest } from "@/lib/marketplace"
import { usePaymentCapability } from "@/hooks/usePaymentCapability"
export interface Earnings {
  currency: string
  pending: string
  available: string
  requested: string
  paid: string
  providerAvailable: boolean
  availableOrders: { id: string }[]
  payouts: {
    id: string
    amount: string
    status: string
    failureReason: string | null
    escrow: { orderId: string }
  }[]
}
export function LiveEarnings() {
  const payments = usePaymentCapability()
  const resource = useApiResource<Earnings>("/api/v1/financial/earnings")
  const keys = useRef<Record<string, string>>({})
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState("")
  async function request(orderId: string) {
    if (!payments.available) return
    setBusy(true)
    setError("")
    try {
      await requestData(
        `/api/v1/financial/orders/${orderId}/payouts`,
        jsonRequest("POST", {
          idempotencyKey: keys.current[orderId] || (keys.current[orderId] = crypto.randomUUID()),
        })
      )
      delete keys.current[orderId]
      setStatus("Payout request recorded. External payout requires a validated provider.")
      resource.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Payout request failed.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Earnings & Payouts</h1>
      <ApiState
        loading={resource.loading}
        error={error || resource.error}
        retry={resource.reload}
      />
      <p role="status">{status}</p>
      {!payments.available && <p role="status">{payments.message}</p>}
      {resource.data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["pending", "available", "requested", "paid"] as const).map((bucket) => (
              <section key={bucket} className="rounded-2xl border bg-white p-5">
                <h2>{bucket}</h2>
                <p data-testid={`earnings-${bucket}`}>${resource.data![bucket]} USD</p>
              </section>
            ))}
          </div>
          <p>
            Provider payouts unavailable until validated. Requested earnings are reserved; pending
            or disputed earnings cannot be withdrawn.
          </p>
          <section>
            <h2 className="font-semibold">Eligible completed orders (first 100)</h2>
            {resource.data.availableOrders.map((order) => (
              <div key={order.id} className="p-3 border rounded break-all">
                <span>{order.id}</span>
                <button
                  disabled={busy || !payments.available}
                  onClick={() => void request(order.id)}
                  className="rounded border p-2 ml-2"
                >
                  Request payout for order
                </button>
              </div>
            ))}
            {!resource.data.availableOrders.length && <p>No eligible completed orders.</p>}
          </section>
          <section>
            <h2 className="font-semibold">Payout history</h2>
            {resource.data.payouts.map((payout) => (
              <p key={payout.id}>
                ${payout.amount} · {payout.status}
                {payout.failureReason && ` · ${payout.failureReason}`}
              </p>
            ))}
            {!resource.data.payouts.length && <p>No payout requests.</p>}
          </section>
        </>
      )}
    </div>
  )
}

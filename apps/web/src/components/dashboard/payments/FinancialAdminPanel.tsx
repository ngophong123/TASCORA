"use client"
import { useState } from "react"
import { useApiResource } from "@/hooks/useApiResource"
import { requestData, jsonRequest } from "@/lib/marketplace"
import { ApiState } from "@/components/feedback/ApiState"
import { usePaymentCapability } from "@/hooks/usePaymentCapability"
interface Queue {
  disputes: { id: string; orderId: string; description: string; status: string }[]
  refunds: { id: string; orderId: string; amount: string; status: string }[]
  payouts: { id: string; amount: string; status: string }[]
}
interface Evidence {
  id: string
  status: string
  amount: string
  deliveries: { id: string; message: string; files: string[] }[]
  financialEntries: {
    id: string
    type: string
    amount: string
    reason: string | null
    actorId: string | null
    createdAt: string
  }[]
  conversation: { messages: { id: string; content: string }[] } | null
}
export function FinancialAdminPanel() {
  const payments = usePaymentCapability()
  const queue = useApiResource<Queue>("/api/v1/financial/admin/queue")
  const [orderId, setOrderId] = useState(""),
    [reason, setReason] = useState(""),
    [refundAmount, setRefundAmount] = useState("")
  const [evidence, setEvidence] = useState<Evidence | null>(null),
    [diagnostics, setDiagnostics] = useState("")
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  const [refundKey, setRefundKey] = useState("")
  async function execute(path: string, body?: unknown) {
    setBusy(true)
    setError("")
    try {
      await requestData(path, jsonRequest("POST", body))
      queue.reload()
      setEvidence(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Financial operation failed.")
    } finally {
      setBusy(false)
    }
  }
  async function inspect() {
    setBusy(true)
    setError("")
    try {
      setEvidence(await requestData<Evidence>(`/api/v1/financial/admin/orders/${orderId}`))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Order unavailable.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="rounded-xl border bg-white p-5 space-y-4">
      <h2 className="font-semibold">Financial review</h2>
      {!payments.available && <p role="status">{payments.message}</p>}
      <ApiState loading={queue.loading} error={error || queue.error} retry={queue.reload} />
      <p>
        External payouts are disabled pending provider validation. Refund processing contacts the
        configured provider; use isolated test mode during validation.
      </p>
      <label className="block">
        Order ID
        <input
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value)
            setEvidence(null)
            setRefundKey("")
          }}
          className="block rounded border p-2 w-full"
        />
      </label>
      <button
        disabled={busy || !orderId}
        onClick={() => void inspect()}
        className="rounded border p-2"
      >
        Inspect financial order
      </button>
      {evidence && (
        <div className="space-y-2">
          <p>
            {evidence.id} · {evidence.status} · USD {evidence.amount}
          </p>
          {evidence.deliveries.map((delivery) => (
            <article key={delivery.id}>
              <p>{delivery.message}</p>
              <p>{delivery.files.length} persisted attachments</p>
            </article>
          ))}
          {evidence.conversation?.messages.map((message) => (
            <p key={message.id}>{message.content}</p>
          ))}
          <h3>Financial audit history</h3>
          {evidence.financialEntries.map((event) => (
            <p key={event.id}>
              {event.type} · USD {event.amount} · {event.actorId || "system/provider"} ·{" "}
              {event.createdAt} · {event.reason}
            </p>
          ))}
        </div>
      )}
      <label className="block">
        Resolution / refund reason
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setRefundKey("")
          }}
          maxLength={2000}
          className="block rounded border p-2 w-full"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy || !payments.available || !orderId || reason.trim().length < 3}
          onClick={() =>
            void execute(`/api/v1/financial/admin/orders/${orderId}/resolve`, {
              outcome: "BUYER",
              reason,
            })
          }
          className="rounded border p-2"
        >
          Resolve for buyer / request refund
        </button>
        <button
          disabled={busy || !orderId || reason.trim().length < 3}
          onClick={() =>
            void execute(`/api/v1/financial/admin/orders/${orderId}/resolve`, {
              outcome: "SELLER",
              reason,
            })
          }
          className="rounded border p-2"
        >
          Resolve for seller
        </button>
      </div>
      <label className="block">
        Refund amount (USD)
        <input
          value={refundAmount}
          onChange={(e) => {
            setRefundAmount(e.target.value)
            setRefundKey("")
          }}
          inputMode="decimal"
          className="block rounded border p-2"
        />
      </label>
      <button
        disabled={
          busy || !payments.available || !orderId || !refundAmount || reason.trim().length < 3
        }
        onClick={() => {
          const key = refundKey || crypto.randomUUID()
          setRefundKey(key)
          void execute(`/api/v1/financial/orders/${orderId}/refunds`, {
            amount: refundAmount,
            reason,
            idempotencyKey: key,
          })
        }}
        className="rounded border p-2"
      >
        Request controlled refund
      </button>
      <h3 className="font-semibold">Open disputes (first 100)</h3>
      {queue.data?.disputes.map((dispute) => (
        <article key={dispute.id} className="p-2 border rounded">
          <p>
            {dispute.status} · {dispute.description}
          </p>
          <button
            onClick={() => {
              setOrderId(dispute.orderId)
              setEvidence(null)
            }}
            className="underline"
          >
            Select disputed order
          </button>
        </article>
      ))}
      <h3 className="font-semibold">Refund requests</h3>
      {queue.data?.refunds.map((refund) => (
        <div key={refund.id} className="p-2 border rounded">
          <p>
            USD {refund.amount} · {refund.status}
          </p>
          <button
            disabled={busy || !payments.available}
            onClick={() => void execute(`/api/v1/financial/admin/refunds/${refund.id}/process`)}
            className="rounded border p-2"
          >
            Process / reconcile refund
          </button>
        </div>
      ))}
      <h3 className="font-semibold">Payout status</h3>
      {queue.data?.payouts.map((payout) => (
        <p key={payout.id}>
          USD {payout.amount} · {payout.status}
        </p>
      ))}
      <button
        disabled={busy || !payments.available || !orderId}
        onClick={() => {
          setBusy(true)
          void requestData(`/api/v1/financial/admin/orders/${orderId}/reconciliation`)
            .then((result) => setDiagnostics(JSON.stringify(result)))
            .catch((error: Error) => setError(error.message))
            .finally(() => setBusy(false))
        }}
        className="rounded border p-2"
      >
        Check provider reconciliation
      </button>
      {diagnostics && <pre className="whitespace-pre-wrap break-all text-xs">{diagnostics}</pre>}
    </section>
  )
}

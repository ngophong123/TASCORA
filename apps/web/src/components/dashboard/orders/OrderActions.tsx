"use client"
import { useRef, useState } from "react"
import { useDashboard } from "@/context/DashboardContext"
import { requestData, jsonRequest, uploadFile, downloadUpload } from "@/lib/marketplace"
import { OrderPayment } from "./OrderPayment"
import { ApiState } from "@/components/feedback/ApiState"
import { usePaymentCapability } from "@/hooks/usePaymentCapability"
export function OrderActions({ orderId }: { orderId: string }) {
  const payments = usePaymentCapability()
  const { rawOrders, reloadOrders, role, account } = useDashboard()
  const order = rawOrders.find((o) => o.id === orderId)
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [note, setNote] = useState(""),
    [files, setFiles] = useState<string[]>([])
  const [ratings, setRatings] = useState({ communication: 5, serviceQuality: 5, recommend: 5 })
  const deliveryKey = useRef(""),
    refundKey = useRef("")
  if (!order) return null
  const buyer = account?.id === order.buyerId
  const outstandingRefund = order.refunds?.some((refund) =>
    ["PENDING", "PROCESSING"].includes(refund.status)
  )
  async function action(path: string, body: unknown) {
    setBusy(true)
    setError("")
    try {
      await requestData(path, jsonRequest("POST", body))
      if (path.endsWith("/delivery")) deliveryKey.current = ""
      reloadOrders()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Order update failed.")
    } finally {
      setBusy(false)
    }
  }
  const transition = (operation: string) =>
    void action(
      `/api/v1/orders/${orderId}/operations/${operation}`,
      note.trim() ? { message: note } : {}
    )
  return (
    <section className="rounded-xl border border-slate-200 p-4 space-y-3 text-sm">
      <p>
        Order status: <strong>{order.status}</strong>
      </p>
      <ApiState error={error} />
      {buyer && order.status === "PENDING" && (
        <>
          <p>Awaiting payment. Only the server confirms funding.</p>
          <OrderPayment orderId={orderId} refresh={reloadOrders} />
          <button
            disabled={busy}
            className="rounded border px-3 py-2"
            onClick={() => transition("cancel")}
          >
            Cancel unpaid order
          </button>
          <button
            disabled={busy || !payments.available}
            className="rounded border px-3 py-2"
            onClick={() => void action(`/api/v1/financial/orders/${orderId}/cancel-payment`, {})}
          >
            Cancel pending payment
          </button>
        </>
      )}
      {role === "FREELANCER" && !buyer && order.status === "PAID" && (
        <button
          disabled={busy || outstandingRefund}
          onClick={() => transition("start")}
          className="rounded border px-3 py-2"
        >
          Start work
        </button>
      )}
      {role === "FREELANCER" && ["IN_PROGRESS", "IN_REVISION"].includes(order.status) && (
        <>
          <label>
            Delivery message
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded border p-2"
            />
          </label>
          <label>
            Delivery attachment
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setBusy(true)
                  void uploadFile(file)
                    .then((ref) => setFiles((prev) => [...prev, ref]))
                    .catch((error: Error) => setError(error.message))
                    .finally(() => setBusy(false))
                }
              }}
            />
          </label>
          <p>{files.length} attachments selected</p>
          <button
            disabled={busy || !note.trim()}
            onClick={() =>
              void action(`/api/v1/orders/${orderId}/delivery`, {
                message: note,
                files,
                idempotencyKey: deliveryKey.current || (deliveryKey.current = crypto.randomUUID()),
              })
            }
            className="rounded border px-3 py-2"
          >
            Submit delivery
          </button>
        </>
      )}
      {buyer && order.status === "DELIVERED" && (
        <>
          <label>
            Revision instructions
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded border p-2"
            />
          </label>
          <button
            disabled={busy}
            className="rounded border px-3 py-2"
            onClick={() => transition("accept")}
          >
            Accept delivery
          </button>
          <button
            disabled={busy || !note.trim()}
            className="rounded border px-3 py-2"
            onClick={() => transition("revision")}
          >
            Request revision
          </button>
          <p>
            Acceptance makes the server-calculated seller earnings available for payout requests; it
            does not send an external payout.
          </p>
        </>
      )}
      {role === "FREELANCER" && order.status === "IN_REVISION" && (
        <button
          disabled={busy}
          onClick={() => {
            deliveryKey.current = ""
            transition("start")
          }}
          className="rounded border px-3 py-2"
        >
          Continue work
        </button>
      )}
      {buyer && ["PAID", "IN_PROGRESS", "IN_REVISION", "DELIVERED"].includes(order.status) && (
        <div className="space-y-2">
          <label>
            Dispute reason
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded border p-2"
            />
          </label>
          <button
            disabled={busy || note.trim().length < 3}
            onClick={() =>
              void action(`/api/v1/financial/orders/${orderId}/disputes`, {
                category: "OTHER",
                description: note,
              })
            }
            className="rounded border px-3 py-2"
          >
            Open dispute
          </button>
        </div>
      )}
      {buyer && order.status === "PAID" && (
        <div>
          <label>
            Cancellation reason
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block rounded border p-2"
            />
          </label>
          <button
            disabled={busy || !payments.available || outstandingRefund || note.trim().length < 3}
            onClick={() =>
              void action(`/api/v1/financial/orders/${orderId}/refunds`, {
                reason: note,
                idempotencyKey: refundKey.current || (refundKey.current = crypto.randomUUID()),
              })
            }
            className="rounded border px-3 py-2"
          >
            Request full refund before work starts
          </button>
          <p>Administrator processing and provider confirmation are required.</p>
          {!payments.available && <p role="status">{payments.message}</p>}
        </div>
      )}
      {order.dispute && (
        <p>
          Internal dispute: {order.dispute.status} · {order.dispute.description}
        </p>
      )}
      {order.refunds?.map((refund) => (
        <p key={refund.id}>
          Refund: {refund.amount} · {refund.status}
        </p>
      ))}
      {(order.deliveries || []).map((delivery) => (
        <div key={delivery.id} className="rounded border p-2">
          <p>{delivery.message}</p>
          {delivery.files.map((ref) => (
            <button
              key={ref}
              className="block underline"
              onClick={() =>
                void downloadUpload(ref).catch((error: Error) => setError(error.message))
              }
            >
              Download {ref.split("/").pop()}
            </button>
          ))}
        </div>
      ))}
      {buyer && order.status === "COMPLETED" && !order.review && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void action("/api/v1/reviews", { orderId, ...ratings, comment: note })
          }}
          className="space-y-2"
        >
          <h3 className="font-semibold">Review this completed order</h3>
          {(Object.keys(ratings) as (keyof typeof ratings)[]).map((field) => (
            <label className="block" key={field}>
              {field}
              <select
                value={ratings[field]}
                onChange={(e) =>
                  setRatings((prev) => ({ ...prev, [field]: Number(e.target.value) }))
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label>
            Review
            <textarea
              minLength={10}
              maxLength={1000}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded border p-2"
            />
          </label>
          <button disabled={busy} className="rounded border px-3 py-2">
            Submit review
          </button>
        </form>
      )}
      {order.review && (
        <>
          <p>
            Review: {order.review.rating}/5 · {order.review.comment}
          </p>
          {order.review.sellerReply ? (
            <p>Seller reply: {order.review.sellerReply}</p>
          ) : (
            role === "FREELANCER" && (
              <>
                <label>
                  Reply to review
                  <textarea
                    minLength={10}
                    maxLength={1000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="block w-full rounded border p-2"
                  />
                </label>
                <button
                  disabled={busy || note.length < 10}
                  onClick={() =>
                    void action(`/api/v1/reviews/${order.review!.id}/reply`, { reply: note })
                  }
                  className="rounded border px-3 py-2"
                >
                  Reply
                </button>
              </>
            )
          )}
        </>
      )}
    </section>
  )
}

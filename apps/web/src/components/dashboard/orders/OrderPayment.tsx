"use client"
import { useEffect, useRef, useState } from "react"
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js"
import { requestData, jsonRequest } from "@/lib/marketplace"
export function OrderPayment({ orderId, refresh }: { orderId: string; refresh: () => void }) {
  const [secret, setSecret] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("")
  const container = useRef<HTMLDivElement>(null),
    provider = useRef<Stripe | null>(null),
    elements = useRef<StripeElements | null>(null)
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  useEffect(() => {
    if (!secret || !key) return
    let active = true
    let destroy: (() => void) | undefined
    void loadStripe(key)
      .then((stripe) => {
        if (!active || !stripe || !container.current) return
        provider.current = stripe
        const form = stripe.elements({ clientSecret: secret })
        elements.current = form
        const payment = form.create("payment")
        payment.mount(container.current)
        destroy = () => payment.destroy()
      })
      .catch(() => {
        if (active) setError("Payment form unavailable. Please retry.")
      })
    return () => {
      active = false
      destroy?.()
      provider.current = null
      elements.current = null
    }
  }, [secret, key])
  async function initiate() {
    setBusy(true)
    setError("")
    try {
      const intent = await requestData<{ clientSecret: string }>(
        "/api/v1/payments/create-intent",
        jsonRequest("POST", { orderId })
      )
      setSecret(intent.clientSecret)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Payment unavailable.")
    } finally {
      setBusy(false)
    }
  }
  async function confirm() {
    if (!provider.current || !elements.current) return
    setBusy(true)
    setError("")
    try {
      const result = await provider.current.confirmPayment({
        elements: elements.current,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      })
      if (result.error) setError(result.error.message || "Payment could not be confirmed.")
      else {
        setStatus("Payment submitted. Order funding is confirmed by the server; refresh to check.")
        refresh()
      }
    } catch {
      setError("Payment interrupted. Refresh your order before retrying.")
    } finally {
      setBusy(false)
    }
  }
  if (!/^pk_(test|live)_/.test(key))
    return <p>Online payment form unavailable until the provider publishable key is configured.</p>
  return (
    <div className="space-y-2">
      <p role="status">{status}</p>
      {error && <p role="alert">{error}</p>}
      {!secret ? (
        <button
          disabled={busy}
          onClick={() => void initiate()}
          className="rounded border px-3 py-2"
        >
          Prepare payment
        </button>
      ) : (
        <>
          <div ref={container} />
          <button
            disabled={busy}
            onClick={() => void confirm()}
            className="rounded border px-3 py-2"
          >
            Confirm payment
          </button>
        </>
      )}
      <button disabled={busy} onClick={refresh} className="underline">
        Refresh funding status
      </button>
    </div>
  )
}

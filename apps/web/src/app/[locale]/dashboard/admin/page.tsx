"use client"
import { useState } from "react"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import {
  requestData,
  jsonRequest,
  profileName,
  type Profile,
  type Service,
} from "@/lib/marketplace"
import { useDashboard } from "@/context/DashboardContext"
import { FinancialAdminPanel } from "@/components/dashboard/payments/FinancialAdminPanel"
export default function AdminPage() {
  const { account, ordersError } = useDashboard()
  const queue = useApiResource<{ sellers: Profile[]; services: Service[] }>(
    account?.role === "ADMIN" ? "/api/v1/admin/review-queue" : null
  )
  const [categoryName, setCategoryName] = useState(""),
    [categorySlug, setCategorySlug] = useState("")
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  async function review(path: string, body?: unknown) {
    setBusy(true)
    setError("")
    try {
      await requestData(path, jsonRequest("PUT", body))
      queue.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Review failed.")
    } finally {
      setBusy(false)
    }
  }
  if (!account && ordersError) return <ApiState error={ordersError} />
  if (account && account.role !== "ADMIN")
    return <ApiState error="Administrator access required." />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0A0A23]">Marketplace review</h1>
      <ApiState
        loading={!account || queue.loading}
        error={error || queue.error}
        retry={queue.reload}
      />
      <form
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          setBusy(true)
          void requestData(
            "/api/v1/admin/categories",
            jsonRequest("POST", { name: categoryName, slug: categorySlug })
          )
            .then(() => {
              setCategoryName("")
              setCategorySlug("")
            })
            .catch((error: Error) => setError(error.message))
            .finally(() => setBusy(false))
        }}
      >
        <h2 className="font-semibold">Create marketplace category</h2>
        <label className="block">
          Name
          <input
            required
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            className="block rounded border p-2"
          />
        </label>
        <label className="block">
          Slug
          <input
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={categorySlug}
            onChange={(event) => setCategorySlug(event.target.value)}
            className="block rounded border p-2"
          />
        </label>
        <button disabled={busy} className="rounded border px-3 py-2">
          Create category
        </button>
      </form>
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold">Seller profiles awaiting review</h2>
        <p className="text-sm">Profile approval does not verify identity or enable payouts.</p>
        {queue.data?.sellers.map((seller) => (
          <article key={seller.id} className="rounded border p-3">
            <h3>
              {profileName(seller)} · {seller.professionalTitle}
            </h3>
            <p>{seller.bio}</p>
            <button
              disabled={busy}
              onClick={() =>
                void review(`/api/v1/admin/sellers/${seller.id}/review`, { status: "APPROVED" })
              }
              className="rounded border px-3 py-2"
            >
              Approve seller
            </button>
            <button
              disabled={busy}
              onClick={() =>
                void review(`/api/v1/admin/sellers/${seller.id}/review`, { status: "REJECTED" })
              }
              className="rounded border px-3 py-2"
            >
              Reject seller
            </button>
          </article>
        ))}
        {queue.data && !queue.data.sellers.length && <p>No seller profiles awaiting review.</p>}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold">Service drafts (first 100)</h2>
        {queue.data?.services.map((service) => (
          <article key={service.id} className="rounded border p-3">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <ul>
              {service.packages.map((pkg) => (
                <li key={pkg.id}>
                  {pkg.type}: ${pkg.price} · {pkg.deliveryDays} days
                </li>
              ))}
            </ul>
            <button
              disabled={busy}
              onClick={() => void review(`/api/v1/admin/services/${service.id}/approve`)}
              className="rounded border px-3 py-2"
            >
              Publish service
            </button>
          </article>
        ))}
        {queue.data && !queue.data.services.length && (
          <p>No eligible service drafts awaiting review.</p>
        )}
      </section>
      {account?.role === "ADMIN" && <FinancialAdminPanel />}
    </div>
  )
}

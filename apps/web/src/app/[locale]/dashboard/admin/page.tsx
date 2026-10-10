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
  const [search, setSearch] = useState("")
  const query = search.trim().toLowerCase()
  const sellers = queue.data?.sellers.filter((seller) =>
    `${profileName(seller)} ${seller.professionalTitle || ""} ${seller.bio || ""}`
      .toLowerCase()
      .includes(query)
  )
  const services = queue.data?.services.filter((service) =>
    `${service.title} ${service.description}`.toLowerCase().includes(query)
  )
  if (!account && ordersError) return <ApiState error={ordersError} />
  if (account && account.role !== "ADMIN")
    return <ApiState error="Administrator access required." />
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-medium tracking-tight text-foreground">Marketplace review</h1>
      <ApiState
        loading={!account || queue.loading}
        error={error || queue.error}
        retry={queue.reload}
      />
      {busy && (
        <p role="status" className="text-sm text-text-secondary">
          Saving your change…
        </p>
      )}
      <div className="max-w-lg">
        <label htmlFor="review-search" className="mb-2 block text-sm font-medium">
          Search review queue
        </label>
        <input
          id="review-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Seller name or service title"
          className="min-h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-base"
        />
      </div>
      <form
        className="rounded-xl border border-border-default bg-bg-surface p-5 sm:p-6 space-y-4"
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
        <label className="block text-sm font-medium">
          Name
          <input
            required
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            disabled={busy}
            className="mt-2 block min-h-11 w-full max-w-lg rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-base font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/20 disabled:opacity-50"
          />
        </label>
        <label className="block text-sm font-medium">
          Slug
          <input
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={categorySlug}
            onChange={(event) => setCategorySlug(event.target.value)}
            disabled={busy}
            className="mt-2 block min-h-11 w-full max-w-lg rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-base font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/20 disabled:opacity-50"
          />
        </label>
        <button
          disabled={busy}
          className="min-h-11 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm font-semibold hover:bg-bg-subtle disabled:opacity-50"
        >
          Create category
        </button>
      </form>
      <section className="rounded-xl border border-border-default bg-bg-surface p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold">Seller profiles awaiting review</h2>
        <p className="text-sm leading-6 text-text-secondary">
          Profile approval does not verify identity or enable payouts.
        </p>
        {sellers?.map((seller) => (
          <article
            key={seller.id}
            className="space-y-3 rounded-lg border border-border-default bg-bg-subtle p-4 break-words"
          >
            <h3 className="text-base font-semibold leading-6">
              {profileName(seller)} · {seller.professionalTitle}
            </h3>
            <p className="text-sm leading-6 text-text-secondary">{seller.bio}</p>
            <button
              disabled={busy}
              onClick={() =>
                void review(`/api/v1/admin/sellers/${seller.id}/review`, { status: "APPROVED" })
              }
              className="min-h-11 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm font-semibold hover:bg-bg-subtle disabled:opacity-50"
            >
              Approve seller
            </button>
            <button
              disabled={busy}
              onClick={() =>
                void review(`/api/v1/admin/sellers/${seller.id}/review`, { status: "REJECTED" })
              }
              className="min-h-11 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm font-semibold hover:bg-bg-subtle disabled:opacity-50"
            >
              Reject seller
            </button>
          </article>
        ))}
        {queue.data && !sellers?.length && (
          <p>
            {query
              ? "No seller profiles match this search."
              : "No seller profiles awaiting review."}
          </p>
        )}
      </section>
      <section className="rounded-xl border border-border-default bg-bg-surface p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold">Service drafts (first 100)</h2>
        {services?.map((service) => (
          <article
            key={service.id}
            className="space-y-3 rounded-lg border border-border-default bg-bg-subtle p-4 break-words"
          >
            <h3 className="text-base font-semibold leading-6">{service.title}</h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
              {service.description}
            </p>
            <ul className="space-y-2 text-sm text-text-secondary">
              {service.packages.map((pkg) => (
                <li key={pkg.id}>
                  {pkg.type}: ${pkg.price} · {pkg.deliveryDays} days
                </li>
              ))}
            </ul>
            <button
              disabled={busy}
              onClick={() => void review(`/api/v1/admin/services/${service.id}/approve`)}
              className="min-h-11 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm font-semibold hover:bg-bg-subtle disabled:opacity-50"
            >
              Publish service
            </button>
          </article>
        ))}
        {queue.data && !services?.length && (
          <p>
            {query
              ? "No service drafts match this search."
              : "No eligible service drafts awaiting review."}
          </p>
        )}
      </section>
      {account?.role === "ADMIN" && <FinancialAdminPanel />}
    </div>
  )
}

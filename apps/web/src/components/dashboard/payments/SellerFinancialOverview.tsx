"use client"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { Link } from "@/i18n/routing"
import type { Earnings } from "./LiveEarnings"
export function SellerFinancialOverview() {
  const resource = useApiResource<Earnings>("/api/v1/financial/earnings")
  return (
    <section className="rounded-xl border bg-white p-5 space-y-3 my-5">
      <h2 className="font-semibold">Seller financial account</h2>
      <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      {resource.data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["pending", "available", "requested", "paid"] as const).map((bucket) => (
              <p key={bucket}>
                {bucket}: USD {resource.data![bucket]}
              </p>
            ))}
          </div>
          <p>External payout provider unavailable pending validation.</p>
          <Link href="/dashboard/earnings" className="underline">
            View earnings and payout requests
          </Link>
        </>
      )}
    </section>
  )
}

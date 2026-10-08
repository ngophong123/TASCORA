"use client"

import { useState } from "react"
import { Bookmark, Trash2, ArrowUpRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useDashboard } from "@/context/DashboardContext"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { ServiceCardImage } from "@/components/ui/ServiceCardImage"
import { requestData, jsonRequest, profileName, imageUrl, type Service } from "@/lib/marketplace"

export default function SavedPage() {
  const { showToast } = useDashboard()
  const resource = useApiResource<Service[]>("/api/v1/favorites")
  const [busyId, setBusyId] = useState<string | null>(null)
  const remove = async (id: string) => {
    if (busyId) return
    setBusyId(id)
    try {
      await requestData(`/api/v1/favorites/${id}`, jsonRequest("DELETE"))
      resource.reload()
      showToast({ title: "Service removed from saved", type: "success" })
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "Unable to remove favorite",
        type: "error",
      })
    } finally {
      setBusyId(null)
    }
  }
  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <Bookmark aria-hidden="true" className="h-4 w-4" />
            Your shortlist
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Saved services
          </h1>
          <p className="mt-2 text-base text-[var(--text-secondary)]">
            Keep useful services close for your next project.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--primary)]"
        >
          Explore services
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </header>
      <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      {!resource.loading && !resource.error && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {!resource.data?.length && (
            <div className="col-span-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <h2 className="text-lg font-semibold">Your shortlist starts here</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Save a service while browsing to find it here later.
              </p>
              <Link
                href="/services"
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)]"
              >
                Explore services
              </Link>
            </div>
          )}
          {resource.data?.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="relative aspect-[16/10] bg-[var(--subtle)]">
                <ServiceCardImage
                  src={imageUrl(service.images[0]?.url)}
                  alt={service.title}
                  sizes="(max-width: 767px) calc(100vw - 64px), 450px"
                />
                <button
                  type="button"
                  aria-label={`Remove saved service ${service.title}`}
                  aria-busy={busyId === service.id}
                  disabled={Boolean(busyId)}
                  onClick={() => void remove(service.id)}
                  className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--status-danger)] disabled:opacity-50"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-xs text-[var(--text-muted)]">{service.category.name}</p>
                <h2 className="mt-2 text-base font-semibold leading-relaxed">
                  <Link href={`/services/${service.id}`} className="hover:text-[var(--primary)]">
                    {service.title}
                  </Link>
                </h2>
                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <AvatarImage
                    src={imageUrl(service.seller.avatar)}
                    name={profileName(service.seller)}
                    id={service.seller.id}
                    size={28}
                    alt={`${profileName(service.seller)} portrait`}
                  />
                  <span>{profileName(service.seller)}</span>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                  <span className="text-sm text-[var(--text-muted)]">
                    {service.ratingCount
                      ? `${service.ratingAverage.toFixed(1)} (${service.ratingCount} reviews)`
                      : "No reviews yet"}
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">
                    From{" "}
                    <strong className="font-semibold tabular-nums text-[var(--foreground)]">
                      $
                      {service.packages.length
                        ? Math.min(...service.packages.map((p) => Number(p.price)))
                        : 0}
                    </strong>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="text-sm text-[var(--text-muted)]">
        Specialist bookmarks are not available yet.
      </p>
    </div>
  )
}

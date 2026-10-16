"use client"

import { useParams } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { ChevronRight, MessageSquare, Star, Globe } from "lucide-react"
import { Link } from "@/i18n/routing"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { GigCard } from "@/components/ui/GigCard"
import { ApiState } from "@/components/feedback/ApiState"
import { useApiResource } from "@/hooks/useApiResource"
import {
  profileName,
  imageUrl,
  serviceGig,
  type Profile,
  type Service,
  type Review,
} from "@/lib/marketplace"

type SellerRecord = Profile & {
  hourlyRate: string | null
  createdAt: string
  services: Service[]
  reviews: Review[]
  _count: { orders: number }
}
const panel = "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"

export default function FreelancerProfilePage() {
  const params = useParams()
  const resource = useApiResource<SellerRecord>(`/api/v1/marketplace/sellers/${String(params.id)}`)
  const t = useTranslations("freelancerProfile")
  const locale = useLocale()
  const record = resource.data
  const name = profileName(record)
  return (
    <div className="container mx-auto min-h-[60vh] px-4 py-10 md:px-8 md:py-14">
      <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      {!resource.loading && !resource.error && !record && (
        <p className={panel}>{t("unavailable")}</p>
      )}
      {!resource.loading && !resource.error && record && (
        <>
          <nav
            aria-label={t("breadcrumb")}
            className="mb-7 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]"
          >
            <Link href="/" className="hover:text-[var(--primary)]">
              {t("home")}
            </Link>
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            <Link href="/explore?type=freelancers" className="hover:text-[var(--primary)]">
              {t("directory")}
            </Link>
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            <span aria-current="page" className="break-words text-[var(--foreground)]">
              {name}
            </span>
          </nav>
          <header className={`${panel} mb-10`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <AvatarImage
                  src={imageUrl(record.avatar)}
                  name={name}
                  id={record.id}
                  size={96}
                  rounded="xl"
                  alt={t("portrait", { name })}
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="break-words text-3xl font-semibold leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
                    {name}
                  </h1>
                  {record.professionalTitle && (
                    <p className="mt-2 text-base text-[var(--text-secondary)]">
                      {record.professionalTitle}
                    </p>
                  )}
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
                    {(record.ratingCount || 0) > 0 ? (
                      <>
                        <Star
                          aria-hidden="true"
                          className="h-4 w-4 fill-current text-[var(--foreground)]"
                        />
                        <span className="font-medium text-[var(--foreground)]">
                          {(record.ratingAverage || 0).toFixed(1)}
                        </span>
                        <span>{t("reviewsCount", { count: record.ratingCount || 0 })}</span>
                      </>
                    ) : (
                      t("noReviews")
                    )}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/messages?seller=${record.id}`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
              >
                <MessageSquare aria-hidden="true" className="h-4 w-4" />
                {t("contact")}
              </Link>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-[var(--border)] pt-6 md:grid-cols-4">
              {[
                [t("location"), record.country || t("notProvided")],
                [
                  t("memberSince"),
                  new Date(record.createdAt).toLocaleDateString(locale, {
                    month: "short",
                    year: "numeric",
                  }),
                ],
                [t("rate"), record.hourlyRate ? `$${record.hourlyRate}/hr` : t("notProvided")],
                [t("orders"), String(record._count.orders)],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="mb-1 text-xs text-[var(--text-muted)]">{label}</dt>
                  <dd className="break-words text-sm font-medium text-[var(--foreground)]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </header>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-8">
              <section className={panel}>
                <h2 className="mb-4 text-xl font-semibold tracking-tight">{t("about")}</h2>
                <p className="whitespace-pre-line break-words text-base leading-relaxed text-[var(--text-secondary)]">
                  {record.bio || t("noBio")}
                </p>
              </section>
              <section>
                <h2 className="mb-5 text-2xl font-semibold tracking-tight">
                  {t("services", { count: record.services.length })}
                </h2>
                {record.services.length ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {record.services.map((service) => (
                      <GigCard key={service.id} gig={serviceGig(service)} />
                    ))}
                  </div>
                ) : (
                  <p className={`${panel} text-[var(--text-secondary)]`}>{t("noServices")}</p>
                )}
              </section>
              <section className={panel}>
                <h2 className="mb-6 text-xl font-semibold tracking-tight">{t("reviews")}</h2>
                {record.reviews.length ? (
                  <div className="divide-y divide-[var(--border)]">
                    {record.reviews.map((review) => (
                      <article key={review.id} className="py-5 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold">
                            {profileName(review.buyer.buyerProfile)}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)]">
                            {t("reviewRating", { rating: review.rating })} ·{" "}
                            <time dateTime={review.createdAt}>
                              {new Date(review.createdAt).toLocaleDateString(locale)}
                            </time>
                          </p>
                        </div>
                        <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-[var(--text-secondary)]">
                          {review.comment}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)]">{t("noReviews")}</p>
                )}
              </section>
            </div>
            <aside className="space-y-6">
              <section className={panel}>
                <h2 className="mb-4 text-lg font-semibold">{t("skills")}</h2>
                {record.skills?.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {record.skills.map((skill) => (
                      <li
                        key={skill}
                        className="break-words rounded-md border border-[var(--border)] bg-[var(--subtle)] px-3 py-1.5 text-sm text-[var(--text-secondary)]"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{t("notProvided")}</p>
                )}
              </section>
              <section className={panel}>
                <h2 className="mb-4 text-lg font-semibold">{t("languages")}</h2>
                {record.languages?.length ? (
                  <ul className="space-y-3">
                    {record.languages.map((language) => (
                      <li
                        key={language}
                        className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <Globe
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                        />
                        {language}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{t("notProvided")}</p>
                )}
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

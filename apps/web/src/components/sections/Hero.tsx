"use client"

import { useTranslations } from "next-intl"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { SearchBar } from "@/components/ui/SearchBar"
import { ServiceCardImage } from "@/components/ui/ServiceCardImage"
import { ApiState } from "@/components/feedback/ApiState"
import { useApiResource } from "@/hooks/useApiResource"
import { imageUrl, type Service } from "@/lib/marketplace"

export function Hero() {
  const t = useTranslations("premiumHome")
  const resource = useApiResource<{ services: Service[] }>("/api/v1/services?limit=3&page=1")
  const services = resource.data?.services || []
  return (
    <section className="border-b border-border-default">
      <div className="premium-container grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
        <div className="flex flex-col justify-center lg:col-span-7">
          <p className="premium-eyebrow mb-6">{t("eyebrow")}</p>
          <h1 className="premium-display max-w-3xl">
            {t("title1")} <span className="text-primary">{t("title2")}</span>
          </h1>
          <p className="premium-body mt-6 max-w-xl">{t("intro")}</p>
          <div className="mt-8">
            <SearchBar />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/services" className="premium-link">
              {t("browse")}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link href="/register?role=seller" className="premium-link text-text-secondary">
              {t("sell")}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="mb-4 flex items-center justify-between border-b border-border-default pb-3">
            <p className="premium-eyebrow">{t("current")}</p>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-text-muted" />
          </div>
          {resource.loading && (
            <div role="status" aria-label="Loading marketplace services">
              <div className="premium-panel mb-4 overflow-hidden" aria-hidden="true">
                <div className="aspect-[4/3] bg-bg-elevated animate-pulse motion-reduce:animate-none" />
                <div className="h-32 p-5">
                  <div className="mb-3 h-3 w-24 rounded bg-bg-elevated" />
                  <div className="h-5 w-4/5 rounded bg-bg-elevated" />
                  <div className="mt-3 h-5 w-2/3 rounded bg-bg-elevated" />
                </div>
              </div>
              {[0, 1].map((index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="h-20 border-b border-border-default py-4"
                >
                  <div className="h-3 w-24 rounded bg-bg-elevated" />
                  <div className="mt-3 h-4 w-4/5 rounded bg-bg-elevated" />
                </div>
              ))}
            </div>
          )}
          <ApiState
            error={resource.error}
            retry={resource.reload}
            empty={
              !resource.loading && !resource.error && !services.length ? t("noServices") : undefined
            }
          />
          {services.map((service, index) => {
            const prices = service.packages
              .map((item) => Number(item.price))
              .filter(Number.isFinite)
            return (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className={`group block overflow-hidden border-border-default ${index === 0 ? "premium-panel mb-4" : "border-b py-4"}`}
              >
                {index === 0 ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-bg-subtle">
                    <ServiceCardImage
                      src={imageUrl(service.images[0]?.url)}
                      alt={service.title}
                      sizes="(max-width: 1024px) 100vw, 480px"
                      priority
                    />
                  </div>
                ) : null}
                <div
                  className={`flex items-start justify-between gap-4 ${index === 0 ? "p-5" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-text-secondary">{service.category.name}</p>
                    <h2
                      className={`line-clamp-2 font-medium leading-snug group-hover:text-primary ${index === 0 ? "text-lg" : "text-sm"}`}
                    >
                      {service.title}
                    </h2>
                    {index === 0 && prices.length > 0 && (
                      <p className="mt-3 text-sm text-text-secondary">
                        {t("from")}{" "}
                        <span className="font-semibold text-text-primary">
                          $
                          {Math.min(...prices).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0 text-text-muted group-hover:text-primary"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useTranslations } from "next-intl"
import { ArrowRight, ArrowUpRight, Layers, Star } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { GigCard } from "@/components/ui/GigCard"
import { GigCardSkeleton } from "@/components/ui/GigCardSkeleton"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { imageUrl, profileName, serviceGig, type Service, type Profile } from "@/lib/marketplace"

export function FeaturedServices() {
  const t = useTranslations("premiumHome")
  const resource = useApiResource<{ services: Service[] }>("/api/v1/services?limit=6&page=1")
  return (
    <section className="premium-section premium-container">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="premium-eyebrow mb-3">{t("featuredEyebrow")}</p>
          <h2 className="premium-title">{t("featuredTitle")}</h2>
          <p className="premium-body mt-3">{t("featuredIntro")}</p>
        </div>
        <Link href="/services" className="premium-link">
          {t("browse")}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      {resource.loading ? (
        <div
          role="status"
          aria-label="Loading services"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <GigCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <ApiState
            error={resource.error}
            retry={resource.reload}
            empty={!resource.error && !resource.data?.services.length ? t("noServices") : undefined}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resource.data?.services.map((service) => (
              <GigCard key={service.id} gig={serviceGig(service)} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export function MarketplaceCategories() {
  const t = useTranslations("premiumHome")
  const resource = useApiResource<
    { id: string; name: string; slug: string; parentId: string | null }[]
  >("/api/v1/marketplace/categories")
  return (
    <section
      id="categories"
      className="premium-section border-y border-border-default bg-bg-surface"
    >
      <div className="premium-container grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <p className="premium-eyebrow mb-3">{t("categoryEyebrow")}</p>
          <h2 className="premium-title">{t("categoryTitle")}</h2>
          <p className="premium-body mt-4">{t("categoryIntro")}</p>
        </div>
        <div>
          <ApiState
            loading={resource.loading}
            error={resource.error}
            retry={resource.reload}
            empty={
              !resource.loading && !resource.error && !resource.data?.length
                ? t("categoryEmpty")
                : undefined
            }
          />
          <div className="grid sm:grid-cols-2 sm:gap-x-8">
            {resource.data
              ?.filter((category) => !category.parentId)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/services?category=${category.slug}`}
                  className="group flex min-h-20 items-center gap-4 border-b border-border-default py-4 text-sm font-medium hover:text-primary"
                >
                  <Layers aria-hidden="true" className="h-5 w-5 shrink-0 text-text-muted" />
                  <span className="flex-1">{category.name}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 text-text-muted group-hover:text-primary"
                  />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function MarketplaceTalent() {
  const t = useTranslations("premiumHome")
  const resource = useApiResource<Profile[]>("/api/v1/marketplace/sellers?limit=4")
  return (
    <section id="talent" className="premium-section border-t border-border-default bg-bg-subtle">
      <div className="premium-container">
        <p className="premium-eyebrow mb-3">{t("talentEyebrow")}</p>
        <h2 className="premium-title">{t("talentTitle")}</h2>
        <p className="premium-body mt-3">{t("talentIntro")}</p>
        <div className="mt-8">
          <ApiState
            loading={resource.loading}
            error={resource.error}
            retry={resource.reload}
            empty={
              !resource.loading && !resource.error && !resource.data?.length
                ? t("talentEmpty")
                : undefined
            }
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {resource.data?.slice(0, 4).map((profile) => (
            <article key={profile.id} className="premium-panel flex flex-col p-6">
              <AvatarImage
                src={imageUrl(profile.avatar)}
                name={profileName(profile)}
                alt={profileName(profile)}
                size={56}
                rounded="md"
              />
              <h3 className="mt-5 text-lg font-medium">{profileName(profile)}</h3>
              <p className="mt-1 text-sm text-text-secondary">{profile.professionalTitle}</p>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                {(profile.ratingCount || 0) > 0 ? (
                  <>
                    <Star aria-hidden="true" className="h-4 w-4 text-status-warning" />
                    <span>{Number(profile.ratingAverage || 0).toFixed(1)}</span>
                    <span className="text-text-muted">({profile.ratingCount})</span>
                  </>
                ) : (
                  <span className="text-text-muted">{t("noReviews")}</span>
                )}
              </div>
              <Link href={`/freelancers/${profile.id}`} className="premium-link mt-5">
                {t("profile")}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

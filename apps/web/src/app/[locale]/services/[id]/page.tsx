"use client"

import { requestData, jsonRequest, imageUrl, profileName, type Service } from "@/lib/marketplace"
import { useApiResource } from "@/hooks/useApiResource"
import { usePaymentCapability } from "@/hooks/usePaymentCapability"
import { ApiState } from "@/components/feedback/ApiState"
import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useParams } from "next/navigation"
import {
  Star,
  Clock,
  RotateCcw,
  CheckCircle2,
  Heart,
  Share2,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { GigAddon } from "@/data/gigs"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { useDialogFocus } from "@/hooks/useDialogFocus"
import { ServiceCardImage } from "@/components/ui/ServiceCardImage"
import { ServiceDescription } from "@/components/services/ServiceDescription"

export default function ServiceDetailPage() {
  const params = useParams()
  const resource = useApiResource<Service>(`/api/v1/services/${String(params.id)}`)
  if (resource.loading || resource.error || !resource.data)
    return (
      <div className="container mx-auto px-4 py-10">
        <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      </div>
    )
  if (!resource.data.packages.length)
    return <ApiState empty="This service has no available package." />
  return <ServiceDetailContent key={resource.data.id} record={resource.data} />
}
function ServiceDetailContent({ record }: { record: Service }) {
  const payments = usePaymentCapability()
  const t = useTranslations("serviceDetail")
  const router = useRouter()
  const service = React.useMemo(
    () => ({
      ...record,
      seller: {
        ...record.seller,
        user: { profile: { ...record.seller, avatar: imageUrl(record.seller.avatar) } },
        title: record.seller.professionalTitle || "",
        memberSince: record.seller.createdAt
          ? new Date(record.seller.createdAt).getFullYear()
          : "Unavailable",
        completedOrders: null,
        responseTimeHours: null,
      },
      images: record.images.length
        ? record.images.map((i) => ({ url: imageUrl(i.url) }))
        : [{ url: "/favicon.svg" }],
      packages: record.packages.map((p) => ({ ...p, name: p.title, price: Number(p.price) })),
      reviews: (record.reviews || []).map((r) => ({
        ...r,
        buyer: {
          name: profileName(r.buyer.buyerProfile),
          avatar: imageUrl(r.buyer.buyerProfile?.avatar),
          country: r.buyer.buyerProfile?.country || "",
        },
        date: new Date(r.createdAt).toLocaleDateString(),
      })),
      faqs: (record.faqs || []).map((f) => ({ q: f.question, a: f.answer })),
    }),
    [record]
  )
  const availableTiers = service.packages.map((p) => p.type)
  const [selectedPackageTier, setSelectedPackageTier] = React.useState(
    service.packages.find((p) => p.type === "STANDARD")?.type || service.packages[0]!.type
  )
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([])
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [orderModalOpen, setOrderModalOpen] = React.useState(false)
  const [orderSuccess, setOrderSuccess] = React.useState(false)
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const [showAllReviews, setShowAllReviews] = React.useState(false)
  const [actionError, setActionError] = React.useState("")
  const [createdOrder, setCreatedOrder] = React.useState<{
    id: string
    amount: string
    status: string
  } | null>(null)
  const orderDialogRef = React.useRef<HTMLDivElement>(null)
  useDialogFocus(orderModalOpen, orderDialogRef, () => {
    if (!isCheckingOut) setOrderModalOpen(false)
  })
  const checkout = React.useRef<{ packageId: string; key: string } | null>(null)
  const currentPackage =
    service.packages.find((p) => p.type === selectedPackageTier) || service.packages[0]!
  const availableAddons: GigAddon[] = []
  const SERVICE_ADDONS = availableAddons
  const computedTotal = currentPackage.price
  const toggleAddon = (id: string) =>
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  React.useEffect(() => {
    if (!localStorage.getItem("user")) return
    let active = true
    requestData<Service[]>("/api/v1/favorites")
      .then((saved) => {
        if (active) setIsFavorite(saved.some((s) => s.id === record.id))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [record.id])
  async function toggleFavorite() {
    try {
      await requestData(
        `/api/v1/favorites/${record.id}`,
        jsonRequest(isFavorite ? "DELETE" : "POST")
      )
      setIsFavorite(!isFavorite)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to save service.")
    }
  }
  const handleStartOrder = () => {
    if (!payments.available) return
    setActionError("")
    setOrderSuccess(false)
    setOrderModalOpen(true)
  }
  async function createOrder() {
    if (!payments.available || isCheckingOut || orderSuccess) return
    setIsCheckingOut(true)
    setActionError("")
    if (!checkout.current || checkout.current.packageId !== currentPackage.id)
      checkout.current = { packageId: currentPackage.id, key: crypto.randomUUID() }
    try {
      const order = await requestData<{ id: string; amount: string; status: string }>(
        "/api/v1/orders",
        jsonRequest("POST", {
          serviceId: record.id,
          packageId: currentPackage.id,
          idempotencyKey: checkout.current.key,
        })
      )
      setCreatedOrder(order)
      setOrderSuccess(true)
      checkout.current = null
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to create order.")
    } finally {
      setIsCheckingOut(false)
    }
  }
  return (
    <div className="premium-container py-10 pb-32 lg:pb-10 min-h-screen">
      <ApiState error={actionError} />
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-text-muted mb-6 overflow-x-auto scrollbar-none py-1"
      >
        <Link href="/" className="hover:text-text-primary transition-colors shrink-0">
          {t("breadcrumbHome")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/explore" className="hover:text-text-primary transition-colors shrink-0">
          {t("breadcrumbExplore")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link
          href={`/explore?category=${service.category?.slug || ""}`}
          className="hover:text-text-primary transition-colors shrink-0"
        >
          {service.category?.name || "Professional"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-text-primary truncate max-w-xs">{service.title}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Details & Media (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div>
            <p className="premium-eyebrow mb-3">{service.category?.name}</p>

            <h1
              data-testid="service-title"
              className="text-3xl font-medium leading-tight tracking-[-0.035em] text-[var(--foreground)] sm:text-4xl"
            >
              {service.title}
            </h1>

            {/* Seller meta line */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/40 text-sm text-text-secondary">
              <div className="flex items-center gap-2.5">
                <AvatarImage
                  src={service.seller.user.profile.avatar}
                  name={`${service.seller.user.profile.firstName} ${service.seller.user.profile.lastName}`}
                  id={service.seller.id}
                  size={32}
                  rounded="full"
                  alt={`${service.seller.user.profile.firstName} ${service.seller.user.profile.lastName} - Specialist profile`}
                />
                <div>
                  <span data-testid="seller-name" className="font-medium text-text-primary block">
                    {service.seller.user.profile.firstName} {service.seller.user.profile.lastName}
                  </span>
                  <span className="text-xs text-text-muted">{service.seller.title}</span>
                </div>
              </div>

              <span className="text-border">•</span>

              {service.ratingCount > 0 ? (
                <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                  <Star aria-hidden="true" className="h-4 w-4 fill-current" />
                  <span className="font-medium">{service.ratingAverage}</span>
                  <span className="text-text-muted">
                    {t("reviewsCount", { count: service.ratingCount })}
                  </span>
                </div>
              ) : (
                <span className="text-text-muted">No reviews yet</span>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => void toggleFavorite()}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
                    isFavorite
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                      : "border-border bg-surface text-text-muted hover:text-text-primary"
                  }`}
                  aria-label={isFavorite ? "Remove from saved" : "Save service"}
                  aria-pressed={isFavorite}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Share service"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="space-y-3">
            <div
              role="region"
              aria-label="Service image gallery"
              className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border bg-slate-100"
            >
              <ServiceCardImage
                src={service.images[selectedImageIndex]?.url || service.images[0]?.url}
                alt={`${service.title} - Main service preview shot ${selectedImageIndex + 1}`}
                priority
                sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1440px) 62vw, 820px"
              />
              {service.images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setSelectedImageIndex(
                        (index) => (index - 1 + service.images.length) % service.images.length
                      )
                    }
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() =>
                      setSelectedImageIndex((index) => (index + 1) % service.images.length)
                    }
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <span
                    role="status"
                    className="absolute bottom-3 right-3 rounded-md bg-[var(--surface)] px-2 py-1 text-sm"
                  >
                    {selectedImageIndex + 1} / {service.images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {service.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {service.images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-[16/10] w-24 shrink-0 rounded-lg overflow-hidden border transition-all ${
                      selectedImageIndex === index
                        ? "border-[var(--primary)] ring-2 ring-[var(--focus-ring)]"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <ServiceCardImage
                      src={img.url}
                      alt={`${service.title} preview thumbnail ${index + 1}`}
                      sizes="96px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Description */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7 space-y-6">
            <h2 className="font-display text-xl text-text-primary font-medium">
              {t("aboutService")}
            </h2>
            <ServiceDescription text={service.description} />
          </div>

          {/* About The Seller */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7 space-y-6">
            <h2 className="font-display text-xl text-text-primary font-medium">
              {t("aboutSpecialist")}
            </h2>

            <div className="flex flex-col sm:flex-row items-start gap-5">
              <AvatarImage
                src={service.seller.user.profile.avatar}
                name={`${service.seller.user.profile.firstName} ${service.seller.user.profile.lastName}`}
                id={service.seller.id}
                size={64}
                rounded="full"
                alt={`${service.seller.user.profile.firstName} ${service.seller.user.profile.lastName} - Specialist portrait`}
                imageClassName="border-2 border-blue-600/30"
              />
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold text-lg text-text-primary">
                    {service.seller.user.profile.firstName} {service.seller.user.profile.lastName}
                  </h3>
                </div>
                <p className="text-sm text-[var(--primary)] font-medium">{service.seller.title}</p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {service.seller.user.profile.bio}
                </p>
              </div>
            </div>

            {/* Seller stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50 text-sm">
              <div className="p-3 rounded-xl bg-[var(--subtle)] border border-border">
                <span className="text-text-muted block text-xs uppercase">{t("location")}</span>
                <span className="font-medium text-text-primary">
                  {service.seller.user.profile.country || "Not provided"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--subtle)] border border-border">
                <span className="text-text-muted block text-xs uppercase">{t("memberSince")}</span>
                <span className="font-medium text-text-primary">{service.seller.memberSince}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--subtle)] border border-border">
                <span className="text-text-muted block text-xs uppercase">{t("rating")}</span>
                <span className="font-medium text-[var(--foreground)] flex items-center gap-1">
                  {(service.seller.ratingCount || 0) > 0 ? (
                    <>
                      <Star aria-hidden="true" className="h-3 w-3 fill-current" />
                      {service.seller.ratingAverage}
                    </>
                  ) : (
                    "No reviews yet"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Client Reviews Section */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
              <div>
                <h2 className="font-display text-xl text-text-primary font-medium">
                  {t("clientReviews")}
                </h2>
              </div>
              {service.ratingCount > 0 && (
                <div className="flex items-center gap-1.5 text-[var(--foreground)] font-semibold text-lg">
                  <Star aria-hidden="true" className="h-5 w-5 fill-current" />
                  <span>{service.ratingAverage}</span>
                  <span className="text-sm text-text-muted font-normal">
                    {t("reviewsCount", { count: service.ratingCount })}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {service.reviews.length === 0 && (
                <p className="text-text-muted">No reviews have been submitted yet.</p>
              )}
              {(showAllReviews ? service.reviews : service.reviews.slice(0, 4)).map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-[var(--subtle)] border border-border space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarImage
                        src={rev.buyer.avatar}
                        name={rev.buyer.name}
                        id={rev.id}
                        size={32}
                        rounded="full"
                        alt={`${rev.buyer.name} - Buyer avatar`}
                      />
                      <div>
                        <span className="font-medium text-sm text-text-primary block">
                          {rev.buyer.name}
                        </span>
                        <span className="text-xs text-text-muted">{rev.buyer.country}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--foreground)] text-sm">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                      <span className="text-text-muted text-xs ml-1.5">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed pt-1">{rev.comment}</p>
                  {Boolean("sellerResponse" in rev && rev.sellerResponse) ? (
                    <div className="mt-2.5 p-3 rounded-lg bg-[var(--primary-subtle)] border border-blue-100/80 text-sm space-y-1">
                      <div className="flex items-center gap-1.5 text-[var(--primary)] font-semibold text-xs">
                        <span>Response from seller</span>
                      </div>
                      <p className="text-text-secondary text-xs leading-relaxed">
                        {(rev as { sellerResponse?: { comment: string } }).sellerResponse?.comment}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}

              {service.reviews.length > 4 && (
                <button
                  type="button"
                  data-testid="show-more-reviews-btn"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-[var(--subtle)] transition-colors cursor-pointer"
                >
                  {showAllReviews
                    ? "Show fewer reviews"
                    : `Show all ${service.reviews.length} loaded reviews`}
                </button>
              )}
            </div>
          </div>

          {/* FAQ Accordion */}
          {service.faqs && service.faqs.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-7 space-y-4">
              <h2 className="font-display text-xl text-text-primary font-medium mb-4">
                {t("faq")}
              </h2>
              <div className="space-y-3">
                {service.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--subtle)] border border-border">
                    <h4 className="font-medium text-sm text-text-primary">{faq.q}</h4>
                    <p className="text-sm text-text-muted mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Pricing Packages (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-[var(--shadow-sm)] space-y-6">
            {/* Package Tabs */}
            <div
              className={cn(
                "grid rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 p-1.5",
                availableTiers.length === 1 && "grid-cols-1",
                availableTiers.length === 2 && "grid-cols-2",
                availableTiers.length >= 3 && "grid-cols-3"
              )}
            >
              {availableTiers.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={selectedPackageTier === tier}
                  data-testid={`package-tab-${tier.toLowerCase()}`}
                  onClick={() => setSelectedPackageTier(tier)}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                    selectedPackageTier === tier
                      ? "bg-[var(--surface)] dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Tier Overview */}
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-lg text-text-primary font-medium">
                {currentPackage.name}
              </h3>
              <span
                data-testid="package-price"
                className="font-sans text-3xl font-semibold text-text-primary tracking-tight"
              >
                ${currentPackage.price}
              </span>
            </div>

            <p className="text-sm text-text-muted leading-relaxed">{currentPackage.description}</p>

            {/* Delivery & Revisions Badge */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/50 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="h-4 w-4 text-[var(--primary)]" />
                <span>{t("daysDelivery", { days: currentPackage.deliveryDays })}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <RotateCcw className="h-4 w-4 text-[var(--primary)]" />
                <span>{t("revisionsCount", { count: currentPackage.revisions })}</span>
              </div>
            </div>

            {/* Included Features Checklist */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
                {t("deliverablesIncluded")}
              </span>
              <ul data-testid="package-features" className="space-y-2 text-sm text-text-secondary">
                {currentPackage.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add-ons */}
            {availableAddons.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-border/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
                  Upgrade Deliverables
                </span>
                <div className="space-y-2">
                  {availableAddons.map((addon: GigAddon) => {
                    const isChecked = selectedAddons.includes(addon.id)
                    return (
                      <label
                        key={addon.id}
                        data-testid={`addon-item-${addon.id}`}
                        className={cn(
                          "flex items-start justify-between p-2.5 rounded-xl border text-sm cursor-pointer select-none transition-all",
                          isChecked
                            ? "border-blue-600 bg-[var(--primary-subtle)] ring-1 ring-blue-600"
                            : "border-border hover:bg-[var(--subtle)]"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            data-testid={`addon-checkbox-${addon.id}`}
                            checked={isChecked}
                            onChange={() => toggleAddon(addon.id)}
                            className="mt-0.5 rounded border-border text-[var(--primary)] focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-semibold text-text-primary block">
                              {addon.name}
                            </span>
                            <span className="text-xs text-text-muted">{addon.description}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-text-primary shrink-0 ml-2 tabular-nums">
                          +${addon.price}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Total Computed Price */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold text-text-primary">Computed Total:</span>
              <span
                data-testid="order-total-price"
                className="text-2xl font-bold tabular-nums text-[var(--primary)]"
              >
                ${computedTotal}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {!payments.available && <p role="status">{payments.message}</p>}
              <Button
                data-testid="continue-order-btn"
                disabled={!payments.available}
                onClick={handleStartOrder}
                className="w-full rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3.5 font-semibold  gap-2 transition-all cursor-pointer "
              >
                <span>{t("continueOrder", { price: computedTotal })}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Link href={`/dashboard/messages?seller=${service.seller.id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-border bg-[var(--surface)] hover:bg-[var(--subtle)] text-text-primary text-sm gap-2"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>{t("contactSpecialist")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-slate-200/80 dark:border-slate-800 px-4 py-3 safe-area-bottom shadow-[var(--shadow-lg)] flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {selectedPackageTier}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-0.5">
              <Clock className="h-3 w-3 text-[var(--primary)]" />
              {currentPackage.deliveryDays}d
            </span>
          </div>
          <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white leading-tight">
            ${computedTotal}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/messages?seller=${service.seller.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-11 w-11 p-0 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
              aria-label="Contact Specialist"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            onClick={handleStartOrder}
            disabled={!payments.available}
            className="h-11 px-5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold  text-sm sm:text-sm gap-2 "
          >
            <span>{t("continueOrder", { price: computedTotal })}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Server-backed order confirmation */}
      {orderModalOpen && (
        <div
          data-testid="checkout-drawer-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4"
        >
          <div
            ref={orderDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-confirmation-title"
            data-testid="checkout-drawer"
            className="max-h-[90dvh] overflow-y-auto max-w-md w-full rounded-xl border border-border bg-[var(--surface)] p-6 space-y-6 shadow-[var(--shadow-lg)]  safe-area-bottom"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3
                id="order-confirmation-title"
                className="font-display text-lg text-text-primary font-medium"
              >
                {t("orderConfirmation")}
              </h3>
              <Badge variant="luxury">{selectedPackageTier}</Badge>
            </div>

            <ApiState error={actionError} />
            {orderSuccess ? (
              <div
                data-testid="checkout-success"
                className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-emerald-900 text-base">
                  Order Confirmed Successfully!
                </h4>
                <p className="text-sm text-emerald-700">
                  Your order for {service.title} was created with payment pending. No charge, escrow
                  activation or transfer has occurred.
                  {createdOrder && (
                    <span className="block mt-2">
                      Order amount: ${createdOrder.amount} · {createdOrder.status}
                    </span>
                  )}
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    data-testid="view-order-dashboard-btn"
                    onClick={() => {
                      setOrderModalOpen(false)
                      router.push("/dashboard/orders")
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer"
                  >
                    View in Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-sm text-text-secondary">
                  <p className="text-text-primary font-medium text-sm">{service.title}</p>
                  <div className="p-3 rounded-xl bg-[var(--subtle)] border border-border flex justify-between items-center">
                    <span>Package: {currentPackage.name}</span>
                    <span className="font-bold text-text-primary text-base">
                      ${currentPackage.price}
                    </span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="p-3 rounded-xl bg-[var(--subtle)] border border-border space-y-1">
                      <span className="font-medium text-text-primary block">Add-ons Selected:</span>
                      {selectedAddons.map((id) => {
                        const addon = SERVICE_ADDONS.find((a) => a.id === id)
                        return (
                          <div key={id} className="flex justify-between text-xs text-text-muted">
                            <span>+ {addon?.name}</span>
                            <span className="tabular-nums">+${addon?.price}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-[var(--primary-subtle)] border border-blue-200 flex justify-between items-center">
                    <span className="font-bold text-[var(--primary)]">Total Billed:</span>
                    <span
                      data-testid="drawer-total-price"
                      className="font-bold text-[var(--primary)] text-lg tabular-nums"
                    >
                      ${computedTotal}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isCheckingOut || !payments.available}
                    onClick={() => setOrderModalOpen(false)}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    data-testid="confirm-checkout-btn"
                    isLoading={isCheckingOut}
                    loadingText="Đang xử lý..."
                    onClick={() => void createOrder()}
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold cursor-pointer   py-2.5 rounded-xl"
                  >
                    Create order
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

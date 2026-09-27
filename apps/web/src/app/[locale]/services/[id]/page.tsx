"use client"

import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useParams } from "next/navigation"
import {
  Star,
  Clock,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Share2,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

// Fallback curated service details
const FALLBACK_SERVICE_DETAIL = {
  id: "srv-1",
  title: "Full-Stack Next.js 15 & Node.js Production Architecture with Clean Code",
  category: { name: "Programming & Tech", slug: "programming" },
  ratingAverage: 4.98,
  ratingCount: 42,
  seller: {
    id: "seller-1",
    user: {
      profile: {
        firstName: "Alexandre",
        lastName: "Moreau",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "Principal Software Architect with 12+ years of experience designing high-throughput distributed systems, Next.js applications, and secure microservices.",
        country: "France",
      },
      email: "alexandre@tascora.com",
    },
    level: "TOP_RATED",
    title: "Senior Full-Stack Architect",
    ratingAverage: 4.99,
    ratingCount: 114,
    completedOrders: 114,
    responseTimeHours: 1,
    memberSince: "2023",
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    },
  ],
  description: `Are you seeking a high-throughput, enterprise-grade Next.js 15 and Node.js architecture engineered for production scale?

I specialize in building bulletproof full-stack platforms adhering to Clean Architecture principles, automated test coverage, and optimized database indexing.

### What is included in this service:
- **Full Architecture Blueprint**: Scalable modular monolith or microservices pattern.
- **Next.js 15 App Router**: Server components, streaming SSR, and edge API optimization.
- **Enterprise Database Modeling**: PostgreSQL schema with Prisma ORM, foreign keys, and zero-downtime migration scripts.
- **Authentication & Security**: Multi-tenant JWT session cookies, rate-limiting, CORS whitelisting, and input sanitization via Zod.
- **Containerization & CI/CD**: Docker Compose development setup and GitHub Actions pipelines.`,
  packages: [
    {
      type: "BASIC",
      name: "Starter Architecture",
      price: 250,
      deliveryDays: 3,
      revisions: 2,
      description:
        "Ideal for early-stage MVPs or technical audits. Clean project scaffold with Next.js 15 and database configuration.",
      features: [
        "Core Next.js 15 Scaffold",
        "Prisma ORM & PostgreSQL Setup",
        "JWT Authentication Boilerplate",
        "2 Revisions included",
        "3 Days Delivery",
      ],
    },
    {
      type: "STANDARD",
      name: "Production Monorepo",
      price: 450,
      deliveryDays: 5,
      revisions: 4,
      description:
        "Comprehensive production setup with full API integration, Redis caching, and real-time Socket.io.",
      features: [
        "Everything in Basic",
        "pnpm Monorepo Configuration",
        "Redis Cache & Rate Limiting",
        "Socket.io Real-time Setup",
        "Stripe Payment Webhook Boilerplate",
        "4 Revisions included",
        "5 Days Delivery",
      ],
    },
    {
      type: "PREMIUM",
      name: "Enterprise Architecture",
      price: 850,
      deliveryDays: 7,
      revisions: 99,
      description:
        "Full-scale deployment with CI/CD, Docker production image, automated unit tests, and 30 days post-launch support.",
      features: [
        "Everything in Standard",
        "Docker Production Multi-Stage Build",
        "Automated CI/CD Pipeline",
        "Comprehensive Unit & E2E Test Suite",
        "Unlimited Revisions",
        "30 Days Dedicated Support",
      ],
    },
  ],
  reviews: [
    {
      id: "rev-1",
      buyer: {
        name: "Marcus Thorne",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        country: "United Kingdom",
      },
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Alexandre delivered an exceptional codebase. The architecture is clean, maintainable, and performs flawlessly under load. Will certainly hire again.",
    },
    {
      id: "rev-2",
      buyer: {
        name: "Sarah Lin",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        country: "United States",
      },
      rating: 5,
      date: "1 month ago",
      comment:
        "Outstanding communication and profound technical depth. The Next.js 15 setup saved our engineering team weeks of trial and error.",
    },
  ],
  faqs: [
    {
      q: "Which Next.js version is utilized?",
      a: "All deliverables utilize Next.js 15+ App Router with React 19 and strict TypeScript compiler settings.",
    },
    {
      q: "Can this be customized to my existing cloud infrastructure?",
      a: "Yes. Standard and Premium packages can be customized for AWS ECS, Vercel, Fly.io, or self-hosted Docker environments.",
    },
  ],
}

const SERVICE_ADDONS = [
  {
    id: "express-delivery",
    name: "24-Hour Express Delivery",
    price: 50,
    description: "Prioritize project delivery within 24 hours",
  },
  {
    id: "extra-revision",
    name: "Additional Code Audit & Revision Round",
    price: 35,
    description: "Deep architectural & vulnerability review",
  },
]

export default function ServiceDetailPage() {
  const t = useTranslations("serviceDetail")
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = React.useState(FALLBACK_SERVICE_DETAIL)
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [selectedPackageTier, setSelectedPackageTier] = React.useState<
    "BASIC" | "STANDARD" | "PREMIUM"
  >("STANDARD")
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([])
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [orderModalOpen, setOrderModalOpen] = React.useState(false)
  const [orderSuccess, setOrderSuccess] = React.useState(false)

  // Fetch from API
  React.useEffect(() => {
    async function loadService() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        const res = await fetch(`${apiUrl}/api/v1/services/${serviceId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            const apiData = data.data
            setService({
              ...FALLBACK_SERVICE_DETAIL,
              id: apiData.id,
              title: apiData.title,
              description: apiData.description || FALLBACK_SERVICE_DETAIL.description,
              ratingAverage: apiData.ratingAverage || 5.0,
              ratingCount: apiData.ratingCount || 12,
              seller: {
                ...FALLBACK_SERVICE_DETAIL.seller,
                ...(apiData.seller || {}),
              },
              packages:
                apiData.packages?.length > 0 ? apiData.packages : FALLBACK_SERVICE_DETAIL.packages,
              images: apiData.images?.length > 0 ? apiData.images : FALLBACK_SERVICE_DETAIL.images,
            })
          }
        }
      } catch {
        // Fallback works automatically
      }
    }
    void loadService()
  }, [serviceId])

  const currentPackage =
    service.packages.find((p) => p.type === selectedPackageTier) ??
    service.packages[0] ??
    FALLBACK_SERVICE_DETAIL.packages[0]!

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = SERVICE_ADDONS.find((a) => a.id === id)
    return sum + (addon ? addon.price : 0)
  }, 0)

  const computedTotal = currentPackage.price + addonsTotal

  const handleStartOrder = () => {
    setOrderSuccess(false)
    setOrderModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/" className="hover:text-text-primary transition-colors">
          {t("breadcrumbHome")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/explore" className="hover:text-text-primary transition-colors">
          {t("breadcrumbExplore")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/explore?category=${service.category?.slug || ""}`}
          className="hover:text-text-primary transition-colors"
        >
          {service.category?.name || "Professional"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text-primary truncate max-w-xs">{service.title}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Details & Media (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="luxury">{service.category?.name}</Badge>
              <Badge variant="outline" className="border-border text-text-muted">
                {service.seller.level === "TOP_RATED"
                  ? t("topRatedTalent")
                  : t("verifiedSpecialist")}
              </Badge>
            </div>

            <h1
              data-testid="service-title"
              className="font-display text-2xl sm:text-3xl md:text-4xl text-text-primary font-medium leading-snug"
            >
              {service.title}
            </h1>

            {/* Seller meta line */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/40 text-xs text-text-secondary">
              <div className="flex items-center gap-2.5">
                <img
                  src={service.seller.user.profile.avatar}
                  alt={service.seller.user.profile.firstName}
                  className="h-8 w-8 rounded-full object-cover border border-border"
                />
                <div>
                  <span data-testid="seller-name" className="font-medium text-text-primary block">
                    {service.seller.user.profile.firstName} {service.seller.user.profile.lastName}
                  </span>
                  <span className="text-[11px] text-text-muted">{service.seller.title}</span>
                </div>
              </div>

              <span className="text-border">•</span>

              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="h-4 w-4 fill-current" />
                <span>{service.ratingAverage}</span>
                <span className="text-text-muted font-normal">
                  {t("reviewsCount", { count: service.ratingCount })}
                </span>
              </div>

              <span className="text-border">•</span>

              <div className="flex items-center gap-1 text-text-muted">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>{t("respondsIn", { hours: service.seller.responseTimeHours })}</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isFavorite
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                      : "border-border bg-surface text-text-muted hover:text-text-primary"
                  }`}
                  aria-label="Save service"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="p-2 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Share service"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-border bg-slate-100">
              <img
                src={service.images[selectedImageIndex]?.url || service.images[0]?.url}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Thumbnail Strip */}
            {service.images.length > 1 && (
              <div className="flex gap-3">
                {service.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-[16/10] w-24 rounded-lg overflow-hidden border transition-all ${
                      selectedImageIndex === index
                        ? "border-blue-600 ring-2 ring-blue-600/30 scale-105"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Preview ${index}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Description */}
          <div className="rounded-2xl border border-border bg-surface p-7 space-y-6">
            <h2 className="font-display text-xl text-text-primary font-medium">
              {t("aboutService")}
            </h2>
            <div className="prose max-w-none text-sm leading-relaxed text-text-secondary whitespace-pre-line">
              {service.description}
            </div>
          </div>

          {/* About The Seller */}
          <div className="rounded-2xl border border-border bg-surface p-7 space-y-6">
            <h2 className="font-display text-xl text-text-primary font-medium">
              {t("aboutSpecialist")}
            </h2>

            <div className="flex flex-col sm:flex-row items-start gap-5">
              <img
                src={service.seller.user.profile.avatar}
                alt={service.seller.user.profile.firstName}
                className="h-16 w-16 rounded-full object-cover border-2 border-blue-600/30"
              />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-text-primary">
                    {service.seller.user.profile.firstName} {service.seller.user.profile.lastName}
                  </h3>
                  <Badge variant="luxury">{service.seller.level}</Badge>
                </div>
                <p className="text-xs text-blue-600 font-medium">{service.seller.title}</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {service.seller.user.profile.bio}
                </p>
              </div>
            </div>

            {/* Seller stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-muted block text-[10px] uppercase">{t("location")}</span>
                <span className="font-medium text-text-primary">
                  {service.seller.user.profile.country || "Global"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-muted block text-[10px] uppercase">
                  {t("memberSince")}
                </span>
                <span className="font-medium text-text-primary">{service.seller.memberSince}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-muted block text-[10px] uppercase">
                  {t("ordersDelivered")}
                </span>
                <span className="font-medium text-text-primary">
                  {service.seller.completedOrders}+
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-muted block text-[10px] uppercase">{t("rating")}</span>
                <span className="font-medium text-amber-500 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {service.seller.ratingAverage}
                </span>
              </div>
            </div>
          </div>

          {/* Client Reviews Section */}
          <div className="rounded-2xl border border-border bg-surface p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div>
                <h2 className="font-display text-xl text-text-primary font-medium">
                  {t("clientReviews")}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">{t("clientReviewsSubtext")}</p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-lg">
                <Star className="h-5 w-5 fill-current" />
                <span>{service.ratingAverage}</span>
                <span className="text-xs text-text-muted font-normal">
                  {t("reviewsCount", { count: service.ratingCount })}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {service.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-slate-50 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.buyer.avatar}
                        alt={rev.buyer.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-medium text-xs text-text-primary block">
                          {rev.buyer.name}
                        </span>
                        <span className="text-[10px] text-text-muted">{rev.buyer.country}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                      <span className="text-text-muted text-[11px] ml-1.5">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed pt-1">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          {service.faqs && service.faqs.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-7 space-y-4">
              <h2 className="font-display text-xl text-text-primary font-medium mb-4">
                {t("faq")}
              </h2>
              <div className="space-y-3">
                {service.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-border">
                    <h4 className="font-medium text-xs text-text-primary">{faq.q}</h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Pricing Packages (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-6">
            {/* Package Tabs */}
            <div className="grid grid-cols-3 rounded-xl border border-border bg-slate-100 p-1">
              {(["BASIC", "STANDARD", "PREMIUM"] as const).map((tier) => (
                <button
                  key={tier}
                  data-testid={`package-tab-${tier.toLowerCase()}`}
                  onClick={() => setSelectedPackageTier(tier)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedPackageTier === tier
                      ? "bg-blue-600 text-white shadow"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Tier Overview */}
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-lg text-text-primary font-medium">
                {currentPackage.name}
              </h3>
              <span
                data-testid="package-price"
                className="font-sans text-3xl font-bold text-text-primary tracking-tight"
              >
                ${currentPackage.price}
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">{currentPackage.description}</p>

            {/* Delivery & Revisions Badge */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/50 text-xs">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{t("daysDelivery", { days: currentPackage.deliveryDays })}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <RotateCcw className="h-4 w-4 text-blue-600" />
                <span>
                  {currentPackage.revisions >= 90
                    ? t("unlimitedRevisions")
                    : t("revisionsCount", { count: currentPackage.revisions })}
                </span>
              </div>
            </div>

            {/* Included Features Checklist */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                {t("deliverablesIncluded")}
              </span>
              <ul data-testid="package-features" className="space-y-2 text-xs text-text-secondary">
                {currentPackage.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add-ons */}
            <div className="space-y-2.5 pt-2 border-t border-border/50">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                Upgrade Deliverables
              </span>
              <div className="space-y-2">
                {SERVICE_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id)
                  return (
                    <label
                      key={addon.id}
                      data-testid={`addon-item-${addon.id}`}
                      className={cn(
                        "flex items-start justify-between p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all",
                        isChecked
                          ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                          : "border-border hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          data-testid={`addon-checkbox-${addon.id}`}
                          checked={isChecked}
                          onChange={() => toggleAddon(addon.id)}
                          className="mt-0.5 rounded border-border text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-semibold text-text-primary block">
                            {addon.name}
                          </span>
                          <span className="text-[11px] text-text-muted">{addon.description}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-text-primary shrink-0 ml-2 font-mono">
                        +${addon.price}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Total Computed Price */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs font-semibold text-text-primary">Computed Total:</span>
              <span
                data-testid="order-total-price"
                className="text-2xl font-bold font-mono text-blue-700"
              >
                ${computedTotal}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                data-testid="continue-order-btn"
                onClick={handleStartOrder}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold shadow-lg shadow-blue-600/20 gap-2 transition-all cursor-pointer"
              >
                <span>{t("continueOrder", { price: computedTotal })}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Link href={`/dashboard/messages?seller=${service.seller.id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-border bg-white hover:bg-slate-50 text-text-primary text-xs gap-2"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                  <span>{t("contactSpecialist")}</span>
                </Button>
              </Link>
            </div>

            {/* Escrow Guarantee Statement */}
            <div className="pt-2 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>{t("escrowMilestone")}</span>
              </div>
              <p className="text-[10px] text-text-muted mt-0.5">{t("escrowGuaranteeNote")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Order Drawer Confirmation */}
      {orderModalOpen && (
        <div
          data-testid="checkout-drawer-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            data-testid="checkout-drawer"
            className="max-w-md w-full rounded-2xl border border-border bg-white p-6 space-y-6 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-lg text-text-primary font-medium">
                {t("orderConfirmation")}
              </h3>
              <Badge variant="luxury">{selectedPackageTier}</Badge>
            </div>

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
                <p className="text-xs text-emerald-700">
                  Your milestone escrow contract has been activated for{" "}
                  <strong>${computedTotal}</strong>. The freelancer has been notified.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    data-testid="view-order-dashboard-btn"
                    onClick={() => {
                      setOrderModalOpen(false)
                      router.push("/dashboard/orders")
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer"
                  >
                    View in Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs text-text-secondary">
                  <p className="text-text-primary font-medium text-sm">{service.title}</p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-border flex justify-between items-center">
                    <span>Package: {currentPackage.name}</span>
                    <span className="font-bold text-text-primary text-base">
                      ${currentPackage.price}
                    </span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-border space-y-1">
                      <span className="font-medium text-text-primary block">Add-ons Selected:</span>
                      {selectedAddons.map((id) => {
                        const addon = SERVICE_ADDONS.find((a) => a.id === id)
                        return (
                          <div
                            key={id}
                            className="flex justify-between text-[11px] text-text-muted"
                          >
                            <span>+ {addon?.name}</span>
                            <span className="font-mono">+${addon?.price}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex justify-between items-center">
                    <span className="font-bold text-blue-900">Total Billed:</span>
                    <span
                      data-testid="drawer-total-price"
                      className="font-bold text-blue-700 text-lg font-mono"
                    >
                      ${computedTotal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 text-[11px] pt-1">
                    <Lock className="h-3.5 w-3.5" />
                    <span>{t("protectedEscrow")}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrderModalOpen(false)}
                    className="flex-1 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    data-testid="confirm-checkout-btn"
                    onClick={() => setOrderSuccess(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    {t("confirmAndPay")}
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

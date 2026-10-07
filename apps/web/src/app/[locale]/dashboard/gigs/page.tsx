"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { Plus, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GigsList } from "@/components/dashboard/gigs/GigsList"
import type { DashboardGig, GigTier } from "@/data/dashboard/gigs"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { type Service } from "@/lib/marketplace"

export default function MyGigsPage() {
  const resource = useApiResource<Service[]>("/api/v1/services/seller/me")
  const gigs: DashboardGig[] = (resource.data || []).map((service) => {
    const tier = (type: string): GigTier => {
      const p = service.packages.find((p) => p.type === type)
      return {
        name: type as GigTier["name"],
        title: p?.title || "",
        description: p?.description || "",
        price: Number(p?.price || 0),
        deliveryDays: p?.deliveryDays || 0,
        revisions: p?.revisions || 0,
        features: p?.features || [],
      }
    }
    return {
      id: service.id,
      title: service.title,
      slug: service.id,
      category: service.category.name,
      subcategory: "",
      coverImage: service.images[0]?.url || "/favicon.svg",
      status:
        service.status === "PUBLISHED"
          ? "active"
          : service.status === "PAUSED"
            ? "paused"
            : "draft",
      createdAt: service.createdAt,
      updatedAt: service.updatedAt || service.createdAt,
      startingPrice: service.packages.length
        ? Math.min(...service.packages.map((p) => Number(p.price)))
        : 0,
      rating: service.ratingAverage,
      reviewsCount: service.ratingCount,
      stats: {
        orders: service._count?.orders || 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversionRate: 0,
      },
      tiers: { basic: tier("BASIC"), standard: tier("STANDARD"), premium: tier("PREMIUM") },
      description: service.description,
      requirements: service.requirements?.[0]?.description || "",
      tags: service.tags?.map((t) => t.tag.name) || [],
      faqs: (service.faqs || []).map((f, i) => ({ ...f, id: String(i) })),
    }
  })
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A23]">
              My Gigs & Service Catalog
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Briefcase className="h-3.5 w-3.5" />
              Freelancer Services
            </span>
          </div>
          <p className="text-sm text-[#4B4B5C] mt-1">
            Manage your service offerings, tiered pricing structures, marketplace impressions, and
            client conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/gigs/new">
            <Button className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-medium text-xs shadow-sm h-9 px-4 rounded-xl flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Create New Gig</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Gigs List with Metrics */}
      <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      {!resource.loading && !resource.error && <GigsList initialGigs={gigs} />}
    </div>
  )
}

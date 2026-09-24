"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { Plus, Briefcase, Sparkles, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GigsList } from "@/components/dashboard/gigs/GigsList"
import { INITIAL_GIGS } from "@/data/dashboard/gigs"

export default function MyGigsPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0B0B14]">
              My Gigs & Service Catalog
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Briefcase className="h-3.5 w-3.5" />
              Freelancer Services
            </span>
          </div>
          <p className="text-sm text-[#4B4B5C] mt-1">
            Manage your service offerings, tiered pricing structures, marketplace impressions, and client conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/gigs/new">
            <Button
              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-medium text-xs shadow-sm h-9 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Gig</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Gigs List with Metrics */}
      <GigsList initialGigs={INITIAL_GIGS} />
    </div>
  )
}

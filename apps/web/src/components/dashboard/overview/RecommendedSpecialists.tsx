"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { type RecommendedSpecialist } from "@/data/dashboard/overview"
import { Sparkles, Star, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RecommendedSpecialistsProps {
  specialists: RecommendedSpecialist[]
  className?: string
}

export function RecommendedSpecialists({ specialists, className }: RecommendedSpecialistsProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.06)] mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-[#0B0B14]">Recommended Talent For You</h3>
        </div>
        <Link
          href="/services"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
        >
          <span>Browse all</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {specialists.map((spec) => (
          <div
            key={spec.id}
            className="p-4 rounded-xl border border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Header with avatar & online status */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="relative">
                  <img
                    src={spec.avatar}
                    alt={spec.name}
                    className="w-10 h-10 rounded-full object-cover border border-[rgba(15,15,30,0.1)]"
                  />
                  {spec.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                <Badge
                  variant={spec.level === "TOP_RATED" ? "gradient" : "luxury"}
                  size="sm"
                  className="text-[9px] py-0 px-1.5 h-4"
                >
                  {spec.level === "TOP_RATED" ? "★ Top Rated" : "Level 2"}
                </Badge>
              </div>

              <h4 className="text-xs font-bold text-[#0B0B14]">{spec.name}</h4>
              <p className="text-[11px] text-[#6B6B7B] line-clamp-1 mb-2">{spec.title}</p>

              {/* Rating & Rate */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{spec.rating}</span>
                  <span className="text-[10px] text-[#8B8B9B] font-normal">
                    ({spec.reviewsCount})
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-[#0B0B14]">
                  {spec.hourlyRate}
                </span>
              </div>

              {/* Skill pills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {spec.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-[rgba(15,15,30,0.06)] text-[#4B4B5C]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/services"
              className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white border border-[rgba(15,15,30,0.12)] text-xs font-semibold text-[#0B0B14] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-2xs"
            >
              <span>View Profile & Gigs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { motion } from "framer-motion"
import { Star, Heart, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Gig, SellerLevel } from "@/data/gigs"

interface GigCardProps {
  gig: Gig
  view?: "grid" | "list"
  className?: string
  priority?: boolean
}

const LEVEL_BADGE_MAP: Record<
  SellerLevel,
  { label: string; variant: "default" | "secondary" | "luxury" | "gradient" }
> = {
  TOP_RATED: { label: "Top Rated", variant: "gradient" },
  LEVEL_2: { label: "Level 2", variant: "luxury" },
  LEVEL_1: { label: "Level 1", variant: "secondary" },
  NEW: { label: "New Talent", variant: "default" },
}

export function GigCard({ gig, view = "grid", className }: GigCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite((prev) => !prev)
  }

  const levelInfo = LEVEL_BADGE_MAP[gig.seller.level]

  if (view === "list") {
    return (
      <div
        data-testid="gig-card"
        className={cn(
          "group relative rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-[0_12px_36px_-10px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 flex flex-col sm:flex-row gap-5",
          className
        )}
      >
        {/* Clickable Link Container */}
        <Link
          href={`/services/${gig.id}`}
          data-testid="gig-card-link"
          className="absolute inset-0 z-20 rounded-2xl"
          aria-label={gig.title}
        />

        {/* Cover Preview Tile */}
        <div className="relative w-full sm:w-60 h-44 sm:h-auto rounded-xl overflow-hidden shrink-0 border border-[rgba(15,15,30,0.06)] bg-[#FAFAFC] pointer-events-none">
          {/* Generated CSS Gradient Background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-tr transition-transform duration-500 group-hover:scale-105 pointer-events-none",
              gig.coverGradient
            )}
          />

          {/* Abstract Subtle Geometric Overlay */}
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(${gig.accentColor} 1.5px, transparent 1.5px)`,
              backgroundSize: "16px 16px",
            }}
          />

          {/* Category Pill on Cover */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md border border-[rgba(15,15,30,0.08)] text-[10px] font-semibold text-[#0B0B14] shadow-sm">
              {gig.subCategoryName}
            </span>
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "Remove from saved" : "Save service"}
            className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md border border-[rgba(15,15,30,0.08)] flex items-center justify-center text-[#6B6B7B] shadow-sm transition-transform active:scale-90 hover:bg-white hover:text-rose-500 cursor-pointer pointer-events-auto"
          >
            <motion.div
              animate={isFavorite ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-rose-500 text-rose-500" : "text-[#6B6B7B]"
                )}
              />
            </motion.div>
          </button>

          {gig.badgeText && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                {gig.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between relative z-10 pointer-events-none">
          <div>
            {/* Seller Header */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg bg-gradient-to-tr p-[1px] shadow-sm",
                      gig.seller.gradient
                    )}
                  >
                    <div className="h-full w-full rounded-[7px] bg-white flex items-center justify-center font-bold text-xs text-blue-700 font-mono">
                      {gig.seller.avatarInitials}
                    </div>
                  </div>
                  {gig.seller.isOnline && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"
                      title="Online now"
                    />
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#0B0B14] flex items-center gap-1">
                    {gig.seller.name}
                    {gig.seller.isPro && <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />}
                  </span>
                </div>
              </div>

              <Badge variant={levelInfo.variant} size="sm">
                {levelInfo.label}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-[#0B0B14] line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors mb-2">
              {gig.title}
            </h3>

            {/* Description in List View */}
            <p className="text-xs text-[#4B4B5C] line-clamp-2 leading-relaxed mb-3">
              {gig.description}
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {gig.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[#F4F4F8] border border-[rgba(15,15,30,0.06)] text-[10px] font-medium text-[#4B4B5C]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Rating & Price */}
          <div className="pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B0B14]">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>{gig.rating.toFixed(1)}</span>
              <span className="text-[#6B6B7B] font-normal text-[11px]">({gig.reviewsCount})</span>
              <span className="text-[#6B6B7B] text-[11px] ml-2 hidden sm:inline">
                • {gig.deliveryDays}d delivery
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#6B6B7B] uppercase block">Starting at</span>
              <span className="text-base font-bold text-[#0B0B14] font-mono">
                ${gig.startingPrice}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View (Default)
  return (
    <div
      data-testid="gig-card"
      className={cn(
        "group relative rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-[0_12px_36px_-10px_rgba(37,99,235,0.18)] hover:-translate-y-1 flex flex-col justify-between",
        className
      )}
    >
      {/* Clickable Card Link Container */}
      <Link
        href={`/services/${gig.id}`}
        data-testid="gig-card-link"
        className="absolute inset-0 z-20 rounded-2xl"
        aria-label={gig.title}
      />

      <div>
        {/* Cover Preview Area */}
        <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-3.5 border border-[rgba(15,15,30,0.06)] bg-[#FAFAFC] pointer-events-none">
          {/* Dynamic Generated CSS Gradient */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-tr transition-transform duration-500 group-hover:scale-105 pointer-events-none",
              gig.coverGradient
            )}
          />

          {/* Abstract Subtle Geometric Overlay */}
          <div
            className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(${gig.accentColor} 1.5px, transparent 1.5px)`,
              backgroundSize: "16px 16px",
            }}
          />

          {/* Subcategory Label Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md border border-[rgba(15,15,30,0.08)] text-[10px] font-semibold text-[#0B0B14] shadow-sm">
              {gig.subCategoryName}
            </span>
          </div>

          {/* Interactive Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "Remove from saved" : "Save service"}
            className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md border border-[rgba(15,15,30,0.08)] flex items-center justify-center text-[#6B6B7B] shadow-sm transition-transform active:scale-90 hover:bg-white hover:text-rose-500 cursor-pointer pointer-events-auto"
          >
            <motion.div
              animate={isFavorite ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-rose-500 text-rose-500" : "text-[#6B6B7B]"
                )}
              />
            </motion.div>
          </button>

          {/* Highlight Badge if any */}
          {gig.badgeText && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                {gig.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Seller Info Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className={cn(
                  "h-7 w-7 rounded-lg bg-gradient-to-tr p-[1px] shadow-sm",
                  gig.seller.gradient
                )}
              >
                <div className="h-full w-full rounded-[6px] bg-white flex items-center justify-center font-bold text-[11px] text-blue-700 font-mono">
                  {gig.seller.avatarInitials}
                </div>
              </div>
              {gig.seller.isOnline && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-[1.5px] border-white"
                  title="Online now"
                />
              )}
            </div>

            <span className="text-xs font-semibold text-[#0B0B14] line-clamp-1 flex items-center gap-1">
              {gig.seller.name}
              {gig.seller.isPro && <ShieldCheck className="h-3 w-3 text-blue-600" />}
            </span>
          </div>

          <Badge variant={levelInfo.variant} size="sm">
            {levelInfo.label}
          </Badge>
        </div>

        {/* 2-Line Clamped Title */}
        <h3 className="text-sm font-semibold text-[#0B0B14] line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors mb-3">
          {gig.title}
        </h3>
      </div>

      {/* Footer: Rating & Starting Price */}
      <div className="pt-3 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between relative z-10 pointer-events-none">
        <div className="flex items-center gap-1 text-xs font-semibold text-[#0B0B14]">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span>{gig.rating.toFixed(1)}</span>
          <span className="text-[#6B6B7B] font-normal text-[11px]">({gig.reviewsCount})</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#6B6B7B] uppercase font-mono block leading-none mb-0.5">
            From
          </span>
          <span className="text-sm font-bold text-[#0B0B14] font-mono">${gig.startingPrice}</span>
        </div>
      </div>
    </div>
  )
}

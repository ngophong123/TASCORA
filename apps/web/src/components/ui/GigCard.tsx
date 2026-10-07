"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { Star, Heart, ShieldCheck, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { ServiceCardImage } from "@/components/ui/ServiceCardImage"
import { requestData, jsonRequest, type Service } from "@/lib/marketplace"
import { getCategoryAccent } from "@/lib/categoryAccents"
import { cn } from "@/lib/utils"
import type { Gig, SellerLevel } from "@/data/gigs"

export interface GigCardProps {
  gig: Gig
  view?: "grid" | "list"
  className?: string
  priority?: boolean
  tier?: "standard" | "flagship"
}

const LEVEL_BADGE_MAP: Record<
  SellerLevel,
  { label: string; variant: "default" | "secondary" | "luxury" | "outline" | "success" }
> = {
  TOP_RATED: { label: "Top Rated", variant: "luxury" },
  LEVEL_2: { label: "Level 2", variant: "secondary" },
  LEVEL_1: { label: "Level 1", variant: "outline" },
  NEW: { label: "New Talent", variant: "success" },
}

export function GigCard({ gig, view = "grid", className, priority = false, tier }: GigCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [isJustLiked, setIsJustLiked] = React.useState(false)
  const coverImageUrl = gig.gallery[0]?.url || "/favicon.svg"
  const catAccent = getCategoryAccent(gig.subCategoryName || gig.title)

  const [favoriteError, setFavoriteError] = React.useState("")
  const [favoriteBusy, setFavoriteBusy] = React.useState(false)
  React.useEffect(() => {
    if (!localStorage.getItem("user")) return
    let active = true
    requestData<Service[]>("/api/v1/favorites")
      .then((saved) => {
        if (active) setIsFavorite(saved.some((item) => item.id === gig.id))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [gig.id])
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (favoriteBusy) return
    setFavoriteBusy(true)
    setFavoriteError("")
    try {
      await requestData(`/api/v1/favorites/${gig.id}`, jsonRequest(isFavorite ? "DELETE" : "POST"))
      setIsFavorite(!isFavorite)
      setIsJustLiked(!isFavorite)
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Unable to save service.")
    } finally {
      setFavoriteBusy(false)
    }
  }

  const isFlagship = tier === "flagship" || gig.seller.level === "TOP_RATED"
  const levelInfo = LEVEL_BADGE_MAP[gig.seller.level] || {
    label: "Specialist",
    variant: "secondary",
  }

  // List View (Horizontal Deliverable Card)
  if (view === "list") {
    return (
      <div
        data-testid="gig-card"
        className={cn(
          "stripe-service-card group relative rounded-xl border bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_14px_34px_-8px_rgba(15,23,42,0.12),0_4px_12px_-2px_rgba(15,23,42,0.04)] hover:border-[#635BFF]/35 dark:hover:border-[#635BFF]/45 active:scale-[0.99] flex flex-col sm:flex-row gap-5",
          isFlagship
            ? "border-slate-300 dark:border-slate-700 hover:border-[#635BFF]"
            : "border-slate-200/90 dark:border-slate-800",
          className
        )}
      >
        {/* Clickable Link Container */}
        <Link
          href={`/services/${gig.id}`}
          data-testid="gig-card-link"
          className="absolute inset-0 z-20 rounded-xl"
          aria-label={gig.title}
        />

        {/* Cover Preview Tile */}
        <div className="relative w-full sm:w-60 h-44 sm:h-auto rounded-lg overflow-hidden shrink-0 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 pointer-events-none group-hover:[&_img]:scale-[1.03] [&_img]:transition-transform [&_img]:duration-300 [&_img]:ease-out">
          <ServiceCardImage
            src={coverImageUrl}
            alt={gig.title}
            sizes="(max-width: 640px) 100vw, 240px"
            priority={priority}
          />

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(event) => void handleFavoriteClick(event)}
            disabled={favoriteBusy}
            title={favoriteError || undefined}
            aria-label={isFavorite ? "Remove from saved" : "Save service"}
            className={cn(
              "icon-btn-stripe absolute top-2.5 right-2.5 z-30 h-8 w-8 rounded-lg bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-xs transition-all duration-200 active:scale-90 hover:scale-110 hover:bg-white hover:text-rose-600 cursor-pointer pointer-events-auto",
              isFavorite
                ? "opacity-100 text-rose-600 fill-rose-600 scale-105"
                : "opacity-0 sm:group-hover:opacity-100 text-slate-500 hover:text-rose-500"
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isFavorite ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-600",
                isJustLiked && "animate-heart-pop"
              )}
              onAnimationEnd={() => setIsJustLiked(false)}
            />
          </button>

          {gig.badgeText && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className="px-2 py-0.5 rounded bg-[#0F172A]/90 text-white text-[10px] font-semibold uppercase tracking-wider">
                {gig.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between relative z-10 pointer-events-none">
          <div>
            {/* Category + Level Header */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all duration-200 group-hover:brightness-[1.06] group-hover:shadow-xs",
                  catAccent.pillClass
                )}
              >
                {gig.subCategoryName}
              </span>
              <Badge variant={levelInfo.variant} size="sm">
                {levelInfo.label}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
              {gig.title}
            </h3>

            {/* Description in List View */}
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {gig.description}
            </p>

            {/* Seller info row with Avatar subtle ring on hover */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="transition-all duration-200 group-hover:scale-[1.03] group-hover:ring-2 group-hover:ring-primary/25 rounded-md">
                <AvatarImage
                  src={gig.seller.avatar}
                  name={gig.seller.name}
                  id={gig.seller.id}
                  size={26}
                  rounded="md"
                  showOnlineStatus
                  isOnline={gig.seller.isOnline}
                  alt={`${gig.seller.name} portrait`}
                />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                {gig.seller.name}
                {gig.seller.isPro && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
              </span>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {gig.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Rating, Escrow & Price */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-900 dark:text-white">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 transition-transform duration-200 group-hover:scale-110" />
                <span>{gig.rating.toFixed(1)}</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px]">
                  ({gig.reviewsCount})
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal hidden sm:inline flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {gig.deliveryDays}d delivery
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 transition-colors">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Milestone Escrow</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-mono">
                  From
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono group-hover:text-primary transition-colors">
                  ${gig.startingPrice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View (Default Architectural Card)
  return (
    <div
      data-testid="gig-card"
      className={cn(
        "stripe-card group relative rounded-xl border bg-white dark:bg-slate-900 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(15,23,42,0.10)] hover:border-[#635BFF]/30 active:scale-[0.99]",
        isFlagship
          ? "border-slate-300 dark:border-slate-700 shadow-xs hover:border-[#635BFF]"
          : "border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-600",
        className
      )}
    >
      {/* Clickable Card Link Container */}
      <Link
        href={`/services/${gig.id}`}
        data-testid="gig-card-link"
        className="absolute inset-0 z-20 rounded-xl"
        aria-label={gig.title}
      />

      {/* Flagship Header Banner */}
      {isFlagship && (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-primary rounded-t-xl">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Verified Specialist
          </span>
          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
            Milestone Escrow
          </span>
        </div>
      )}

      <div>
        {/* Cover Preview Area with Controlled Zoom */}
        <div
          className={cn(
            "relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 pointer-events-none group-hover:[&_img]:scale-[1.03] [&_img]:transition-transform [&_img]:duration-350 [&_img]:ease-out",
            isFlagship ? "" : "rounded-t-xl"
          )}
        >
          {/* Real Photography Cover Image */}
          <ServiceCardImage
            src={coverImageUrl}
            alt={gig.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />

          {/* Interactive Favorite Heart Button */}
          <button
            type="button"
            onClick={(event) => void handleFavoriteClick(event)}
            disabled={favoriteBusy}
            title={favoriteError || undefined}
            aria-label={isFavorite ? "Remove from saved" : "Save service"}
            className={cn(
              "absolute top-2.5 right-2.5 z-30 h-8 w-8 rounded-lg bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-xs transition-all duration-200 active:scale-90 hover:scale-110 hover:bg-white hover:text-rose-600 cursor-pointer pointer-events-auto",
              isFavorite
                ? "opacity-100 text-rose-600 fill-rose-600 scale-105"
                : "opacity-0 sm:group-hover:opacity-100 text-slate-500 hover:text-rose-500"
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isFavorite ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-600",
                isJustLiked && "animate-heart-pop"
              )}
              onAnimationEnd={() => setIsJustLiked(false)}
            />
          </button>

          {/* Highlight Badge if any and not flagship */}
          {gig.badgeText && !isFlagship && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className="px-2 py-0.5 rounded bg-[#0F172A]/90 text-white text-[10px] font-semibold tracking-wide">
                {gig.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4">
          {/* Category discipline + Seller level tag */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md",
                catAccent.pillClass
              )}
            >
              {gig.subCategoryName}
            </span>
            <Badge variant={levelInfo.variant} size="sm">
              {levelInfo.label}
            </Badge>
          </div>

          {/* 2-Line Clamped Title */}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2.5">
            {gig.title}
          </h3>

          {/* Seller Info Row */}
          <div className="flex items-center gap-2">
            <div className="transition-transform duration-200 group-hover:scale-105">
              <AvatarImage
                src={gig.seller.avatar}
                name={gig.seller.name}
                id={gig.seller.id}
                size={24}
                rounded="md"
                showOnlineStatus
                isOnline={gig.seller.isOnline}
                alt={`${gig.seller.name} portrait`}
              />
            </div>

            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1 flex items-center gap-1">
              {gig.seller.name}
              {gig.seller.isPro && <ShieldCheck className="h-3 w-3 text-primary" />}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Rating, Escrow micro-badge & Starting Price */}
      <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 transition-transform duration-200 group-hover:scale-110" />
          <span>{gig.rating.toFixed(1)}</span>
          <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px]">
            ({gig.reviewsCount})
          </span>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 transition-colors">
          <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Escrow</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block leading-none mb-0.5">
            From
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono group-hover:text-primary transition-colors">
            ${gig.startingPrice}
          </span>
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { Star, Heart, Clock } from "lucide-react"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { ServiceCardImage } from "@/components/ui/ServiceCardImage"
import { requestData, jsonRequest, type Service } from "@/lib/marketplace"
import { cn } from "@/lib/utils"
import type { Gig } from "@/data/gigs"

export interface GigCardProps {
  gig: Gig
  view?: "grid" | "list"
  className?: string
  priority?: boolean
  tier?: "standard" | "flagship"
}

export function GigCard({ gig, view = "grid", className, priority = false }: GigCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [favoriteError, setFavoriteError] = React.useState("")
  const [favoriteBusy, setFavoriteBusy] = React.useState(false)
  const errorId = React.useId()
  const list = view === "list"
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
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Unable to save service.")
    } finally {
      setFavoriteBusy(false)
    }
  }
  return (
    <article
      data-testid="gig-card"
      className={cn(
        "group relative flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)] motion-reduce:transition-none",
        list ? "flex-col sm:flex-row" : "h-full flex-col",
        className
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-[var(--subtle)]",
          list ? "aspect-[16/10] w-full sm:aspect-auto sm:w-60" : "aspect-[16/10] w-full"
        )}
      >
        <ServiceCardImage
          src={gig.gallery[0]?.url}
          alt={gig.title}
          priority={priority}
          sizes={
            list
              ? "(max-width: 639px) calc(100vw - 32px), 240px"
              : "(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 46vw, (max-width: 1279px) 42vw, 400px"
          }
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2.5">
          <AvatarImage
            src={gig.seller.avatar}
            name={gig.seller.name}
            id={gig.seller.id}
            size={28}
            alt={`${gig.seller.name} portrait`}
          />
          <span className="min-w-0 truncate text-sm text-[var(--text-secondary)]">
            {gig.seller.name}
          </span>
        </div>
        <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
          {gig.subCategoryName || gig.categoryName}
        </p>
        <h3 className="mb-3 text-base font-medium leading-relaxed tracking-[-0.015em] text-[var(--foreground)]">
          <Link
            href={`/services/${gig.id}`}
            data-testid="gig-card-link"
            className="line-clamp-2 after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-[var(--focus-ring)] focus-visible:after:-outline-offset-2 group-hover:text-[var(--primary)]"
          >
            {gig.title}
          </Link>
        </h3>
        {list && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {gig.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-[var(--border-subtle)] pt-4">
          <div className="text-sm text-[var(--text-secondary)]">
            {gig.reviewsCount > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Star
                  aria-hidden="true"
                  className="h-3.5 w-3.5 fill-current text-[var(--foreground)]"
                />
                <span className="font-medium text-[var(--foreground)]">
                  {gig.rating.toFixed(1)}
                </span>
                <span>({gig.reviewsCount})</span>
                <span className="sr-only">reviews</span>
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            {list && gig.deliveryDays > 0 && (
              <span className="mt-1 flex items-center gap-1.5 text-xs">
                <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                {gig.deliveryDays}d delivery
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            From{" "}
            <span className="ml-1 text-base font-semibold tabular-nums text-[var(--foreground)]">
              ${gig.startingPrice}
            </span>
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => void handleFavoriteClick(event)}
        disabled={favoriteBusy}
        aria-label={isFavorite ? "Remove from saved" : "Save service"}
        aria-pressed={isFavorite}
        aria-busy={favoriteBusy}
        aria-describedby={favoriteError ? errorId : undefined}
        className={cn(
          "absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-colors duration-150 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none",
          isFavorite
            ? "text-[var(--status-danger)]"
            : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
        )}
      >
        <Heart aria-hidden="true" className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>
      {favoriteError && (
        <p
          id={errorId}
          role="alert"
          className="absolute bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--status-danger)]"
        >
          {favoriteError}
        </p>
      )}
    </article>
  )
}

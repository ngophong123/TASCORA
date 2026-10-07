"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useParams } from "next/navigation"
import { Star, ShieldCheck, Award, MessageSquare, ChevronRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { profileName, imageUrl, type Profile, type Service, type Review } from "@/lib/marketplace"
interface ServiceItem {
  id: string
  title: string
  category: string
  cover: string
  rating: number
  reviews: number
  startingPrice: number
  deliveryDays?: number
}

interface ReviewItem {
  buyer: string
  company: string
  rating: number
  date: string
  comment: string
}

interface FreelancerDetail {
  id: string
  name: string
  title: string
  avatar: string
  cover: string
  level: string
  country: string
  languages: string[]
  memberSince: string
  ratingAverage: number
  ratingCount: number
  completedOrders: number
  responseTimeHours?: number
  hourlyRate: string
  bio: string
  skills: string[]
  services: ServiceItem[]
  reviews: ReviewItem[]
}

export default function FreelancerProfilePage() {
  const params = useParams()
  const resource = useApiResource<
    Profile & {
      hourlyRate: string | null
      createdAt: string
      services: Service[]
      reviews: Review[]
      _count: { orders: number }
    }
  >(`/api/v1/marketplace/sellers/${String(params.id)}`)
  if (resource.loading || resource.error || !resource.data)
    return (
      <div className="container mx-auto px-4 py-10">
        <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      </div>
    )
  return <FreelancerProfileContent record={resource.data} />
}
function FreelancerProfileContent({
  record,
}: {
  record: Profile & {
    hourlyRate: string | null
    createdAt: string
    services: Service[]
    reviews: Review[]
    _count: { orders: number }
  }
}) {
  const profile: FreelancerDetail = {
    id: record.id,
    name: profileName(record),
    title: record.professionalTitle || "",
    avatar: imageUrl(record.avatar),
    cover: "/favicon.svg",
    level: record.level || "",
    country: record.country || "",
    languages: record.languages || [],
    memberSince: new Date(record.createdAt).toLocaleDateString(),
    ratingAverage: record.ratingAverage || 0,
    ratingCount: record.ratingCount || 0,
    completedOrders: record._count.orders,
    hourlyRate: record.hourlyRate ? `$${record.hourlyRate}/hr` : "Unavailable",
    bio: record.bio || "",
    skills: record.skills || [],
    services: record.services.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category.name,
      cover: imageUrl(s.images[0]?.url),
      rating: s.ratingAverage,
      reviews: s.ratingCount,
      startingPrice: s.packages.length ? Math.min(...s.packages.map((p) => Number(p.price))) : 0,
    })),
    reviews: record.reviews.map((r) => ({
      buyer: profileName(r.buyer.buyerProfile),
      company: "",
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString(),
      comment: r.comment,
    })),
  }
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href="/explore?type=freelancers"
          className="hover:text-text-primary transition-colors"
        >
          Talent Directory
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text-primary">{profile.name}</span>
      </nav>

      {/* Profile Header Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl mb-10">
        {/* Cover Banner */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-950">
          <img
            src={profile.cover}
            alt={`${profile.name} - Modern developer workspace cover banner`}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/30 dark:via-slate-900/40 to-transparent" />
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            {/* Avatar & Main Title */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <AvatarImage
                src={profile.avatar}
                name={profile.name}
                id={profile.id}
                size={120}
                rounded="xl"
                alt={`${profile.name} - ${profile.title} profile avatar`}
                className="shrink-0"
                imageClassName="rounded-3xl border-4 border-white dark:border-slate-800 shadow-2xl ring-2 ring-primary/20"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold tracking-tight">
                    {profile.name}
                  </h1>
                  <Badge variant="luxury" className="gap-1">
                    <Award className="h-3 w-3 text-primary" />
                    {profile.level === "TOP_RATED" ? "Top Rated Talent" : "Approved seller"}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-primary">{profile.title}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {profile.ratingAverage}
                    <span className="text-text-muted font-normal">
                      ({profile.ratingCount} reviews)
                    </span>
                  </span>
                  <span>•</span>
                  <span>{profile.completedOrders} orders completed</span>
                  <span>•</span>
                  <span>Response time unavailable</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/messages?seller=${profile.id}`}>
                <Button className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 text-white px-6 shadow-lg shadow-indigo-500/20 gap-2 transition-all active:scale-[0.98]">
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Me</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase text-text-muted block font-semibold">
                Location
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile.country}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase text-text-muted block font-semibold">
                Member Since
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile.memberSince}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase text-text-muted block font-semibold">
                Consulting Rate
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {profile.hourlyRate}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase text-text-muted block font-semibold">
                Escrow Deliveries
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile.completedOrders} completed orders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2/3: Bio, Services, and Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* Bio Card */}
          <div className="rounded-2xl border border-border bg-white p-8 space-y-4">
            <h2 className="font-display text-xl text-text-primary font-medium">
              About My Practice
            </h2>
            <div className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
              {profile.bio}
            </div>
          </div>

          {/* Published Services Grid */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-text-primary font-medium">
              Published Service Offerings ({profile.services.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {profile.services.map((srv) => (
                <Link
                  key={srv.id}
                  href={`/services/${srv.id}`}
                  className="stripe-card group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={srv.cover}
                      alt={`${srv.title} service offering card`}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-primary tracking-wider block mb-1">
                        {srv.category}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                        {srv.title}
                      </h3>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {srv.rating} ({srv.reviews})
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-text-muted block">From</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                          ${srv.startingPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Client Reviews */}
          <div className="rounded-2xl border border-border bg-white p-8 space-y-6">
            <h2 className="font-display text-xl text-text-primary font-medium">
              Verified Client Reviews
            </h2>
            <div className="space-y-4">
              {profile.reviews.map((rev, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AvatarImage
                        name={rev.buyer}
                        id={`buyer-rev-${idx}`}
                        size={32}
                        rounded="full"
                        alt={`${rev.buyer} avatar`}
                      />
                      <div>
                        <span className="text-xs font-semibold text-text-primary block">
                          {rev.buyer}
                        </span>
                        <span className="text-[10px] text-text-muted">{rev.company}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                      <span className="text-[10px] text-text-muted ml-2">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed pt-1">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1/3: Skills & Platform Guarantee */}
        <div className="space-y-6">
          {/* Skills Badges */}
          <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
            <h3 className="font-display text-lg text-text-primary font-medium">
              Verified Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-text-secondary border border-border hover:border-blue-600/40 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="rounded-2xl border border-border bg-white p-6 space-y-3 text-xs">
            <h3 className="font-display text-base text-text-primary font-medium">Languages</h3>
            <ul className="space-y-2 text-text-secondary">
              {profile.languages.map((lang: string) => (
                <li key={lang} className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  <span>{lang}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Security & Escrow Guarantee */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Escrow Milestone Protection</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              When working with this specialist, your payments are securely vaulted until
              deliverables are received and approved by you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useParams } from "next/navigation"
import {
  Star,
  ShieldCheck,
  Award,
  MessageSquare,
  ChevronRight,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const FREELANCER_PROFILES: Record<string, any> = {
  "alexandre": {
    id: "alexandre",
    name: "Alexandre Moreau",
    title: "Senior Full-Stack Architect & Distributed Systems Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    level: "TOP_RATED",
    country: "France (UTC+2)",
    languages: ["English (Fluent)", "French (Native)"],
    memberSince: "March 2023",
    ratingAverage: 4.99,
    ratingCount: 114,
    completedOrders: 114,
    responseTimeHours: 1,
    hourlyRate: "$95/hr",
    bio: `Principal Software Architect with over a decade of hands-on experience designing resilient distributed systems, Next.js 15 enterprise platforms, and high-performance backend microservices.

I partner with visionary startups and established product teams to construct scalable architectures that endure rapid traffic spikes, pass stringent security audits, and empower developers with enjoyable codebases.`,
    skills: [
      "Next.js 15 & React 19",
      "TypeScript",
      "Node.js & Express",
      "PostgreSQL & Prisma ORM",
      "Redis Caching",
      "Docker & Kubernetes",
      "Stripe Integration",
      "Clean Architecture",
    ],
    services: [
      {
        id: "srv-1",
        title: "Full-Stack Next.js 15 & Node.js Production Architecture",
        category: "Programming & Tech",
        startingPrice: 350,
        deliveryDays: 5,
        rating: 4.98,
        reviews: 42,
        cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
      },
      {
        id: "srv-5",
        title: "Enterprise Cybersecurity Audit & Penetration Testing",
        category: "Programming & Tech",
        startingPrice: 500,
        deliveryDays: 7,
        rating: 4.99,
        reviews: 64,
        cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      },
    ],
    reviews: [
      {
        buyer: "Marcus Thorne",
        company: "Fintech UK",
        rating: 5,
        date: "2 weeks ago",
        comment: "Alexandre delivered an exceptional monorepo architecture. Highly structured, well-documented, and production-tested.",
      },
      {
        buyer: "Sophia Chen",
        company: "Acro Cloud",
        rating: 5,
        date: "1 month ago",
        comment: "Flawless communication and deep technical expertise. The Next.js 15 SSR setup was delivered ahead of schedule.",
      },
    ],
  },
}

export default function FreelancerProfilePage() {
  const params = useParams()
  const id = params.id as string
  const profile = FREELANCER_PROFILES[id] || FREELANCER_PROFILES["alexandre"]

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/explore?type=freelancers" className="hover:text-text-primary transition-colors">Talent Directory</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text-primary">{profile.name}</span>
      </nav>

      {/* Profile Header Card */}
      <div className="rounded-3xl border border-border bg-white overflow-hidden shadow-xl mb-10">
        {/* Cover Banner */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-100">
          <img src={profile.cover} alt="Cover" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            {/* Avatar & Main Title */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover border-4 border-white shadow-xl shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl text-text-primary font-medium">
                    {profile.name}
                  </h1>
                  <Badge variant="luxury" className="gap-1">
                    <Award className="h-3 w-3 text-blue-600" />
                    {profile.level === "TOP_RATED" ? "Top Rated Talent" : "Verified Specialist"}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-blue-600 font-medium">{profile.title}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {profile.ratingAverage}
                    <span className="text-text-muted font-normal">({profile.ratingCount} reviews)</span>
                  </span>
                  <span>•</span>
                  <span>{profile.completedOrders} orders completed</span>
                  <span>•</span>
                  <span>Responds in ~{profile.responseTimeHours}h</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/messages?seller=${profile.id}`}>
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-md gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Contact Me</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/50 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <span className="text-[10px] uppercase text-text-muted block">Location</span>
              <span className="font-medium text-text-primary">{profile.country}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <span className="text-[10px] uppercase text-text-muted block">Member Since</span>
              <span className="font-medium text-text-primary">{profile.memberSince}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <span className="text-[10px] uppercase text-text-muted block">Consulting Rate</span>
              <span className="font-medium text-emerald-600">{profile.hourlyRate}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <span className="text-[10px] uppercase text-text-muted block">Escrow Deliveries</span>
              <span className="font-medium text-text-primary">{profile.completedOrders} Milestone Verified</span>
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
            <h2 className="font-display text-xl text-text-primary font-medium">About My Practice</h2>
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
              {profile.services.map((srv: any) => (
                <Link
                  key={srv.id}
                  href={`/services/${srv.id}`}
                  className="group rounded-2xl border border-border bg-white overflow-hidden flex flex-col justify-between transition-all hover:border-blue-600/50 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <img
                      src={srv.cover}
                      alt={srv.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider block mb-1">
                        {srv.category}
                      </span>
                      <h3 className="font-medium text-sm text-text-primary line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {srv.title}
                      </h3>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-current" />
                        {srv.rating} ({srv.reviews})
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-text-muted block">From</span>
                        <span className="font-semibold text-text-primary text-sm">${srv.startingPrice}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Client Reviews */}
          <div className="rounded-2xl border border-border bg-white p-8 space-y-6">
            <h2 className="font-display text-xl text-text-primary font-medium">Verified Client Reviews</h2>
            <div className="space-y-4">
              {profile.reviews.map((rev: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-text-primary block">{rev.buyer}</span>
                      <span className="text-[10px] text-text-muted">{rev.company}</span>
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
            <h3 className="font-display text-lg text-text-primary font-medium">Verified Expertise</h3>
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
              When working with this specialist, your payments are securely vaulted until deliverables are received and approved by you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

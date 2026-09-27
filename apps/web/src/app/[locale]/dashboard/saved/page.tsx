"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { Bookmark, Star, MessageSquare, ArrowUpRight, Trash2, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/context/DashboardContext"
import {
  SAVED_SPECIALISTS,
  SAVED_GIGS,
  type SavedSpecialist,
  type SavedGigItem,
} from "@/data/dashboard/saved"

export default function SavedPage() {
  const { showToast } = useDashboard()
  const [activeTab, setActiveTab] = React.useState<"specialists" | "gigs">("specialists")
  const [specialists, setSpecialists] = React.useState<SavedSpecialist[]>(SAVED_SPECIALISTS)
  const [gigs, setGigs] = React.useState<SavedGigItem[]>(SAVED_GIGS)

  const handleRemoveSpecialist = (id: string, name: string) => {
    setSpecialists((prev) => prev.filter((s) => s.id !== id))
    showToast({
      title: "Removed from Saved",
      message: `${name} has been removed from your saved specialists list.`,
      type: "info",
    })
  }

  const handleRemoveGig = (id: string, title: string) => {
    setGigs((prev) => prev.filter((g) => g.id !== id))
    showToast({
      title: "Removed from Saved",
      message: `"${title}" has been removed from your saved gigs.`,
      type: "info",
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0B0B14]">
              Saved Talents & Services
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Bookmark className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
              Client Bookmarks
            </span>
          </div>
          <p className="text-sm text-[#4B4B5C] mt-1">
            Keep track of verified top-rated specialists and curated service packages for upcoming
            projects.
          </p>
        </div>

        <Link href="/services">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs text-[#0B0B14] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] flex items-center gap-1.5"
          >
            <Compass className="h-3.5 w-3.5 text-blue-600" />
            <span>Explore More Services</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(15,15,30,0.06)] pb-3">
        <button
          onClick={() => setActiveTab("specialists")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "specialists"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#F4F4F8]"
          }`}
        >
          Saved Specialists ({specialists.length})
        </button>

        <button
          onClick={() => setActiveTab("gigs")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "gigs"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#F4F4F8]"
          }`}
        >
          Saved Services ({gigs.length})
        </button>
      </div>

      {/* TAB 1: Specialists */}
      {activeTab === "specialists" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialists.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-xs text-[#6B6B7B] bg-white rounded-2xl border border-[rgba(15,15,30,0.08)]">
              You have no saved specialists.
            </div>
          ) : (
            specialists.map((spec) => (
              <div
                key={spec.id}
                className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[rgba(15,15,30,0.16)] transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={spec.avatar}
                        alt={spec.name}
                        className="h-12 w-12 rounded-full object-cover border border-[rgba(15,15,30,0.1)] shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#0B0B14]">{spec.name}</h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                            {spec.badge === "TOP_RATED" ? "Top Rated" : "Verified Pro"}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6B7B]">{spec.title}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveSpecialist(spec.id, spec.name)}
                      className="text-[#6B6B7B] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-3 mt-3 border-y border-[rgba(15,15,30,0.06)] text-[11px]">
                    <div>
                      <span className="text-[#6B6B7B] block text-[10px]">Hourly Rate</span>
                      <span className="font-mono font-bold text-[#0B0B14]">
                        ${spec.hourlyRate}/hr
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B6B7B] block text-[10px]">Rating</span>
                      <span className="font-semibold text-amber-600 flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {spec.rating} ({spec.reviewsCount})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B6B7B] block text-[10px]">Projects</span>
                      <span className="font-medium text-[#0B0B14]">
                        {spec.completedProjects} done
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {spec.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-[#FAFAFC] border border-[rgba(15,15,30,0.06)] text-[11px] text-[#4B4B5C]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center gap-2 pt-2 border-t border-[rgba(15,15,30,0.06)]">
                  <Link href={`/dashboard/messages?contact=${spec.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium text-[#0B0B14] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                      <span>Message</span>
                    </Button>
                  </Link>

                  <Link href={`/freelancers/${spec.id}`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Hire Now</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Saved Gigs */}
      {activeTab === "gigs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gigs.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-xs text-[#6B6B7B] bg-white rounded-2xl border border-[rgba(15,15,30,0.08)]">
              You have no saved gigs.
            </div>
          ) : (
            gigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex gap-4 hover:border-[rgba(15,15,30,0.16)] transition-all"
              >
                <img
                  src={gig.coverImage}
                  alt={gig.title}
                  className="h-28 w-36 rounded-xl object-cover border border-[rgba(15,15,30,0.08)] shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {gig.category}
                      </span>

                      <button
                        onClick={() => handleRemoveGig(gig.id, gig.title)}
                        className="text-[#6B6B7B] hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-semibold text-[#0B0B14] line-clamp-2 mt-1.5">
                      {gig.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-[#6B6B7B] mt-1.5">
                      <img
                        src={gig.sellerAvatar}
                        alt={gig.sellerName}
                        className="h-4 w-4 rounded-full object-cover"
                      />
                      <span>{gig.sellerName}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {gig.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(15,15,30,0.06)]">
                    <span className="text-xs">
                      From{" "}
                      <strong className="font-mono font-bold text-[#0B0B14]">
                        ${gig.startingPrice}
                      </strong>
                    </span>

                    <Link href={`/services/${gig.id}`}>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Order Service
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

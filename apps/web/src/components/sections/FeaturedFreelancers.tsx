"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Star, ShieldCheck, ArrowRight } from "lucide-react"
import type { FreelancerProfile } from "@/data/freelancers"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { profileName, imageUrl, type Profile } from "@/lib/marketplace"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AvatarImage } from "@/components/ui/AvatarImage"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  staggerContainerVariants,
  staggerChildCardVariants,
  VIEWPORT_ONCE,
} from "@/lib/motion"

function FreelancerCard({
  freelancer,
}: {
  freelancer: FreelancerProfile & { hourlyRate: string | null }
}) {
  const t = useTranslations("freelancersSection")
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = React.useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Max 6 deg tilt for subtle elegance
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6

    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.2s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out",
      }}
      className="group relative rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 flex flex-col justify-between h-full hover:border-[#94A3B8] shadow-xs hover:shadow-md transition-all duration-200 will-change-transform"
    >
      <div>
        {/* Header with Avatar & Availability Dot */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
            <div className="h-16 w-16 rounded-lg bg-slate-100 border border-[#E2E8F0] p-0.5 shadow-xs overflow-hidden">
              <AvatarImage
                src={freelancer.avatar}
                name={freelancer.name}
                id={freelancer.id}
                size={64}
                rounded="md"
                alt={`${freelancer.name} - ${freelancer.title}`}
                className="h-full w-full rounded-md"
                imageClassName="rounded-md"
              />
            </div>

            {/* Availability Green / Amber Status Dot */}
            <div
              className="absolute -bottom-1 -right-1 flex items-center justify-center"
              title="Presence unavailable"
            >
              <span className="relative flex h-3.5 w-3.5">
                {freelancer.available && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white ${
                    freelancer.available ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAFAFC] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{freelancer.rating}</span>
            <span className="text-[#64748B] font-normal">({freelancer.reviewsCount})</span>
          </div>
        </div>

        {/* Name & Title */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#0F172A] flex items-center gap-1.5 group-hover:text-[#635BFF] transition-colors">
            {freelancer.name}
            <ShieldCheck className="h-4 w-4 text-[#635BFF]" />
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">{freelancer.title}</p>
        </div>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {freelancer.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] font-medium text-[#475569] group-hover:border-[#CBD5E1] transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Price & Profile CTA */}
      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#64748B] uppercase font-mono block">
            {t("startingAt")}
          </span>
          <span className="text-base font-bold text-[#0F172A] font-mono">
            {freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : "Unavailable"}
          </span>
        </div>

        <Link href={`/freelancers/${freelancer.id}`}>
          <Button
            size="sm"
            variant="outline"
            className="text-xs hover:border-[#635BFF] hover:text-[#635BFF]"
          >
            <span>{t("viewProfile")}</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export function FeaturedFreelancers() {
  const t = useTranslations("freelancersSection")
  const resource = useApiResource<
    (Profile & { hourlyRate: string | null; availability: string | null; createdAt: string })[]
  >("/api/v1/marketplace/sellers")
  const featured: (FreelancerProfile & { hourlyRate: string | null })[] = (resource.data || [])
    .slice(0, 4)
    .map((profile) => ({
      id: profile.id,
      hourlyRate: profile.hourlyRate,
      name: profileName(profile),
      email: "",
      role: "freelancer",
      title: profile.professionalTitle || "",
      avatarInitials: profileName(profile).slice(0, 2),
      avatar: imageUrl(profile.avatar),
      gradient: "from-blue-600 to-sky-500",
      bio: profile.bio || "",
      country: profile.country || "",
      memberSince: profile.createdAt,
      languages: profile.languages || [],
      skills: profile.skills || [],
      responseTime: "Unavailable",
      completionRate: 0,
      rating: profile.ratingAverage || 0,
      reviewsCount: profile.ratingCount || 0,
      startingPrice: Number(profile.hourlyRate || 0),
      available: false,
      isVerified: false,
      isOnline: false,
      isPro: false,
      level: profile.level === "NEW_SELLER" ? "NEW" : (profile.level as FreelancerProfile["level"]),
      status: "active",
      completedOrders: 0,
    }))

  return (
    <section
      className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] relative overflow-hidden"
      id="talent"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              className="inline-block"
            >
              <Badge variant="gradient" size="md" className="mb-4">
                {t("badge")}
              </Badge>
            </motion.div>

            <motion.h2
              variants={fadeUpBlurVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              className="stripe-section-heading text-[#0F172A]"
            >
              {t("titlePrefix")} <span className="stripe-gradient-text">{t("titleHighlight")}</span>
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              custom={0.12}
              className="stripe-subheading mt-3 font-normal"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.18}
            className="self-start md:self-end"
          >
            <Link
              href="/explore?type=freelancers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#635BFF] hover:text-[#4F46E5] transition-colors group"
            >
              <span>{t("viewAll")}</span>
              <ArrowRight className="h-4 w-4 transition-transform arrow-micro" />
            </Link>
          </motion.div>
        </div>

        <ApiState
          loading={resource.loading}
          error={resource.error}
          empty={
            !resource.loading && !resource.error && !featured.length
              ? "No approved sellers available yet."
              : undefined
          }
        />
        {/* 4 Cards with 3D Tilt and Staggered Entrance */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featured.map((freelancer) => (
            <motion.div key={freelancer.id} variants={staggerChildCardVariants} className="h-full">
              <FreelancerCard freelancer={freelancer} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

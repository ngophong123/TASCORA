"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Star, ShieldCheck, ArrowRight } from "lucide-react"
import { FEATURED_FREELANCERS_DATA, FreelancerProfile } from "@/data/freelancers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAccentTheme } from "@/lib/gradients"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  staggerContainerVariants,
  staggerChildCardVariants,
  VIEWPORT_ONCE,
} from "@/lib/motion"

function FreelancerCard({ freelancer }: { freelancer: FreelancerProfile }) {
  const t = useTranslations("freelancersSection")
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = React.useState({ x: 0, y: 0 })
  const theme = getAccentTheme(freelancer.accent)

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
      className="group relative rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-5 sm:p-6 flex flex-col justify-between h-full hover:border-blue-300 hover:shadow-[0_24px_50px_-15px_rgba(37,99,235,0.18)] shadow-sm will-change-transform"
    >
      <div>
        {/* Header with Avatar & Availability Dot */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
            {/* Multi-Hue Avatar Gradient Placeholder */}
            <div
              className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${theme.avatarGradientClass} p-[1.5px] shadow-sm`}
            >
              <div
                className="h-full w-full rounded-[14px] bg-white flex items-center justify-center font-bold text-lg font-mono"
                style={{ color: theme.dark }}
              >
                {freelancer.avatarInitials}
              </div>
            </div>

            {/* Availability Green / Amber Status Dot */}
            <div
              className="absolute -bottom-1 -right-1 flex items-center justify-center"
              title={freelancer.available ? t("available") : t("booked")}
            >
              <span className="relative flex h-4 w-4">
                {freelancer.available && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white ${
                    freelancer.available ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] text-xs font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{freelancer.rating}</span>
            <span className="text-[#6B6B7B] font-normal">({freelancer.reviewsCount})</span>
          </div>
        </div>

        {/* Name & Title */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#0B0B14] flex items-center gap-1.5 group-hover:text-blue-950 transition-colors">
            {freelancer.name}
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </h3>
          <p className="text-xs text-[#4B4B5C] mt-0.5">{freelancer.title}</p>
        </div>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {freelancer.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] text-[11px] font-medium text-[#4B4B5C] group-hover:border-blue-300 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Price & Profile CTA */}
      <div className="pt-4 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#6B6B7B] uppercase font-mono block">{t("startingAt")}</span>
          <span className="text-base font-bold text-[#0B0B14] font-mono">${freelancer.startingPrice}</span>
        </div>

        <Link href={`/explore?talent=${encodeURIComponent(freelancer.name)}`}>
          <Button size="sm" variant="outline" pill className="text-xs hover:border-blue-300 hover:text-blue-700">
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

  return (
    <section className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] relative overflow-hidden" id="talent">
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
              className="text-[clamp(32px,4.5vw,56px)] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0B0B14]"
            >
              {t("titlePrefix")} <span className="text-accent-gradient">{t("titleHighlight")}</span>
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              custom={0.12}
              className="text-base sm:text-lg text-[#4B4B5C] mt-3 leading-relaxed"
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors group"
            >
              <span>{t("viewAll")}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* 4 Cards with 3D Tilt and Staggered Entrance */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURED_FREELANCERS_DATA.map((freelancer) => (
            <motion.div
              key={freelancer.id}
              variants={staggerChildCardVariants}
              className="h-full"
            >
              <FreelancerCard freelancer={freelancer} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

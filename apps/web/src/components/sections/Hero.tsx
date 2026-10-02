"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { ArrowRight, Sparkles, ShieldCheck, Star, CheckCircle2, Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/ui/SearchBar"
import { GradientBackground } from "@/components/ui/GradientBackground"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  landingCardVariants,
  EASE_OUT_EXPO,
} from "@/lib/motion"

export function Hero() {
  const t = useTranslations("hero")
  const heroRef = React.useRef<HTMLDivElement>(null)

  // Scroll-linked parallax mapping across hero exit
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // 1. Editorial text soft fade-out & lift as user scrolls past
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -40])

  // 2. Parallax multi-depth drift for mockup cards (depth illusion: back moves faster, front moves slower)
  const card1Y = useTransform(scrollYProgress, [0, 1], [0, -35]) // Gig Card (center)
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, -75]) // Milestone progress (background)
  const card3Y = useTransform(scrollYProgress, [0, 1], [0, -20]) // Toast (foreground)

  return (
    <div ref={heroRef}>
      <GradientBackground className="pt-4 sm:pt-8 pb-14 sm:pb-20 md:pt-16 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Editorial Headline, Benefits, Search & Dual CTAs */}
            <motion.div
              style={{ opacity: contentOpacity, y: contentY }}
              className="lg:col-span-7 flex flex-col items-start text-left will-change-transform"
            >
              {/* 1. Announcement Pill */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                <Link
                  href="/#how-it-works"
                  className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 hover:border-blue-300 backdrop-blur-md mb-8 transition-all duration-300 hover:scale-[1.02] shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                  </span>
                  <span className="text-xs font-semibold text-blue-800 tracking-wide">
                    {t("announcement")}
                  </span>
                  <ArrowRight className="h-3 w-3 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* 2. Hero Headline with Blur-to-Sharp reveal */}
              <motion.h1
                variants={fadeUpBlurVariants}
                initial="hidden"
                animate="visible"
                custom={0.05}
                className="text-[clamp(44px,6.5vw,84px)] font-semibold tracking-[-0.03em] leading-[1.05] text-[#0B0B14] mb-6"
              >
                <span className="text-accent-gradient">{t("titlePart1")}</span> {t("titlePart2")}
              </motion.h1>

              {/* 3. Subheading focused on user benefit */}
              <motion.p
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                custom={0.12}
                className="text-base sm:text-lg md:text-xl text-[#4B4B5C] max-w-xl leading-relaxed mb-8 font-normal"
              >
                {t("subtitle")}
              </motion.p>

              {/* 4. Big Glass Search Bar */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                custom={0.18}
                className="w-full mb-8"
              >
                <SearchBar />
              </motion.div>

              {/* 5. Dual Action CTAs (Full-width stacked on mobile, inline on tablet/desktop) */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                custom={0.24}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto"
              >
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    pill
                    className="w-full sm:w-auto justify-center px-8 shadow-lg"
                  >
                    <span>{t("ctaHire")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register?role=seller" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    pill
                    className="w-full sm:w-auto justify-center px-8"
                  >
                    {t("ctaBecomeFreelancer")}
                  </Button>
                </Link>
              </motion.div>

              {/* 6. Micro reassurance trust indicators */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="flex flex-wrap items-center justify-between sm:justify-start gap-y-2.5 gap-x-4 sm:gap-6 mt-8 pt-6 border-t border-[rgba(15,15,30,0.08)] text-xs text-[#6B6B7B] w-full"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-[#4B4B5C] font-medium">{t("trustEscrow")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-[#4B4B5C] font-medium">{t("trustVetted")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="text-[#4B4B5C] font-medium">{t("trustRisk")}</span>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: Floating Product Mockup Cluster with Parallax Depth & Idle Floating Animation */}
            <div className="lg:col-span-5 relative w-full h-[430px] sm:h-[500px] md:h-[540px] flex items-center justify-center overflow-hidden lg:overflow-visible">
              {/* Ambient Background Glow for Mockup Cluster */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[440px] h-[300px] sm:h-[440px] bg-gradient-to-tr from-blue-400/20 via-sky-300/15 to-teal-300/15 rounded-full blur-[90px] pointer-events-none"
                aria-hidden="true"
              />

              {/* Mockup Card 1: Premium Gig Card (Center-Left) */}
              <motion.div
                style={{ y: card1Y }}
                className="absolute z-20 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 top-3 sm:top-8 will-change-transform max-w-[calc(100vw-36px)]"
              >
                <motion.div
                  variants={landingCardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.15}
                >
                  <div className="animate-float-1">
                    <div className="w-[290px] sm:w-[330px] rounded-2xl bg-white/95 backdrop-blur-2xl border border-[rgba(15,15,30,0.1)] p-4 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.2),0_4px_16px_rgba(15,15,30,0.06)] will-change-transform">
                      {/* Cover Art Gradient Header */}
                      <div className="relative h-32 w-full rounded-xl bg-gradient-to-br from-blue-100 via-sky-50 to-teal-50 p-3 flex flex-col justify-between overflow-hidden border border-[rgba(15,15,30,0.06)]">
                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-[rgba(15,15,30,0.08)] text-[10px] font-semibold text-blue-800">
                            {t("mockupCategory")}
                          </span>
                          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-[rgba(15,15,30,0.08)] text-amber-700 text-[10px] font-semibold">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span>5.0</span>
                            <span className="text-[#6B6B7B] font-normal">(128)</span>
                          </div>
                        </div>

                        {/* Subtle abstract code lines simulation */}
                        <div className="space-y-1 opacity-60 z-10">
                          <div className="h-1.5 w-24 bg-blue-400/60 rounded-full" />
                          <div className="h-1.5 w-16 bg-sky-400/50 rounded-full" />
                        </div>

                        {/* Radial shimmer inside card */}
                        <div className="absolute inset-0 bg-radial from-blue-200/40 to-transparent pointer-events-none" />
                      </div>

                      {/* Freelancer Author Info */}
                      <div className="flex items-center gap-2.5 mt-3 px-1">
                        <div className="relative h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 p-[1.5px]">
                          <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-blue-900 border border-blue-100">
                            AM
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0B0B14] truncate flex items-center gap-1">
                            {t("mockupAuthorName")}
                            <ShieldCheck className="h-3 w-3 text-blue-600 shrink-0" />
                          </p>
                          <p className="text-[10px] text-[#4B4B5C] truncate">
                            {t("mockupAuthorTitle")}
                          </p>
                        </div>
                      </div>

                      {/* Gig Title */}
                      <p className="text-xs font-medium text-[#0B0B14] mt-2.5 px-1 line-clamp-2 leading-snug">
                        {t("mockupGigTitle")}
                      </p>

                      {/* Price & Delivery Meta */}
                      <div className="mt-3 pt-2.5 border-t border-[rgba(15,15,30,0.08)] flex items-center justify-between px-1 text-[11px]">
                        <span className="text-[#6B6B7B] flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t("mockupDelivery")}
                        </span>
                        <div>
                          <span className="text-[#6B6B7B] text-[10px] mr-1 uppercase">
                            {t("mockupFrom")}
                          </span>
                          <span className="font-bold text-[#0B0B14] text-sm font-mono">
                            {t("mockupPrice")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Mockup Card 2: Project Milestone Progress Card (Top-Right / Background Parallax) */}
              <motion.div
                style={{ y: card2Y }}
                className="absolute z-30 right-0 sm:right-2 top-24 sm:top-28 will-change-transform"
              >
                <motion.div
                  variants={landingCardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.25}
                >
                  <div className="animate-float-2">
                    <div className="w-[270px] sm:w-[300px] rounded-2xl bg-white/95 backdrop-blur-2xl border border-[rgba(15,15,30,0.1)] p-4 shadow-[0_20px_45px_rgba(15,15,30,0.12),0_0_35px_-10px_rgba(37,99,235,0.15)] will-change-transform">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                            <Lock className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-semibold text-[#0B0B14]">
                            {t("mockupEscrowTitle")}
                          </span>
                        </div>
                        <Badge
                          variant="luxury"
                          size="sm"
                          className="text-[10px] py-0 px-2 font-mono"
                        >
                          {t("mockupPhase")}
                        </Badge>
                      </div>

                      <p className="text-xs font-medium text-[#4B4B5C] mb-1">{t("mockupTask")}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#6B6B7B] mb-2 font-mono">
                        <span>{t("mockupProgress")}</span>
                        <span className="text-blue-700 font-semibold">{t("mockupDue")}</span>
                      </div>

                      {/* Animated Glowing Progress Bar */}
                      <div className="h-2 w-full bg-[#F4F4F8] rounded-full overflow-hidden p-[1px]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 shadow-sm"
                          style={{ width: "75%" }}
                        />
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[rgba(15,15,30,0.08)] flex items-center justify-between text-[11px]">
                        <span className="text-[#6B6B7B]">{t("mockupVaultLocked")}</span>
                        <span className="font-semibold text-emerald-700 font-mono">$1,450.00</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Mockup Card 3: "Payment Released" Notification Toast (Bottom Floating / Foreground) */}
              <motion.div
                style={{ y: card3Y }}
                className="absolute z-40 left-4 sm:left-12 bottom-6 sm:bottom-10 will-change-transform"
              >
                <motion.div
                  variants={landingCardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0.35}
                >
                  <div className="animate-float-3">
                    <div className="w-[280px] sm:w-[310px] rounded-2xl bg-white/95 backdrop-blur-2xl border border-emerald-500/30 p-3.5 shadow-[0_20px_45px_rgba(15,15,30,0.12),0_0_35px_-10px_rgba(16,185,129,0.15)] flex items-center gap-3 will-change-transform">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#0B0B14]">
                            {t("mockupPaymentReleased")}
                          </p>
                          <span className="text-[10px] text-[#6B6B7B]">{t("mockupJustNow")}</span>
                        </div>
                        <p className="text-[11px] text-[#4B4B5C] truncate mt-0.5">
                          <span className="text-emerald-700 font-semibold font-mono">
                            +$1,450.00
                          </span>{" "}
                          {t("mockupPaymentSent")}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-blue-700 mt-1 font-semibold">
                          <ShieldCheck className="h-3 w-3" />
                          <span>{t("mockupProtectionVerified")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </GradientBackground>
    </div>
  )
}

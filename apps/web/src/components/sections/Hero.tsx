"use client"

import * as React from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { ArrowRight, ShieldCheck, Star, CheckCircle2, Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/ui/SearchBar"
import { GradientBackground } from "@/components/ui/GradientBackground"
import Image from "next/image"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { images, imageDetails } from "@/data/images"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  landingCardVariants,
  EASE_OUT_EXPO,
} from "@/lib/motion"

export function Hero() {
  const t = useTranslations("hero")
  const heroRef = React.useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  // Scroll-linked parallax mapping across hero exit (disabled on reduced-motion)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // 1. Editorial text soft fade-out & lift as user scrolls past
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, shouldReduceMotion ? 1 : 0])
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, shouldReduceMotion ? 0 : -35])

  // 2. Parallax multi-depth drift for mockup cards (depth illusion: back moves faster, front moves slower)
  const card1Y = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -30]) // Gig Card (center)
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -60]) // Milestone progress (background)
  const card3Y = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -18]) // Toast (foreground)

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
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/25 hover:border-[#635BFF]/45 mb-6 sm:mb-8 transition-colors shadow-xs"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#635BFF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#635BFF]" />
                  </span>
                  <span className="text-xs font-semibold text-[#635BFF] tracking-wide">
                    {t("announcement")}
                  </span>
                  <ArrowRight className="h-3 w-3 text-[#635BFF] arrow-micro" />
                </Link>
              </motion.div>

              {/* 2. Hero Headline with Blur-to-Sharp reveal */}
              <motion.h1
                variants={fadeUpBlurVariants}
                initial="hidden"
                animate="visible"
                custom={0.05}
                className="stripe-hero-heading max-w-2xl mb-6"
              >
                <span className="stripe-gradient-text">{t("titlePart1")}</span> {t("titlePart2")}
              </motion.h1>

              {/* 3. Subheading focused on user benefit */}
              <motion.p
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                custom={0.12}
                className="stripe-subheading max-w-xl mb-8 font-normal"
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

              {/* 5. Dual Action CTAs */}
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
                    className="w-full sm:w-auto justify-center px-8 shadow-sm"
                  >
                    <span>{t("ctaHire")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register?role=seller" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
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
                className="flex flex-wrap items-center justify-between sm:justify-start gap-y-2.5 gap-x-4 sm:gap-6 mt-8 pt-6 border-t border-[rgba(10,10,35,0.08)] text-xs text-[#6B6B7B] w-full"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-[#4B4B5C] font-medium">{t("trustEscrow")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#635BFF] shrink-0" />
                  <span className="text-[#4B4B5C] font-medium">{t("trustVetted")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="text-[#4B4B5C] font-medium">{t("trustRisk")}</span>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: Floating Product Mockup Cluster with Parallax Depth & Idle Floating Animation */}
            <div className="lg:col-span-5 relative w-full h-[430px] sm:h-[500px] md:h-[540px] flex items-center justify-center overflow-hidden lg:overflow-visible">
              {/* Ambient Background Aura for Mockup Cluster */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[440px] h-[300px] sm:h-[440px] bg-gradient-to-tr from-blue-100/40 via-slate-100/30 to-teal-50/20 rounded-full blur-[90px] pointer-events-none"
                aria-hidden="true"
              />

              {/* Mockup Card 1: Deliverable Card (Center-Left) */}
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
                    <div className="w-[290px] sm:w-[330px] rounded-lg bg-white border border-[#CBD5E1] p-4 shadow-md will-change-transform">
                      {/* Cover Art Image Header */}
                      <div className="relative h-32 w-full rounded-md overflow-hidden border border-[#E2E8F0] flex flex-col justify-between p-2.5">
                        <Image
                          src={images.heroGigCover}
                          alt={imageDetails.heroGigCover.alt}
                          fill
                          sizes="(max-width: 640px) 290px, 330px"
                          className="object-cover"
                          priority
                        />

                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 rounded bg-white/95 border border-[#E2E8F0] text-[10px] font-semibold text-[#0F172A] shadow-xs">
                            {t("mockupCategory")}
                          </span>
                          <div className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded border border-[#E2E8F0] text-[#0F172A] text-[10px] font-semibold shadow-xs">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                            <span>5.0</span>
                            <span className="text-[#64748B] font-normal">(128)</span>
                          </div>
                        </div>
                      </div>

                      {/* Freelancer Author Info */}
                      <div className="flex items-center gap-2.5 mt-3 px-1">
                        <AvatarImage
                          src={images.avatarAlexandre}
                          name="Alexandre Moreau"
                          size={28}
                          rounded="md"
                          alt={imageDetails.avatarAlexandre.alt}
                          showOnlineStatus
                          isOnline
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0F172A] truncate flex items-center gap-1">
                            {t("mockupAuthorName")}
                            <ShieldCheck className="h-3.5 w-3.5 text-[#635BFF] shrink-0" />
                          </p>
                          <p className="text-[10px] text-[#64748B] truncate">
                            {t("mockupAuthorTitle")}
                          </p>
                        </div>
                      </div>

                      {/* Gig Title */}
                      <p className="text-xs font-semibold text-[#0F172A] mt-2.5 px-1 line-clamp-2 leading-snug">
                        {t("mockupGigTitle")}
                      </p>

                      {/* Price & Delivery Meta */}
                      <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between px-1 text-[11px]">
                        <span className="text-[#64748B] flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t("mockupDelivery")}
                        </span>
                        <div>
                          <span className="text-[#64748B] text-[10px] mr-1 uppercase font-mono">
                            {t("mockupFrom")}
                          </span>
                          <span className="font-bold text-[#0F172A] text-sm font-mono">
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
                    <div className="w-[270px] sm:w-[300px] rounded-lg bg-white border border-[#E2E8F0] p-4 shadow-lg will-change-transform">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-[#635BFF]/10 border border-[#635BFF]/25 flex items-center justify-center text-[#635BFF]">
                            <Lock className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-semibold text-[#0F172A]">
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

                      <p className="text-xs font-medium text-[#475569] mb-1">{t("mockupTask")}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-2 font-mono">
                        <span>{t("mockupProgress")}</span>
                        <span className="text-[#635BFF] font-semibold">{t("mockupDue")}</span>
                      </div>

                      {/* Clean Progress Bar in Indigo-Violet */}
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-[1px]">
                        <div
                          className="h-full rounded-full bg-[#635BFF] shadow-xs"
                          style={{ width: "75%" }}
                        />
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                        <span className="text-[#64748B]">{t("mockupVaultLocked")}</span>
                        <span className="font-semibold text-[#047857] font-mono">$1,450.00</span>
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
                    <div className="w-[280px] sm:w-[310px] rounded-lg bg-white border border-[#A7F3D0] p-3.5 shadow-md flex items-center gap-3 will-change-transform">
                      <div className="h-9 w-9 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {t("mockupPaymentReleased")}
                          </p>
                          <span className="text-[10px] text-[#64748B]">{t("mockupJustNow")}</span>
                        </div>
                        <p className="text-[11px] text-[#475569] truncate mt-0.5">
                          <span className="text-[#047857] font-semibold font-mono">+$1,450.00</span>{" "}
                          {t("mockupPaymentSent")}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-[#047857] mt-1 font-medium">
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

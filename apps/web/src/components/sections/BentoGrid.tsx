"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import {
  ShieldCheck,
  Lock,
  Layers,
  MessageSquare,
  Globe,
  Award,
  CheckCircle2,
  Headphones,
} from "lucide-react"
import { SpotlightCard } from "@/components/ui/SpotlightCard"
import { Badge } from "@/components/ui/badge"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  staggerContainerVariants,
  staggerChildCardVariants,
  VIEWPORT_ONCE,
} from "@/lib/motion"

import { getAccentTheme } from "@/lib/gradients"

export function BentoGrid() {
  const t = useTranslations("bento")
  const tealTheme = getAccentTheme("teal")
  const blueTheme = getAccentTheme("blue")
  const violetTheme = getAccentTheme("violet")
  const pinkTheme = getAccentTheme("pink")
  const amberTheme = getAccentTheme("amber")
  const indigoTheme = getAccentTheme("indigo")

  return (
    <section className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] relative overflow-hidden">
      {/* Subtle background glow: soft blue + violet bridge */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-400/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[400px] bg-purple-400/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 md:mb-20">
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
            className="text-[clamp(32px,4.5vw,56px)] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0B0B14] mb-4"
          >
            {t("titlePrefix")} <span className="text-accent-gradient">{t("titleHighlight")}</span>
          </motion.h2>

          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.12}
            className="text-base sm:text-lg text-[#4B4B5C] leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Asymmetric Bento Grid (6 Cards) with Staggered Entrance & Individual Accent Themes */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* CARD 1 (Col Span 2): SECURE ESCROW PAYMENTS (Teal / Emerald Accent) */}
          <motion.div variants={staggerChildCardVariants} className="lg:col-span-2 h-full">
            <SpotlightCard accent="teal" className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border ${tealTheme.iconBoxClass}`}>
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold tracking-wide border shadow-xs ${tealTheme.badgeClass}`}>
                    {t("card1Badge")}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-[#0B0B14] mb-3">
                  {t("card1Title")}
                </h3>
                <p className="text-sm text-[#4B4B5C] max-w-xl leading-relaxed mb-6 sm:mb-8">
                  {t("card1Desc")}
                </p>
              </div>

              {/* Live Visual: Escrow Vault Status */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 shadow-sm">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0B0B14]">{t("card1VaultStatus")}</span>
                      <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    </div>
                    <span className="font-mono text-[11px] text-[#6B6B7B]">
                      {t("card1ContractMeta")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#6B6B7B] uppercase block">{t("card1ProtectedBalance")}</span>
                    <span className="text-teal-700 font-bold">{t("card1BalanceValue")}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-semibold">
                    {t("card1Insured")}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 2 (Col Span 1): MILESTONE TRACKING (Blue Accent - Brand Primary) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard accent="blue" className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full">
              <div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 shadow-sm border ${blueTheme.iconBoxClass}`}>
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#0B0B14] mb-2">
                  {t("card2Title")}
                </h3>
                <p className="text-sm text-[#4B4B5C] leading-relaxed mb-6">
                  {t("card2Desc")}
                </p>
              </div>

              {/* Live Visual: 3 Mini Milestones */}
              <div className="space-y-2.5 p-3.5 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#4B4B5C] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> {t("card2M1")}
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 font-semibold">100%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-full" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-2 text-[#0B0B14] font-medium">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" /> {t("card2M2")}
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 font-semibold">75%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-sky-400 h-full w-3/4" />
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 3 (Col Span 1): REAL-TIME MESSAGING (Violet Accent) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard accent="violet" className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full">
              <div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 shadow-sm border ${violetTheme.iconBoxClass}`}>
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#0B0B14] mb-2">
                  {t("card3Title")}
                </h3>
                <p className="text-sm text-[#4B4B5C] leading-relaxed mb-6">
                  {t("card3Desc")}
                </p>
              </div>

              {/* Live Visual: Chat simulation */}
              <div className="p-3.5 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] space-y-2.5">
                <div className="p-2.5 rounded-lg bg-white border border-purple-200 text-xs text-[#0B0B14] ml-2 sm:ml-4 shadow-sm">
                  <p>{t("card3ChatMsg")}</p>
                  <span className="text-[9px] text-purple-700 font-mono font-medium mt-1 block">{t("card3ChatTime")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B6B7B] px-1">
                  <span className="text-[11px] font-medium">{t("card3Typing")}</span>
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 4 (Col Span 2): GLOBAL TALENT MATRIX (Pink / Rose Accent) */}
          <motion.div variants={staggerChildCardVariants} className="lg:col-span-2 h-full">
            <SpotlightCard accent="pink" className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm border ${pinkTheme.iconBoxClass}`}>
                    <Globe className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#4B4B5C]">
                    <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="font-medium">{t("card4ActiveOnline")}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-[#0B0B14] mb-3">
                  {t("card4Title")}
                </h3>
                <p className="text-sm text-[#4B4B5C] max-w-xl leading-relaxed mb-6">
                  {t("card4Desc")}
                </p>
              </div>

              {/* Live Visual: Coordinate Hubs with Pulsing Radar */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                {[
                  { city: "San Francisco", count: "840+ devs", tz: "UTC-7" },
                  { city: "London", count: "620+ devs", tz: "UTC+0" },
                  { city: "Berlin", count: "480+ devs", tz: "UTC+1" },
                  { city: "Singapore", count: "510+ devs", tz: "UTC+8" },
                ].map((hub) => (
                  <div key={hub.city} className="p-2 sm:p-2.5 rounded-lg bg-white border border-[rgba(15,15,30,0.06)] shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-ping" />
                      <span className="text-xs font-semibold text-[#0B0B14] truncate">{hub.city}</span>
                    </div>
                    <span className="text-[11px] text-pink-700 block font-mono font-medium">{hub.count}</span>
                    <span className="text-[9px] text-[#6B6B7B] block">{hub.tz}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 5: VERIFIED FREELANCERS (Amber / Orange Accent) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard accent="amber" className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full">
              <div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 shadow-sm border ${amberTheme.iconBoxClass}`}>
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#0B0B14] mb-2">
                  {t("card5Title")}
                </h3>
                <p className="text-sm text-[#4B4B5C] leading-relaxed mb-6">
                  {t("card5Desc")}
                </p>
              </div>

              {/* Live Visual: Verified Skill Badges */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] text-xs">
                <div className="flex items-center justify-between text-[#0B0B14]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" /> {t("card5IdentityVerified")}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono font-semibold">{t("card5KycPassed")}</span>
                </div>
                <div className="flex items-center justify-between text-[#0B0B14]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" /> {t("card5TechAssessment")}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono font-semibold">{t("card5TopPercent")}</span>
                </div>
                <div className="flex items-center justify-between text-[#0B0B14]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" /> {t("card5EscrowHistory")}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono font-semibold">{t("card5Fulfilled")}</span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 6: DISPUTE PROTECTION & 24/7 SUPPORT (Indigo Accent) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard accent="indigo" className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full">
              <div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 shadow-sm border ${indigoTheme.iconBoxClass}`}>
                  <Headphones className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#0B0B14] mb-2">
                  {t("card6Title")}
                </h3>
                <p className="text-sm text-[#4B4B5C] leading-relaxed mb-6">
                  {t("card6Desc")}
                </p>
              </div>

              {/* Live Visual: SLA Guarantee Card */}
              <div className="p-3.5 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6B6B7B] uppercase block font-mono font-medium">{t("card6SlaLabel")}</span>
                  <span className="text-xs font-semibold text-[#0B0B14]">{t("card6SlaValue")}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6B6B7B] uppercase block font-mono font-medium">{t("card6ResolutionLabel")}</span>
                  <span className="text-xs font-bold text-indigo-700 font-mono">{t("card6ResolutionValue")}</span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

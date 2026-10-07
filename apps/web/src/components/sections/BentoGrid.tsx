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
  const amberTheme = getAccentTheme("amber")
  const indigoTheme = getAccentTheme("indigo")

  return (
    <section className="py-16 sm:py-24 md:py-36 border-b border-[#E2E8F0] bg-[#F8F9FA] relative overflow-hidden">
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
            className="stripe-section-heading text-[#0F172A] mb-4"
          >
            {t("titlePrefix")} <span className="stripe-gradient-text">{t("titleHighlight")}</span>
          </motion.h2>

          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.12}
            className="stripe-subheading leading-relaxed font-normal"
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
            <SpotlightCard
              accent="teal"
              className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`h-10 w-10 rounded-md flex items-center justify-center shadow-xs border ${tealTheme.iconBoxClass}`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold tracking-wide border shadow-2xs ${tealTheme.badgeClass}`}
                  >
                    {t("card1Badge")}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] mb-3">
                  {t("card1Title")}
                </h3>
                <p className="text-sm text-[#475569] max-w-xl leading-relaxed mb-6 sm:mb-8">
                  {t("card1Desc")}
                </p>
              </div>

              {/* Live Visual: Escrow Vault Status */}
              <div className="p-3.5 sm:p-4 rounded-md bg-[#F8F9FA] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-2xs">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {t("card1VaultStatus")}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <span className="font-mono text-[11px] text-[#64748B]">
                      {t("card1ContractMeta")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase block">
                      {t("card1ProtectedBalance")}
                    </span>
                    <span className="text-emerald-700 font-bold">{t("card1BalanceValue")}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                    {t("card1Insured")}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 2 (Col Span 1): MILESTONE TRACKING (Indigo Accent - Brand Primary) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard
              accent="indigo"
              className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full"
            >
              <div>
                <div
                  className={`h-10 w-10 rounded-md flex items-center justify-center mb-6 shadow-xs border ${indigoTheme.iconBoxClass}`}
                >
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{t("card2Title")}</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-6">{t("card2Desc")}</p>
              </div>

              {/* Live Visual: 3 Mini Milestones */}
              <div className="space-y-2.5 p-3.5 rounded-md bg-[#F8F9FA] border border-[#E2E8F0] text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#475569] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> {t("card2M1")}
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 font-semibold">100%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#635BFF] h-full w-full" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-2 text-[#0F172A] font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#635BFF] animate-ping" />{" "}
                    {t("card2M2")}
                  </span>
                  <span className="text-[10px] font-mono text-[#635BFF] font-semibold">75%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#635BFF] h-full w-3/4" />
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 3 (Col Span 1): REAL-TIME MESSAGING (Indigo Accent) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard
              accent="indigo"
              className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full"
            >
              <div>
                <div
                  className={`h-10 w-10 rounded-md flex items-center justify-center mb-6 shadow-xs border ${indigoTheme.iconBoxClass}`}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{t("card3Title")}</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-6">{t("card3Desc")}</p>
              </div>

              {/* Live Visual: Chat simulation */}
              <div className="p-3.5 rounded-md bg-[#F8F9FA] border border-[#E2E8F0] space-y-2.5">
                <div className="p-2.5 rounded-md bg-white border border-[#E2E8F0] text-xs text-[#0F172A] ml-2 sm:ml-4 shadow-2xs">
                  <p>{t("card3ChatMsg")}</p>
                  <span className="text-[9px] text-[#635BFF] font-mono font-medium mt-1 block">
                    {t("card3ChatTime")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] px-1">
                  <span className="text-[11px] font-medium">{t("card3Typing")}</span>
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF] animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF] animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF] animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 4 (Col Span 2): GLOBAL TALENT MATRIX (Indigo Accent) */}
          <motion.div variants={staggerChildCardVariants} className="lg:col-span-2 h-full">
            <SpotlightCard
              accent="indigo"
              className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`h-10 w-10 rounded-md flex items-center justify-center shadow-xs border ${indigoTheme.iconBoxClass}`}
                  >
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">{t("card4ActiveOnline")}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] mb-3">
                  {t("card4Title")}
                </h3>
                <p className="text-sm text-[#475569] max-w-xl leading-relaxed mb-6">
                  {t("card4Desc")}
                </p>
              </div>

              {/* Live Visual: Coordinate Hubs with Pulsing Radar */}
              <div className="p-3 sm:p-4 rounded-md bg-[#F8F9FA] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                {[
                  { city: "San Francisco", count: "840+ devs", tz: "UTC-7" },
                  { city: "London", count: "620+ devs", tz: "UTC+0" },
                  { city: "Berlin", count: "480+ devs", tz: "UTC+1" },
                  { city: "Singapore", count: "510+ devs", tz: "UTC+8" },
                ].map((hub) => (
                  <div
                    key={hub.city}
                    className="p-2 sm:p-2.5 rounded-md bg-white border border-[#E2E8F0] shadow-2xs"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span className="text-xs font-semibold text-[#0F172A] truncate">
                        {hub.city}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#635BFF] block font-mono font-medium">
                      {hub.count}
                    </span>
                    <span className="text-[9px] text-[#64748B] block">{hub.tz}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 5: VERIFIED FREELANCERS (Amber / Orange Accent) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard
              accent="amber"
              className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full"
            >
              <div>
                <div
                  className={`h-10 w-10 rounded-md flex items-center justify-center mb-6 shadow-xs border ${amberTheme.iconBoxClass}`}
                >
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{t("card5Title")}</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-6">{t("card5Desc")}</p>
              </div>

              {/* Live Visual: Verified Skill Badges */}
              <div className="space-y-2 p-3.5 rounded-md bg-[#F8F9FA] border border-[#E2E8F0] text-xs">
                <div className="flex items-center justify-between text-[#0F172A]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />{" "}
                    {t("card5IdentityVerified")}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono font-semibold">
                    {t("card5KycPassed")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#0F172A]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />{" "}
                    {t("card5TechAssessment")}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono font-semibold">
                    {t("card5TopPercent")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#0F172A]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />{" "}
                    {t("card5EscrowHistory")}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono font-semibold">
                    {t("card5Fulfilled")}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD 6: DISPUTE PROTECTION & 24/7 SUPPORT (Indigo Accent) */}
          <motion.div variants={staggerChildCardVariants} className="h-full">
            <SpotlightCard
              accent="indigo"
              className="p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[360px] h-full"
            >
              <div>
                <div
                  className={`h-10 w-10 rounded-md flex items-center justify-center mb-6 shadow-xs border ${indigoTheme.iconBoxClass}`}
                >
                  <Headphones className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{t("card6Title")}</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-6">{t("card6Desc")}</p>
              </div>

              {/* Live Visual: SLA Guarantee Card */}
              <div className="p-3.5 rounded-md bg-[#F8F9FA] border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase block font-mono font-medium">
                    {t("card6SlaLabel")}
                  </span>
                  <span className="text-xs font-semibold text-[#0F172A]">{t("card6SlaValue")}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#64748B] uppercase block font-mono font-medium">
                    {t("card6ResolutionLabel")}
                  </span>
                  <span className="text-xs font-bold text-[#635BFF] font-mono">
                    {t("card6ResolutionValue")}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

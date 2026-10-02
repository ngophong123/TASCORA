"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ArrowRight, Briefcase, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  EASE_OUT_EXPO,
  VIEWPORT_ONCE,
  fadeUpVariants,
  fadeUpBlurVariants,
  buttonTapMotion,
} from "@/lib/motion"

export function AudienceTabs() {
  const t = useTranslations("audience")
  const [activeTab, setActiveTab] = React.useState<"clients" | "freelancers">("clients")

  React.useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#for-freelancers" || window.location.hash === "#freelancers") {
        setActiveTab("freelancers")
      } else if (window.location.hash === "#for-clients" || window.location.hash === "#clients") {
        setActiveTab("clients")
      }
    }

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<"clients" | "freelancers">
      if (customEvent.detail === "freelancers" || customEvent.detail === "clients") {
        setActiveTab(customEvent.detail)
      }
    }

    handleHash()
    window.addEventListener("hashchange", handleHash)
    window.addEventListener("switch-audience-tab", handleCustom)
    return () => {
      window.removeEventListener("hashchange", handleHash)
      window.removeEventListener("switch-audience-tab", handleCustom)
    }
  }, [])

  return (
    <section
      id="for-freelancers"
      className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] relative overflow-hidden"
    >
      {/* Background ambient radial lighting */}
      <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Tab Switcher Controller */}
        <motion.div
          className="flex flex-col items-center text-center mb-10 sm:mb-16 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <motion.div variants={fadeUpVariants}>
            <Badge variant="gradient" size="md" className="mb-4 sm:mb-6">
              <Users className="h-3.5 w-3.5 mr-1" />
              {t("badge")}
            </Badge>
          </motion.div>

          {/* Animated Pill Switcher with layoutId */}
          <motion.div
            variants={fadeUpVariants}
            custom={0.1}
            className="relative inline-flex p-1 sm:p-1.5 rounded-full bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] shadow-sm max-w-full"
          >
            <motion.button
              type="button"
              whileTap={buttonTapMotion.whileTap}
              onClick={() => setActiveTab("clients")}
              className={cn(
                "relative z-10 px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer",
                activeTab === "clients" ? "text-white" : "text-[#6B6B7B] hover:text-[#0B0B14]"
              )}
            >
              {activeTab === "clients" && (
                <motion.div
                  layoutId="audience-tab-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 rounded-full shadow-md shadow-blue-600/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t("tabClients")}
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={buttonTapMotion.whileTap}
              onClick={() => setActiveTab("freelancers")}
              className={cn(
                "relative z-10 px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer",
                activeTab === "freelancers" ? "text-white" : "text-[#6B6B7B] hover:text-[#0B0B14]"
              )}
            >
              {activeTab === "freelancers" && (
                <motion.div
                  layoutId="audience-tab-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 rounded-full shadow-md shadow-blue-600/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t("tabFreelancers")}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Tab Content Body (Split layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <AnimatePresence mode="wait">
            {activeTab === "clients" ? (
              <motion.div
                key="tab-content-clients"
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                className="contents"
              >
                {/* Left: Value Proposition */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-700">
                    {t("clientsSubbadge")}
                  </span>
                  <motion.h3
                    variants={fadeUpBlurVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-[clamp(28px,3.5vw,48px)] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0B0B14]"
                  >
                    {t("clientsTitlePrefix")}{" "}
                    <span className="text-accent-gradient">{t("clientsTitleHighlight")}</span>
                  </motion.h3>
                  <p className="text-base text-[#4B4B5C] leading-relaxed">{t("clientsDesc")}</p>

                  <div className="space-y-4 pt-4 border-t border-[rgba(15,15,30,0.08)]">
                    {[
                      {
                        title: t("clientsF1Title"),
                        desc: t("clientsF1Desc"),
                      },
                      {
                        title: t("clientsF2Title"),
                        desc: t("clientsF2Desc"),
                      },
                      {
                        title: t("clientsF3Title"),
                        desc: t("clientsF3Desc"),
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3.5">
                        <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 shadow-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B0B14]">{item.title}</h4>
                          <p className="text-xs text-[#4B4B5C] mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link href="/explore">
                      <Button variant="primary" size="lg" pill className="px-8 shadow-md">
                        <span>{t("clientsCtaHire")}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="#how-it-works">
                      <Button variant="outline" size="lg" pill className="px-8">
                        {t("clientsCtaLearn")}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right: Client Project Dashboard Mockup */}
                <div className="lg:col-span-6">
                  <div className="rounded-2xl bg-white/95 backdrop-blur-2xl border border-[rgba(15,15,30,0.1)] p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(15,15,30,0.08),0_0_30px_-10px_rgba(37,99,235,0.12)]">
                    <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.08)] mb-6">
                      <div>
                        <span className="text-[10px] text-[#6B6B7B] uppercase font-mono block">
                          {t("clientsWorkspaceLabel")}
                        </span>
                        <h4 className="text-sm font-semibold text-[#0B0B14]">
                          {t("clientsProjectName")}
                        </h4>
                      </div>
                      <Badge variant="success" size="sm">
                        In Progress
                      </Badge>
                    </div>

                    {/* Milestone Progress Status */}
                    <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] mb-6 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#4B4B5C] font-medium">
                          {t("clientsSprintTitle")}
                        </span>
                        <span className="text-emerald-700 font-mono font-bold">
                          {t("clientsSprintProgress")}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-[1px]">
                        <div className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full w-[85%]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6B6B7B]">
                        <span>{t("clientsNextReview")}</span>
                        <span className="text-[#0B0B14] font-semibold font-mono">
                          {t("clientsEscrowProtected")}
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)]">
                        <span className="text-[10px] uppercase text-[#6B6B7B] block font-mono">
                          {t("clientsProtectedEscrowLabel")}
                        </span>
                        <span className="text-lg font-bold text-emerald-700 font-mono mt-1 block">
                          {t("clientsTotalEscrow")}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)]">
                        <span className="text-[10px] uppercase text-[#6B6B7B] block font-mono">
                          {t("clientsCompletedMilestonesLabel")}
                        </span>
                        <span className="text-lg font-bold text-[#0B0B14] font-mono mt-1 block">
                          {t("clientsCompletedMilestonesValue")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tab-content-freelancers"
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                className="contents"
              >
                {/* Left: Value Proposition for Freelancers */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-teal-700">
                    {t("freelancersSubbadge")}
                  </span>
                  <motion.h3
                    variants={fadeUpBlurVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-[clamp(28px,3.5vw,48px)] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0B0B14]"
                  >
                    {t("freelancersTitlePrefix")}{" "}
                    <span className="text-accent-gradient">{t("freelancersTitleHighlight")}</span>
                  </motion.h3>
                  <p className="text-base text-[#4B4B5C] leading-relaxed">{t("freelancersDesc")}</p>

                  <div className="space-y-4 pt-4 border-t border-[rgba(15,15,30,0.08)]">
                    {[
                      {
                        title: t("freelancersF1Title"),
                        desc: t("freelancersF1Desc"),
                      },
                      {
                        title: t("freelancersF2Title"),
                        desc: t("freelancersF2Desc"),
                      },
                      {
                        title: t("freelancersF3Title"),
                        desc: t("freelancersF3Desc"),
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3.5">
                        <div className="h-6 w-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 shadow-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B0B14]">{item.title}</h4>
                          <p className="text-xs text-[#4B4B5C] mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link href="/register?role=seller">
                      <Button variant="primary" size="lg" pill className="px-8 shadow-md">
                        <span>{t("freelancersCtaApply")}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/seller-guide">
                      <Button variant="outline" size="lg" pill className="px-8">
                        {t("freelancersCtaGuide")}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right: Freelancer Earnings Mockup */}
                <div className="lg:col-span-6">
                  <div className="rounded-2xl bg-white/95 backdrop-blur-2xl border border-[rgba(15,15,30,0.1)] p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(15,15,30,0.08),0_0_30px_-10px_rgba(37,99,235,0.12)]">
                    <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.08)] mb-6">
                      <div>
                        <span className="text-[10px] text-[#6B6B7B] uppercase font-mono block">
                          Seller Analytics
                        </span>
                        <h4 className="text-sm font-semibold text-[#0B0B14]">
                          {t("freelancersPayoutSummary")}
                        </h4>
                      </div>
                      <Badge variant="luxury" size="sm">
                        Top Rated Seller
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)]">
                        <span className="text-[10px] uppercase text-[#6B6B7B] block font-mono">
                          {t("freelancersNetEarningsLabel")}
                        </span>
                        <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
                          {t("freelancersNetEarnings")}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)]">
                        <span className="text-[10px] uppercase text-[#6B6B7B] block font-mono">
                          {t("freelancersAvgHourlyLabel")}
                        </span>
                        <span className="text-2xl font-bold text-blue-700 font-mono mt-1 block">
                          {t("freelancersAvgHourly")}
                        </span>
                      </div>
                    </div>

                    {/* Escrow Released Strip */}
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                      <span className="text-[10px] text-blue-800 font-semibold uppercase tracking-wider">
                        {t("freelancersRecentPill")}
                      </span>
                      <p className="text-xs font-semibold text-[#0B0B14]">
                        {t("freelancersMilestoneCleared")}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-[#4B4B5C]">
                        <span>{t("freelancersClearedClient")}</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {t("freelancersClearedAmount")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

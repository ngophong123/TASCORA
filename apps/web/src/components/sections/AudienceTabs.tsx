"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ArrowRight, Users } from "lucide-react"
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
      className="py-16 sm:py-24 md:py-36 border-b border-[#E2E8F0] bg-[#F8F9FA] relative overflow-hidden"
    >
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

          {/* Architectural Segmented Switcher with layoutId */}
          <motion.div
            variants={fadeUpVariants}
            custom={0.1}
            className="relative inline-flex p-1 rounded-lg bg-[#E2E8F0]/70 border border-[#E2E8F0] shadow-2xs max-w-full"
          >
            <motion.button
              type="button"
              whileTap={buttonTapMotion.whileTap}
              onClick={() => setActiveTab("clients")}
              className={cn(
                "relative z-10 px-5 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer",
                activeTab === "clients" ? "text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"
              )}
            >
              {activeTab === "clients" && (
                <motion.div
                  layoutId="audience-tab-indicator"
                  className="absolute inset-0 bg-white rounded-md shadow-xs border border-[#CBD5E1]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t("tabClients")}</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={buttonTapMotion.whileTap}
              onClick={() => setActiveTab("freelancers")}
              className={cn(
                "relative z-10 px-5 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer",
                activeTab === "freelancers"
                  ? "text-[#0F172A]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              )}
            >
              {activeTab === "freelancers" && (
                <motion.div
                  layoutId="audience-tab-indicator"
                  className="absolute inset-0 bg-white rounded-md shadow-xs border border-[#CBD5E1]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t("tabFreelancers")}</span>
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
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#635BFF]">
                    {t("clientsSubbadge")}
                  </span>
                  <motion.h3
                    variants={fadeUpBlurVariants}
                    initial="hidden"
                    animate="visible"
                    className="stripe-section-heading text-[#0F172A]"
                  >
                    {t("clientsTitlePrefix")}{" "}
                    <span className="stripe-gradient-text">{t("clientsTitleHighlight")}</span>
                  </motion.h3>
                  <p className="stripe-subheading leading-relaxed font-normal">
                    {t("clientsDesc")}
                  </p>

                  <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
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
                        <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0F172A]">{item.title}</h4>
                          <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link href="/explore">
                      <Button variant="primary" size="lg" className="px-8 shadow-sm">
                        <span>{t("clientsCtaHire")}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="#how-it-works">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-8 hover:border-[#635BFF] hover:text-[#635BFF]"
                      >
                        {t("clientsCtaLearn")}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right: Client Project Dashboard Mockup */}
                <div className="lg:col-span-6">
                  <div className="rounded-lg bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
                      <div>
                        <span className="text-[10px] text-[#64748B] uppercase font-mono block">
                          {t("clientsWorkspaceLabel")}
                        </span>
                        <h4 className="text-sm font-semibold text-[#0F172A]">
                          {t("clientsProjectName")}
                        </h4>
                      </div>
                      <Badge variant="success" size="sm">
                        In Progress
                      </Badge>
                    </div>

                    {/* Milestone Progress Status */}
                    <div className="p-4 rounded-md bg-[#F8F9FA] border border-[#E2E8F0] mb-6 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#475569] font-medium">
                          {t("clientsSprintTitle")}
                        </span>
                        <span className="text-emerald-700 font-mono font-bold">
                          {t("clientsSprintProgress")}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-[1px]">
                        <div className="bg-[#635BFF] h-full rounded-full w-[85%]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>{t("clientsNextReview")}</span>
                        <span className="text-[#0F172A] font-semibold font-mono">
                          {t("clientsEscrowProtected")}
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-md bg-[#F8F9FA] border border-[#E2E8F0]">
                        <span className="text-[10px] uppercase text-[#64748B] block font-mono">
                          {t("clientsProtectedEscrowLabel")}
                        </span>
                        <span className="text-lg font-bold text-emerald-700 font-mono mt-1 block">
                          {t("clientsTotalEscrow")}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-md bg-[#F8F9FA] border border-[#E2E8F0]">
                        <span className="text-[10px] uppercase text-[#64748B] block font-mono">
                          {t("clientsCompletedMilestonesLabel")}
                        </span>
                        <span className="text-lg font-bold text-[#0F172A] font-mono mt-1 block">
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
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#635BFF]">
                    {t("freelancersSubbadge")}
                  </span>
                  <motion.h3
                    variants={fadeUpBlurVariants}
                    initial="hidden"
                    animate="visible"
                    className="stripe-section-heading text-[#0F172A]"
                  >
                    {t("freelancersTitlePrefix")}{" "}
                    <span className="stripe-gradient-text">{t("freelancersTitleHighlight")}</span>
                  </motion.h3>
                  <p className="stripe-subheading leading-relaxed font-normal">
                    {t("freelancersDesc")}
                  </p>

                  <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
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
                        <div className="h-6 w-6 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/25 flex items-center justify-center text-[#635BFF] shrink-0 mt-0.5 shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0F172A]">{item.title}</h4>
                          <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link href="/register?role=seller">
                      <Button variant="primary" size="lg" className="px-8 shadow-sm">
                        <span>{t("freelancersCtaApply")}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/seller-guide">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-8 hover:border-[#635BFF] hover:text-[#635BFF]"
                      >
                        {t("freelancersCtaGuide")}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right: Freelancer Earnings Mockup */}
                <div className="lg:col-span-6">
                  <div className="rounded-lg bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
                      <div>
                        <span className="text-[10px] text-[#64748B] uppercase font-mono block">
                          Seller Analytics
                        </span>
                        <h4 className="text-sm font-semibold text-[#0F172A]">
                          {t("freelancersPayoutSummary")}
                        </h4>
                      </div>
                      <Badge variant="luxury" size="sm">
                        Top Rated Seller
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-md bg-[#F8F9FA] border border-[#E2E8F0]">
                        <span className="text-[10px] uppercase text-[#64748B] block font-mono">
                          {t("freelancersNetEarningsLabel")}
                        </span>
                        <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
                          {t("freelancersNetEarnings")}
                        </span>
                      </div>
                      <div className="p-4 rounded-md bg-[#F8F9FA] border border-[#E2E8F0]">
                        <span className="text-[10px] uppercase text-[#64748B] block font-mono">
                          {t("freelancersAvgHourlyLabel")}
                        </span>
                        <span className="text-2xl font-bold text-blue-700 font-mono mt-1 block">
                          {t("freelancersAvgHourly")}
                        </span>
                      </div>
                    </div>

                    {/* Escrow Released Strip */}
                    <div className="p-4 rounded-md bg-[#635BFF]/10 border border-[#635BFF]/25 space-y-1">
                      <span className="text-[10px] text-[#635BFF] font-semibold uppercase tracking-wider">
                        {t("freelancersRecentPill")}
                      </span>
                      <p className="text-xs font-semibold text-[#0F172A]">
                        {t("freelancersMilestoneCleared")}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-[#475569]">
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

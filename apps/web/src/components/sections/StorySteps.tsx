"use client"

import * as React from "react"
import { motion, AnimatePresence, useScroll, useSpring, useInView } from "framer-motion"
import { useTranslations } from "next-intl"
import {
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  EASE_OUT_EXPO,
  VIEWPORT_ONCE,
  fadeUpVariants,
  fadeUpBlurVariants,
  staggerContainerVariants,
  staggerChildCardVariants,
  buttonTapMotion,
} from "@/lib/motion"

interface StepItemProps {
  step: {
    id: string
    stepNumber: string
    badge: string
    title: string
    description: string
    benefits: string[]
  }
  index: number
  isActive: boolean
  onActivate: (idx: number) => void
}

function StepItem({ step, index, isActive, onActivate }: StepItemProps) {
  const itemRef = React.useRef<HTMLDivElement>(null)
  const isInCenterView = useInView(itemRef, {
    margin: "-15% 0px -30% 0px",
  })

  React.useEffect(() => {
    if (isInCenterView) {
      onActivate(index)
    }
  }, [isInCenterView, index, onActivate])

  return (
    <motion.div
      ref={itemRef}
      variants={staggerChildCardVariants}
      onClick={() => onActivate(index)}
      className={cn(
        "p-4 sm:p-7 md:p-8 rounded-2xl border transition-all duration-300 cursor-pointer select-none relative group",
        isActive
          ? "bg-white border-blue-400/80 shadow-[0_16px_40px_-12px_rgba(37,99,235,0.22)] ring-1 ring-blue-300/60"
          : "bg-[#FAFAFC] border-[rgba(15,15,30,0.08)] hover:border-[rgba(15,15,30,0.18)] hover:bg-white"
      )}
    >
      {/* Active step subtle glow highlight line on left border */}
      {isActive && (
        <motion.div
          layoutId="story-step-active-bar"
          className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-blue-600 to-sky-400 rounded-r-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-sm font-bold px-2.5 py-1 rounded-lg transition-colors",
              isActive
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-[#F4F4F8] text-[#6B6B7B] border border-[rgba(15,15,30,0.08)]"
            )}
          >
            {step.stepNumber}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            {step.badge}
          </span>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isActive ? "rotate-90 text-blue-600" : "text-[#6B6B7B] group-hover:translate-x-1"
          )}
        />
      </div>

      <h3 className="text-xl sm:text-2xl font-semibold text-[#0B0B14] mb-2 group-hover:text-blue-950 transition-colors">
        {step.title}
      </h3>
      <p className="text-sm text-[#4B4B5C] leading-relaxed mb-4">{step.description}</p>

      {/* Bullet Highlights */}
      <div className="space-y-2 pt-3 border-t border-[rgba(15,15,30,0.06)]">
        {step.benefits.map((benefit, bIdx) => (
          <div key={bIdx} className="flex items-center gap-2 text-xs text-[#4B4B5C]">
            <CheckCircle2
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-colors",
                isActive ? "text-emerald-600" : "text-[#6B6B7B]"
              )}
            />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function StorySteps() {
  const t = useTranslations("story")
  const tCommon = useTranslations("common")
  const [activeStep, setActiveStep] = React.useState(0)
  const [activePackage, setActivePackage] = React.useState<"basic" | "standard" | "premium">(
    "standard"
  )

  const stepsContainerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stepsContainerRef,
    offset: ["start center", "end center"],
  })
  const progressSpring = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
  })

  const STEPS = [
    {
      id: "step-1",
      stepNumber: "01",
      badge: t("step1Badge"),
      title: t("step1Title"),
      description: t("step1Desc"),
      benefits: [t("step1B1"), t("step1B2"), t("step1B3")],
    },
    {
      id: "step-2",
      stepNumber: "02",
      badge: t("step2Badge"),
      title: t("step2Title"),
      description: t("step2Desc"),
      benefits: [t("step2B1"), t("step2B2"), t("step2B3")],
    },
    {
      id: "step-3",
      stepNumber: "03",
      badge: t("step3Badge"),
      title: t("step3Title"),
      description: t("step3Desc"),
      benefits: [t("step3B1"), t("step3B2"), t("step3B3")],
    },
  ]

  const mockupAnimationVariants = {
    initial: { opacity: 0, y: 14, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -14, filter: "blur(4px)" },
  }

  return (
    <section
      className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FFFFFF] relative overflow-hidden"
      id="how-it-works"
    >
      {/* Background ambient lighting: Blue + soft Teal blend */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-teal-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <motion.div
          className="max-w-2xl mb-10 sm:mb-16 md:mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <motion.div variants={fadeUpVariants}>
            <Badge variant="gradient" size="md" className="mb-4">
              {t("badge")}
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUpBlurVariants}
            className="text-[clamp(32px,4.5vw,56px)] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0B0B14] mb-4"
          >
            {t("titlePrefix")} <span className="text-accent-gradient">{t("titleHighlight")}</span>
          </motion.h2>
          <motion.p
            variants={fadeUpVariants}
            custom={0.1}
            className="text-base sm:text-lg text-[#4B4B5C] leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>

        {/* Two-column Layout: Left Steps with Vertical Reading Line, Right Sticky Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: Interactive Step Indicators with Reading Line */}
          <div className="lg:col-span-6 relative pl-4 sm:pl-7">
            {/* Vertical Reading Progress Line */}
            <div className="absolute left-0.5 sm:left-2 top-6 bottom-10 w-[2.5px] bg-slate-200/80 rounded-full overflow-hidden">
              <motion.div
                className="w-full h-full bg-gradient-to-b from-blue-600 via-sky-400 to-teal-400 origin-top"
                style={{ scaleY: progressSpring }}
              />
            </div>

            <motion.div
              ref={stepsContainerRef}
              className="space-y-4 sm:space-y-6"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
            >
              {STEPS.map((step, idx) => (
                <StepItem
                  key={step.id}
                  step={step}
                  index={idx}
                  isActive={activeStep === idx}
                  onActivate={setActiveStep}
                />
              ))}
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Sticky Mockup Visual */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-2xl border border-[rgba(15,15,30,0.12)] p-4 sm:p-7 md:p-8 shadow-[0_24px_60px_-15px_rgba(15,15,30,0.08),0_0_30px_-10px_rgba(37,99,235,0.12)] overflow-hidden min-h-[400px] sm:min-h-[470px] flex flex-col justify-between">
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header of Mockup Screen */}
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.08)] mb-6 z-10">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-[#6B6B7B]">
                    tascora.app/workflow/{STEPS[activeStep]?.id ?? ""}
                  </span>
                </div>
                <Badge variant="secondary" size="sm">
                  {STEPS[activeStep]?.badge ?? ""}
                </Badge>
              </div>

              {/* Dynamic Content Switching with Framer Motion AnimatePresence */}
              <div className="relative flex-1 z-10">
                <AnimatePresence mode="wait" initial={false}>
                  {/* STEP A: SEARCH & FILTER UI */}
                  {activeStep === 0 && (
                    <motion.div
                      key="mockup-step-1"
                      variants={mockupAnimationVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0B0B14]">
                          Filters Active (3)
                        </span>
                        <span className="text-xs text-blue-700 font-mono font-semibold">
                          142 Matches Found
                        </span>
                      </div>

                      {/* Mock Filter Chips */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl bg-[#FAFAFC] border border-blue-200">
                          <span className="text-[10px] text-[#6B6B7B] block">Budget</span>
                          <span className="text-xs font-semibold text-[#0B0B14]">
                            $250 - $1,000
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAFAFC] border border-blue-200">
                          <span className="text-[10px] text-[#6B6B7B] block">Turnaround</span>
                          <span className="text-xs font-semibold text-[#0B0B14]">&lt; 5 Days</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAFAFC] border border-blue-200">
                          <span className="text-[10px] text-[#6B6B7B] block">Min. Rating</span>
                          <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> 4.9+
                          </span>
                        </div>
                      </div>

                      {/* Sample Search Results List */}
                      <div className="space-y-2.5 pt-2">
                        <div className="p-3.5 rounded-xl bg-white border border-[rgba(15,15,30,0.08)] shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                              AM
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#0B0B14] flex items-center gap-1">
                                Full-Stack Next.js 15 & AI Engine
                                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              </p>
                              <p className="text-[11px] text-[#6B6B7B]">
                                Alexandre Moreau • Top Rated
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#0B0B14] font-mono">$350</span>
                            <span className="text-[10px] text-[#6B6B7B] block">4d delivery</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-[rgba(15,15,30,0.08)] shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                              HR
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#0B0B14] flex items-center gap-1">
                                Luxury Brand Identity System
                                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              </p>
                              <p className="text-[11px] text-[#6B6B7B]">Helena Rostova • Level 2</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#0B0B14] font-mono">$280</span>
                            <span className="text-[10px] text-[#6B6B7B] block">3d delivery</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP B: FREELANCER PROFILE PREVIEW */}
                  {activeStep === 1 && (
                    <motion.div
                      key="mockup-step-2"
                      variants={mockupAnimationVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="space-y-4"
                    >
                      {/* Specialist Header */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 p-[1.5px] shadow-sm">
                          <div className="h-full w-full rounded-xl bg-white flex items-center justify-center font-bold text-sm text-blue-700">
                            AM
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-[#0B0B14] flex items-center gap-1">
                              Alexandre Moreau
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                            </h4>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              $95/hr
                            </span>
                          </div>
                          <p className="text-xs text-[#4B4B5C]">
                            Senior Full-Stack Architect • Paris, FR
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6B6B7B]">
                            <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> 5.0 (128
                              reviews)
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">100% Job Success</span>
                          </div>
                        </div>
                      </div>

                      {/* Verified Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          "Next.js 15",
                          "TypeScript",
                          "LangChain",
                          "PostgreSQL",
                          "Docker",
                          "Tailwind",
                        ].map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] text-[11px] font-medium text-[#4B4B5C]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Client Testimonial Quote */}
                      <div className="p-3.5 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] text-xs text-[#4B4B5C] italic">
                        &quot;Alexandre built our entire enterprise Next.js and AI backend 2 days
                        ahead of deadline. Flawless communication.&quot;
                        <div className="text-[10px] text-[#6B6B7B] not-italic mt-1 font-medium">
                          — VP of Product, Series A FinTech
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP C: ORDER & ESCROW CHECKOUT SUMMARY */}
                  {activeStep === 2 && (
                    <motion.div
                      key="mockup-step-3"
                      variants={mockupAnimationVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="space-y-4"
                    >
                      {/* Package Tier Tabs */}
                      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)]">
                        {(["basic", "standard", "premium"] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setActivePackage(tier)}
                            className={cn(
                              "py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer",
                              activePackage === tier
                                ? "bg-white text-blue-700 shadow-sm border border-[rgba(15,15,30,0.06)]"
                                : "text-[#6B6B7B] hover:text-[#0B0B14]"
                            )}
                          >
                            {tier === "basic"
                              ? t("previewPackageBasic")
                              : tier === "standard"
                                ? t("previewPackageStandard")
                                : t("previewPackagePremium")}
                          </button>
                        ))}
                      </div>

                      {/* Active Package Breakdown */}
                      <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#0B0B14]">
                            {activePackage === "basic" && "Basic MVP Architecture"}
                            {activePackage === "standard" && "Full-Stack System + AI Agents"}
                            {activePackage === "premium" && "Enterprise Scale & 24/7 SLA"}
                          </span>
                          <span className="font-bold text-base text-blue-700 font-mono">
                            {activePackage === "basic" && "$150"}
                            {activePackage === "standard" && "$350"}
                            {activePackage === "premium" && "$850"}
                          </span>
                        </div>

                        {/* Milestone Timeline */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[#4B4B5C]">
                            <span className="flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Milestone 1:
                              Schema & Wireframes
                            </span>
                            <span className="text-emerald-700 font-mono font-semibold">
                              Released
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[#0B0B14] font-medium">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-600" /> Milestone 2: Core
                              Engine & API
                            </span>
                            <span className="text-blue-700 font-mono font-semibold">
                              In Progress
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[#6B6B7B]">
                            <span className="flex items-center gap-1.5">
                              <Lock className="h-3.5 w-3.5" /> Milestone 3: QA & Deployment
                            </span>
                            <span className="font-mono">Locked</span>
                          </div>
                        </div>
                      </div>

                      {/* Escrow Guarantee Pill */}
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">
                          Funds held in cryptographic escrow until final milestone approval.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Mockup Action */}
              <div className="pt-4 border-t border-[rgba(15,15,30,0.08)] mt-6 flex items-center justify-between z-10">
                <span className="text-xs text-[#6B6B7B]">
                  Step {activeStep + 1} / {STEPS.length}
                </span>
                <motion.div whileTap={buttonTapMotion.whileTap}>
                  <Button
                    size="sm"
                    variant="primary"
                    pill
                    onClick={() => setActiveStep((prev) => (prev + 1) % STEPS.length)}
                    className="text-xs"
                  >
                    <span>{tCommon("next")}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

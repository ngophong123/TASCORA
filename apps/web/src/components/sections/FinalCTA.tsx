"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, CheckCircle2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  landingCardVariants,
  VIEWPORT_ONCE,
  buttonTapMotion,
} from "@/lib/motion"

export function FinalCTA() {
  const t = useTranslations("finalCta")

  return (
    <section className="relative py-14 sm:py-20 md:py-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Signature Stripe Ambient Banner */}
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-[#0B1026] border border-white/12 px-6 py-12 sm:p-16 md:p-20 text-center shadow-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={landingCardVariants}
        >
          {/* Deliberate Signature Gradient Moment: Top angled radiant mesh bloom */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div
              className="absolute -top-36 sm:-top-44 left-1/2 -translate-x-1/2 w-[750px] sm:w-[950px] h-[360px] sm:h-[460px] rounded-full blur-[110px] sm:blur-[130px] opacity-45 pointer-events-none animate-ambient-mesh"
              style={{
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #7c3aed 32%, #ec4899 68%, #f97316 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative z-10">
            {/* Announcement Badge */}
            <motion.div
              variants={fadeUpVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 mb-8 shadow-xs backdrop-blur-sm"
            >
              <span className="text-xs font-semibold text-slate-200 tracking-wide">
                {t("badge")}
              </span>
            </motion.div>

            {/* Main Display Headline */}
            <motion.h2
              variants={fadeUpBlurVariants}
              className="stripe-section-heading text-white max-w-4xl mx-auto mb-5 sm:mb-6"
            >
              {t("titlePrefix")}{" "}
              <span className="stripe-gradient-text-light">{t("titleHighlight")}</span>
            </motion.h2>

            {/* Supporting Subhead */}
            <motion.p
              variants={fadeUpVariants}
              custom={0.1}
              className="stripe-subheading text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 font-normal"
            >
              {t("subtitle")}
            </motion.p>

            {/* Dual Action Buttons */}
            <motion.div
              variants={fadeUpVariants}
              custom={0.15}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-8 w-full max-w-md mx-auto sm:max-w-none"
            >
              <Link href="/explore" className="w-full sm:w-auto">
                <motion.div whileTap={buttonTapMotion.whileTap} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto px-9 font-semibold shadow-sm justify-center"
                  >
                    <span>{t("ctaHire")}</span>
                    <ArrowRight className="h-4 w-4 arrow-micro" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register?role=seller" className="w-full sm:w-auto">
                <motion.div whileTap={buttonTapMotion.whileTap} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-9 bg-transparent border-white/20 text-white hover:bg-white/10 transition-all font-semibold justify-center"
                  >
                    {t("ctaFreelancer")}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Reassurance Microcopy */}
            <motion.div
              variants={fadeUpVariants}
              custom={0.2}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>{t("guarantee")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#818CF8]" />
                <span>{t("zeroRisk")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>{t("noHiddenFees")}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

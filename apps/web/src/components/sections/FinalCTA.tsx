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
    <section className="relative py-14 sm:py-20 md:py-32 overflow-hidden bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Rich Multi-Stop Showstopper Gradient Banner (Blue -> Violet -> Pink) */}
        <motion.div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] via-[#7C3AED] to-[#DB2777] px-5 py-10 sm:p-14 md:p-20 text-center shadow-[0_24px_70px_-15px_rgba(124,58,237,0.38)] border border-white/20"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={landingCardVariants}
        >
          {/* Ambient Blobs inside Banner for Depth */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-400/30 blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-pink-400/25 blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10">
            {/* Announcement Badge */}
            <motion.div
              variants={fadeUpVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-md shadow-sm"
            >
              <span className="text-xs font-semibold text-white tracking-wide">
                {t("badge")}
              </span>
            </motion.div>

            {/* Main Display Headline */}
            <motion.h2
              variants={fadeUpBlurVariants}
              className="text-[clamp(26px,5.5vw,68px)] font-semibold tracking-[-0.03em] leading-[1.1] text-white max-w-4xl mx-auto mb-5 sm:mb-6"
            >
              {t("titlePrefix")} <span className="text-pink-100 drop-shadow-sm">{t("titleHighlight")}</span>
            </motion.h2>

            {/* Supporting Subhead */}
            <motion.p
              variants={fadeUpVariants}
              custom={0.1}
              className="text-sm sm:text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2"
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
                    pill
                    className="w-full sm:w-auto px-9 bg-white text-blue-950 font-bold hover:bg-blue-50 hover:shadow-xl transition-all shadow-lg justify-center"
                  >
                    <span>{t("ctaHire")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register?role=seller" className="w-full sm:w-auto">
                <motion.div whileTap={buttonTapMotion.whileTap} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    pill
                    className="w-full sm:w-auto px-9 bg-white/10 border border-white/25 text-white hover:bg-white/20 transition-all font-semibold justify-center"
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
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-blue-200/90 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>{t("guarantee")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-200" />
                <span>{t("zeroRisk")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-sky-300" />
                <span>{t("noHiddenFees")}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


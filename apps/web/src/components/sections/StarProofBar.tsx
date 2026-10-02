"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Star, ShieldCheck, CheckCircle2, Award } from "lucide-react"
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerChildCardVariants,
  VIEWPORT_ONCE,
  cardHoverMotion,
} from "@/lib/motion"

export function StarProofBar() {
  const t = useTranslations("starProof")

  return (
    <section className="py-16 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div
          className="rounded-2xl bg-white border border-[rgba(15,15,30,0.08)] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_20px_-8px_rgba(15,15,30,0.06)]"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUpVariants}
          whileHover={cardHoverMotion.whileHover}
        >
          {/* Left: Star Rating and Score */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <motion.div
              className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200"
              variants={staggerContainerVariants}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} variants={staggerChildCardVariants}>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                </motion.div>
              ))}
            </motion.div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-bold text-lg sm:text-xl text-[#0B0B14] font-mono">
                  {t("ratingScore")}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {t("verifiedReviews")}
                </span>
              </div>
              <p className="text-xs text-[#4B4B5C] mt-0.5">
                {t.rich("reviewsSubtext", {
                  count: t("reviewsCountBold"),
                  bold: (chunks) => <strong className="text-[#0B0B14]">{chunks}</strong>,
                })}
              </p>
            </div>
          </div>

          {/* Right: Key Platform Commitments */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#4B4B5C] font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{t("escrowProtection")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>{t("onTimeCompletion")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-sky-600" />
              <span>{t("preVettedSpecialists")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

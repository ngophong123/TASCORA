"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Marquee } from "@/components/ui/Marquee"
import { fadeUpVariants, VIEWPORT_ONCE } from "@/lib/motion"
import { FICTIONAL_ENTERPRISE_WORDMARKS } from "@/components/ui/BrandWordmarks"

export function TrustBar() {
  const t = useTranslations("trustBar")

  return (
    <section className="py-12 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-8 mb-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        variants={fadeUpVariants}
      >
        <p className="text-xs uppercase font-semibold tracking-[0.2em] text-[#6B6B7B]">
          {t("label")}
        </p>
      </motion.div>

      <Marquee speed={32} className="py-3 items-center">
        {FICTIONAL_ENTERPRISE_WORDMARKS.map((brand) => {
          const Wordmark = brand.Component
          return (
            <div
              key={brand.id}
              className="flex items-center justify-center px-6 sm:px-8 text-[#4B4B5C] transition-all duration-300 cursor-default group"
              title={brand.name}
            >
              <Wordmark className="h-6 sm:h-7 w-auto opacity-50 group-hover:opacity-100 group-hover:text-[#0A0A23] group-hover:scale-105 transition-all duration-300" />
            </div>
          )
        })}
      </Marquee>
    </section>
  )
}

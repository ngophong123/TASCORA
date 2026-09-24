"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Marquee } from "@/components/ui/Marquee"
import { fadeUpVariants, VIEWPORT_ONCE } from "@/lib/motion"

const BRAND_LOGOS = [
  { name: "NEXUS LABS", font: "font-mono font-bold tracking-widest" },
  { name: "STRATOS", font: "font-sans font-black tracking-tighter uppercase" },
  { name: "HYPERION", font: "font-mono font-semibold tracking-wider" },
  { name: "VERTEX AI", font: "font-sans font-bold tracking-tight uppercase" },
  { name: "CHRONO CLOUD", font: "font-mono font-medium tracking-wide" },
  { name: "AETHER DATA", font: "font-sans font-extrabold tracking-widest uppercase" },
  { name: "SYNAPSE", font: "font-mono font-bold tracking-tight" },
  { name: "MONOLITH", font: "font-sans font-black tracking-widest" },
]

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


      <Marquee speed={35} className="py-2">
        {BRAND_LOGOS.map((brand, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 text-lg sm:text-xl text-[#0B0B14] transition-all duration-300 cursor-default group"
          >
            <div className="h-2 w-2 rounded-full bg-[#0B0B14]/20 group-hover:bg-blue-600 group-hover:shadow-[0_0_8px_rgba(37,99,235,0.5)] transition-all" />
            <span className={`${brand.font} opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all text-[#0B0B14]`}>
              {brand.name}
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  )
}

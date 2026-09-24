"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import {
  Code2,
  Palette,
  Cpu,
  PenTool,
  Smartphone,
  Film,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { CATEGORIES_DATA } from "@/data/categories"
import { Badge } from "@/components/ui/badge"
import { getAccentTheme } from "@/lib/gradients"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  staggerContainerVariants,
  staggerChildCardVariants,
  VIEWPORT_ONCE,
} from "@/lib/motion"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Palette,
  Cpu,
  PenTool,
  Smartphone,
  Film,
  TrendingUp,
  BookOpen,
}

export function Categories() {
  const t = useTranslations("categories")

  return (
    <section className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FFFFFF] relative overflow-hidden" id="categories">
      {/* Ambient background glow: soft blue for brand foundation */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-300/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6">
          <div className="max-w-2xl">
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
              className="text-[clamp(32px,4.5vw,56px)] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0B0B14]"
            >
              {t("titlePrefix")} <span className="text-accent-gradient">{t("titleHighlight")}</span>
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              custom={0.12}
              className="text-base sm:text-lg text-[#4B4B5C] mt-3 leading-relaxed"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            custom={0.18}
            className="self-start md:self-end"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors group"
            >
              <span>{t("browseAll")}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* 8 Category Cards Grid with Rotating Accent Themes */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {CATEGORIES_DATA.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || Sparkles
            const theme = getAccentTheme(cat.accent)

            return (
              <motion.div
                key={cat.id}
                variants={staggerChildCardVariants}
                className="h-full"
              >
                <Link
                  href={`/explore?category=${cat.slug}`}
                  className={`group relative rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-5 sm:p-6 flex flex-col justify-between h-full transition-all duration-300 hover:bg-[#FAFAFC] hover:-translate-y-1.5 shadow-sm ${theme.hoverBorderClass} ${theme.hoverShadowClass}`}
                >
                  <div>
                    {/* Gradient Icon Tile + Price Pill */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:text-white group-hover:scale-110 group-hover:bg-gradient-to-tr shadow-sm ${theme.iconBoxClass} ${theme.iconHoverGradientClass}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>

                      <span className={`px-2.5 py-1 rounded-full bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] text-[11px] font-mono text-[#4B4B5C] group-hover:text-[#0B0B14] transition-colors ${theme.hoverBorderClass}`}>
                        {t("fromLabel")}{" "}
                        <strong className="font-bold" style={{ color: theme.dark }}>
                          ${cat.fromPrice}
                        </strong>
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#0B0B14] mb-2 group-hover:text-[#0B0B14] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#4B4B5C] leading-relaxed group-hover:text-[#1F1F2E] transition-colors">
                      {cat.description}
                    </p>
                  </div>

                  {/* Bottom Arrow Indicator */}
                  <div className={`mt-6 pt-4 border-t border-[rgba(15,15,30,0.06)] flex items-center justify-between text-xs text-[#6B6B7B] transition-colors ${theme.hoverTextClass}`}>
                    <span className="font-medium">{t("discoverSpecialists")}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

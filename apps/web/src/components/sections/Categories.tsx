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
import { cn } from "@/lib/utils"
import { getCategoryAccent } from "@/lib/categoryAccents"
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
    <section
      className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FFFFFF] relative overflow-hidden"
      id="categories"
    >
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
              className="stripe-section-heading text-[#0F172A]"
            >
              {t("titlePrefix")} <span className="stripe-gradient-text">{t("titleHighlight")}</span>
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
              custom={0.12}
              className="stripe-subheading mt-3 font-normal"
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#635BFF] hover:text-[#4F46E5] transition-colors group"
            >
              <span>{t("browseAll")}</span>
              <ArrowRight className="h-4 w-4 transition-transform arrow-micro" />
            </Link>
          </motion.div>
        </div>

        {/* 8 Category Cards Grid with Distinct Per-Category Accents */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {CATEGORIES_DATA.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || Sparkles
            const accent = getCategoryAccent(cat.name)

            return (
              <motion.div key={cat.id} variants={staggerChildCardVariants} className="h-full">
                <Link
                  href={`/explore?category=${cat.slug}`}
                  className={cn(
                    "stripe-card group relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between h-full transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs hover:shadow-[0_16px_36px_-8px_rgba(15,23,42,0.12)] hover:-translate-y-1.5 active:scale-[0.985] cursor-pointer",
                    accent.borderHoverClass
                  )}
                >
                  <div>
                    {/* Architectural Icon Tile + Price Pill */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        style={{ background: accent.iconBgGradient }}
                        className={cn(
                          "h-11 w-11 rounded-lg border flex items-center justify-center transition-all duration-300 ease-out shadow-xs group-hover:scale-[1.06]",
                          accent.borderSoftClass,
                          accent.textClass
                        )}
                      >
                        <IconComponent className="h-5 w-5 transition-transform duration-300 ease-out group-hover:rotate-3 group-hover:scale-105" />
                      </div>

                      <span className="px-2.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        {t("fromLabel")}{" "}
                        <strong className="font-bold text-slate-900 dark:text-white font-mono">
                          ${cat.fromPrice}
                        </strong>
                      </span>
                    </div>

                    <h3
                      className={cn(
                        "text-base font-semibold text-slate-900 dark:text-white mb-2 transition-colors duration-200",
                        `group-hover:${accent.textClass}`
                      )}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Bottom Arrow Indicator */}
                  <div
                    className={cn(
                      "mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200",
                      `group-hover:${accent.textClass}`
                    )}
                  >
                    <span className="font-medium">{t("discoverSpecialists")}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
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

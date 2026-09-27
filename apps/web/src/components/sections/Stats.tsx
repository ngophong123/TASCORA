"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { STATS_DATA } from "@/data/stats"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"
import { staggerContainerVariants, staggerChildCardVariants, EASE_OUT_EXPO } from "@/lib/motion"

const FLOAT_CLASSES = ["animate-float-1", "animate-float-2", "animate-float-3", "animate-float-2"]

export function Stats() {
  return (
    <section className="py-14 sm:py-20 md:py-28 border-b border-[rgba(15,15,30,0.08)] bg-[#FFFFFF] relative overflow-hidden">
      {/* Subtle ambient lighting: soft multi-hue blend (blue + violet) for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[360px] bg-gradient-to-r from-blue-500/15 via-indigo-500/12 to-purple-500/12 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {STATS_DATA.map((stat, idx) => (
            <motion.div
              key={stat.id}
              variants={staggerChildCardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.25, ease: EASE_OUT_EXPO },
              }}
              className="group cursor-default"
            >
              <div
                className={`${FLOAT_CLASSES[idx % FLOAT_CLASSES.length]} flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-2xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.06)] shadow-sm group-hover:border-blue-300 group-hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.18)] group-hover:bg-white transition-all duration-300 will-change-transform`}
              >
                {/* Large Metric in Geist Mono with Brand Blue Gradient Text */}
                <div className="text-3xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tight text-accent-gradient mb-1 sm:mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={2.2}
                  />
                </div>

                {/* Label */}
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#4B4B5C] group-hover:text-[#0B0B14] uppercase tracking-wider transition-colors">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

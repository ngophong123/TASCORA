"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { STATS_DATA } from "@/data/stats"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"
import { staggerContainerVariants, staggerChildCardVariants, EASE_OUT_EXPO } from "@/lib/motion"

const FLOAT_CLASSES = ["animate-float-1", "animate-float-2", "animate-float-3", "animate-float-2"]

export function Stats() {
  return (
    <section className="py-14 sm:py-20 md:py-28 border-b border-[#E2E8F0] bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {STATS_DATA.map((stat, idx) => (
            <motion.div
              key={stat.id}
              variants={staggerChildCardVariants}
              whileHover={{
                y: -4,
                transition: { duration: 0.2, ease: EASE_OUT_EXPO },
              }}
              className="group cursor-default"
            >
              <div
                className={`${FLOAT_CLASSES[idx % FLOAT_CLASSES.length]} flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs group-hover:border-[#CBD5E1] group-hover:shadow-[0_16px_36px_-8px_rgba(15,23,42,0.12)] group-hover:bg-white transition-all duration-300 will-change-transform`}
              >
                {/* Large Metric in Geist Mono with Stripe Gradient Text */}
                <div className="text-3xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tight stripe-gradient-text mb-1 sm:mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={2.2}
                  />
                </div>

                {/* Label */}
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#64748B] group-hover:text-[#0F172A] uppercase tracking-wider transition-colors">
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

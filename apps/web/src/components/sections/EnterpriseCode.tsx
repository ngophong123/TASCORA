"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import {
  Terminal,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  ArrowRight,
  Copy,
  Check,
  FileCode2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  fadeUpVariants,
  fadeUpBlurVariants,
  staggerContainerVariants,
  staggerChildCardVariants,
  landingCardVariants,
  VIEWPORT_ONCE,
  buttonTapMotion,
} from "@/lib/motion"

const CODE_SNIPPET = `// POST https://api.tascora.com/v1/projects
const response = await fetch("https://api.tascora.com/v1/projects", {
  method: "POST",
  headers: {
    "Authorization": "Bearer tsk_live_9a8f2c3e4...",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: "AI-Powered Knowledge Graph Architecture",
    category: "programming",
    escrowAmount: 4800,
    currency: "USD",
    milestones: [
      { name: "Schema & Vector DB", amount: 1600, dueDays: 5 },
      { name: "Agent Tool Integration", amount: 2000, dueDays: 8 },
      { name: "Production QA & SLA", amount: 1200, dueDays: 3 }
    ],
    ndaRequired: true,
    dedicatedEscrowVault: true
  })
});

const project = await response.json();
console.log("Vault locked:", project.escrowVaultId);`

export function EnterpriseCode() {
  const t = useTranslations("enterprise")
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(CODE_SNIPPET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      className="py-16 sm:py-24 md:py-36 border-b border-[rgba(15,15,30,0.08)] bg-[#FFFFFF] relative overflow-hidden"
      id="enterprise"
    >
      {/* Ambient background lighting */}
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-blue-300/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT COLUMN: Enterprise Story & Value Proposition */}
          <motion.div
            className="lg:col-span-5 space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <motion.div variants={fadeUpVariants}>
              <Badge variant="gradient" size="md">
                <Building2 className="h-3.5 w-3.5 mr-1" />
                {t("badge")}
              </Badge>
            </motion.div>

            <motion.h2
              variants={fadeUpBlurVariants}
              className="text-[clamp(32px,4.5vw,56px)] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0B0B14]"
            >
              {t("titlePrefix")} <span className="text-accent-gradient">{t("titleHighlight")}</span>
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              custom={0.1}
              className="text-base text-[#4B4B5C] leading-relaxed"
            >
              {t("subtitle")}
            </motion.p>

            {/* Feature Bullets */}
            <motion.div className="space-y-4 pt-2" variants={staggerContainerVariants}>
              {[
                {
                  icon: ShieldCheck,
                  title: t("f1Title"),
                  desc: t("f1Desc"),
                },
                {
                  icon: Zap,
                  title: t("f2Title"),
                  desc: t("f2Desc"),
                },
                {
                  icon: Users,
                  title: t("f3Title"),
                  desc: t("f3Desc"),
                },
                {
                  icon: Terminal,
                  title: t("f4Title"),
                  desc: t("f4Desc"),
                },
              ].map((bullet, idx) => {
                const IconComponent = bullet.icon
                return (
                  <motion.div
                    key={idx}
                    variants={staggerChildCardVariants}
                    className="flex items-start gap-3.5"
                  >
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 shadow-sm">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0B0B14]">{bullet.title}</h4>
                      <p className="text-xs text-[#4B4B5C] mt-0.5 leading-relaxed">{bullet.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            <motion.div
              variants={fadeUpVariants}
              custom={0.2}
              className="pt-4 flex items-center gap-4"
            >
              <Link href="/enterprise" className="w-full sm:w-auto">
                <motion.div
                  whileTap={buttonTapMotion.whileTap}
                  className="w-full sm:w-auto inline-block"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    pill
                    className="w-full sm:w-auto px-8 shadow-md justify-center"
                  >
                    <span>{t("ctaContact")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Styled Fake Code Editor Window (Stripe Style) */}
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={landingCardVariants}
          >
            <div className="rounded-2xl bg-[#0D0D12] border border-slate-800 shadow-[0_24px_70px_-15px_rgba(15,15,30,0.35),0_0_30px_-10px_rgba(37,99,235,0.2)] overflow-hidden">
              {/* macOS Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#14141C] border-b border-white/8">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80 hover:opacity-100 transition-opacity" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity" />
                  <div className="ml-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0D0D12] border border-white/6 text-xs text-[#A1A1AA] font-mono">
                    <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>create-project.ts</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-[#71717A] hidden sm:inline">
                    TypeScript
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title={copied ? t("copiedButton") : t("copyButton")}
                    aria-label={copied ? t("copiedButton") : t("copyButton")}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code Area with Syntax Colors */}
              <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-xs md:text-[13px] leading-relaxed overflow-x-auto text-[#D4D4D8] bg-[#0A0A0F]">
                <div className="text-[#71717A] select-none mb-2">
                  {"// 1. Initialize API request to lock dedicated escrow vault"}
                </div>
                <div>
                  <span className="text-sky-400">const</span> response ={" "}
                  <span className="text-sky-400">await</span>{" "}
                  <span className="text-blue-400">fetch</span>(
                  <span className="text-emerald-400">
                    &quot;https://api.tascora.com/v1/projects&quot;
                  </span>
                  , &#123;
                </div>
                <div className="pl-4">
                  <span className="text-[#A1A1AA]">method</span>:{" "}
                  <span className="text-emerald-400">&quot;POST&quot;</span>,
                </div>
                <div className="pl-4">
                  <span className="text-[#A1A1AA]">headers</span>: &#123;
                </div>
                <div className="pl-8">
                  <span className="text-emerald-400">&quot;Authorization&quot;</span>:{" "}
                  <span className="text-emerald-400">&quot;Bearer tsk_live_9a8f2c3e4...&quot;</span>
                  ,
                </div>
                <div className="pl-8">
                  <span className="text-emerald-400">&quot;Content-Type&quot;</span>:{" "}
                  <span className="text-emerald-400">&quot;application/json&quot;</span>
                </div>
                <div className="pl-4">&#125;,</div>
                <div className="pl-4">
                  <span className="text-[#A1A1AA]">body</span>: JSON.
                  <span className="text-sky-400">stringify</span>(&#123;
                </div>
                <div className="pl-8">
                  <span className="text-[#A1A1AA]">title</span>:{" "}
                  <span className="text-emerald-400">
                    &quot;AI Knowledge Graph Architecture&quot;
                  </span>
                  ,
                </div>
                <div className="pl-8">
                  <span className="text-[#A1A1AA]">escrowAmount</span>:{" "}
                  <span className="text-amber-400 font-bold">4800</span>,
                </div>
                <div className="pl-8">
                  <span className="text-[#A1A1AA]">milestones</span>: [
                </div>
                <div className="pl-12">
                  &#123; <span className="text-[#A1A1AA]">name</span>:{" "}
                  <span className="text-emerald-400">&quot;Schema & Vector DB&quot;</span>,{" "}
                  <span className="text-[#A1A1AA]">amount</span>:{" "}
                  <span className="text-amber-400">1600</span> &#125;,
                </div>
                <div className="pl-12">
                  &#123; <span className="text-[#A1A1AA]">name</span>:{" "}
                  <span className="text-emerald-400">&quot;Agent Tool Integration&quot;</span>,{" "}
                  <span className="text-[#A1A1AA]">amount</span>:{" "}
                  <span className="text-amber-400">2000</span> &#125;,
                </div>
                <div className="pl-12">
                  &#123; <span className="text-[#A1A1AA]">name</span>:{" "}
                  <span className="text-emerald-400">&quot;Production QA & SLA&quot;</span>,{" "}
                  <span className="text-[#A1A1AA]">amount</span>:{" "}
                  <span className="text-amber-400">1200</span> &#125;
                </div>
                <div className="pl-8">],</div>
                <div className="pl-8">
                  <span className="text-[#A1A1AA]">dedicatedEscrowVault</span>:{" "}
                  <span className="text-sky-400">true</span>
                </div>
                <div className="pl-4">&#125;)</div>
                <div>&#125;);</div>
                <div className="mt-3 text-[#71717A]">
                  {"// 2. Escrow contract generated & verified on network"}
                </div>
                <div>
                  <span className="text-sky-400">const</span> project ={" "}
                  <span className="text-sky-400">await</span> response.
                  <span className="text-blue-400">json</span>();
                </div>
                <div className="flex items-center gap-1">
                  console.<span className="text-blue-400">log</span>(
                  <span className="text-emerald-400">&quot;Vault locked:&quot;</span>,
                  project.escrowVaultId);
                  <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />
                </div>
              </div>

              {/* Console Output Footer Bar */}
              <div className="px-6 py-3 bg-[#101018] border-t border-white/6 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>HTTP 201 Created • 182ms</span>
                </div>
                <span className="text-sky-400">vault_0x9b48...c81e [READY]</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

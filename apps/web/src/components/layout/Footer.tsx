"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { MessageCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Footer() {
  const pathname = usePathname()
  const t = useTranslations("footer")

  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  // Suppress marketing footer on dashboard routes (including localized routes like /vi/dashboard)
  if (pathname?.includes("/dashboard")) {
    return null
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  return (
    <footer
      data-testid="footer"
      className="relative bg-[#FAFAFC] text-[#4B4B5C] border-t border-[rgba(15,15,30,0.08)] pt-14 sm:pt-20 pb-10 sm:pb-12 overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Top Newsletter & Brand Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-10 sm:pb-16 border-b border-[rgba(15,15,30,0.08)] gap-8">
          <div className="max-w-md">
            <Link href="/" className="group flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-[1px] shadow-sm">
                <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center">
                  <span className="font-bold text-sm bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">
                    T
                  </span>
                </div>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[#0B0B14] group-hover:text-blue-950 transition-colors">
                TASCOR
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent font-bold">
                  A
                </span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#4B4B5C] leading-relaxed">{t("brandDesc")}</p>
          </div>

          {/* Newsletter Input */}
          <div className="w-full lg:w-auto">
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative w-full sm:w-80">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletterPlaceholder")}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-white border border-[rgba(15,15,30,0.12)] text-xs sm:text-sm text-[#0B0B14] placeholder:text-[#6B6B7B] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                pill
                className="w-full sm:w-auto px-5 text-xs shrink-0"
              >
                {subscribed ? (
                  <span className="flex items-center gap-1.5 text-white">
                    <Check className="h-3.5 w-3.5" /> {t("newsletterSubscribed")}
                  </span>
                ) : (
                  <span>{t("newsletterButton")}</span>
                )}
              </Button>
            </form>
            <span className="text-[11px] text-[#6B6B7B] mt-2 block sm:text-left text-center">
              {t("newsletterSubtext")}
            </span>
          </div>
        </div>

        {/* 5 Link Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 py-10 sm:py-16 border-b border-[rgba(15,15,30,0.08)] text-xs">
          {/* Column 1: Marketplace */}
          <div>
            <h4 className="font-semibold text-[#0B0B14] uppercase tracking-wider mb-4 text-[11px]">
              {t("colMarketplace")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services?category=programming"
                  className="hover:text-[#0B0B14] transition-colors"
                >
                  {t("linkWebFullStack")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=design"
                  className="hover:text-[#0B0B14] transition-colors"
                >
                  {t("linkDesignSystems")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=ai"
                  className="hover:text-[#0B0B14] transition-colors"
                >
                  {t("linkAiAgents")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=marketing"
                  className="hover:text-[#0B0B14] transition-colors"
                >
                  {t("linkGrowthSeo")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=writing"
                  className="hover:text-[#0B0B14] transition-colors"
                >
                  {t("linkTechnicalCopywriting")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-blue-700 text-blue-700 font-medium transition-colors"
                >
                  {t("allDisciplines")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Clients */}
          <div>
            <h4 className="font-semibold text-[#0B0B14] uppercase tracking-wider mb-4 text-[11px]">
              {t("colClients")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkFindSpecialists")}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkMilestoneEscrow")}
                </Link>
              </li>
              <li>
                <Link href="/#enterprise" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkEnterpriseWorkspaces")}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkPlatformPricing")}
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkDedicatedSquads")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Freelancers */}
          <div>
            <h4 className="font-semibold text-[#0B0B14] uppercase tracking-wider mb-4 text-[11px]">
              {t("colFreelancers")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/register?role=seller"
                  className="hover:text-[#0B0B14] transition-colors"
                >
                  {t("linkApplySpecialist")}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkSellerHandbook")}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkPayoutGuarantee")}
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkDeveloperGuild")}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkReputationLevels")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="font-semibold text-[#0B0B14] uppercase tracking-wider mb-4 text-[11px]">
              {t("colCompany")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#about" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkAbout")}
                </Link>
              </li>
              <li>
                <Link href="#careers" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkCareers")}
                </Link>
              </li>
              <li>
                <Link href="#news" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkNews")}
                </Link>
              </li>
              <li>
                <Link href="#brand" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkBrand")}
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkContact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Resources & Legal */}
          <div>
            <h4 className="font-semibold text-[#0B0B14] uppercase tracking-wider mb-4 text-[11px]">
              {t("colResources")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#docs" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkDocs")}
                </Link>
              </li>
              <li>
                <Link href="#trust-and-safety" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkTrustSafety")}
                </Link>
              </li>
              <li>
                <Link href="#dispute-policy" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkDisputePolicy")}
                </Link>
              </li>
              <li>
                <Link href="#privacy" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkPrivacy")}
                </Link>
              </li>
              <li>
                <Link href="#terms" className="hover:text-[#0B0B14] transition-colors">
                  {t("linkTerms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Status, Socials & Region/Language Selector */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-[#6B6B7B]">
          {/* Operational Status & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {t("allSystemsOperational")}
            </span>
            <span>{t("copyright", { year: new Date().getFullYear() })}</span>
          </div>

          {/* Functional Language Switcher in Footer */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher align="right" />
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-[#6B6B7B]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0B0B14] transition-colors"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0B0B14] transition-colors"
              aria-label="Twitter"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0B0B14] transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0B0B14] transition-colors"
              aria-label="Discord"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Giant Faint "TASCORA" Wordmark at Bottom (Stripe Signature) */}
        <div className="mt-16 sm:mt-24 pointer-events-none select-none text-center overflow-hidden">
          <span className="font-bold text-[clamp(60px,18vw,230px)] tracking-tighter leading-none bg-gradient-to-b from-[#0B0B14]/[0.06] via-[#0B0B14]/[0.02] to-transparent bg-clip-text text-transparent block">
            TASCORA
          </span>
        </div>
      </div>
    </footer>
  )
}

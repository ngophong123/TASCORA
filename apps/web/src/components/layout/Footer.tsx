"use client"

import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Logo } from "@/components/ui/Logo"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Footer() {
  const pathname = usePathname()
  const t = useTranslations("footer")
  const nav = useTranslations("nav")
  if (pathname?.includes("/dashboard")) return null
  const groups = [
    {
      title: t("colMarketplace"),
      links: [
        { href: "/explore?category=programming", label: t("linkWebFullStack") },
        { href: "/explore?category=design", label: t("linkDesignSystems") },
        { href: "/explore?category=ai", label: t("linkAiAgents") },
        { href: "/explore?category=marketing", label: t("linkGrowthSeo") },
        { href: "/explore?category=writing", label: t("linkTechnicalCopywriting") },
      ],
    },
    {
      title: t("colClients"),
      links: [
        { href: "/explore", label: nav("exploreServices") },
        { href: "/#how-it-works", label: nav("howItWorks") },
        { href: "/dashboard/orders", label: nav("dashboard") },
        { href: "/register", label: nav("joinTascora") },
      ],
    },
    {
      title: t("colFreelancers"),
      links: [
        { href: "/register?role=seller", label: t("linkApplySpecialist") },
        { href: "/#for-freelancers", label: nav("forFreelancers") },
        { href: "/seller/dashboard", label: nav("dashboard") },
        { href: "/login", label: nav("signIn") },
      ],
    },
  ]
  return (
    <footer
      data-testid="footer"
      className="border-t border-border-default bg-bg-subtle py-12 sm:py-16"
    >
      <div className="premium-container">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr] lg:gap-20">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label="TASCORA Home">
              <Logo size="md" theme="monochrome" className="text-foreground" />
            </Link>
            <p className="mt-4 text-sm leading-7 text-text-secondary">{t("brandDesc")}</p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8"
          >
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 text-sm font-semibold text-foreground">{group.title}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-sm text-text-secondary hover:text-primary hover:underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-border-default pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <LanguageSwitcher align="right" />
        </div>
      </div>
    </footer>
  )
}

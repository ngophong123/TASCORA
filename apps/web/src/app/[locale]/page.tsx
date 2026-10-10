import { WorkingSteps, MarketplaceInvitation } from "@/components/sections/StaticMarketplace"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { Hero } from "@/components/sections/Hero"
import {
  FeaturedServices,
  MarketplaceCategories,
  MarketplaceTalent,
} from "@/components/sections/PremiumMarketplace"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Files excluded by the locale proxy can reach this dynamic segment. Keep
  // their 404 rendering static; do not read request headers for an invalid locale.
  if (!routing.locales.includes(locale as "en" | "vi")) {
    setRequestLocale(routing.defaultLocale)
    notFound()
  }
  setRequestLocale(locale)
  return (
    <>
      <Hero />
      <FeaturedServices />
      <MarketplaceCategories />
      <WorkingSteps locale={locale} />
      <MarketplaceTalent />
      <MarketplaceInvitation locale={locale} />
    </>
  )
}

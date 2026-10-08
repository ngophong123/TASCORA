import { Hero } from "@/components/sections/Hero"
import {
  FeaturedServices,
  MarketplaceCategories,
  WorkingSteps,
  MarketplaceTalent,
  MarketplaceInvitation,
} from "@/components/sections/PremiumMarketplace"

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <MarketplaceCategories />
      <WorkingSteps />
      <MarketplaceTalent />
      <MarketplaceInvitation />
    </>
  )
}

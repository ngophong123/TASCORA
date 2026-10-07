"use client"

import * as React from "react"
import { Hero } from "@/components/sections/Hero"
import { TrustBar } from "@/components/sections/TrustBar"
import { StorySteps } from "@/components/sections/StorySteps"
import { BentoGrid } from "@/components/sections/BentoGrid"
import { Categories } from "@/components/sections/Categories"
import { AudienceTabs } from "@/components/sections/AudienceTabs"
import { Stats } from "@/components/sections/Stats"
import { FeaturedFreelancers } from "@/components/sections/FeaturedFreelancers"
import { EnterpriseCode } from "@/components/sections/EnterpriseCode"
import { StarProofBar } from "@/components/sections/StarProofBar"
import { FinalCTA } from "@/components/sections/FinalCTA"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO (Stripe-Style Mesh Gradient + HTML/CSS Mockups) */}
      <Hero />
      <p className="max-w-7xl mx-auto px-4 py-3 text-xs text-slate-500">
        Product mockups, statistics and testimonials on this page are illustrative presentation
        content. Services and seller profiles load actual marketplace records. Settlement and
        payouts are unavailable.
      </p>

      {/* 2. TRUST BAR (Infinite Marquee) */}
      <TrustBar />

      {/* 3. STORYTELLING: "Find the right talent, fast" (Sticky Visual) */}
      <StorySteps />

      {/* 4. BENTO GRID: "Everything you need to ship great work" */}
      <BentoGrid />

      {/* 5. CATEGORIES SHOWCASE */}
      <Categories />

      {/* 6. FOR CLIENTS / FOR FREELANCERS (Interactive Tabbed Section) */}
      <AudienceTabs />

      {/* 7. STATS (Animated Counter in Geist Mono) */}
      <Stats />

      {/* 8. FEATURED FREELANCERS (3D Tilt Cards) */}
      <FeaturedFreelancers />

      {/* 9. ENTERPRISE CODE STRIP (Stripe-Inspired Code Editor) */}
      <EnterpriseCode />

      {/* 10. STAR RATING & SOCIAL PROOF STRIP */}
      <StarProofBar />

      {/* 11. FINAL CTA (Full-Width Animated Gradient) */}
      <FinalCTA />
    </div>
  )
}

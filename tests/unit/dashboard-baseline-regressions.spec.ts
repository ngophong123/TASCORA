import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { getCommandPaletteItems } from "../../apps/web/src/components/dashboard/ui/command-palette-items"

const WEB_APP_LOCALE_DIR = path.resolve(process.cwd(), "apps/web/src/app/[locale]")

function routePageFile(href: string): string {
  const relative = href.replace(/^\/+/, "")
  return path.join(WEB_APP_LOCALE_DIR, relative, "page.tsx")
}

describe("Phase 0 dashboard baseline regressions", () => {
  it("routes CommandPalette Create New Gig action to /dashboard/gigs/new and never /dashboard/gigs/create", () => {
    const freelancerItems = getCommandPaletteItems("FREELANCER")
    const createGig = freelancerItems.find((item) => item.id === "action-new-gig")
    expect(createGig).toBeDefined()
    expect(createGig?.href).toBe("/dashboard/gigs/new")
    expect(freelancerItems.some((item) => item.href === "/dashboard/gigs/create")).toBe(false)
  })

  it("ensures every CommandPalette navigation href maps to a real Next.js App Router page", () => {
    for (const role of ["CLIENT", "FREELANCER"] as const) {
      const items = getCommandPaletteItems(role)
      for (const item of items) {
        if (item.kind === "navigate") {
          expect(item.href).toBeTruthy()
          const targetPage = routePageFile(item.href!)
          expect(
            existsSync(targetPage),
            `Expected route "${item.href}" (${item.id}) to resolve to ${targetPage}`
          ).toBe(true)
        }
        expect(item.subtitle ?? "").not.toContain("48+")
      }
    }
  })

  it("uses locale-aware router in CommandPalette instead of raw next/navigation", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "apps/web/src/components/dashboard/ui/CommandPalette.tsx"),
      "utf8"
    )
    expect(source).toContain('from "@/i18n/routing"')
    expect(source).not.toContain('from "next/navigation"')
    expect(source).not.toContain("/dashboard/gigs/create")
  })

  it("removes orphaned WithdrawDialog fake payout simulator and keeps live earnings honest", () => {
    const withdrawDialogPath = path.resolve(
      process.cwd(),
      "apps/web/src/components/dashboard/payments/WithdrawDialog.tsx"
    )
    expect(existsSync(withdrawDialogPath)).toBe(false)

    const liveEarningsSource = readFileSync(
      path.resolve(process.cwd(), "apps/web/src/components/dashboard/payments/LiveEarnings.tsx"),
      "utf8"
    )
    expect(liveEarningsSource).not.toContain("WithdrawDialog")
    expect(liveEarningsSource).not.toContain("setTimeout")
    expect(liveEarningsSource).toContain("Provider payouts unavailable until validated")

    const overviewSource = readFileSync(
      path.resolve(process.cwd(), "apps/web/src/app/[locale]/dashboard/page.tsx"),
      "utf8"
    )
    expect(overviewSource).toContain("Time-series analytics, profile views, and conversion metrics")
  })
})

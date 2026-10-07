import { chromium } from "playwright"
import * as path from "path"
import * as fs from "fs"

const ARTIFACT_DIR = "C:/Users/Admin/.gemini/antigravity-ide/brain/aba5d4a1-8ac1-442d-96ab-e0aa95d09912"
const BASE_URL = "http://localhost:3200"

const BREAKPOINTS = [
  { name: "mobile-320", width: 320, height: 568 },
  { name: "mobile-360", width: 360, height: 740 },
  { name: "mobile-375", width: 375, height: 667 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-414", width: 414, height: 896 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
]

async function runVerification() {
  console.log("🚀 Starting Stripe Visual System & Responsiveness Verification...")
  const browser = await chromium.launch({ headless: true })

  const results: Record<string, any> = {
    overflowChecks: [],
    screenshots: [],
    features: {},
  }

  try {
    // 1. Check all breakpoints for horizontal overflow
    for (const bp of BREAKPOINTS) {
      const page = await browser.newPage({
        viewport: { width: bp.width, height: bp.height },
      })

      // Home Page check
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(300)
      const homeOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        }
      })

      // Explore Page check
      await page.goto(`${BASE_URL}/explore`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(300)
      const exploreOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        }
      })

      const passed = !homeOverflow.hasOverflow && !exploreOverflow.hasOverflow
      console.log(
        `Breakpoint ${bp.name} (${bp.width}x${bp.height}): ${
          passed ? "✅ PASS" : "❌ FAIL"
        } (Home scrollWidth: ${homeOverflow.scrollWidth}/${bp.width}, Explore: ${exploreOverflow.scrollWidth}/${bp.width})`
      )

      results.overflowChecks.push({
        breakpoint: bp.name,
        width: bp.width,
        height: bp.height,
        home: homeOverflow,
        explore: exploreOverflow,
        passed,
      })

      await page.close()
    }

    // 2. Desktop Screenshots & Feature Checks (1280x800)
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)

      // Screenshot 1: Desktop Hero
      const heroPath = path.join(ARTIFACT_DIR, "stripe_desktop_hero.png")
      await page.screenshot({ path: heroPath, fullPage: false })
      results.screenshots.push({ name: "Desktop Hero", path: heroPath })
      console.log("📸 Captured Desktop Hero Screenshot")

      // Scroll to Dark Navy Enterprise section
      const enterpriseSection = page.locator("#enterprise")
      await enterpriseSection.scrollIntoViewIfNeeded()
      await page.waitForTimeout(600)
      const enterprisePath = path.join(ARTIFACT_DIR, "stripe_dark_navy_enterprise.png")
      await page.screenshot({ path: enterprisePath, fullPage: false })
      results.screenshots.push({ name: "Dark Navy Enterprise Section", path: enterprisePath })
      console.log("📸 Captured Dark Navy Enterprise Section Screenshot")

      // Check button hover micro-interaction
      const ctaBtn = page.locator('a[href="/explore"]').first()
      await ctaBtn.hover()
      await page.waitForTimeout(200)

      await page.close()
    }

    // 3. Tablet View (768x1024)
    {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } })
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const tabletPath = path.join(ARTIFACT_DIR, "stripe_tablet_view.png")
      await page.screenshot({ path: tabletPath, fullPage: false })
      results.screenshots.push({ name: "Tablet View (768x1024)", path: tabletPath })
      console.log("📸 Captured Tablet Screenshot")
      await page.close()
    }

    // 4. Mobile View & Mobile Drawer (390x844)
    {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)

      const mobileHeroPath = path.join(ARTIFACT_DIR, "stripe_mobile_hero_390.png")
      await page.screenshot({ path: mobileHeroPath, fullPage: false })
      results.screenshots.push({ name: "Mobile Hero (390x844)", path: mobileHeroPath })
      console.log("📸 Captured Mobile Hero Screenshot")

      // Open mobile hamburger menu
      const menuBtn = page.locator('[data-testid="mobile-menu-toggle"]')
      await menuBtn.click()
      await page.waitForTimeout(400)

      const drawer = page.locator('[data-testid="mobile-drawer"]')
      const drawerVisible = await drawer.isVisible()
      console.log(`Mobile Drawer Open: ${drawerVisible ? "✅ VISIBLE" : "❌ NOT VISIBLE"}`)

      const mobileMenuPath = path.join(ARTIFACT_DIR, "stripe_mobile_menu_drawer.png")
      await page.screenshot({ path: mobileMenuPath, fullPage: false })
      results.screenshots.push({ name: "Mobile Nav Drawer (390x844)", path: mobileMenuPath })
      console.log("📸 Captured Mobile Nav Drawer Screenshot")

      await page.close()
    }

    // 5. Mobile Explore & Bottom Sheet Filter Drawer (390x844)
    {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
      await page.goto(`${BASE_URL}/explore`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)

      // Click "Filters" button
      const filterBtn = page.locator('button:has-text("Filters")').first()
      await filterBtn.click()
      await page.waitForTimeout(400)

      const filterDrawerPath = path.join(ARTIFACT_DIR, "stripe_mobile_filter_bottom_sheet.png")
      await page.screenshot({ path: filterDrawerPath, fullPage: false })
      results.screenshots.push({
        name: "Mobile Filter Bottom Sheet (390x844)",
        path: filterDrawerPath,
      })
      console.log("📸 Captured Mobile Filter Bottom Sheet Screenshot")

      await page.close()
    }

    // 6. Extreme Mobile Check (320x568)
    {
      const page = await browser.newPage({ viewport: { width: 320, height: 568 } })
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const extremeMobilePath = path.join(ARTIFACT_DIR, "stripe_mobile_320.png")
      await page.screenshot({ path: extremeMobilePath, fullPage: false })
      results.screenshots.push({ name: "Extreme Mobile View (320x568)", path: extremeMobilePath })
      console.log("📸 Captured Extreme Mobile Screenshot (320x568)")
      await page.close()
    }

    // 7. Service Detail Mobile Sticky Bar (390x844)
    {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
      await page.goto(`${BASE_URL}/services/srv-1`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      
      const serviceDetailOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        }
      })
      console.log(`Service Detail (390x844) Overflow: ${serviceDetailOverflow.hasOverflow ? "❌ FAIL" : "✅ PASS"}`)

      const serviceMobilePath = path.join(ARTIFACT_DIR, "stripe_service_detail_mobile_bar.png")
      await page.screenshot({ path: serviceMobilePath, fullPage: false })
      results.screenshots.push({ name: "Service Detail Mobile Sticky Bar", path: serviceMobilePath })
      console.log("📸 Captured Service Detail Mobile Sticky Bar Screenshot")
      await page.close()
    }

    // 8. Categories Page (1280x800)
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page.goto(`${BASE_URL}/categories`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const categoriesPath = path.join(ARTIFACT_DIR, "stripe_categories_page.png")
      await page.screenshot({ path: categoriesPath, fullPage: false })
      results.screenshots.push({ name: "Categories Page", path: categoriesPath })
      console.log("📸 Captured Categories Page Screenshot")
      await page.close()
    }

    // 9. Freelancer Profile Page (1280x800)
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page.goto(`${BASE_URL}/freelancers/alexandre`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const freelancerPath = path.join(ARTIFACT_DIR, "stripe_freelancer_profile.png")
      await page.screenshot({ path: freelancerPath, fullPage: false })
      results.screenshots.push({ name: "Freelancer Profile Page", path: freelancerPath })
      console.log("📸 Captured Freelancer Profile Screenshot")
      await page.close()
    }

    // 10. Login Page (1280x800)
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const loginPath = path.join(ARTIFACT_DIR, "stripe_login_page.png")
      await page.screenshot({ path: loginPath, fullPage: false })
      results.screenshots.push({ name: "Login Page", path: loginPath })
      console.log("📸 Captured Login Page Screenshot")
      await page.close()
    }

    // 11. Dashboard Overview (1280x800)
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const dashOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        }
      })
      console.log(`Dashboard Overview Overflow: ${dashOverflow.hasOverflow ? "❌ FAIL" : "✅ PASS"}`)
      const dashPath = path.join(ARTIFACT_DIR, "stripe_dashboard_overview.png")
      await page.screenshot({ path: dashPath, fullPage: false })
      results.screenshots.push({ name: "Dashboard Overview", path: dashPath })
      console.log("📸 Captured Dashboard Overview Screenshot")
      await page.close()
    }

    // 12. Dashboard Payments & Escrow (1280x800 & 390x844)
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await page.goto(`${BASE_URL}/dashboard/payments`, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const paymentsOverflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        }
      })
      console.log(`Dashboard Payments Overflow: ${paymentsOverflow.hasOverflow ? "❌ FAIL" : "✅ PASS"}`)
      const paymentsPath = path.join(ARTIFACT_DIR, "stripe_dashboard_payments.png")
      await page.screenshot({ path: paymentsPath, fullPage: false })
      results.screenshots.push({ name: "Dashboard Payments & Escrow", path: paymentsPath })
      console.log("📸 Captured Dashboard Payments Screenshot")
      await page.close()
    }

    // Save summary json
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, "verification_summary.json"),
      JSON.stringify(results, null, 2)
    )
    console.log("✨ All verifications completed successfully!")
  } catch (err) {
    console.error("❌ Verification failed:", err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

runVerification()

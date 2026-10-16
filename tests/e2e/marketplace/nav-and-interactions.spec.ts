import { test, expect } from "../support/live-fixtures"

test.describe("Navigation, Localization and Anchors", () => {
  test("Vietnamese MegaMenu displays localized column headings and working item links on /vi", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop MegaMenu test")

    await page.goto("/vi")
    await page.waitForLoadState("domcontentloaded")

    // 1. Check Explore Services MegaMenu
    const exploreBtn = page.getByRole("button", { name: /Khám phá dịch vụ/i })
    await expect(exploreBtn).toBeVisible()
    await exploreBtn.hover()

    const megaMenu = page.getByTestId("mega-menu-dropdown")
    await expect(megaMenu).toBeVisible()

    // Assert Vietnamese column titles and items
    await expect(megaMenu.getByText("Kỹ thuật & Đám mây")).toBeVisible()
    await expect(megaMenu.getByText("Phát triển Full-Stack")).toBeVisible()
    await expect(megaMenu.getByRole("link", { name: "Phát triển Full-Stack" })).toHaveAttribute(
      "href",
      /\/vi\/explore\?category=programming$/
    )

    await expect(megaMenu.getByText("Hệ thống AI & Dữ liệu")).toBeVisible()
    await expect(megaMenu.getByText("AI Agent tự hành")).toBeVisible()
    await expect(megaMenu.getByRole("link", { name: "AI Agent tự hành" })).toHaveAttribute(
      "href",
      /\/vi\/explore\?category=ai$/
    )

    await expect(megaMenu.getByText("Thiết kế & Sản phẩm")).toBeVisible()
    await expect(megaMenu.getByText("Hệ thống thiết kế & UI/UX")).toBeVisible()

    // 2. Check Categories MegaMenu
    const categoriesBtn = page.getByRole("button", { name: /Danh mục/i })
    await categoriesBtn.hover()

    await expect(megaMenu.getByText("Công nghệ & Kỹ thuật")).toBeVisible()
    await expect(megaMenu.getByText("Lập trình & Công nghệ")).toBeVisible()
    await expect(megaMenu.getByRole("link", { name: "Lập trình & Công nghệ" })).toHaveAttribute(
      "href",
      /\/vi\/explore\?category=programming$/
    )

    await expect(megaMenu.getByText("Sáng tạo & Nghệ thuật")).toBeVisible()
    await expect(megaMenu.getByText("Đồ họa & Thiết kế")).toBeVisible()

    await expect(megaMenu.getByText("Tăng trưởng & Chiến lược")).toBeVisible()
    await expect(megaMenu.getByText("Tiếp thị kỹ thuật số")).toBeVisible()
  })

  test("English MegaMenu displays standard English text on /en", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop MegaMenu test")

    await page.goto("/en")
    await page.waitForLoadState("domcontentloaded")

    const exploreBtn = page.getByRole("button", { name: /Explore Services/i })
    await expect(exploreBtn).toBeVisible()
    await exploreBtn.hover()

    const megaMenu = page.getByTestId("mega-menu-dropdown")
    await expect(megaMenu).toBeVisible()

    await expect(megaMenu.getByText("Engineering & Cloud")).toBeVisible()
    await expect(megaMenu.getByText("Full-Stack Development")).toBeVisible()
    await expect(megaMenu.getByText("AI & Data Systems")).toBeVisible()
    await expect(megaMenu.getByText("Autonomous AI Agents")).toBeVisible()
  })

  test("Navbar anchor links reach workflow, freelancer and enterprise sections with real CTAs", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop navigation test")

    await page.goto("/vi")
    await page.waitForLoadState("domcontentloaded")

    // Test 'Cách thức hoạt động'
    const howItWorksLink = page.getByTestId("nav-link-how-it-works")
    await expect(howItWorksLink).toBeVisible()
    await howItWorksLink.click({ force: true })

    await page.waitForTimeout(800)
    const howItWorksSection = page.locator("#how-it-works")
    await expect(howItWorksSection).toBeInViewport()
    await expect(howItWorksSection.getByRole("listitem")).toHaveCount(3)

    // Test 'Dành cho Freelancer'
    const forFreelancersLink = page.getByTestId("nav-link-for-freelancers")
    await expect(forFreelancersLink).toBeVisible()
    await forFreelancersLink.click({ force: true })

    await page.waitForTimeout(800)
    const audienceSection = page.locator("#for-freelancers")
    await expect(audienceSection).toBeInViewport()

    await expect(audienceSection.getByRole("heading", { level: 2 })).toBeVisible()
    await expect(audienceSection.getByRole("link")).toHaveAttribute(
      "href",
      /\/vi\/register\?role=seller$/
    )

    // Test 'Doanh nghiệp'
    const enterpriseLink = page.getByTestId("nav-link-enterprise")
    await expect(enterpriseLink).toBeVisible()
    await enterpriseLink.click({ force: true })

    await page.waitForTimeout(800)
    const enterpriseSection = page.locator("#enterprise")
    await expect(enterpriseSection).toBeInViewport()
    await expect(enterpriseSection.getByRole("link")).toHaveAttribute("href", /\/vi\/services$/)
  })

  test("Mobile drawer links close drawer and navigate to anchor sections", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile viewport only")

    await page.goto("/vi")
    await page.waitForLoadState("domcontentloaded")

    const menuToggle = page.getByTestId("mobile-menu-toggle")
    await expect(menuToggle).toBeVisible()
    await menuToggle.click()

    const mobileDrawer = page.getByTestId("mobile-drawer")
    await expect(mobileDrawer).toBeVisible()

    // Click 'Dành cho Freelancer' in mobile drawer
    const forFreelancersMobile = mobileDrawer.getByRole("link", { name: "Dành cho Freelancer" })
    await forFreelancersMobile.click()

    // Drawer should close
    await expect(mobileDrawer).not.toBeVisible()

    // Section and its actual seller onboarding CTA should be reached.
    await page.waitForTimeout(600)
    const audienceSection = page.locator("#for-freelancers")
    await expect(audienceSection).toBeInViewport()
    await expect(audienceSection.getByRole("link")).toBeVisible()
    await expect(audienceSection.getByRole("link")).toHaveAttribute(
      "href",
      /\/vi\/register\?role=seller$/
    )
  })
})

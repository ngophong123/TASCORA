import { test, expect } from "../support/live-fixtures"

test.describe("Dashboard Flows", () => {
  test("overview page loads key metrics and stat cards", async ({ page }) => {
    await page.goto("/dashboard")

    // Stat cards should render with values
    const statCards = page.locator('[data-testid^="stat-card-"]')
    await expect(statCards.first()).toBeVisible()
    const count = await statCards.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // Verify first stat card has a value
    const firstValue = statCards.first().locator('[data-testid="stat-card-value"]')
    await expect(firstValue).toBeVisible()
    await expect(firstValue).not.toBeEmpty()
  })

  test("orders page filters by status tabs and inspects order detail drawer", async ({
    page,
    isMobile,
    marketplace,
  }) => {
    await page.goto("/dashboard/orders")

    // Orders table or container should be visible
    const ordersContainer = isMobile
      ? page.locator('[data-testid^="order-card-"]:visible').first()
      : page.getByTestId("orders-table")
    await expect(ordersContainer).toBeVisible()

    // Status filter tabs should exist
    const tabAll = page.getByTestId("order-tab-all")
    const tabActive = page.getByTestId("order-tab-active")
    const tabCompleted = page.getByTestId("order-tab-completed")

    await expect(tabAll).toBeVisible()
    await expect(tabActive).toBeVisible()

    // Click Active tab
    await tabActive.click()
    await expect(tabActive).toHaveAttribute("aria-pressed", "true")
    await expect(tabAll).toHaveAttribute("aria-pressed", "false")
    const prefix = isMobile ? "order-card-" : "order-row-"
    await expect(page.locator(`[data-testid^="${prefix}"]:visible`)).toHaveCount(1)
    await expect(
      page.getByTestId(
        `${prefix}${marketplace.orders.find((order) => order.status === "IN_PROGRESS")!.id}`
      )
    ).toBeVisible()

    // Click Completed tab
    await tabCompleted.click()
    await expect(tabCompleted).toHaveAttribute("aria-pressed", "true")
    await expect(tabActive).toHaveAttribute("aria-pressed", "false")
    await expect(page.locator(`[data-testid^="${prefix}"]:visible`)).toHaveCount(1)
    await expect(
      page.getByTestId(
        `${prefix}${marketplace.orders.find((order) => order.status === "COMPLETED")!.id}`
      )
    ).toBeVisible()

    // Return to All tab
    await tabAll.click()
    await expect(tabAll).toHaveAttribute("aria-pressed", "true")
    await expect(page.locator(`[data-testid^="${prefix}"]:visible`)).toHaveCount(
      marketplace.orders.length
    )

    // Open detail drawer: click first order row or mobile card
    const orderItems = isMobile
      ? page.locator('[data-testid^="order-card-"]')
      : page.locator('[data-testid^="order-row-"]')

    await expect(orderItems.first()).toBeVisible()
    await orderItems.first().click()

    // Detail drawer should be visible
    const drawer = page.getByTestId("order-detail-drawer")
    await expect(drawer).toBeVisible()

    // Close drawer using close button
    const closeBtn = page.getByTestId("order-detail-drawer-close")
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()

    // Drawer should disappear
    await expect(drawer).not.toBeVisible()
  })

  test("messages page enables selecting conversation and sending message", async ({ page }) => {
    await page.goto("/dashboard/messages")

    // Conversation items should be listed
    const conversations = page.locator('[data-testid^="conversation-item-"]')
    await expect(conversations.first()).toBeVisible()
    await conversations.first().click()

    // Message input textarea should be available
    const messageInput = page.getByTestId("message-input")
    await expect(messageInput).toBeVisible()

    const sendBtn = page.getByTestId("send-message-btn")
    await expect(sendBtn).toBeVisible()

    // Type a unique test message
    const uniqueText = `Playwright E2E message ${Date.now()}`
    await messageInput.fill(uniqueText)

    // Send the message
    await sendBtn.click()

    // Input should be cleared
    await expect(messageInput).toHaveValue("")

    // The newly sent message should appear in chat bubbles
    const sentBubble = page
      .locator('[data-testid="chat-message-bubble"]')
      .filter({ hasText: uniqueText })
    await expect(sentBubble).toBeVisible()
  })

  test("gig wizard navigates step progression and validates form interaction", async ({
    page,
    marketplace,
  }) => {
    await page.goto("/login")
    await page.locator('input[placeholder="name@company.com"]').fill("seller@example.test")
    await page.locator('input[type="password"]').first().fill("E2E-password-123!")
    await page.locator('form button[type="submit"]').first().click()
    await expect(page).toHaveURL(/seller\/dashboard/)
    await page.goto("/dashboard/gigs/new")

    // A new service must start blank, then persist deliberate seller input.
    // Streamed hidden HTML may temporarily retain the same test ID. Target the
    // accessible control and still require exactly one active title input.
    const titleInput = page.getByRole("textbox", { name: "Service title", exact: true })
    await expect(titleInput).toHaveCount(1)
    await expect(titleInput).toBeVisible()
    await expect(titleInput).toBeEmpty()
    await titleInput.fill("A verified seller service draft")
    await page.getByRole("combobox", { name: "Category", exact: true }).selectOption({ index: 1 })

    const nextBtn = page.getByTestId("wizard-next-btn")
    const prevBtn = page.getByTestId("wizard-prev-btn")

    // On step 1, previous button is disabled
    await expect(prevBtn).toBeDisabled()

    // Advance to Step 2: Pricing
    await nextBtn.click()
    const step2Btn = page.getByTestId("wizard-step-2")
    await expect(step2Btn).toHaveAttribute("aria-current", "step")

    await page
      .getByRole("textbox", { name: "Basic package title", exact: true })
      .fill("Basic package")
    await page.getByRole("spinbutton", { name: "Basic price in USD", exact: true }).fill("25")
    // Advance to Step 3: Description
    await nextBtn.click()
    await page
      .getByRole("textbox", { name: "Detailed service description", exact: true })
      .fill("A complete and persistent service description for customers.")
    const step3Btn = page.getByTestId("wizard-step-3")
    await expect(step3Btn).toHaveAttribute("aria-current", "step")

    // Advance to Step 4: Gallery
    await nextBtn.click()
    const step4Btn = page.getByTestId("wizard-step-4")
    await expect(step4Btn).toHaveAttribute("aria-current", "step")

    // Advance to Step 5: Publish
    await nextBtn.click()
    await expect(page.getByTestId("wizard-step-5")).toHaveAttribute("aria-current", "step")
    const publishBtn = page.getByTestId("wizard-publish-btn")
    await expect(publishBtn).toBeVisible()

    // Test going backward to Step 4
    await prevBtn.click()
    await expect(step4Btn).toHaveAttribute("aria-current", "step")
    await expect(page.getByTestId("wizard-next-btn")).toBeVisible()

    // Advance back to Step 5
    await page.getByTestId("wizard-next-btn").click()
    await expect(publishBtn).toBeVisible()

    // Click publish button and wait for redirect to /dashboard/gigs
    const savedResponse = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/v1/services" &&
        response.request().method() === "POST"
    )
    await publishBtn.click()
    const saved = await savedResponse
    expect(saved.status()).toBe(201)
    const payload = await saved.json()
    expect(payload.success).toBe(true)
    await expect(page).toHaveURL(/\/dashboard\/gigs/, { timeout: 10000 })
    const draft = marketplace.services.find((service) => service.id === payload.data.id)
    expect(draft?.title).toBe("A verified seller service draft")
    expect(draft?.description).toBe("A complete and persistent service description for customers.")
    expect(draft?.status).toBe("DRAFT")
    expect(Number(draft?.packages.find((pack) => pack.type === "BASIC")?.price)).toBe(25)
  })
})

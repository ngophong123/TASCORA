import { test, expect } from "@playwright/test"

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

  test("orders page filters by status tabs and inspects order detail drawer", async ({ page, isMobile }) => {
    await page.goto("/dashboard/orders")

    // Orders table or container should be visible
    const ordersContainer = page.getByTestId("orders-table")
    await expect(ordersContainer).toBeVisible()

    // Status filter tabs should exist
    const tabAll = page.getByTestId("order-tab-all")
    const tabActive = page.getByTestId("order-tab-active")
    const tabCompleted = page.getByTestId("order-tab-completed")

    await expect(tabAll).toBeVisible()
    await expect(tabActive).toBeVisible()

    // Click Active tab
    await tabActive.click()
    await expect(tabActive).toHaveAttribute("aria-selected", "true")

    // Click Completed tab
    await tabCompleted.click()
    await expect(tabCompleted).toHaveAttribute("aria-selected", "true")

    // Return to All tab
    await tabAll.click()
    await expect(tabAll).toHaveAttribute("aria-selected", "true")

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
    const sentBubble = page.locator('[data-testid="chat-message-bubble"]').filter({ hasText: uniqueText })
    await expect(sentBubble).toBeVisible()
  })

  test("gig wizard navigates step progression and validates form interaction", async ({ page }) => {
    await page.goto("/dashboard/gigs/new")

    // Verify step 1 title input is populated
    const titleInput = page.getByTestId("wizard-gig-title-input")
    await expect(titleInput).toBeVisible()
    await expect(titleInput).not.toBeEmpty()

    const nextBtn = page.getByTestId("wizard-next-btn")
    const prevBtn = page.getByTestId("wizard-prev-btn")

    // On step 1, previous button is disabled
    await expect(prevBtn).toBeDisabled()

    // Advance to Step 2: Pricing
    await nextBtn.click()
    const step2Btn = page.getByTestId("wizard-step-2")
    await expect(step2Btn).toBeVisible()

    // Advance to Step 3: Description
    await nextBtn.click()
    const step3Btn = page.getByTestId("wizard-step-3")
    await expect(step3Btn).toBeVisible()

    // Advance to Step 4: Gallery
    await nextBtn.click()
    const step4Btn = page.getByTestId("wizard-step-4")
    await expect(step4Btn).toBeVisible()

    // Advance to Step 5: Publish
    await nextBtn.click()
    const publishBtn = page.getByTestId("wizard-publish-btn")
    await expect(publishBtn).toBeVisible()

    // Test going backward to Step 4
    await prevBtn.click()
    await expect(page.getByTestId("wizard-next-btn")).toBeVisible()

    // Advance back to Step 5
    await page.getByTestId("wizard-next-btn").click()
    await expect(publishBtn).toBeVisible()

    // Click publish button and wait for redirect to /dashboard/gigs
    await publishBtn.click()
    await expect(page).toHaveURL(/\/dashboard\/gigs/, { timeout: 10000 })
  })
})

import { expect, test } from "../support/live-fixtures"

test.describe("Identity, Password Recovery & Seller KYC E2E Flows", () => {
  test("EN login links to forgot-password and submits non-enumerating recovery request", async ({
    page,
  }) => {
    await page.goto("/en/login")
    const forgotLink = page.getByRole("link", { name: "Forgot password?" })
    await expect(forgotLink).toBeVisible()
    await forgotLink.click()

    await expect(page).toHaveURL(/\/(?:en\/)?forgot-password$/)
    await page.locator("#forgot-email").fill("seller@example.test")
    await page.locator('form button[type="submit"]').click()

    await expect(
      page.getByRole("status").filter({ hasText: "password reset link has been sent" })
    ).toBeVisible()
  })

  test("VI reset-password validates invalid token vs valid reset flow", async ({ page }) => {
    await page.goto(`/vi/reset-password?token=${"0".repeat(64)}`)
    await page.locator("#reset-password").fill("StrongPass99!")
    await page.locator("#reset-confirm-password").fill("StrongPass99!")
    await page.locator('form button[type="submit"]').click()

    await expect(
      page.getByRole("alert").filter({ hasText: "Liên kết đặt lại mật khẩu không hợp lệ" })
    ).toBeVisible()

    await page.goto(`/vi/reset-password?token=${"a".repeat(64)}`)
    await page.locator("#reset-password").fill("StrongPass99!")
    await page.locator("#reset-confirm-password").fill("StrongPass99!")
    await page.locator('form button[type="submit"]').click()

    await expect(
      page.getByRole("status").filter({ hasText: "Mật khẩu đã được cập nhật" })
    ).toBeVisible()
  })

  test("seller submits private KYC and admin reviews queue with quarantine, reason validation & audit log", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("e2e_role_initialized")) {
        sessionStorage.setItem("e2e_role_initialized", "1")
        localStorage.setItem(
          "user",
          JSON.stringify({ id: "seller", email: "seller@example.test", role: "SELLER" })
        )
        localStorage.setItem("token", "e2e-seller")
      }
    })

    await page.goto("/en/seller/dashboard")
    const kycSection = page.locator('section[aria-labelledby="seller-kyc-heading"]')
    await expect(
      kycSection.getByRole("heading", { name: "Identity Verification (Seller KYC)" })
    ).toBeVisible()
    await expect(kycSection.getByText("Payouts disabled")).toBeVisible()

    await kycSection.locator('input[name="legalName"]').fill("Alexandre Moreau")
    await kycSection.locator('input[name="dateOfBirth"]').fill("1992-05-14")
    await kycSection.locator('input[name="country"]').fill("VN")
    await kycSection.locator('input[name="documentNumber"]').fill("ID99886789")

    const fileInput = kycSection.locator('input[type="file"]').first()
    await fileInput.setInputFiles({
      name: "passport-front.png",
      mimeType: "image/png",
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    })
    await expect(kycSection.getByText("Stored privately").first()).toBeVisible()

    await kycSection.getByRole("button", { name: "Submit KYC verification" }).click()
    await expect(
      kycSection.getByRole("status").filter({ hasText: "KYC verification has been submitted" })
    ).toBeVisible()
    await expect(kycSection.getByText("••••6789")).toBeVisible()

    // Non-admin sees explicit permission-denied card on /en/dashboard/admin
    await page.goto("/en/dashboard/admin")
    await expect(
      page.getByRole("alert").filter({ hasText: "Administrator access required" })
    ).toBeVisible()

    // Switch session to ADMIN and verify quarantined fail-closed controls (no preview/download, approve disabled)
    await page.evaluate(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "admin", email: "admin@example.test", role: "ADMIN" })
      )
      localStorage.setItem("token", "e2e-admin")
    })
    await page.reload()

    const adminQueue = page.locator('section[aria-labelledby="admin-kyc-queue-heading"]')
    const auditLog = page.locator('section[aria-labelledby="admin-audit-log-heading"]')
    await expect(
      adminQueue.getByRole("heading", { name: "Identity KYC Compliance Queue" })
    ).toBeVisible()
    await expect(adminQueue.getByText("Alexandre Moreau")).toBeVisible()
    await expect(adminQueue.getByText("Review state: Pending Review")).toBeVisible()
    await expect(adminQueue.getByText("Security scan: Quarantined (Unscanned)")).toBeVisible()

    await adminQueue.getByRole("button", { name: "Inspect submission" }).click()
    await expect(adminQueue.getByText("Quarantine lock:")).toBeVisible()
    await expect(adminQueue.getByText("Locked in quarantine")).toBeVisible()
    await expect(adminQueue.getByRole("button", { name: "Inspect / Download file" })).toHaveCount(0)
    await expect(adminQueue.getByRole("button", { name: "Approve KYC" })).toBeDisabled()
    await expect(adminQueue.getByText("Final KYC approval is blocked until uploaded evidence achieves VERIFIED_SAFE")).toBeVisible()

    // Reject without reason must be rejected client-side
    await adminQueue.getByRole("button", { name: "Reject KYC" }).click()
    await expect(
      adminQueue.getByRole("alert").filter({ hasText: "at least 5 characters" })
    ).toBeVisible()

    // Request resubmission works and audits view + decision cleanly without document download
    await adminQueue.locator("textarea").fill("Please upload a clearer photo after scanner validation.")
    await adminQueue.getByRole("button", { name: "Request resubmission" }).click()
    await expect(
      adminQueue.getByRole("status").filter({ hasText: "KYC compliance decision recorded and audited." })
    ).toBeVisible()
    await expect(auditLog.getByRole("listitem").filter({ hasText: "KYC_RESUBMISSION_REQUESTED" }).first()).toBeVisible()
    await expect(auditLog.getByRole("listitem").filter({ hasText: "KYC_RECORD_VIEWED" }).first()).toBeVisible()
  })

  test("admin can inspect VERIFIED_SAFE KYC documents and approve submission in fixture", async ({
    page,
    marketplace,
  }) => {
    marketplace.setSellerKyc({
      id: "ckyc_e2e_verified",
      sellerProfileId: "c000000000000000000000201",
      status: "UNDER_REVIEW",
      documentType: "PASSPORT",
      legalName: "Verified Clean Seller",
      documentNumber: "P11223344",
      dateOfBirth: "1990-01-15",
      country: "VN",
      documentFrontUrl: "upload:seller/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png",
      documentBackUrl: null,
      selfieUrl: null,
      scanStatus: "VERIFIED_SAFE",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      resubmissionRequestedAt: null,
      decisionReason: null,
      comments: null,
      version: 2,
      reviewHistory: [],
    })

    await page.addInitScript(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "admin", email: "admin@example.test", role: "ADMIN" })
      )
      localStorage.setItem("token", "e2e-admin")
    })

    await page.goto("/en/dashboard/admin")
    const adminQueue = page.locator('section[aria-labelledby="admin-kyc-queue-heading"]')
    const auditLog = page.locator('section[aria-labelledby="admin-audit-log-heading"]')
    await expect(adminQueue.getByText("Verified Clean Seller")).toBeVisible()

    await adminQueue.getByRole("button", { name: "Inspect submission" }).click()
    await expect(adminQueue.getByText("Verified safe (VERIFIED_SAFE):")).toBeVisible()
    await adminQueue.getByRole("button", { name: "Inspect / Download file" }).first().click()
    await expect(adminQueue.getByRole("link", { name: "Download file" })).toBeVisible()

    const approveBtn = adminQueue.getByRole("button", { name: "Approve KYC" })
    await expect(approveBtn).toBeEnabled()
    await approveBtn.click()
    await expect(
      adminQueue.getByRole("status").filter({ hasText: "KYC compliance decision recorded and audited." })
    ).toBeVisible()
    await expect(auditLog.getByRole("listitem").filter({ hasText: "KYC_APPROVED" }).first()).toBeVisible()
    await expect(auditLog.getByRole("listitem").filter({ hasText: "KYC_DOCUMENT_VIEWED" }).first()).toBeVisible()
    await expect(auditLog.getByRole("listitem").filter({ hasText: "KYC_RECORD_VIEWED" }).first()).toBeVisible()
  })
})

"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/routing"
import { getApiUrl } from "@/lib/api-url"
import { AuthPanel, authInput, authLabel } from "@/components/auth/AuthPanel"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

function VerificationForm() {
  const t = useTranslations("auth")
  const params = useSearchParams()
  const [message, setMessage] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const [email, setEmail] = React.useState("")
  async function verify() {
    setBusy(true)
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.get("token") || "" }),
      })
      if (!response.ok) throw new Error(t("verifyInvalid"))
      setVerified(true)
      setMessage(t("verifySuccess"))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("verifyFailed"))
    } finally {
      setBusy(false)
    }
  }
  async function resend(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error(t("verifyResendFailed"))
      setMessage(t("verifyResent"))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("verifyResendFailed"))
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthPanel title={t("verifyTitle")} description={t("verifyDescription")}>
      {params.get("token") && !verified && (
        <Button
          type="button"
          onClick={() => void verify()}
          disabled={busy}
          isLoading={busy}
          loadingText={t("verifyLoading")}
          className="mb-5 w-full"
          size="lg"
        >
          {t("verifyAction")}
        </Button>
      )}
      <p
        role="status"
        aria-live="polite"
        className={`text-sm leading-6 ${message ? "mb-5 rounded-lg border border-border-default bg-bg-subtle p-4" : ""}`}
      >
        {message}
      </p>
      {!verified && (
        <form method="post" onSubmit={resend} className="space-y-5" aria-busy={busy}>
          <div>
            <label htmlFor="verification-email" className={authLabel}>
              {t("verifyEmailLabel")}
            </label>
            <input
              id="verification-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={busy}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInput}
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            isLoading={busy}
            loadingText={t("verifyLoading")}
            variant={params.get("token") ? "outline" : "primary"}
            className="w-full"
            size="lg"
          >
            {t("verifyResendAction")}
          </Button>
        </form>
      )}
      <div className="mt-6 border-t border-border-default pt-4">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          {t("signIn")}
        </Link>
      </div>
    </AuthPanel>
  )
}
export default function VerifyEmailPage() {
  const t = useTranslations("auth")
  return (
    <React.Suspense
      fallback={
        <p role="status" className="px-4 py-12 text-center text-text-muted">
          {t("verifyPageLoading")}
        </p>
      }
    >
      <VerificationForm />
    </React.Suspense>
  )
}

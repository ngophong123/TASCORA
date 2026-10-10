"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/routing"
import { getApiUrl } from "@/lib/api-url"
import { AuthPanel, authInput, authLabel } from "@/components/auth/AuthPanel"
import { Button } from "@/components/ui/button"

function VerificationForm() {
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
      if (!response.ok) throw new Error("This verification link is invalid or expired.")
      setVerified(true)
      setMessage("Email verified. You can now sign in.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Verification failed.")
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
      if (!response.ok) throw new Error("Unable to send verification. Please retry later.")
      setMessage("If your account needs verification, an email will be sent.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please retry later.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthPanel
      title="Verify your email"
      description="Confirm your email address before signing in."
    >
      {params.get("token") && !verified && (
        <Button
          type="button"
          onClick={() => void verify()}
          disabled={busy}
          isLoading={busy}
          loadingText="Please wait…"
          className="mb-5 w-full"
          size="lg"
        >
          Verify email
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
              Email address
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
            loadingText="Please wait…"
            variant={params.get("token") ? "outline" : "primary"}
            className="w-full"
            size="lg"
          >
            Resend verification email
          </Button>
        </form>
      )}
      <div className="mt-6 border-t border-border-default pt-4">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </AuthPanel>
  )
}
export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <p role="status" className="px-4 py-12 text-center text-text-muted">
          Loading…
        </p>
      }
    >
      <VerificationForm />
    </React.Suspense>
  )
}

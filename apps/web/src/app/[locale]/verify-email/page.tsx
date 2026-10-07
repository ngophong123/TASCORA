"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/routing"
import { getApiUrl } from "@/lib/api-url"

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
    <main className="mx-auto w-full max-w-lg p-8 space-y-5">
      <h1 className="text-2xl font-bold">Verify your email</h1>
      <p>Confirm your email address before signing in.</p>
      {params.get("token") && !verified && (
        <button
          onClick={() => void verify()}
          disabled={busy}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2"
        >
          Verify email
        </button>
      )}
      <p role="status">{message}</p>
      {!verified && (
        <form onSubmit={resend} className="space-y-3">
          <label className="block">
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full rounded border p-2"
            />
          </label>
          <button disabled={busy} className="rounded border px-4 py-2">
            Resend verification email
          </button>
        </form>
      )}
      <Link href="/login" className="text-indigo-600 underline">
        Sign in
      </Link>
    </main>
  )
}
export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<p>Loading?</p>}>
      <VerificationForm />
    </React.Suspense>
  )
}

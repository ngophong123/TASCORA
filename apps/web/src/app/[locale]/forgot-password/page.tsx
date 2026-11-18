"use client"

import * as React from "react"
import { CheckCircle2, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { AuthPanel, authInput, authLabel } from "@/components/auth/AuthPanel"
import { getApiUrl } from "@/lib/api-url"

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("forgotInvalidEmail"))
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })

      if (res.status === 429) {
        setError(t("forgotRateLimited"))
        return
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error?.message || t("forgotFailed"))
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("forgotFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPanel title={t("forgotTitle")} description={t("forgotDescription")}>
      {submitted ? (
        <div role="status" className="space-y-6">
          <div className="rounded-lg border border-success-subtle bg-success-subtle p-4 text-sm leading-6 text-success">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{t("forgotSuccess")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setError(null)
              }}
              className="min-h-11 rounded-lg px-4"
            >
              {t("forgotSendAnother")}
            </Button>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
            >
              {t("backToSignIn")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-error bg-error-subtle p-4 text-sm text-error"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="forgot-email" className={authLabel}>
              {t("workEmail")}
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              />
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className={`${authInput} pl-11`}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg text-base font-medium"
          >
            {loading ? t("forgotSending") : t("forgotSubmit")}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
            >
              {t("backToSignIn")}
            </Link>
          </p>
        </form>
      )}
    </AuthPanel>
  )
}

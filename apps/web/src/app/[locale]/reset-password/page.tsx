"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { AuthPanel, authInput, authLabel, authToggle } from "@/components/auth/AuthPanel"
import { getApiUrl } from "@/lib/api-url"

const RESET_TOKEN_REGEX = /^[0-9a-f]{64}$/i
const RESET_POLICY_REGEX = /(?=.*[A-Za-z])(?=.*[^A-Za-z\s])/

function ResetPasswordForm() {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const rawToken = (searchParams.get("token") || "").trim()
  const hasValidTokenShape = RESET_TOKEN_REGEX.test(rawToken)

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [tokenRejected, setTokenRejected] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTokenRejected(false)

    if (!hasValidTokenShape) {
      setTokenRejected(true)
      setError(t("resetInvalidToken"))
      return
    }

    if (password.length < 8) {
      setError(t("passMinLength"))
      return
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError(t("passMaxBytes"))
      return
    }

    if (!RESET_POLICY_REGEX.test(password)) {
      setError(t("passComplexity"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("passNotMatch"))
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken.toLowerCase(), password }),
      })

      const payload = await res.json().catch(() => null)
      if (res.status === 429) {
        setError(t("forgotRateLimited"))
        return
      }
      if (!res.ok || !payload?.success) {
        if (res.status === 400) {
          setTokenRejected(true)
          setError(t("resetInvalidToken"))
          return
        }
        throw new Error(payload?.error?.message || t("resetFailed"))
      }

      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("resetFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPanel title={t("resetTitle")} description={t("resetDescription")}>
      {success ? (
        <div role="status" className="space-y-6">
          <div className="rounded-lg border border-success-subtle bg-success-subtle p-4 text-sm leading-6 text-success">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{t("resetSuccess")}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-base font-medium text-primary-foreground hover:opacity-95"
          >
            {t("signIn")}
          </Link>
        </div>
      ) : !hasValidTokenShape || tokenRejected ? (
        <div className="space-y-6">
          <div
            role="alert"
            className="rounded-lg border border-error bg-error-subtle p-4 text-sm leading-6 text-error"
          >
            {error || t("resetInvalidToken")}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/forgot-password"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-95"
            >
              {t("requestNewResetLink")}
            </Link>
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
            <label htmlFor="reset-password" className={authLabel}>
              {t("resetNewPassword")}
            </label>
            <div className="relative">
              <KeyRound
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              />
              <input
                id="reset-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                aria-describedby="reset-password-hint"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${authInput} pl-11 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={authToggle}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Eye aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            </div>
            <p id="reset-password-hint" className="mt-2 text-xs text-text-secondary">
              {t("resetPasswordPolicyHint")}
            </p>
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className={authLabel}>
              {t("confirmPassword")}
            </label>
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={authInput}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg text-base font-medium"
          >
            {loading ? t("resetSubmitting") : t("resetSubmit")}
          </Button>
        </form>
      )}
    </AuthPanel>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth")
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-text-secondary">{t("verifyPageLoading")}</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

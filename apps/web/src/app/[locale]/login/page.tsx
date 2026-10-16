"use client"

import { getApiUrl } from "@/lib/api-url"
import * as React from "react"
import { Link } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthPanel, authInput, authLabel, authToggle } from "@/components/auth/AuthPanel"
import { useTranslations } from "next-intl"

function LoginForm() {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const requestedRedirect = searchParams.get("redirect") || "/dashboard"
  const redirect =
    /^\/(?![\/\\])/.test(requestedRedirect) && !/[\\\x00-\x1f]/.test(requestedRedirect)
      ? requestedRedirect
      : "/dashboard"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid email or password.")
      }

      // Save token and user in localStorage
      localStorage.setItem("token", data.data.accessToken)
      localStorage.setItem("user", JSON.stringify(data.data.user))

      // Redirect
      window.location.href =
        redirect === "/dashboard" && data.data.user.role === "SELLER"
          ? "/seller/dashboard"
          : redirect
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPanel title={t("welcomeBack")} description={t("loginSubtext")}>
      {error && (
        <p
          id="auth-error"
          role="alert"
          className="mb-5 rounded-lg border border-status-danger/30 bg-status-danger/5 p-4 text-sm text-status-danger"
        >
          {error}
        </p>
      )}
      <form method="post" onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
        <div>
          <label htmlFor="login-email" className={authLabel}>
            {t("workEmail")}
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className={authInput}
            aria-describedby={error ? "auth-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="login-password" className={authLabel}>
            {t("password")}
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`${authInput} pr-12`}
              aria-describedby={error ? "auth-error" : undefined}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              className={authToggle}
              aria-label="Toggle password visibility"
              aria-pressed={showPassword}
              aria-controls="login-password"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Eye aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          isLoading={loading}
          loadingText={t("signingIn")}
          className="w-full"
          size="lg"
        >
          {t("signInButton")}
        </Button>
      </form>
      <Link
        href="/verify-email"
        className="mt-3 inline-flex min-h-11 items-center text-sm text-primary hover:underline underline-offset-4"
      >
        Verify your email
      </Link>
      <div className="mt-6 border-t border-border-default pt-5 text-sm text-text-secondary">
        <span>{t("noAccount")} </span>
        <Link
          href="/register"
          className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
        >
          {t("createAccount")}
        </Link>
      </div>
    </AuthPanel>
  )
}
export default function LoginPage() {
  const t = useTranslations("auth")
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto p-12 text-center text-text-muted">{t("authLoading")}</div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}

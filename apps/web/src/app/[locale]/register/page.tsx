"use client"

import { getApiUrl } from "@/lib/api-url"
import * as React from "react"
import { Link } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, User, Briefcase, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthPanel, authInput, authLabel, authToggle } from "@/components/auth/AuthPanel"
import { useTranslations } from "next-intl"

function RegisterForm() {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") === "seller" ? "seller" : "buyer"

  const [role, setRole] = React.useState<"buyer" | "seller">(initialRole)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t("passMinLength"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("passNotMatch"))
      return
    }

    setLoading(true)

    try {
      const apiUrl = getApiUrl()

      // 1. Call Register API
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Registration failed. Please try a different email.")
      }

      // Registration remains pending until the email link is verified.
      setSuccess(true)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred during registration."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPanel title={t("joinTitle")} description={t("joinSubtext")}>
      <div
        role="group"
        aria-label="Account type"
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {(["buyer", "seller"] as const).map((option) => (
          <button
            key={option}
            type="button"
            disabled={loading || success}
            aria-pressed={role === option}
            onClick={() => setRole(option)}
            className={`flex min-h-20 items-start gap-3 rounded-lg border p-4 text-left ${role === option ? "border-primary bg-primary-subtle" : "border-border-default hover:bg-bg-subtle"}`}
          >
            {option === "buyer" ? (
              <User aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            ) : (
              <Briefcase aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            )}
            <span>
              <span className="block text-sm font-semibold text-foreground">
                {option === "buyer" ? t("wantToHire") : t("wantToWork")}
              </span>
              <span className="mt-1 block text-xs leading-5 text-text-secondary">
                {option === "buyer" ? t("hireSub") : t("workSub")}
              </span>
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p
          id="auth-error"
          role="alert"
          className="mb-5 rounded-lg border border-status-danger/30 bg-status-danger/5 p-4 text-sm text-status-danger"
        >
          {error}
        </p>
      )}
      {success && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-lg border border-status-success/30 bg-status-success/5 p-4 text-sm text-status-success"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            Check your email to verify your account before signing in.{" "}
            <Link href="/verify-email" className="inline-flex min-h-11 items-center underline">
              Resend verification
            </Link>
          </span>
        </div>
      )}
      <form method="post" onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
        <div>
          <label htmlFor="register-email" className={authLabel}>
            {t("workEmail")}
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={loading || success}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className={authInput}
            aria-describedby={error ? "auth-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="register-password" className={authLabel}>
            {t("password")}
          </label>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={loading || success}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars"
              className={`${authInput} pr-12`}
              aria-describedby={error ? "auth-error" : undefined}
            />
            <button
              type="button"
              disabled={loading || success}
              onClick={() => setShowPassword(!showPassword)}
              className={authToggle}
              aria-label="Toggle password visibility"
              aria-pressed={showPassword}
              aria-controls="register-password register-confirm-password"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Eye aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="register-confirm-password" className={authLabel}>
            {t("confirmPassword")}
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            disabled={loading || success}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            className={authInput}
            aria-describedby={error ? "auth-error" : undefined}
          />
        </div>
        <p className="text-xs leading-6 text-text-muted">{t("termsAgree")}</p>
        <Button
          type="submit"
          disabled={loading || success}
          isLoading={loading}
          loadingText={t("creatingAccount")}
          isSuccess={success}
          successText={t("regSuccess")}
          className="w-full"
          size="lg"
        >
          {role === "seller" ? t("createSellerAccount") : t("createClientAccount")}
        </Button>
      </form>
      <div className="mt-6 border-t border-border-default pt-5 text-sm text-text-secondary">
        <span>{t("haveAccount")} </span>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
        >
          {t("signIn")}
        </Link>
      </div>
    </AuthPanel>
  )
}
export default function RegisterPage() {
  const t = useTranslations("auth")
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto p-12 text-center text-text-muted">{t("regLoading")}</div>
      }
    >
      <RegisterForm />
    </React.Suspense>
  )
}

"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

function LoginForm() {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      window.location.href = redirect
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-surface p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Ambient glow in background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="font-display text-3xl font-bold tracking-tight text-text-primary">
              TASCORA<span className="text-blue-600">.</span>
            </span>
          </Link>
          <h2 className="font-display text-2xl font-medium text-text-primary tracking-tight">
            {t("welcomeBack")}
          </h2>
          <p className="mt-2 text-xs text-text-secondary">{t("loginSubtext")}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2 animate-micro-shake">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              {t("workEmail")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none input-premium focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t("password")}
              </label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                {t("forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-border bg-white pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none input-premium focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            loadingText={t("signingIn")}
            isError={!!error}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-semibold shadow-lg shadow-blue-600/20"
          >
            {t("signInButton")}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-border/50 text-xs text-text-muted">
          <span>{t("noAccount")} </span>
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline transition-colors"
          >
            {t("createAccount")}
          </Link>
        </div>
      </div>
    </div>
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

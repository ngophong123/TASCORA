"use client"

import { getApiUrl } from "@/lib/api-url"
import * as React from "react"
import { Link } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/Logo"
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-md space-y-8 stripe-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Ambient mesh glow in background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center relative">
          <Link href="/" className="inline-block mb-4" aria-label="TASCORA Home">
            <Logo size="lg" className="justify-center" />
          </Link>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("welcomeBack")}
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{t("loginSubtext")}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2 animate-micro-shake">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 relative">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t("workEmail")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("password")}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary font-semibold hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
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
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 text-white py-3 font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            {t("signInButton")}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>{t("noAccount")} </span>
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline transition-colors"
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

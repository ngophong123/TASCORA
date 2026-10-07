"use client"

import { getApiUrl } from "@/lib/api-url"
import * as React from "react"
import { Link } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, Briefcase, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/Logo"
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-xl space-y-8 stripe-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Ambient glow in background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative">
          <Link href="/" className="inline-block mb-3" aria-label="TASCORA Home">
            <Logo size="lg" className="justify-center" />
          </Link>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("joinTitle")}
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{t("joinSubtext")}</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`p-3.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
              role === "buyer"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
            <div>
              <span className="text-xs font-bold block">{t("wantToHire")}</span>
              <span className="text-[11px] opacity-80 block leading-snug mt-0.5">
                {t("hireSub")}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("seller")}
            className={`p-3.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
              role === "seller"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
            <div>
              <span className="text-xs font-bold block">{t("wantToWork")}</span>
              <span className="text-[11px] opacity-80 block leading-snug mt-0.5">
                {t("workSub")}
              </span>
            </div>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs animate-micro-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Check your email to verify your account before signing in.{" "}
              <Link href="/verify-email" className="underline">
                Resend verification
              </Link>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars"
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">{t("termsAgree")}</p>

          <Button
            type="submit"
            disabled={loading || success}
            isLoading={loading}
            loadingText={t("creatingAccount")}
            isSuccess={success}
            successText={t("regSuccess")}
            isError={!!error}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 text-white py-3.5 font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            {role === "seller" ? t("createSellerAccount") : t("createClientAccount")}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>{t("haveAccount")} </span>
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline transition-colors"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </div>
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

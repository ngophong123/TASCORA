"use client"

import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, Briefcase, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

function RegisterForm() {
  const t = useTranslations("auth")
  const router = useRouter()
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

      // 1. Call Register API
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Registration failed. Please try a different email.")
      }

      // 2. Auto login to retrieve accessToken
      const loginRes = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginRes.json()

      if (loginRes.ok && loginData.success) {
        const token = loginData.data.accessToken
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(loginData.data.user))

        // 3. If selected role is seller, become seller
        if (role === "seller") {
          try {
            await fetch(`${apiUrl}/api/v1/onboarding/become-seller`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
          } catch {
            // Non-blocking
          }
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(role === "seller" ? "/seller/dashboard" : "/dashboard")
      }, 1500)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred during registration."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8 rounded-3xl border border-border bg-surface p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <Link href="/" className="inline-block mb-3">
            <span className="font-display text-3xl font-bold tracking-tight text-text-primary">
              TASCORA<span className="text-blue-600">.</span>
            </span>
          </Link>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-text-primary tracking-tight">
            {t("joinTitle")}
          </h2>
          <p className="mt-2 text-xs text-text-secondary">{t("joinSubtext")}</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl border border-border bg-[#F4F4F8]">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`p-3.5 rounded-xl text-left transition-all flex items-start gap-3 ${
              role === "buyer"
                ? "bg-blue-600 text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <User className="h-5 w-5 mt-0.5 shrink-0" />
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
            className={`p-3.5 rounded-xl text-left transition-all flex items-start gap-3 ${
              role === "seller"
                ? "bg-blue-600 text-white shadow-md"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Briefcase className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold block">{t("wantToWork")}</span>
              <span className="text-[11px] opacity-80 block leading-snug mt-0.5">
                {t("workSub")}
              </span>
            </div>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{t("regSuccess")}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-600/60 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full rounded-xl border border-border bg-white pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-600/60 transition-colors"
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-blue-600/60 transition-colors"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-text-muted pt-1">{t("termsAgree")}</p>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            {loading
              ? t("creatingAccount")
              : role === "seller"
                ? t("createSellerAccount")
                : t("createClientAccount")}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-border/50 text-xs text-text-muted">
          <span>{t("haveAccount")} </span>
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline transition-colors"
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

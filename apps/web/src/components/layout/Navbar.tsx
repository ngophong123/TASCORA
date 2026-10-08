"use client"

import * as React from "react"
import { logoutSession } from "@/lib/auth-client"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Menu, X, ChevronDown, ArrowRight, Bell, MessageSquare, LogOut } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { MegaMenu } from "./MegaMenu"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { useLenis } from "./SmoothScrollProvider"
import { useDialogFocus } from "@/hooks/useDialogFocus"
import { EXPLORE_SERVICES_MENU, CATEGORIES_MENU } from "@/data/navigation"

const control =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-bg-subtle hover:text-foreground transition-colors motion-reduce:transition-none"
const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors motion-reduce:transition-none"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const lenis = useLenis()
  const t = useTranslations("nav")
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeMenu, setActiveMenu] = React.useState<"explore" | "categories" | null>(null)
  const [user, setUser] = React.useState<{ email?: string; role?: string } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const navRef = React.useRef<HTMLElement | null>(null)
  const drawerRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  useDialogFocus(mobileMenuOpen, drawerRef, () => setMobileMenuOpen(false))

  React.useEffect(() => {
    setMounted(true)
    try {
      const token = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")
      if (token && savedUser) setUser(JSON.parse(savedUser))
    } catch {
      /* Preserve guest fallback. */
    }
  }, [])
  React.useEffect(() => {
    if (!activeMenu) return
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null)
        triggerRef.current?.focus()
      }
    }
    const outside = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setActiveMenu(null)
    }
    document.addEventListener("keydown", key)
    document.addEventListener("mousedown", outside)
    return () => {
      document.removeEventListener("keydown", key)
      document.removeEventListener("mousedown", outside)
    }
  }, [activeMenu])
  React.useEffect(() => {
    const wide = window.matchMedia("(min-width: 1280px)")
    const resize = () => {
      if (wide.matches) setMobileMenuOpen(false)
    }
    wide.addEventListener("change", resize)
    return () => wide.removeEventListener("change", resize)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutSession()
      setUser(null)
      window.location.replace("/")
    } catch {
      window.alert("Unable to sign out. Please retry.")
    }
  }
  const handleNavAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setMobileMenuOpen(false)
    if (pathname === "/" || pathname === "") {
      if (targetId === "for-freelancers")
        window.dispatchEvent(new CustomEvent("switch-audience-tab", { detail: "freelancers" }))
      const el = document.getElementById(targetId)
      if (el) {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (lenis && !reduced) lenis.scrollTo(el, { offset: -80, duration: 0.7 })
        else
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - 80,
            behavior: reduced ? "instant" : "smooth",
          })
        window.history.pushState(null, "", `#${targetId}`)
      }
    } else router.push(`/#${targetId}`)
  }
  if (pathname?.includes("/dashboard")) return null
  const anchors = [
    { id: "how-it-works", label: t("howItWorks") },
    { id: "for-freelancers", label: t("forFreelancers") },
    { id: "enterprise", label: t("enterprise") },
  ]
  return (
    <header ref={navRef} className="sticky top-0 z-50 border-b border-border-default bg-bg-base">
      <div className="premium-container flex h-20 items-center justify-between gap-4">
        <Link
          href="/"
          data-testid="navbar-brand"
          className="inline-flex min-h-11 shrink-0 items-center"
          aria-label="TASCORA Home"
        >
          <Logo size="md" theme="monochrome" className="text-foreground" />
        </Link>
        <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1">
          {(["explore", "categories"] as const).map((menu) => (
            <div key={menu} className="relative">
              <button
                type="button"
                data-testid={menu === "explore" ? "mega-menu-trigger" : undefined}
                aria-expanded={activeMenu === menu}
                aria-controls={`nav-${menu}`}
                className={control}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget
                  setActiveMenu(activeMenu === menu ? null : menu)
                }}
              >
                {menu === "explore" ? t("exploreServices") : t("categories")}
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 ${activeMenu === menu ? "rotate-180" : ""}`}
                />
              </button>
              {activeMenu === menu && (
                <div id={`nav-${menu}`} className="absolute left-0 top-full pt-3">
                  <MegaMenu
                    columns={menu === "explore" ? EXPLORE_SERVICES_MENU : CATEGORIES_MENU}
                    footerLink={{ label: t("exploreServices"), href: "/explore" }}
                    onClose={() => setActiveMenu(null)}
                  />
                </div>
              )}
            </div>
          ))}
          {anchors.map(({ id, label }) => (
            <Link
              key={id}
              href={`/#${id}`}
              data-testid={`nav-link-${id}`}
              onClick={(e) => handleNavAnchorClick(e, id)}
              className={control}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <div className="hidden xl:flex items-center gap-2">
            {mounted && user ? (
              <>
                <Link
                  href="/dashboard/notifications"
                  className={`${control} min-w-11 px-2`}
                  aria-label={t("notifications")}
                >
                  <Bell className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/messages"
                  className={`${control} min-w-11 px-2`}
                  aria-label={t("messages")}
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <Link href="/dashboard" data-testid="nav-link-dashboard" className={primary}>
                  {t("dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className={`${control} min-w-11 px-2`}
                  aria-label={t("signOut")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" data-testid="nav-link-signin" className={control}>
                  {t("signIn")}
                </Link>
                <Link href="/register" data-testid="nav-link-join" className={primary}>
                  {t("joinTascora")}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${control} xl:hidden min-w-11 px-2`}
            aria-label={t("toggleMenu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          ref={drawerRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label={t("toggleMenu")}
          tabIndex={-1}
          data-testid="mobile-drawer"
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-bg-base p-6"
        >
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <Logo size="md" theme="monochrome" className="text-foreground" />
            <button
              type="button"
              data-testid="mobile-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              className={`${control} min-w-11 px-2`}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="flex flex-col py-5">
            <Link
              href="/explore"
              data-testid="mobile-nav-link-explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-14 items-center justify-between border-b border-border-default text-lg font-medium"
            >
              {t("exploreServices")}
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-primary" />
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-14 items-center border-b border-border-default text-lg font-medium"
            >
              {t("categories")}
            </Link>
            {anchors.map(({ id, label }) => (
              <Link
                key={id}
                href={`/#${id}`}
                onClick={(e) => handleNavAnchorClick(e, id)}
                className="flex min-h-14 items-center border-b border-border-default text-lg text-text-secondary"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between py-3 text-sm text-text-secondary">
            <span>Language / Ngôn ngữ</span>
            <LanguageSwitcher />
          </div>
          <div className="mt-auto flex flex-col gap-3 border-t border-border-default pt-6">
            {mounted && user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={primary}
                >
                  {t("goToDashboard")}
                </Link>
                <button
                  type="button"
                  className={control}
                  onClick={() => {
                    void handleLogout()
                    setMobileMenuOpen(false)
                  }}
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${control} border border-border-default`}
                >
                  {t("signIn")}
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className={primary}>
                  {t("joinTascora")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

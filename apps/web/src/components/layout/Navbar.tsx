"use client"

import { logoutSession } from "@/lib/auth-client"
import * as React from "react"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Bell,
  MessageSquare,
  LogOut,
  LayoutDashboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/Logo"
import { MegaMenu } from "./MegaMenu"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { useLenis } from "./SmoothScrollProvider"
import { EXPLORE_SERVICES_MENU, CATEGORIES_MENU } from "@/data/navigation"
import { EASE_OUT_EXPO } from "@/lib/motion"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const lenis = useLenis()
  const t = useTranslations("nav")

  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeMenu, setActiveMenu] = React.useState<"explore" | "categories" | null>(null)
  const [user, setUser] = React.useState<{ email?: string; role?: string } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const menuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const navRef = React.useRef<HTMLElement | null>(null)

  // Close mega menu on Escape key or outside click
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveMenu(null)
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    if (activeMenu) {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeMenu])

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    try {
      const token = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")
      if (token && savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch {
      // Fallback
    }

    return () => window.removeEventListener("scroll", handleScroll)
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

  const handleMouseEnter = (menu: "explore" | "categories") => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setActiveMenu(menu)
  }

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }

  const handleNavAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    const isHome = pathname === "/" || pathname === ""

    if (isHome) {
      e.preventDefault()
      if (targetId === "for-freelancers") {
        window.dispatchEvent(new CustomEvent("switch-audience-tab", { detail: "freelancers" }))
      }
      const el = document.getElementById(targetId)
      if (el) {
        if (lenis) {
          lenis.scrollTo(el, { offset: -80, duration: 1.1 })
        } else {
          const top = el.getBoundingClientRect().top + window.scrollY - 80
          window.scrollTo({ top, behavior: "smooth" })
        }
        window.history.pushState(null, "", `#${targetId}`)
      }
    } else {
      e.preventDefault()
      router.push(`/#${targetId}`)
    }
  }

  // Suppress marketing navbar on dashboard routes (including localized routes like /vi/dashboard)
  if (pathname?.includes("/dashboard")) {
    return null
  }

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Left: TASCORA Wordmark */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            data-testid="navbar-brand"
            className="group flex items-center outline-none select-none transition-transform hover:scale-[1.01] active:scale-[0.99]"
            aria-label="TASCORA Home"
          >
            <Logo size="md" />
          </Link>

          {/* Center: Desktop Navigation with Mega Menus */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {/* Explore Services with Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("explore")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                data-testid="mega-menu-trigger"
                onClick={() => setActiveMenu("explore")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer nav-link-underline ${
                  activeMenu === "explore"
                    ? "text-[#635BFF]"
                    : "text-slate-600 hover:text-[#635BFF]"
                }`}
                aria-expanded={activeMenu === "explore"}
              >
                <span>{t("exploreServices")}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    activeMenu === "explore"
                      ? "rotate-180 text-[#635BFF]"
                      : "text-slate-400 group-hover:text-[#635BFF]"
                  }`}
                />
              </button>

              <AnimatePresence>
                {activeMenu === "explore" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                    className="absolute top-[calc(100%+8px)] left-0 z-50"
                  >
                    <MegaMenu
                      columns={EXPLORE_SERVICES_MENU}
                      footerLink={{ label: t("viewAllSpecializedServices"), href: "/explore" }}
                      onClose={() => setActiveMenu(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Categories with Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("categories")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer nav-link-underline ${
                  activeMenu === "categories"
                    ? "text-[#635BFF]"
                    : "text-slate-600 hover:text-[#635BFF]"
                }`}
                aria-expanded={activeMenu === "categories"}
              >
                <span>{t("categories")}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    activeMenu === "categories"
                      ? "rotate-180 text-[#635BFF]"
                      : "text-slate-400 group-hover:text-[#635BFF]"
                  }`}
                />
              </button>

              <AnimatePresence>
                {activeMenu === "categories" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                    className="absolute top-[calc(100%+8px)] -left-20 z-50"
                  >
                    <MegaMenu
                      columns={CATEGORIES_MENU}
                      footerLink={{ label: t("browseAllCategoryDisciplines"), href: "/explore" }}
                      onClose={() => setActiveMenu(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Regular Links with Smooth Scroll & Animated Underline */}
            <Link
              href="/#how-it-works"
              data-testid="nav-link-how-it-works"
              onClick={(e) => handleNavAnchorClick(e, "how-it-works")}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#635BFF] transition-colors cursor-pointer nav-link-underline"
            >
              {t("howItWorks")}
            </Link>
            <Link
              href="/#for-freelancers"
              data-testid="nav-link-for-freelancers"
              onClick={(e) => handleNavAnchorClick(e, "for-freelancers")}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#635BFF] transition-colors cursor-pointer nav-link-underline"
            >
              {t("forFreelancers")}
            </Link>
            <Link
              href="/#enterprise"
              data-testid="nav-link-enterprise"
              onClick={(e) => handleNavAnchorClick(e, "enterprise")}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#635BFF] transition-colors cursor-pointer nav-link-underline"
            >
              {t("enterprise")}
            </Link>
          </nav>
        </div>

        {/* Right: Language Switcher + Auth / Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Language Switcher on Desktop */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {mounted && user ? (
            /* Logged in state */
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/dashboard/notifications"
                className="p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors relative"
                aria-label={t("notifications")}
              >
                <Bell className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/messages"
                className="p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                aria-label={t("messages")}
              >
                <MessageSquare className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" data-testid="nav-link-dashboard">
                <Button variant="secondary" size="sm">
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#635BFF]" />
                  <span>{t("dashboard")}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#64748B] hover:text-rose-600"
                title={t("signOut")}
                aria-label={t("signOut")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            /* Guest state */
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                data-testid="nav-link-signin"
                className="text-sm font-medium text-slate-600 hover:text-[#635BFF] transition-colors px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                {t("signIn")}
              </Link>
              <Link href="/register" data-testid="nav-link-join">
                <Button
                  variant="primary"
                  size="md"
                  className="px-5 shadow-xs hover:shadow-md hover:shadow-[#635BFF]/30 active:scale-[0.98]"
                >
                  <span>{t("joinTascora")}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={t("toggleMenu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Full-Screen Animated Mobile Drawer */}
      {/* Full-Screen Animated Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            data-testid="mobile-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 bg-white/98 backdrop-blur-2xl border-b border-[#E2E8F0] z-50 overflow-y-auto px-6 py-6 pb-12 safe-area-bottom flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Navigation
                </span>
                <button
                  type="button"
                  data-testid="mobile-drawer-close"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col pt-2">
                <Link
                  href="/explore"
                  data-testid="mobile-nav-link-explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[48px] text-base font-semibold text-[#0F172A] hover:text-[#635BFF] flex items-center justify-between py-3 border-b border-[#E2E8F0] transition-colors"
                >
                  <span>{t("exploreServices")}</span>
                  <ArrowRight className="h-4 w-4 text-[#635BFF]" />
                </Link>
                <Link
                  href="/explore?category=programming"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[48px] text-base font-semibold text-[#0F172A] hover:text-[#635BFF] flex items-center justify-between py-3 border-b border-[#E2E8F0] transition-colors"
                >
                  <span>{t("categories")}</span>
                  <ArrowRight className="h-4 w-4 text-[#635BFF]" />
                </Link>
                <Link
                  href="/#how-it-works"
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    handleNavAnchorClick(e, "how-it-works")
                  }}
                  className="min-h-[48px] text-base font-medium text-[#475569] hover:text-[#0F172A] flex items-center py-3 border-b border-[#E2E8F0] transition-colors"
                >
                  {t("howItWorks")}
                </Link>
                <Link
                  href="/#for-freelancers"
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    handleNavAnchorClick(e, "for-freelancers")
                  }}
                  className="min-h-[48px] text-base font-medium text-[#475569] hover:text-[#0F172A] flex items-center py-3 border-b border-[#E2E8F0] transition-colors"
                >
                  {t("forFreelancers")}
                </Link>
                <Link
                  href="/#enterprise"
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    handleNavAnchorClick(e, "enterprise")
                  }}
                  className="min-h-[48px] text-base font-medium text-[#475569] hover:text-[#0F172A] flex items-center py-3 border-b border-[#E2E8F0] transition-colors"
                >
                  {t("enterprise")}
                </Link>

                {/* Mobile Language Switcher Item */}
                <div className="min-h-[48px] flex items-center justify-between py-3 border-b border-[#E2E8F0]">
                  <span className="text-sm font-medium text-[#475569]">Language / Ngôn ngữ</span>
                  <LanguageSwitcher align="right" />
                </div>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E2E8F0] flex flex-col gap-3">
              {mounted && user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="lg" className="w-full min-h-[48px]">
                      {t("goToDashboard")}
                    </Button>
                  </Link>
                  <button
                    onClick={() => {
                      void handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full min-h-[44px] py-3 text-sm text-rose-600 text-center font-medium"
                  >
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full min-h-[48px]">
                      {t("signIn")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="lg" className="w-full min-h-[48px]">
                      {t("joinTascora")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

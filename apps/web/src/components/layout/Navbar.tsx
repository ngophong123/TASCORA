"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/routing"
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
import { MegaMenu } from "./MegaMenu"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { EXPLORE_SERVICES_MENU, CATEGORIES_MENU } from "@/data/navigation"
import { EASE_OUT_EXPO } from "@/lib/motion"

export function Navbar() {
  const pathname = usePathname()
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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    window.location.replace("/")
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

  // Suppress marketing navbar on dashboard routes (including localized routes like /vi/dashboard)
  if (pathname?.includes("/dashboard")) {
    return null
  }

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-[rgba(15,15,30,0.08)] shadow-[0_4px_20px_-4px_rgba(15,15,30,0.06)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Left: TASCORA Wordmark */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            data-testid="navbar-brand"
            className="group flex items-center gap-2.5 outline-none select-none"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-[1px] shadow-[0_2px_10px_rgba(37,99,235,0.3)] group-hover:shadow-[0_4px_16px_rgba(37,99,235,0.5)] transition-all">
              <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center">
                <span className="font-bold text-sm bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">
                  T
                </span>
              </div>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#0B0B14] group-hover:text-blue-950 transition-colors">
              TASCOR
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent font-bold">
                A
              </span>
            </span>
          </Link>

          {/* Center: Desktop Navigation with Mega Menus */}
          <nav className="hidden lg:flex items-center gap-1">
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
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeMenu === "explore"
                    ? "text-blue-700 bg-blue-50/80"
                    : "text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-black/[0.03]"
                }`}
                aria-expanded={activeMenu === "explore"}
              >
                <span>{t("exploreServices")}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    activeMenu === "explore" ? "rotate-180 text-blue-600" : "text-[#6B6B7B]"
                  }`}
                />
              </button>

              <AnimatePresence>
                {activeMenu === "explore" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
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
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeMenu === "categories"
                    ? "text-blue-700 bg-blue-50/80"
                    : "text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-black/[0.03]"
                }`}
                aria-expanded={activeMenu === "categories"}
              >
                <span>{t("categories")}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    activeMenu === "categories" ? "rotate-180 text-blue-600" : "text-[#6B6B7B]"
                  }`}
                />
              </button>

              <AnimatePresence>
                {activeMenu === "categories" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
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

            {/* Regular Links */}
            <Link
              href="#how-it-works"
              data-testid="nav-link-how-it-works"
              className="px-3 py-2 text-sm font-medium text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-black/[0.03] rounded-lg transition-colors"
            >
              {t("howItWorks")}
            </Link>
            <Link
              href="/register?role=seller"
              data-testid="nav-link-for-freelancers"
              className="px-3 py-2 text-sm font-medium text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-black/[0.03] rounded-lg transition-colors"
            >
              {t("forFreelancers")}
            </Link>
            <Link
              href="#enterprise"
              data-testid="nav-link-enterprise"
              className="px-3 py-2 text-sm font-medium text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-black/[0.03] rounded-lg transition-colors"
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
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/notifications"
                className="p-2 rounded-xl text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#F4F4F8] transition-colors relative"
                aria-label={t("notifications")}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </Link>
              <Link
                href="/dashboard/messages"
                className="p-2 rounded-xl text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#F4F4F8] transition-colors"
                aria-label={t("messages")}
              >
                <MessageSquare className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" data-testid="nav-link-dashboard">
                <Button variant="secondary" size="sm" pill>
                  <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
                  <span>{t("dashboard")}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                pill
                onClick={handleLogout}
                className="text-[#6B6B7B] hover:text-rose-600"
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
                className="text-sm font-medium text-[#4B4B5C] hover:text-[#0B0B14] transition-colors px-2 py-1"
              >
                {t("signIn")}
              </Link>
              <Link href="/register" data-testid="nav-link-join">
                <Button variant="primary" size="md" pill className="px-5">
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
            className="lg:hidden p-2 rounded-xl text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#F4F4F8] transition-colors cursor-pointer"
            aria-label={t("toggleMenu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Full-Screen Animated Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            data-testid="mobile-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 bg-white/98 backdrop-blur-2xl border-b border-[rgba(15,15,30,0.1)] z-50 overflow-y-auto px-6 py-8 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(15,15,30,0.06)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B7B]">
                Navigation
              </span>
              <button
                type="button"
                data-testid="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#F4F4F8] cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col space-y-4 pt-2">
              <Link
                href="/explore"
                data-testid="mobile-nav-link-explore"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-[#0B0B14] hover:text-blue-700 flex items-center justify-between py-2 border-b border-[rgba(15,15,30,0.06)]"
              >
                <span>{t("exploreServices")}</span>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </Link>
              <Link
                href="/explore?category=programming"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-[#0B0B14] hover:text-blue-700 flex items-center justify-between py-2 border-b border-[rgba(15,15,30,0.06)]"
              >
                <span>{t("categories")}</span>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-[#4B4B5C] hover:text-[#0B0B14] py-2 border-b border-[rgba(15,15,30,0.06)]"
              >
                {t("howItWorks")}
              </Link>
              <Link
                href="/register?role=seller"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-[#4B4B5C] hover:text-[#0B0B14] py-2 border-b border-[rgba(15,15,30,0.06)]"
              >
                {t("forFreelancers")}
              </Link>
              <Link
                href="#enterprise"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-[#4B4B5C] hover:text-[#0B0B14] py-2 border-b border-[rgba(15,15,30,0.06)]"
              >
                {t("enterprise")}
              </Link>

              {/* Mobile Language Switcher Item */}
              <div className="flex items-center justify-between py-3 border-b border-[rgba(15,15,30,0.06)]">
                <span className="text-sm font-medium text-[#4B4B5C]">Language / Ngôn ngữ</span>
                <LanguageSwitcher align="right" />
              </div>
            </nav>

            <div className="pt-8 border-t border-[rgba(15,15,30,0.08)] flex flex-col gap-3">
              {mounted && user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="lg" pill className="w-full">
                      {t("goToDashboard")}
                    </Button>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full py-3 text-sm text-rose-600 text-center font-medium"
                  >
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="lg" pill className="w-full">
                      {t("signIn")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="lg" pill className="w-full">
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

"use client"

import { logoutSession } from "@/lib/auth-client"
import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useDashboard } from "@/context/DashboardContext"
import { NotificationsPopover } from "../ui/NotificationsPopover"
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"
import { motion } from "framer-motion"
import {
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ArrowRightLeft,
  Briefcase,
  UserCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarImage } from "@/components/ui/AvatarImage"
import { profileName, imageUrl } from "@/lib/marketplace"

export function DashboardTopbar() {
  const router = useRouter()
  const t = useTranslations("dashboard")
  const { role, account, setRole, setCommandPaletteOpen, setIsMobileDrawerOpen, showToast } =
    useDashboard()

  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Click outside to dismiss user dropdown
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [userDropdownOpen])

  const handleRoleChange = (newRole: "CLIENT" | "FREELANCER") => {
    if (role === newRole || (newRole === "FREELANCER" && !account?.sellerProfile)) return
    setRole(newRole)
    showToast({
      title: newRole === "CLIENT" ? t("switchedToClient") : t("switchedToFreelancer"),
      message: newRole === "CLIENT" ? t("modeClient") : t("modeFreelancer"),
      type: "info",
    })
  }

  const handleSignOut = async () => {
    try {
      await logoutSession()
      router.push("/")
    } catch {
      showToast({ title: "Sign out failed", message: "Please retry.", type: "error" })
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* 1. Left: Mobile Hamburger & Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar / Command Palette Trigger */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center justify-center sm:justify-start gap-2.5 h-10 px-2 sm:px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/40 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all w-10 sm:w-56 md:w-64 cursor-pointer"
          aria-label="Open Command Palette (Cmd+K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline truncate">Search or type...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 ml-auto text-[10px] font-mono font-semibold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 2. Center: Role Switcher (Segmented Control) */}
      <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 relative">
        <button
          type="button"
          onClick={() => handleRoleChange("CLIENT")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
            role === "CLIENT"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          {role === "CLIENT" && (
            <motion.div
              layoutId="topbar-role-indicator"
              className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200/80 dark:border-slate-700 -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <span className="sr-only sm:not-sr-only">{t("roleClient")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("FREELANCER")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
            role === "FREELANCER"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          {role === "FREELANCER" && (
            <motion.div
              layoutId="topbar-role-indicator"
              className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200/80 dark:border-slate-700 -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <UserCheck className="w-3.5 h-3.5 text-primary" />
          <span className="sr-only sm:not-sr-only">{t("roleFreelancer")}</span>
        </button>
      </div>

      {/* 3. Right: Language Switcher, Notifications & User Profile Menu */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher in Dashboard */}
        <div className="hidden sm:block">
          <LanguageSwitcher align="right" compact />
        </div>

        <NotificationsPopover />

        {/* User Menu Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={userDropdownOpen}
          >
            <AvatarImage
              src={imageUrl(account?.sellerProfile?.avatar || account?.buyerProfile?.avatar)}
              name={profileName(account?.sellerProfile || account?.buyerProfile)}
              size={28}
              rounded="md"
              alt={profileName(account?.sellerProfile || account?.buyerProfile)}
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {profileName(account?.sellerProfile || account?.buyerProfile)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-tight">
                {role === "CLIENT" ? t("roleClient") : t("roleFreelancer")}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown Menu */}
          {userDropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2.5 border-b border-slate-200/60 dark:border-slate-800 mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {profileName(account?.sellerProfile || account?.buyerProfile)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                  {account?.email || "Account unavailable"}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {role === "CLIENT" ? t("modeClient") : t("modeFreelancer")}
                </span>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                role="menuitem"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false)
                  handleRoleChange(role === "CLIENT" ? "FREELANCER" : "CLIENT")
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#4B4B5C] hover:text-[#0A0A23] hover:bg-[#FAFAFC] transition-colors"
                role="menuitem"
              >
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <span>Switch to {role === "CLIENT" ? t("roleFreelancer") : t("roleClient")}</span>
              </button>

              <div className="my-1 border-t border-[rgba(15,15,30,0.06)]" />

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

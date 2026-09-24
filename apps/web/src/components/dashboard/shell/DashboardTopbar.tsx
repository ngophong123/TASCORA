"use client"

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

export function DashboardTopbar() {
  const router = useRouter()
  const t = useTranslations("dashboard")
  const {
    role,
    setRole,
    setCommandPaletteOpen,
    setIsMobileDrawerOpen,
    showToast,
  } = useDashboard()

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
    if (role === newRole) return
    setRole(newRole)
    showToast({
      title: newRole === "CLIENT" ? t("switchedToClient") : t("switchedToFreelancer"),
      message: newRole === "CLIENT" ? t("modeClient") : t("modeFreelancer"),
      type: "info",
    })
  }

  const handleSignOut = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } catch {}
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[rgba(15,15,30,0.08)] px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* 1. Left: Mobile Hamburger & Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] transition-all"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar / Command Palette Trigger */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2.5 h-10 px-3.5 rounded-xl border border-[rgba(15,15,30,0.1)] bg-[#FAFAFC] hover:bg-white hover:border-blue-300 text-xs text-[#6B6B7B] hover:text-[#0B0B14] shadow-2xs transition-all w-36 sm:w-56 md:w-64"
          aria-label="Open Command Palette (Cmd+K)"
        >
          <Search className="w-4 h-4 text-[#8B8B9B]" />
          <span className="truncate">Search or type...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 ml-auto text-[10px] font-mono font-semibold text-[#8B8B9B] bg-white border border-[rgba(15,15,30,0.1)] rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 2. Center: Role Switcher (Segmented Control) */}
      <div className="flex items-center bg-[#F4F4F8] p-1 rounded-xl border border-[rgba(15,15,30,0.08)] relative">
        <button
          type="button"
          onClick={() => handleRoleChange("CLIENT")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
            role === "CLIENT"
              ? "text-blue-900"
              : "text-[#6B6B7B] hover:text-[#0B0B14]"
          )}
        >
          {role === "CLIENT" && (
            <motion.div
              layoutId="topbar-role-indicator"
              className="absolute inset-0 bg-white rounded-lg shadow-xs border border-[rgba(15,15,30,0.08)] -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <Briefcase className="w-3.5 h-3.5" />
          <span>{t("roleClient")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("FREELANCER")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
            role === "FREELANCER"
              ? "text-blue-900"
              : "text-[#6B6B7B] hover:text-[#0B0B14]"
          )}
        >
          {role === "FREELANCER" && (
            <motion.div
              layoutId="topbar-role-indicator"
              className="absolute inset-0 bg-white rounded-lg shadow-xs border border-[rgba(15,15,30,0.08)] -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <UserCheck className="w-3.5 h-3.5" />
          <span>{t("roleFreelancer")}</span>
        </button>
      </div>

      {/* 3. Right: Language Switcher, Notifications & User Profile Menu */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher in Dashboard */}
        <LanguageSwitcher align="right" compact />

        <NotificationsPopover />

        {/* User Menu Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-[rgba(15,15,30,0.08)] bg-white hover:bg-[#FAFAFC] hover:border-[rgba(15,15,30,0.18)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-haspopup="menu"
            aria-expanded={userDropdownOpen}
          >
            {/* Avatar Pill */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 p-[1px]">
              <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center font-bold text-xs text-blue-700 font-mono">
                AM
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#0B0B14] leading-tight">
                Alexandre
              </span>
              <span className="text-[10px] text-[#6B6B7B] font-mono leading-tight">
                {role === "CLIENT" ? t("roleClient") : t("roleFreelancer")}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6B7B] hidden sm:block" />
          </button>

          {/* User Dropdown Menu */}
          {userDropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[rgba(15,15,30,0.1)] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2.5 border-b border-[rgba(15,15,30,0.06)] mb-1">
                <span className="text-xs font-bold text-[#0B0B14] block">
                  Alexandre Moreau
                </span>
                <span className="text-[11px] text-[#6B6B7B] block truncate">
                  alexandre@tascora.com
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {role === "CLIENT" ? t("modeClient") : t("modeFreelancer")}
                </span>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#FAFAFC] transition-colors"
                role="menuitem"
              >
                <User className="w-4 h-4 text-[#6B6B7B]" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#FAFAFC] transition-colors"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-[#6B6B7B]" />
                <span>Account Settings</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false)
                  handleRoleChange(role === "CLIENT" ? "FREELANCER" : "CLIENT")
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#FAFAFC] transition-colors"
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

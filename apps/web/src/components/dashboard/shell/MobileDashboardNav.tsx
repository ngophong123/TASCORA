"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useDashboard } from "@/context/DashboardContext"
import {
  CLIENT_NAV_ITEMS,
  FREELANCER_NAV_ITEMS,
  CLIENT_BOTTOM_TABS,
  FREELANCER_BOTTOM_TABS,
} from "@/data/dashboard/navigation"
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Briefcase,
  MessageSquare,
  Bookmark,
  CreditCard,
  Wallet,
  Settings,
  X,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDialogFocus } from "@/hooks/useDialogFocus"

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Briefcase,
  MessageSquare,
  Bookmark,
  CreditCard,
  Wallet,
  Settings,
}

const NAV_KEY_MAP: Record<string, string> = {
  "nav-overview": "overview",
  "nav-orders": "orders",
  "nav-messages": "messages",
  "nav-saved": "saved",
  "nav-payments": "payments",
  "nav-settings": "settings",
  "nav-gigs": "gigs",
  "nav-earnings": "earnings",
  "tab-overview": "overview",
  "tab-orders": "orders",
  "tab-messages": "messages",
  "tab-settings": "settings",
  "tab-gigs": "gigs",
  "tab-earnings": "earnings",
}

export function MobileDashboardNav() {
  const pathname = usePathname()
  const t = useTranslations("dashboard")
  const { role, toggleRole, isMobileDrawerOpen, setIsMobileDrawerOpen } = useDashboard()

  const navItems = role === "CLIENT" ? CLIENT_NAV_ITEMS : FREELANCER_NAV_ITEMS
  const bottomTabs = role === "CLIENT" ? CLIENT_BOTTOM_TABS : FREELANCER_BOTTOM_TABS

  const drawerRef = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useDialogFocus(isMobileDrawerOpen, drawerRef, () => setIsMobileDrawerOpen(false))
  return (
    <>
      {/* 1. Mobile Off-Canvas Drawer (< lg) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide Drawer Panel */}
            <motion.div
              ref={drawerRef}
              tabIndex={-1}
              initial={reduced ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduced ? undefined : { x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative w-72 max-w-[80vw] h-full bg-bg-surface shadow-lg flex flex-col z-10 select-none"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
            >
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-border-default bg-bg-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 p-[1px] shadow-sm">
                    <div className="h-full w-full bg-bg-surface rounded-[10px] flex items-center justify-center font-bold text-xs text-blue-700">
                      T
                    </div>
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-foreground">
                    TASCORA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-black/[0.04]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role Switcher Pill inside Mobile Drawer */}
              <div className="p-4 border-b border-border-default bg-bg-surface">
                <button
                  type="button"
                  onClick={toggleRole}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[rgba(15,15,30,0.1)] bg-bg-subtle hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {role === "CLIENT" ? t("modeClient") : t("modeFreelancer")}
                      </span>
                      <span className="text-[10px] text-text-muted">Tap to switch</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    Switch
                  </span>
                </button>
              </div>

              {/* Navigation Items */}
              <nav
                aria-label="Dashboard navigation"
                className="flex-1 overflow-y-auto p-3 space-y-1"
              >
                {navItems.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href)

                  const navKey = NAV_KEY_MAP[item.id] as Parameters<typeof t>[0] | undefined
                  const label = navKey && t.has(navKey) ? t(navKey) : item.label

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 min-h-11 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-900 border border-blue-200/60 font-bold"
                          : "text-text-secondary hover:text-foreground hover:bg-bg-subtle"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-text-muted")}
                        />
                        <span>{label}</span>
                      </div>
                    </Link>
                  )
                })}

                {/* Mobile Drawer Language Switcher */}
                <div className="pt-3 mt-3 border-t border-border-default flex items-center justify-between px-3">
                  <span className="text-xs font-medium text-text-secondary">Language</span>
                  <LanguageSwitcher align="right" />
                </div>
              </nav>

              {/* Drawer Footer info */}
              <div className="p-4 border-t border-border-default bg-bg-subtle">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  {role === "CLIENT" ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Order payments and refunds</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Manage your seller profile</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Mobile Fixed Bottom Tab Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-surface backdrop-blur-md border-t border-border-default pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 px-3 flex items-center justify-around shadow-lg">
        {bottomTabs.map((tab) => {
          const Icon = ICON_MAP[tab.iconName] || LayoutDashboard
          const isActive =
            tab.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.href)

          const navKey = NAV_KEY_MAP[tab.id] as Parameters<typeof t>[0] | undefined
          const label = navKey && t.has(navKey) ? t(navKey) : tab.label

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center min-h-11 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors flex-1",
                isActive ? "text-blue-700" : "text-text-muted hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              </div>
              <span className="mt-1 truncate max-w-[60px]">{label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

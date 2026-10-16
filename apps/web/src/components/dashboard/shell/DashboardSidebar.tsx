"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useDashboard } from "@/context/DashboardContext"
import { CLIENT_NAV_ITEMS, FREELANCER_NAV_ITEMS } from "@/data/dashboard/navigation"
import { motion, useReducedMotion } from "framer-motion"
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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/Logo"

const NAV_ICON_MAP: Record<string, React.ElementType> = {
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
}

export function DashboardSidebar() {
  const reduced = useReducedMotion()
  const pathname = usePathname()
  const t = useTranslations("dashboard")
  const { role, sidebarCollapsed, toggleSidebar } = useDashboard()

  const navItems = role === "CLIENT" ? CLIENT_NAV_ITEMS : FREELANCER_NAV_ITEMS

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-bg-surface border-r border-border-default transition-all duration-300 z-40 select-none",
        sidebarCollapsed ? "w-[72px]" : "w-64"
      )}
      aria-label="Dashboard Sidebar"
    >
      {/* 1. Header: Brand Logo & Collapse Toggle */}
      <div
        className={cn(
          "flex items-center border-b border-border-default shrink-0",
          sidebarCollapsed ? "h-28 flex-col justify-center gap-1 px-2" : "h-16 justify-between px-4"
        )}
      >
        <Link
          href="/"
          className="flex min-h-11 items-center overflow-hidden"
          aria-label="TASCORA Home"
        >
          <Logo size="md" theme="monochrome" variant={sidebarCollapsed ? "mark" : "full"} />
        </Link>

        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="min-h-11 min-w-11 shrink-0 rounded-lg text-text-muted hover:text-foreground dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-border-default dark:hover:border-slate-700 transition-all cursor-pointer"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Navigation Items */}
      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = NAV_ICON_MAP[item.iconName] || LayoutDashboard
          const isActive =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)

          const navKey = NAV_KEY_MAP[item.id] as Parameters<typeof t>[0] | undefined
          const label = navKey && t.has(navKey) ? t(navKey) : item.label

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={sidebarCollapsed ? label : undefined}
              className={cn(
                "relative flex items-center gap-3 px-3 min-h-11 py-2.5 rounded-lg text-sm font-semibold transition-all group",
                isActive
                  ? "text-foreground font-bold"
                  : "text-text-secondary hover:text-foreground dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              {/* Active sliding pill background indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-xl -z-10 shadow-xs"
                  transition={
                    reduced ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }
                  }
                />
              )}

              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
                )}
              />

              {!sidebarCollapsed && <span className="truncate flex-1">{label}</span>}

              {/* Badge Counter */}

              {/* Collapsed dot badge */}
            </Link>
          )
        })}
      </nav>

      {/* 3. Bottom Card (Role-Specific, hidden if collapsed) */}
      {!sidebarCollapsed && (
        <div className="p-3.5 m-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-border-default dark:border-slate-700/60 shadow-xs">
          {role === "CLIENT" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Order payments and refunds</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Track server-confirmed payments and refund requests in your orders. External seller
                payouts remain unavailable.
              </p>
              <div className="pt-1">
                <Link
                  href="/services"
                  className="w-full inline-flex items-center justify-center gap-1 min-h-11 rounded-lg bg-bg-surface border border-border-default dark:border-slate-700 text-[11px] font-semibold text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 shadow-xs transition-colors"
                >
                  <span>{t("hireSpecialist")}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Your seller profile</span>
                </span>
              </div>
              <p className="text-[10px] text-text-muted">
                Manage your profile and service drafts in account settings.
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useDashboard } from "@/context/DashboardContext"
import { CLIENT_NAV_ITEMS, FREELANCER_NAV_ITEMS } from "@/data/dashboard/navigation"
import { motion } from "framer-motion"
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
  const pathname = usePathname()
  const t = useTranslations("dashboard")
  const { role, sidebarCollapsed, toggleSidebar } = useDashboard()

  const navItems = role === "CLIENT" ? CLIENT_NAV_ITEMS : FREELANCER_NAV_ITEMS

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 z-40 select-none",
        sidebarCollapsed ? "w-[72px]" : "w-64"
      )}
      aria-label="Dashboard Sidebar"
    >
      {/* 1. Header: Brand Logo & Collapse Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/60 dark:border-slate-800 shrink-0">
        <Link
          href="/"
          className="flex items-center overflow-hidden outline-none"
          aria-label="TASCORA Home"
        >
          <Logo
            size="md"
            variant={sidebarCollapsed ? "mark" : "full"}
            subtitle={
              sidebarCollapsed ? undefined : role === "CLIENT" ? "Client Portal" : "Creator Studio"
            }
          />
        </Link>

        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                isActive
                  ? "text-slate-900 dark:text-white font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              {/* Active sliding pill background indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-xl -z-10 shadow-xs"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
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
              {!sidebarCollapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0",
                    item.badgeVariant === "gradient"
                      ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot badge */}
              {sidebarCollapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* 3. Bottom Card (Role-Specific, hidden if collapsed) */}
      {!sidebarCollapsed && (
        <div className="p-3.5 m-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          {role === "CLIENT" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Order payments and refunds</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Track server-confirmed payments and refund requests in your orders. External seller
                payouts remain unavailable.
              </p>
              <div className="pt-1">
                <Link
                  href="/services"
                  className="w-full inline-flex items-center justify-center gap-1 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-900 dark:text-white hover:bg-primary/10 hover:text-primary hover:border-primary/30 shadow-xs transition-colors"
                >
                  <span>{t("hireSpecialist")}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Your seller profile</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Manage your profile and service drafts in account settings.
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

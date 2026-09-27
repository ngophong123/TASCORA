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
  Sparkles,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
        "hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-[rgba(15,15,30,0.08)] transition-all duration-300 z-40 select-none",
        sidebarCollapsed ? "w-[72px]" : "w-64"
      )}
      aria-label="Dashboard Sidebar"
    >
      {/* 1. Header: Brand Logo & Collapse Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[rgba(15,15,30,0.06)] shrink-0">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-[1px] shadow-sm shrink-0">
            <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center font-bold text-sm bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">
              T
            </div>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#0B0B14]">
                TASCORA
              </span>
              <span className="text-[10px] font-semibold text-blue-700 tracking-wider uppercase">
                {role === "CLIENT" ? "Client Portal" : "Creator Studio"}
              </span>
            </div>
          )}
        </Link>

        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#FAFAFC] border border-transparent hover:border-[rgba(15,15,30,0.08)] transition-all"
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
                  ? "text-blue-900 font-bold"
                  : "text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#FAFAFC]"
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              {/* Active sliding pill background indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-blue-50 border border-blue-200/80 rounded-xl -z-10 shadow-xs"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-blue-700" : "text-[#6B6B7B] group-hover:text-blue-600"
                )}
              />

              {!sidebarCollapsed && <span className="truncate flex-1">{label}</span>}

              {/* Badge Counter */}
              {!sidebarCollapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0",
                    item.badgeVariant === "gradient"
                      ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-2xs"
                      : "bg-[#F4F4F8] text-[#4B4B5C] border border-[rgba(15,15,30,0.06)]"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot badge */}
              {sidebarCollapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* 3. Bottom Card (Role-Specific, hidden if collapsed) */}
      {!sidebarCollapsed && (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-[#FAFAFC] to-[#F4F4F8] border border-[rgba(15,15,30,0.08)] shadow-2xs">
          {role === "CLIENT" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Escrow Protection</span>
              </div>
              <p className="text-[11px] text-[#6B6B7B] leading-relaxed">
                100% of your deposits are safely held in milestone escrow until deliverables are
                approved.
              </p>
              <div className="pt-1">
                <Link
                  href="/services"
                  className="w-full inline-flex items-center justify-center gap-1 h-8 rounded-lg bg-white border border-[rgba(15,15,30,0.12)] text-[11px] font-semibold text-[#0B0B14] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>{t("hireSpecialist")}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0B0B14] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Profile Strength</span>
                </span>
                <span className="font-mono font-bold text-blue-700 text-[11px]">85%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 w-[85%]" />
              </div>
              <p className="text-[10px] text-[#6B6B7B]">
                Add 2 more portfolio showcases to reach 100% and rank higher.
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

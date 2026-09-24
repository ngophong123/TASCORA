"use client"

import * as React from "react"
import { useDashboard } from "@/context/DashboardContext"
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "@/i18n/routing"

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, role } = useDashboard()
  const [isOpen, setIsOpen] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  // Click outside to dismiss
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Filter notifications relevant to current role
  const relevantNotifications = notifications.filter(
    (n) => n.role === "BOTH" || n.role === role
  )

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
      case "message":
        return <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
      case "payment":
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
      case "system":
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />
    }
  }

  return (
    <div ref={popoverRef} className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-[rgba(15,15,30,0.08)] bg-white text-[#4B4B5C] hover:text-[#0B0B14] hover:bg-[#FAFAFC] hover:border-[rgba(15,15,30,0.18)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[rgba(15,15,30,0.1)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(15,15,30,0.08)] bg-[#FAFAFC]">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B0B14]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-[rgba(15,15,30,0.06)]">
            {relevantNotifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#6B6B7B]">
                No notifications right now
              </div>
            ) : (
              relevantNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 hover:bg-[#FAFAFC] transition-colors cursor-pointer relative",
                    !notif.read && "bg-blue-50/40"
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-[rgba(15,15,30,0.08)] shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-semibold text-[#0B0B14] truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#4B4B5C] leading-snug line-clamp-2">
                      {notif.description}
                    </p>
                    <span className="text-[10px] text-[#8B8B9B] block mt-1 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] text-center">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-[#6B6B7B] hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              <span>Notification preferences</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

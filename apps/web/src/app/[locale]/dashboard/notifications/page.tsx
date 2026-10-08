"use client"
import { Bell, Check } from "lucide-react"
import { ApiState } from "@/components/feedback/ApiState"
import { useDashboard } from "@/context/DashboardContext"
export default function NotificationsPage() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    notificationLoading,
    notificationError,
    reloadNotifications,
  } = useDashboard()
  const unread = notifications.filter((notification) => !notification.read).length
  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Notifications
          </h1>
          <p className="mt-2 text-base text-[var(--text-secondary)]">
            Updates from your orders and conversations.
          </p>
        </div>
        <button
          type="button"
          disabled={notificationLoading || Boolean(notificationError) || !unread}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium disabled:cursor-default disabled:opacity-50"
          onClick={markAllAsRead}
        >
          <Check aria-hidden="true" className="h-4 w-4" />
          Mark all as read
        </button>
      </header>
      <ApiState
        loading={notificationLoading}
        error={notificationError}
        retry={reloadNotifications}
      />
      {!notificationLoading && !notificationError && (
        <section
          aria-label="Notification updates"
          className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
        >
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`flex flex-col gap-4 border-b border-[var(--border-subtle)] p-5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between ${!notification.read ? "bg-[var(--primary-subtle)]" : ""}`}
            >
              <div className="min-w-0">
                <h2 className="break-words text-base font-semibold text-[var(--foreground)]">
                  {notification.title}
                </h2>
                <p className="mt-1 break-words text-sm leading-relaxed text-[var(--text-secondary)]">
                  {notification.description}
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{notification.timestamp}</p>
              </div>
              {!notification.read && (
                <button
                  type="button"
                  className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-[var(--primary)]"
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as read
                </button>
              )}
            </article>
          ))}
          {!notifications.length && (
            <div className="p-10 text-center">
              <Bell aria-hidden="true" className="mx-auto mb-4 h-6 w-6 text-[var(--text-muted)]" />
              <h2 className="text-lg font-semibold">All caught up</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                New notifications will appear here.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

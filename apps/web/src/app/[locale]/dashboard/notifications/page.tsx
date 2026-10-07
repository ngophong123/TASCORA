"use client"
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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0A0A23]">Notifications</h1>
      <ApiState
        loading={notificationLoading}
        error={notificationError}
        retry={reloadNotifications}
      />
      <button
        disabled={notificationLoading || Boolean(notificationError)}
        className="rounded border px-3 py-2"
        onClick={markAllAsRead}
      >
        Mark all as read
      </button>
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        {notifications.map((n) => (
          <article key={n.id} className="rounded border p-3">
            <h2 className="font-semibold">{n.title}</h2>
            <p>{n.description}</p>
            <p className="text-xs">{n.timestamp}</p>
            {!n.read && (
              <button className="underline" onClick={() => markAsRead(n.id)}>
                Mark as read
              </button>
            )}
          </article>
        ))}
        {!notificationLoading && !notificationError && !notifications.length && (
          <p>No notifications.</p>
        )}
      </section>
    </div>
  )
}

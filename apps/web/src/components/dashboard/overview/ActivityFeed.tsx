"use client"
import { type ActivityItem } from "@/data/dashboard/overview"
import { cn } from "@/lib/utils"
export function ActivityFeed({
  activities,
  className,
}: {
  activities: ActivityItem[]
  className?: string
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border border-border-default bg-bg-surface p-5 sm:p-6",
        className
      )}
    >
      <h2 className="mb-5 border-b border-border-default pb-4 text-lg font-semibold">
        Recent activity
      </h2>
      {!activities.length ? (
        <p className="text-sm leading-6 text-text-secondary">
          No recent activity. Order updates will appear here.
        </p>
      ) : (
        <ul className="space-y-5">
          {activities.map((item) => (
            <li key={item.id}>
              <h3 className="text-sm font-semibold leading-6">{item.title}</h3>
              <p className="mt-1 break-words text-sm leading-6 text-text-secondary">
                {item.description}
              </p>
              <p className="mt-2 text-xs text-text-muted">{item.timestamp}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

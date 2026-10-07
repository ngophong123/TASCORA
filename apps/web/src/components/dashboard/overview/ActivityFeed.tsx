"use client"

import * as React from "react"
import { type ActivityItem } from "@/data/dashboard/overview"
import { Activity, CreditCard, Star, CheckCircle2, ShoppingBag, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityFeedProps {
  activities: ActivityItem[]
  className?: string
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
      case "review":
        return <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
      case "milestone":
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
      case "order":
        return <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
      case "message":
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-2 pb-4 border-b border-[rgba(15,15,30,0.06)] mb-4">
        <Activity className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-[#0A0A23]">Recent Activity Feed</h3>
      </div>

      <div className="space-y-4">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-xl bg-[#FAFAFC] border border-[rgba(15,15,30,0.08)] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-[#0A0A23] truncate">{item.title}</span>
                <span className="text-[10px] text-[#8B8B9B] font-mono shrink-0">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-[#6B6B7B] mt-0.5 leading-snug">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

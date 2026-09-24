"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { type ProfileChecklistItem } from "@/data/dashboard/overview"
import { Zap, CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileStrengthCardProps {
  checklist: ProfileChecklistItem[]
  className?: string
}

export function ProfileStrengthCard({ checklist, className }: ProfileStrengthCardProps) {
  const totalPoints = checklist.reduce((acc, i) => acc + i.points, 0)
  const earnedPoints = checklist
    .filter((i) => i.completed)
    .reduce((acc, i) => acc + i.points, 0)

  const percent = Math.round((earnedPoints / totalPoints) * 100)

  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.06)] mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-sm font-bold text-[#0B0B14]">Profile Strength</h3>
        </div>
        <span className="text-sm font-bold font-mono text-blue-700">{percent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="w-full h-2 rounded-full bg-[#EAEAF0] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[11px] text-[#6B6B7B] block">
          Profiles over 80% receive up to 3x more direct client inquiries.
        </span>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-2.5 text-xs p-2.5 rounded-xl border transition-colors",
              item.completed
                ? "bg-[#FAFAFC] border-[rgba(15,15,30,0.06)] text-[#4B4B5C]"
                : "bg-white border-blue-200/80 text-[#0B0B14] shadow-2xs"
            )}
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 stroke-[2]" />
            )}

            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "font-semibold block",
                  item.completed && "line-through text-[#8B8B9B]"
                )}
              >
                {item.label}
              </span>
              <p className="text-[11px] text-[#8B8B9B] mt-0.5">{item.description}</p>
            </div>

            <span className="text-[10px] font-mono font-bold text-[#6B6B7B] bg-black/[0.03] px-1.5 py-0.5 rounded shrink-0">
              +{item.points}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-3 border-t border-[rgba(15,15,30,0.06)]">
        <Link
          href="/dashboard/settings"
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200/60 text-xs font-semibold text-blue-800 transition-colors"
        >
          <span>Complete Profile Settings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

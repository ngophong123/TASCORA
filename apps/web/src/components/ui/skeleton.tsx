import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean
}

/**
 * Base Skeleton component with continuous 1.5s linear shimmer wave
 */
export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md bg-[#F4F4F8] border border-[rgba(15,15,30,0.04)]",
        shimmer ? "animate-shimmer" : "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  gap?: string
  lastLineWidth?: string
}

/**
 * Multi-line paragraph or title skeleton with varied widths
 */
export function SkeletonText({
  lines = 3,
  gap = "gap-2",
  lastLineWidth = "w-3/5",
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col", gap, className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1
        const widthClass = isLast ? lastLineWidth : index === 0 ? "w-full" : "w-4/5"

        return <Skeleton key={index} className={cn("h-3.5 rounded-sm", widthClass)} />
      })}
    </div>
  )
}

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

/**
 * Circular avatar skeleton placeholder
 */
export function SkeletonAvatar({ size = "md", className, ...props }: SkeletonAvatarProps) {
  const sizeMap = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }[size]

  return (
    <Skeleton
      aria-hidden="true"
      className={cn("rounded-full shrink-0", sizeMap, className)}
      {...props}
    />
  )
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean
}

/**
 * Card skeleton matching TASCORA service / project card specifications
 */
export function SkeletonCard({ hasImage = true, className, ...props }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl border border-[rgba(15,15,30,0.08)] bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 overflow-hidden",
        className
      )}
      {...props}
    >
      {hasImage && <Skeleton className="w-full aspect-[16/10] rounded-xl -mt-1" />}

      {/* Header / Avatar Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SkeletonAvatar size="sm" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-2 w-12 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>

      {/* Content Text Lines */}
      <div className="space-y-2 py-1">
        <Skeleton className="h-4 w-11/12 rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>

      {/* Card Footer: Rating + Price */}
      <div className="flex items-center justify-between pt-3 border-t border-[rgba(15,15,30,0.06)]">
        <Skeleton className="h-3.5 w-16 rounded" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-5 w-14 rounded" />
        </div>
      </div>
    </div>
  )
}

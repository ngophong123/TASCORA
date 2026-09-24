"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: "left" | "right"
  pauseOnHover?: boolean
  speed?: number
}

export function Marquee({
  children,
  direction = "left",
  pauseOnHover = true,
  speed = 35,
  className,
  style,
  ...props
}: MarqueeProps) {
  const customStyles = {
    ...style,
    "--marquee-duration": `${speed}s`,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className
      )}
      style={customStyles}
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 gap-12 pr-12 items-center min-w-full animate-marquee will-change-transform",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          direction === "right" && "[animation-direction:reverse]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 gap-12 pr-12 items-center min-w-full animate-marquee will-change-transform",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          direction === "right" && "[animation-direction:reverse]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  )
}


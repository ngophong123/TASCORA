"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { imageUrl, isMediatedImage } from "@/lib/marketplace"

export interface AvatarImageProps {
  src?: string | null
  alt: string
  name?: string
  id?: string
  size?: number
  className?: string
  imageClassName?: string
  rounded?: "full" | "xl" | "lg" | "md"
  priority?: boolean
  showOnlineStatus?: boolean
  isOnline?: boolean
}

const ROUNDED_MAP = {
  full: "rounded-full",
  xl: "rounded-2xl",
  lg: "rounded-xl",
  md: "rounded-lg",
}

export function AvatarImage({
  src,
  alt,
  name,
  size = 36,
  className,
  imageClassName,
  rounded = "full",
  priority = false,
  showOnlineStatus = false,
  isOnline = false,
}: AvatarImageProps) {
  const [imageError, setImageError] = React.useState(false)

  // Resolve to deterministic real portrait if src is missing or empty
  const resolvedSrc = React.useMemo(() => {
    if (imageError) {
      return "/favicon.svg"
    }
    if (src && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"))) {
      return imageUrl(src)
    }
    return "/favicon.svg"
  }, [src, imageError])

  const roundedClass = ROUNDED_MAP[rounded]

  return (
    <div
      className={cn("relative shrink-0 select-none overflow-visible", className)}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(
          "w-full h-full overflow-hidden bg-[#FAFAFC] border border-[rgba(10,10,35,0.08)] shadow-2xs relative",
          roundedClass
        )}
      >
        <Image
          unoptimized={isMediatedImage(resolvedSrc)}
          src={resolvedSrc}
          alt={alt || `${name || "Specialist"} profile photo`}
          width={size * 2} // 2x density for crisp retina display
          height={size * 2}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={() => setImageError(true)}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
            roundedClass,
            imageClassName
          )}
        />
      </div>

      {showOnlineStatus && isOnline && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20"
          title="Online now"
        />
      )}
    </div>
  )
}

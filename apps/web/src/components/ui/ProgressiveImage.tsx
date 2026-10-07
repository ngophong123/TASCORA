"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ImageOff, User } from "lucide-react"

export interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: "generic" | "avatar"
}

/**
 * Image component with shimmer placeholder, smooth fade+scale transition, and graceful error fallback.
 * - Loading: Shimmer background placeholder
 * - Loaded: opacity 0 -> 1, scale 1.02 -> 1 (300ms)
 * - Error: Clean fallback icon preventing broken browser icons
 */
export function ProgressiveImage({
  src,
  alt = "",
  className,
  fallbackType = "generic",
  ...props
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  if (hasError || !src) {
    return (
      <div
        className={cn("flex items-center justify-center bg-[#F4F4F8] text-[#8A8A9A]", className)}
        aria-label={alt || "Fallback image"}
      >
        {fallbackType === "avatar" ? (
          <User className="h-1/2 w-1/2 stroke-[1.5]" />
        ) : (
          <ImageOff className="h-5 w-5 stroke-[1.5]" />
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden bg-[#F4F4F8]", className)}>
      {/* Shimmer Placeholder while loading */}
      {!isLoaded && <div className="absolute inset-0 animate-shimmer" aria-hidden="true" />}

      {/* Image with 300ms fade + subtle scale transition */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-300 ease-out will-change-transform",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02] pointer-events-none"
        )}
        {...props}
      />
    </div>
  )
}

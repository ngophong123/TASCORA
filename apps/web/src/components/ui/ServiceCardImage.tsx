"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { imageUrl, isMediatedImage } from "@/lib/marketplace"

export interface ServiceCardImageProps {
  src?: string | null
  alt: string
  priority?: boolean
  sizes?: string
  className?: string
  containerClassName?: string
  fill?: boolean
  width?: number
  height?: number
}

const DEFAULT_FALLBACK = "/favicon.svg"

export function ServiceCardImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
  containerClassName,
  fill = true,
  width,
  height,
}: ServiceCardImageProps) {
  // Normalize initial source
  const initialSrc = React.useMemo(() => {
    if (!src || src.trim() === "") {
      return DEFAULT_FALLBACK
    }
    return imageUrl(src)
  }, [src])

  const [imgSrc, setImgSrc] = React.useState<string>(initialSrc)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  // Synchronize when src prop changes
  React.useEffect(() => {
    const validSrc = !src || src.trim() === "" ? DEFAULT_FALLBACK : imageUrl(src)
    setImgSrc(validSrc)
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError && imgSrc !== DEFAULT_FALLBACK) {
      setHasError(true)
      setImgSrc(DEFAULT_FALLBACK)
    }
  }

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-[var(--subtle)] select-none",
        containerClassName
      )}
    >
      {/* Loading Shimmer Skeleton */}
      {!isLoaded && (
        <div
          className="absolute inset-0 z-0 animate-pulse bg-[var(--muted-panel)] motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}

      {/* Main Image with Smooth Fade-in & Subtle Hover Scale */}
      <Image
        unoptimized={isMediatedImage(imgSrc)}
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        preload={priority}
        loading={priority ? undefined : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "object-cover transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none",
          imgSrc === DEFAULT_FALLBACK && "object-contain p-[25%] opacity-40",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  )
}

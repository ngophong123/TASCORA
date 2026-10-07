"use client"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/auth-client"
import { imageUrl } from "@/lib/marketplace"
export function UploadImage({
  source,
  alt,
  className,
}: {
  source: string
  alt: string
  className?: string
}) {
  const [preview, setPreview] = useState<{ source: string; url: string }>({ source: "", url: "" })
  useEffect(() => {
    if (!source.startsWith("upload:")) return
    const controller = new AbortController()
    let objectUrl = ""
    async function load() {
      try {
        const response = await apiFetch(`/api/v1/uploads/shared/${source.slice(7)}`, {
          signal: controller.signal,
        })
        if (!response.ok) return
        let url: string
        if (response.headers.get("content-type")?.includes("application/json")) {
          const result = await response.json()
          url = result.data.downloadUrl
        } else {
          const blob = await response.blob()
          objectUrl = URL.createObjectURL(
            blob.slice(
              0,
              blob.size,
              source.endsWith(".png")
                ? "image/png"
                : source.endsWith(".webp")
                  ? "image/webp"
                  : "image/jpeg"
            )
          )
          url = objectUrl
        }
        if (!controller.signal.aborted) setPreview({ source, url })
      } catch {
        /* Missing/private images retain the neutral placeholder. */
      }
    }
    void load()
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [source])
  return (
    <img
      src={
        source.startsWith("upload:")
          ? preview.source === source
            ? preview.url
            : "/favicon.svg"
          : imageUrl(source)
      }
      alt={alt}
      className={className}
    />
  )
}

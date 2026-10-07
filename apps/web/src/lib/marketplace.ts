import { apiFetch } from "./auth-client"
import type { Gig } from "@/data/gigs"

export interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
  bio: string | null
  professionalTitle?: string | null
  country?: string | null
  level?: string
  status?: string
  ratingAverage?: number
  ratingCount?: number
  languages?: string[]
  skills?: string[]
  createdAt?: string
}
export interface ServicePackage {
  id: string
  type: "BASIC" | "STANDARD" | "PREMIUM"
  title: string
  description: string
  price: string | number
  deliveryDays: number
  revisions: number
  features: string[]
}
export interface Service {
  id: string
  title: string
  description: string
  status: string
  seller: Profile
  category: { id: string; name: string; slug: string; parentId?: string | null }
  packages: ServicePackage[]
  images: { url: string }[]
  ratingAverage: number
  ratingCount: number
  createdAt: string
  updatedAt?: string
  reviews?: Review[]
  faqs?: { question: string; answer: string }[]
  requirements?: { description: string }[]
  tags?: { tag: { name: string } }[]
  _count?: { orders: number }
}
export interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  sellerReply?: string | null
  buyer: { buyerProfile: Profile | null }
}
export interface Order extends FinancialOrderFields {
  id: string
  buyerId: string
  status: string
  amount: string
  createdAt: string
  deliveryDate: string | null
  service: Service
  package: ServicePackage
  seller?: Profile
  buyer?: { id: string; email: string; buyerProfile: Profile | null }
  review?: Review | null
  deliveries?: { id: string; message: string; files: string[] }[]
  activities?: { id: string; description: string; createdAt: string }[]
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}
export interface FinancialOrderFields {
  currency?: string
  platformFeeBps?: number
  purchaseSnapshot?: {
    serviceTitle: string
    packageTitle: string
    packageType: ServicePackage["type"]
    sellerName: string
    revisions: number
  }
  revisions?: { id: string; message: string }[]
  refunds?: { id: string; amount: string; status: string; reason: string }[]
  dispute?: { id: string; status: string; description: string } | null
}
export async function requestData<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, options)
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success)
    throw new ApiError(
      response.status,
      result?.error?.code === "PAYMENT_PROVIDER_UNAVAILABLE"
        ? "Payments are temporarily unavailable in this environment."
        : typeof result?.error === "string"
          ? result.error
          : result?.error?.message ||
            (
              {
                401: "Sign in to continue.",
                403: "You do not have permission.",
                404: "Not found.",
              } as Record<number, string>
            )[response.status] ||
            "Unable to complete request. Please retry."
    )
  return result.data as T
}
export const jsonRequest = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
})
export const profileName = (profile?: Profile | null) =>
  [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Member"
export function serviceGig(service: Service): Gig {
  const cheapest = [...service.packages].sort((a, b) => Number(a.price) - Number(b.price))[0]
  const name = profileName(service.seller)
  return {
    id: service.id,
    slug: service.id,
    title: service.title,
    description: service.description,
    categorySlug: service.category.slug,
    categoryName: service.category.name,
    subCategorySlug: "",
    subCategoryName: "",
    startingPrice: Number(cheapest?.price || 0),
    deliveryDays: cheapest?.deliveryDays || 0,
    rating: service.ratingAverage,
    reviewsCount: service.ratingCount,
    coverGradient: "from-blue-600 to-sky-500",
    accentColor: "#2563EB",
    seller: {
      id: service.seller.id,
      name,
      avatarInitials: name.slice(0, 2),
      avatar: imageUrl(service.seller.avatar),
      gradient: "from-blue-600 to-sky-500",
      level:
        service.seller.level === "NEW_SELLER"
          ? "NEW"
          : (service.seller.level as Gig["seller"]["level"]) || "NEW",
      isOnline: false,
      isPro: false,
      country: service.seller.country || "",
      languages: service.seller.languages || [],
    },
    tags: service.tags?.map((t) => t.tag.name) || [],
    createdAt: service.createdAt,
    packages: service.packages.map((p) => ({ ...p, name: p.title, price: Number(p.price) })),
    addons: [],
    faqs: [],
    gallery: service.images.map((i) => ({ url: imageUrl(i.url), alt: service.title })),
    stats: { impressions: 0, clicks: 0, orders: 0, revenue: 0, conversionRate: 0 },
  }
}
import { getApiUrl } from "./api-url"
export function imageUrl(value?: string | null): string {
  if (!value) return "/favicon.svg"
  if (/^upload:[a-zA-Z0-9_-]{1,128}\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(value))
    return `${getApiUrl()}/api/v1/uploads/public/${value.slice(7)}`
  if (value.startsWith("/") && !value.startsWith("//")) return value
  if (isMediatedImage(value)) return value
  try {
    const url = new URL(value)
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      ["images.unsplash.com", "images.pexels.com"].includes(url.hostname)
    )
      return value
  } catch {
    /* Invalid/unapproved image URLs use a neutral placeholder. */
  }
  return "/favicon.svg"
}
export function isMediatedImage(value: string): boolean {
  if (!value.startsWith("http")) return false
  try {
    const url = new URL(value)
    return (
      url.origin === new URL(getApiUrl()).origin &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/api\/v1\/uploads\/public\/[a-zA-Z0-9_-]{1,128}\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(
        url.pathname
      )
    )
  } catch {
    return false
  }
}
export async function uploadFile(file: File): Promise<string> {
  const uploaded = await requestData<{ reference: string }>("/api/v1/uploads", {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  })
  return uploaded.reference
}
export async function downloadUpload(reference: string): Promise<void> {
  if (!/^upload:[a-zA-Z0-9_-]+\/[0-9a-f-]{36}\.(png|jpg|webp|pdf)$/.test(reference))
    throw new Error("Invalid attachment reference")
  const response = await apiFetch(`/api/v1/uploads/shared/${reference.slice(7)}`)
  if (!response.ok) throw new Error("Attachment unavailable or access denied.")
  if (response.headers.get("content-type")?.includes("application/json")) {
    const result = await response.json()
    if (!result.success || !result.data.downloadUrl) throw new Error("Attachment unavailable.")
    const link = document.createElement("a")
    link.href = result.data.downloadUrl
    link.rel = "noopener noreferrer"
    link.click()
  } else {
    const url = URL.createObjectURL(await response.blob())
    const link = document.createElement("a")
    link.href = url
    link.download = reference.split("/").pop()!
    link.click()
    URL.revokeObjectURL(url)
  }
}

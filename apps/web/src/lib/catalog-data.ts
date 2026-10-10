import type { Service } from "./marketplace"

export interface CatalogCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  _count: { services: number }
}
export interface CatalogSnapshot {
  services: Service[]
  categories: CatalogCategory[]
  error: string
}
export type CatalogRequest = <T>(path: string, options?: RequestInit) => Promise<T>

// Preserve existing whole-catalog filter semantics; no truncated result counts.
// Share the loader between the public SSR snapshot and explicit browser retry.
export async function loadCatalog(
  request: CatalogRequest,
  signal: AbortSignal,
  includeCategories = true
): Promise<CatalogSnapshot> {
  const [first, categories] = await Promise.all([
    request<{ services: Service[]; totalPages: number }>("/api/v1/services?limit=50", { signal }),
    includeCategories
      ? request<CatalogCategory[]>("/api/v1/marketplace/categories", { signal })
      : Promise.resolve([]),
  ])
  if (!Number.isSafeInteger(first.totalPages) || first.totalPages < 0)
    throw new Error("Catalog unavailable. Please retry.")
  const services = [...first.services]
  for (let page = 2; page <= first.totalPages; page++) {
    const more = await request<{ services: Service[] }>(`/api/v1/services?limit=50&page=${page}`, {
      signal,
    })
    services.push(...more.services)
  }
  return { services, categories, error: "" }
}

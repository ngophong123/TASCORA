import "server-only"
import { connection } from "next/server"
import { getApiUrl } from "./api-url"
import { loadCatalog, type CatalogSnapshot } from "./catalog-data"

export async function getInitialCatalog(includeCategories = true): Promise<CatalogSnapshot> {
  // Never contact the backend during next build. Stream fresh public data only
  // at request time; no credentials, private API calls or shared persistent cache.
  await connection()
  const signal = AbortSignal.timeout(5000)
  try {
    return await loadCatalog(
      async <T>(path: string): Promise<T> => {
        const response = await fetch(`${getApiUrl()}${path}`, {
          cache: "no-store",
          credentials: "omit",
          signal,
          headers: { Accept: "application/json" },
        })
        const result = await response.json()
        if (!response.ok || !result?.success) throw new Error("Catalog unavailable. Please retry.")
        return result.data as T
      },
      signal,
      includeCategories
    )
  } catch {
    // Truthful error + existing authenticated browser retry. Do not expose an
    // upstream URL, headers, credentials or arbitrary network error in HTML.
    return { services: [], categories: [], error: "Catalog unavailable. Please retry." }
  }
}

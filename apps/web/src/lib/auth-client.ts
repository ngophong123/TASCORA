import { getApiUrl } from "./api-url"

let refreshPromise: Promise<boolean> | null = null
let generation = 0
export async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    const startedAt = generation
    refreshPromise = (async () => {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Protection": "1" },
      })
      if (!response.ok) {
        if (response.status === 401 && generation === startedAt) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
        return false
      }
      const result = await response.json()
      if (startedAt !== generation || !result.success) return false
      localStorage.setItem("token", result.data.accessToken)
      localStorage.setItem("user", JSON.stringify(result.data.user))
      return true
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  if (!path.startsWith("/api/v1/")) throw new Error("Invalid API path")
  const perform = () => {
    const headers = new Headers(options.headers)
    const token = localStorage.getItem("token")
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return fetch(`${getApiUrl()}${path}`, { ...options, headers, credentials: "include" })
  }
  const response = await perform()
  if (response.status === 401 && (await refreshSession())) return perform()
  return response
}
export async function logoutSession(): Promise<void> {
  generation++
  const response = await fetch(`${getApiUrl()}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Protection": "1" },
  })
  if (!response.ok) throw new Error("Unable to sign out. Please retry.")
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

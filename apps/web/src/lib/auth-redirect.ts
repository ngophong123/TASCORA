const SUPPORTED_LOCALES = ["en", "vi"] as const

export function sanitizeRedirectPath(requestedRedirect: string | null | undefined): string {
  const candidate = requestedRedirect || "/dashboard"
  return /^\/(?![/\\])/.test(candidate) && !/[\\\x00-\x1f]/.test(candidate)
    ? candidate
    : "/dashboard"
}

export function resolvePostLoginRedirect(
  requestedRedirect: string | null | undefined,
  userRole: string | null | undefined,
  locale: string | null | undefined
): string {
  const safePath = sanitizeRedirectPath(requestedRedirect)
  const target = safePath === "/dashboard" && userRole === "SELLER" ? "/seller/dashboard" : safePath

  const normalizedLocale =
    locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? locale : null
  if (!normalizedLocale) return target

  const hasLocalePrefix = SUPPORTED_LOCALES.some(
    (loc) => target === `/${loc}` || target.startsWith(`/${loc}/`) || target.startsWith(`/${loc}?`)
  )
  return hasLocalePrefix ? target : `/${normalizedLocale}${target}`
}

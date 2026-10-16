// Next integrates native history with useSearchParams. Local catalog filters
// must not start a fresh RSC/API request on every keystroke or view change.
export function updateCatalogUrl(params: URLSearchParams) {
  const query = params.toString()
  window.history.pushState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`)
}

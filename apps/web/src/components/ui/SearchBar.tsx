"use client"

import { useState, useTransition } from "react"
import { useRouter, Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Search, ArrowRight, X } from "lucide-react"
import { Button } from "./button"
import { useApiResource } from "@/hooks/useApiResource"

const SEARCH_IDEAS = ["Web Development", "UI/UX Design", "Brand Identity"]

export function SearchBar() {
  const router = useRouter()
  const t = useTranslations("search")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [pending, startTransition] = useTransition()
  const categories = useApiResource<{ name: string; slug: string; parentId: string | null }[]>(
    "/api/v1/marketplace/categories"
  )

  return (
    <div className="w-full">
      <form
        role="search"
        aria-label={t("searchButton")}
        onSubmit={(event) => {
          event.preventDefault()
          const params = new URLSearchParams()
          if (query.trim()) params.set("q", query.trim())
          if (category !== "all") params.set("category", category)
          startTransition(() => router.push(`/services?${params.toString()}`))
        }}
        className="premium-panel flex flex-col gap-2 p-2 shadow-sm focus-within:border-primary sm:flex-row sm:items-center"
      >
        <select
          data-testid="hero-category-select"
          aria-label={t("filterCategoryAria")}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="min-h-11 max-w-full rounded-md bg-transparent px-3 text-sm text-text-secondary sm:max-w-36 sm:border-r sm:border-border-default"
        >
          <option value="all">{t("categoryAll")}</option>
          {categories.data
            ?.filter((item) => !item.parentId)
            .map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
        </select>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted" />
          <input
            data-testid="hero-search-input"
            type="search"
            aria-label={t("placeholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("placeholder")}
            className="min-h-11 w-full min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted"
          />
          {query && (
            <button
              type="button"
              aria-label={t("clearSearch")}
              onClick={() => setQuery("")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-bg-subtle"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          data-testid="hero-search-submit"
          isLoading={pending}
          loadingText={t("searching")}
          className="shrink-0 px-5"
        >
          {t("searchButton")}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span>{t("popularLabel")}</span>
        {SEARCH_IDEAS.map((idea) => (
          <Link
            key={idea}
            href={`/services?q=${encodeURIComponent(idea)}`}
            className="inline-flex min-h-9 items-center underline decoration-border-hover underline-offset-4 hover:text-primary"
          >
            {idea}
          </Link>
        ))}
      </div>
    </div>
  )
}

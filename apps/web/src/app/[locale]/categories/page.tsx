"use client"

import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { Link } from "@/i18n/routing"
import { Code2, Palette, TrendingUp, Cpu, Languages, Briefcase, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
  description: string | null
  _count: { services: number }
}
const icons = {
  programming: Code2,
  design: Palette,
  marketing: TrendingUp,
  ai: Cpu,
  writing: Languages,
}

export default function CategoriesPage() {
  const resource = useApiResource<Category[]>("/api/v1/marketplace/categories")
  const t = useTranslations("categoriesPage")
  const categories = resource.data || []
  const parents = categories.filter((category) => !category.parentId)
  return (
    <div className="container mx-auto min-h-[60vh] px-4 py-12 md:px-8 md:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
          {t("badge")}
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[var(--text-secondary)]">
          {t("subtitle")}
        </p>
      </header>
      <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      {!resource.loading && !resource.error && !parents.length && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--text-secondary)]">
          {t("empty")}
        </p>
      )}
      {!resource.loading && !resource.error && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {parents.map((category) => {
            const Icon = icons[category.slug as keyof typeof icons] || Briefcase
            const children = categories.filter((child) => child.parentId === category.id)
            return (
              <article
                key={category.id}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7"
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="text-xs tabular-nums text-[var(--text-muted)]">
                    {t("serviceCount", { count: category._count.services })}
                  </span>
                </div>
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-[var(--foreground)]">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {category.description}
                  </p>
                )}
                {children.length > 0 && (
                  <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
                    <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                      {t("popularDomains")}
                    </p>
                    <ul className="space-y-1">
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/explore?category=${encodeURIComponent(child.slug)}`}
                            className="inline-flex min-h-11 items-center text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href={`/explore?category=${encodeURIComponent(category.slug)}`}
                  className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-sm font-semibold text-[var(--primary)]"
                >
                  {t("exploreCategory", { title: category.name })}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

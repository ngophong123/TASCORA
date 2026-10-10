"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { Logo } from "@/components/ui/Logo"

export const authInput =
  "block min-h-12 w-full rounded-lg border border-border-default bg-bg-surface px-4 text-base text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/20 disabled:bg-bg-subtle disabled:text-text-muted transition-colors motion-reduce:transition-none"
export const authLabel = "mb-2 block text-sm font-medium text-foreground"
export const authToggle =
  "absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg text-text-secondary hover:text-primary"

export function AuthPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    setHydrated(true)
  }, [])
  return (
    <section className="px-4 py-12 sm:py-20" aria-labelledby="auth-title">
      <div className="mx-auto w-full max-w-lg rounded-xl border border-border-default bg-bg-surface p-6 sm:p-10">
        <Link href="/" aria-label="TASCORA Home" className="mb-8 inline-flex min-h-11 items-center">
          <Logo size="md" theme="monochrome" className="text-foreground" />
        </Link>
        <h1
          id="auth-title"
          className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-text-secondary">{description}</p>
        <div className="mt-8">
          <fieldset disabled={!hydrated} className="contents">
            {children}
          </fieldset>
        </div>
      </div>
    </section>
  )
}

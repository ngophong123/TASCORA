"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { Globe, Check, ChevronDown } from "lucide-react"

const LANGUAGES = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI" },
] as const
interface LanguageSwitcherProps {
  className?: string
  align?: "left" | "right"
  compact?: boolean
}
export function LanguageSwitcher({
  className = "",
  align = "right",
  compact = false,
}: LanguageSwitcherProps) {
  const locale = useLocale()
  const t = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const id = React.useId()
  const current = LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0]
  React.useEffect(() => {
    if (!open) return
    optionRefs.current[LANGUAGES.findIndex((language) => language.code === locale)]?.focus()
    const outside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", outside)
    return () => document.removeEventListener("mousedown", outside)
  }, [open, locale])
  const select = (code: "en" | "vi") => {
    setOpen(false)
    triggerRef.current?.focus()
    if (code !== locale)
      router.replace(`${pathname}${window.location.search}${window.location.hash}`, {
        locale: code,
      })
  }
  return (
    <div
      ref={rootRef}
      className={`relative inline-block ${className}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault()
          event.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-testid="language-switcher"
        aria-label={t("switchLanguage")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 text-xs font-semibold text-text-secondary hover:bg-bg-subtle transition-colors motion-reduce:transition-none"
      >
        <Globe aria-hidden="true" className="h-4 w-4 text-primary" />
        <span>{current.shortLabel}</span>
        {!compact && <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div
          id={id}
          role="menu"
          aria-label={t("language")}
          data-testid="language-dropdown"
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-[calc(100%+8px)] z-50 min-w-44 rounded-xl border border-border-default bg-surface-elevated p-1.5 shadow-lg`}
        >
          {LANGUAGES.map((language, index) => (
            <button
              key={language.code}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              type="button"
              role="menuitemradio"
              aria-checked={locale === language.code}
              data-testid={`language-option-${language.code}`}
              onClick={() => select(language.code)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault()
                  optionRefs.current[
                    (index + (event.key === "ArrowDown" ? 1 : -1) + LANGUAGES.length) %
                      LANGUAGES.length
                  ]?.focus()
                }
                if (event.key === "Home" || event.key === "End") {
                  event.preventDefault()
                  optionRefs.current[event.key === "Home" ? 0 : LANGUAGES.length - 1]?.focus()
                }
              }}
              className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-lg px-3 text-left text-sm hover:bg-bg-subtle ${locale === language.code ? "text-primary bg-primary-subtle font-semibold" : "text-text-secondary"}`}
            >
              <span lang={language.code}>{language.label}</span>
              {locale === language.code && <Check aria-hidden="true" className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

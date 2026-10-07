"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { Globe, Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LanguageOption {
  code: "en" | "vi"
  label: string
  shortLabel: string
  flag: string
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", shortLabel: "EN", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI", flag: "🇻🇳" },
]

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
  const currentLocale = useLocale() as "en" | "vi"
  const t = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(
    LANGUAGES.findIndex((l) => l.code === currentLocale)
  )
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const activeLang = LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[0]!

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  // Handle language switch
  const handleSelectLanguage = (newLocale: "en" | "vi") => {
    if (newLocale === currentLocale) {
      setIsOpen(false)
      return
    }
    setIsOpen(false)
    router.replace(pathname, { locale: newLocale })
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    if (e.key === "Escape") {
      e.preventDefault()
      setIsOpen(false)
      buttonRef.current?.focus()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % LANGUAGES.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + LANGUAGES.length) % LANGUAGES.length)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      const selected = LANGUAGES[activeIndex]
      if (selected) {
        handleSelectLanguage(selected.code)
      }
    }
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        data-testid="language-switcher"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("switchLanguage")}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#4B4B5C] hover:text-[#0A0A23] hover:bg-black/[0.04] active:bg-black/[0.06] rounded-xl border border-[rgba(15,15,30,0.08)] bg-white/70 backdrop-blur-md transition-all shadow-[0_1px_3px_rgba(15,15,30,0.04)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
      >
        <Globe className="h-3.5 w-3.5 text-blue-600" />
        <span>
          {compact ? activeLang.shortLabel : `${activeLang.flag} ${activeLang.shortLabel}`}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-[#6B6B7B] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            tabIndex={-1}
            data-testid="language-dropdown"
            className={`absolute ${
              align === "right" ? "right-0" : "left-0"
            } top-[calc(100%+6px)] z-50 min-w-[170px] p-1.5 bg-white/95 backdrop-blur-xl border border-[rgba(15,15,30,0.08)] rounded-2xl shadow-[0_10px_30px_-5px_rgba(15,15,30,0.12),0_4px_10px_-2px_rgba(15,15,30,0.06)] focus:outline-none`}
          >
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A8A9A]">
              {t("language")}
            </div>

            <div className="flex flex-col gap-0.5">
              {LANGUAGES.map((lang, index) => {
                const isSelected = lang.code === currentLocale
                const isFocused = index === activeIndex

                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    data-testid={`language-option-${lang.code}`}
                    aria-selected={isSelected}
                    onClick={() => handleSelectLanguage(lang.code)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-blue-50/90 text-blue-700 font-semibold"
                        : isFocused
                          ? "bg-black/[0.04] text-[#0A0A23]"
                          : "text-[#4B4B5C] hover:text-[#0A0A23] hover:bg-black/[0.03]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

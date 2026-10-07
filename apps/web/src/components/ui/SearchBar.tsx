"use client"

import * as React from "react"
import { useRouter, Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Search, ChevronDown, Sparkles, ArrowRight, X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

const AUTOCOMPLETE_SUGGESTIONS = [
  { text: "Next.js Full-Stack Architecture", category: "Programming" },
  { text: "Design System & Figma Tokens", category: "Design" },
  { text: "Autonomous AI Agent Workflow", category: "AI & Automation" },
  { text: "B2B SaaS UI/UX Design", category: "Design" },
  { text: "Audited Smart Contract Development", category: "Programming" },
  { text: "Editorial Brand Identity & Typography", category: "Design" },
  { text: "Cloud DevOps & Kubernetes Cluster", category: "Programming" },
  { text: "Commercial 3D Product Animation", category: "Video & 3D" },
]

const POPULAR_TAGS = [
  "Web Development",
  "UI/UX Design",
  "Logo Design",
  "Video Editing",
  "AI Services",
]

export function SearchBar() {
  const router = useRouter()
  const t = useTranslations("search")
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("all")
  const [isFocused, setIsFocused] = React.useState(false)
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  const filteredSuggestions = React.useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return AUTOCOMPLETE_SUGGESTIONS.filter(
      (item) =>
        item.text.toLowerCase().includes(lower) || item.category.toLowerCase().includes(lower)
    ).slice(0, 5)
  }, [query])

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault()
    if (isSearching) return
    setIsSearching(true)
    const targetQuery = customQuery !== undefined ? customQuery : query
    const params = new URLSearchParams()
    if (targetQuery.trim()) params.set("q", targetQuery.trim())
    if (category !== "all") params.set("category", category)
    setShowDropdown(false)
    router.push(`/services?${params.toString()}`)
    // Reset loading state after transition initiates
    setTimeout(() => {
      setIsSearching(false)
    }, 1200)
  }

  const handleSelectSuggestion = (text: string) => {
    setQuery(text)
    handleSubmit(undefined, text)
  }

  return (
    <div ref={wrapperRef} className="w-full max-w-3xl flex flex-col items-center">
      {/* Search Console Bar */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative w-full rounded-lg p-2 sm:p-2",
          "bg-white border border-[#E2E8F0]",
          "shadow-xs",
          "flex flex-col sm:flex-row items-center gap-2 transition-all duration-200",
          isFocused
            ? "border-[#635BFF] ring-2 ring-[#635BFF]/15 shadow-sm"
            : "hover:border-[#CBD5E1]"
        )}
      >
        {/* Category Selector on the Left */}
        <div className="relative flex items-center shrink-0 w-full sm:w-auto px-3 sm:px-2 border-b sm:border-b-0 sm:border-r border-[#E2E8F0] pb-2 sm:pb-0">
          <select
            data-testid="hero-category-select"
            disabled={!isHydrated}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-transparent text-xs font-medium text-[#475569] hover:text-[#0F172A] pr-7 pl-2 py-1.5 outline-none cursor-pointer transition-colors"
            aria-label={t("filterCategoryAria")}
          >
            <option value="all" className="bg-white text-[#0F172A]">
              {t("categoryAll")}
            </option>
            <option value="programming" className="bg-white text-[#0F172A]">
              {t("categoryProgramming")}
            </option>
            <option value="design" className="bg-white text-[#0F172A]">
              {t("categoryDesign")}
            </option>
            <option value="ai" className="bg-white text-[#0F172A]">
              {t("categoryAi")}
            </option>
            <option value="marketing" className="bg-white text-[#0F172A]">
              {t("categoryMarketing")}
            </option>
            <option value="video" className="bg-white text-[#0F172A]">
              {t("categoryVideo")}
            </option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-[#64748B]" />
        </div>

        {/* Search Input in Middle */}
        <div className="relative flex items-center flex-1 w-full px-3 gap-2.5">
          <Search
            className={cn(
              "h-4 w-4 shrink-0 transition-all duration-200",
              isSearching ? "text-[#635BFF] animate-spin" : "text-[#64748B]"
            )}
          />
          <input
            type="text"
            data-testid="hero-search-input"
            disabled={!isHydrated}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => {
              setIsFocused(true)
              if (query.trim()) setShowDropdown(true)
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={t("placeholder")}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-[#0F172A] placeholder:text-[#94A3B8] py-1.5"
          />
          {query && !isSearching && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setShowDropdown(false)
              }}
              className="p-1 text-[#64748B] hover:text-[#0F172A] transition-colors"
              aria-label={t("clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <div className="w-full sm:w-auto px-1 sm:px-0">
          <Button
            type="submit"
            data-testid="hero-search-submit"
            disabled={!isHydrated}
            size="md"
            variant="primary"
            isLoading={isSearching}
            loadingText={t("searching")}
            className="w-full sm:w-auto px-6 shadow-xs"
          >
            <span>{t("searchButton")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && filteredSuggestions.length > 0 && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-lg bg-white border border-[#E2E8F0] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] border-b border-[#E2E8F0] flex items-center justify-between">
              <span>{t("suggestedMatches")}</span>
              <Sparkles className="h-3 w-3 text-[#635BFF]" />
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion(item.text)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="h-3.5 w-3.5 text-[#635BFF] group-hover:scale-105 transition-transform" />
                    <span className="text-sm text-[#0F172A] group-hover:text-[#635BFF] font-medium">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] group-hover:text-[#635BFF] transition-colors font-medium">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Popular Chips Row */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 text-[11px] sm:text-xs">
        <span className="text-[#64748B] font-medium mr-1">{t("popularLabel")}</span>
        {POPULAR_TAGS.map((tag) => (
          <Link
            key={tag}
            href={`/explore?q=${encodeURIComponent(tag)}`}
            className="px-2.5 sm:px-3 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#635BFF] hover:border-[#635BFF]/30 hover:bg-[#635BFF]/10 transition-colors duration-150"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}

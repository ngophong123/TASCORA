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
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const filteredSuggestions = React.useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return AUTOCOMPLETE_SUGGESTIONS.filter(
      (item) =>
        item.text.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
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
    const targetQuery = customQuery !== undefined ? customQuery : query
    const params = new URLSearchParams()
    if (targetQuery.trim()) params.set("q", targetQuery.trim())
    if (category !== "all") params.set("category", category)
    setShowDropdown(false)
    router.push(`/explore?${params.toString()}`)
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
          "relative w-full rounded-2xl sm:rounded-full p-2 sm:p-2",
          "bg-white/95 backdrop-blur-xl border border-[rgba(15,15,30,0.12)]",
          "shadow-[0_8px_24px_-8px_rgba(15,15,30,0.12)]",
          "flex flex-col sm:flex-row items-center gap-2 transition-all duration-300",
          isFocused ? "border-blue-600 ring-2 ring-blue-500/25 shadow-[0_12px_32px_-8px_rgba(37,99,235,0.25)]" : "hover:border-[rgba(15,15,30,0.2)]"
        )}
      >
        {/* Category Selector on the Left */}
        <div className="relative flex items-center shrink-0 w-full sm:w-auto px-3 sm:px-2 border-b sm:border-b-0 sm:border-r border-[rgba(15,15,30,0.1)] pb-2 sm:pb-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-transparent text-xs font-medium text-[#4B4B5C] hover:text-[#0B0B14] pr-7 pl-2 py-1.5 outline-none cursor-pointer transition-colors"
            aria-label={t("filterCategoryAria")}
          >
            <option value="all" className="bg-white text-[#0B0B14]">{t("categoryAll")}</option>
            <option value="programming" className="bg-white text-[#0B0B14]">{t("categoryProgramming")}</option>
            <option value="design" className="bg-white text-[#0B0B14]">{t("categoryDesign")}</option>
            <option value="ai" className="bg-white text-[#0B0B14]">{t("categoryAi")}</option>
            <option value="marketing" className="bg-white text-[#0B0B14]">{t("categoryMarketing")}</option>
            <option value="video" className="bg-white text-[#0B0B14]">{t("categoryVideo")}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-[#6B6B7B]" />
        </div>

        {/* Search Input in Middle */}
        <div className="relative flex items-center flex-1 w-full px-3 gap-2.5">
          <Search className="h-4 w-4 text-blue-600 shrink-0" />
          <input
            type="text"
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
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-[#0B0B14] placeholder:text-[#6B6B7B] py-1.5"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setShowDropdown(false)
              }}
              className="p-1 text-[#6B6B7B] hover:text-[#0B0B14] transition-colors"
              aria-label={t("clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Gradient Search Pill Button */}
        <div className="w-full sm:w-auto px-1 sm:px-0">
          <Button
            type="submit"
            size="md"
            variant="primary"
            pill
            className="w-full sm:w-auto px-7 shadow-md"
          >
            <span>{t("searchButton")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && filteredSuggestions.length > 0 && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-2xl bg-white/98 backdrop-blur-2xl border border-[rgba(15,15,30,0.1)] shadow-[0_20px_50px_rgba(15,15,30,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B7B] border-b border-[rgba(15,15,30,0.06)] flex items-center justify-between">
              <span>{t("suggestedMatches")}</span>
              <Sparkles className="h-3 w-3 text-blue-600" />
            </div>
            <div className="divide-y divide-[rgba(15,15,30,0.06)]">
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion(item.text)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-blue-50/70 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-[#0B0B14] group-hover:text-blue-950 font-medium">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B6B7B] group-hover:text-blue-700 transition-colors font-medium">
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
        <span className="text-[#6B6B7B] font-medium mr-1">{t("popularLabel")}</span>
        {POPULAR_TAGS.map((tag) => (
          <Link
            key={tag}
            href={`/explore?q=${encodeURIComponent(tag)}`}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] text-[#4B4B5C] hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}

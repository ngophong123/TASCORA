"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useDashboard } from "@/context/DashboardContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Bookmark,
  CreditCard,
  Settings,
  Briefcase,
  Wallet,
  ArrowRightLeft,
  PlusCircle,
  X,
  Compass,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandOption {
  id: string
  title: string
  subtitle?: string
  category: "Navigation" | "Role Mode" | "Quick Actions"
  icon: React.ElementType
  shortcut?: string
  action: () => void
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, role, setRole, showToast } = useDashboard()
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input when opened
  React.useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  // Build commands list
  const commands: CommandOption[] = React.useMemo(() => {
    const list: CommandOption[] = [
      // Navigation
      {
        id: "nav-overview",
        title: "Overview",
        subtitle: "Main dashboard analytics & activity",
        category: "Navigation",
        icon: LayoutDashboard,
        action: () => router.push("/dashboard"),
      },
      {
        id: "nav-orders",
        title: "Orders",
        subtitle: "View active and completed milestone orders",
        category: "Navigation",
        icon: ShoppingBag,
        action: () => router.push("/dashboard/orders"),
      },
      {
        id: "nav-messages",
        title: "Messages",
        subtitle: "Client and freelancer conversation threads",
        category: "Navigation",
        icon: MessageSquare,
        action: () => router.push("/dashboard/messages"),
      },
      {
        id: "nav-settings",
        title: "Settings",
        subtitle: "Profile, security, and account preferences",
        category: "Navigation",
        icon: Settings,
        action: () => router.push("/dashboard/settings"),
      },
      {
        id: "nav-services",
        title: "Browse Services Catalog",
        subtitle: "Explore 48+ verified gigs and specialists",
        category: "Navigation",
        icon: Compass,
        action: () => router.push("/services"),
      },
    ]

    if (role === "CLIENT") {
      list.push(
        {
          id: "nav-saved",
          title: "Saved Freelancers",
          subtitle: "Bookmarked specialists and top talent",
          category: "Navigation",
          icon: Bookmark,
          action: () => router.push("/dashboard/saved"),
        },
        {
          id: "nav-payments",
          title: "Payments & Invoices",
          subtitle: "Milestone escrow deposits and receipts",
          category: "Navigation",
          icon: CreditCard,
          action: () => router.push("/dashboard/payments"),
        }
      )
    } else {
      list.push(
        {
          id: "nav-gigs",
          title: "My Gigs",
          subtitle: "Manage your active service listings and metrics",
          category: "Navigation",
          icon: Briefcase,
          action: () => router.push("/dashboard/gigs"),
        },
        {
          id: "nav-earnings",
          title: "Earnings",
          subtitle: "Revenue breakdown and withdrawal management",
          category: "Navigation",
          icon: Wallet,
          action: () => router.push("/dashboard/earnings"),
        }
      )
    }

    // Role Switch
    list.push({
      id: "role-switch",
      title: role === "CLIENT" ? "Switch to Freelancer Mode" : "Switch to Client Mode",
      subtitle: `Currently active as ${role}`,
      category: "Role Mode",
      icon: ArrowRightLeft,
      shortcut: "Tab",
      action: () => {
        const nextRole = role === "CLIENT" ? "FREELANCER" : "CLIENT"
        setRole(nextRole)
        showToast({
          title: `Switched to ${nextRole} mode`,
          message: "Navigation and overview updated to reflect your role.",
          type: "info",
        })
      },
    })

    // Quick Actions
    if (role === "FREELANCER") {
      list.push({
        id: "action-new-gig",
        title: "Create New Gig Listing",
        subtitle: "Launch a new specialized freelance service",
        category: "Quick Actions",
        icon: PlusCircle,
        action: () => router.push("/dashboard/gigs/create"),
      })
    } else {
      list.push({
        id: "action-post-job",
        title: "Explore Talent for Hire",
        subtitle: "Search verified freelance architects and engineers",
        category: "Quick Actions",
        icon: Compass,
        action: () => router.push("/services"),
      })
    }

    return list
  }, [role, router, setRole, showToast])

  // Filter commands
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase().trim()
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }, [commands, query])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return

      if (e.key === "Escape") {
        e.preventDefault()
        setCommandPaletteOpen(false)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1))
      } else if (e.key === "Enter" && filteredCommands.length > 0) {
        e.preventDefault()
        const selected = filteredCommands[selectedIndex]
        if (selected) {
          selected.action()
          setCommandPaletteOpen(false)
        }
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [commandPaletteOpen, filteredCommands, selectedIndex, setCommandPaletteOpen])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-white rounded-2xl border border-[rgba(15,15,30,0.12)] shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-[rgba(15,15,30,0.08)]">
              <Search className="w-5 h-5 text-[#6B6B7B] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Type a command, page, or action..."
                className="w-full h-14 bg-transparent text-sm text-[#0B0B14] placeholder-[#8B8B9B] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-[#8B8B9B] hover:text-[#0B0B14]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 ml-2 text-[10px] font-mono font-semibold text-[#6B6B7B] bg-[#FAFAFC] border border-[rgba(15,15,30,0.12)] rounded-md shadow-2xs select-none">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#6B6B7B]">
                  No matching commands found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredCommands.map((item, index) => {
                  const Icon = item.icon
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        item.action()
                        setCommandPaletteOpen(false)
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors",
                        isSelected
                          ? "bg-blue-50 text-blue-900"
                          : "text-[#4B4B5C] hover:bg-[#FAFAFC]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "bg-blue-600 text-white" : "bg-[#F4F4F8] text-[#6B6B7B]"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold block text-[#0B0B14] truncate">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-[11px] text-[#6B6B7B] block truncate">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#8B8B9B] px-1.5 py-0.5 bg-black/[0.03] rounded">
                          {item.category}
                        </span>
                        {item.shortcut && (
                          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/[0.04] text-[#6B6B7B]">
                            {item.shortcut}
                          </kbd>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer tips */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAFC] border-t border-[rgba(15,15,30,0.08)] text-[11px] text-[#6B6B7B]">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="font-mono bg-white border border-[rgba(15,15,30,0.1)] px-1.5 py-0.5 rounded text-[10px] shadow-2xs mr-1">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span>
                  <kbd className="font-mono bg-white border border-[rgba(15,15,30,0.1)] px-1.5 py-0.5 rounded text-[10px] shadow-2xs mr-1">
                    ↵
                  </kbd>{" "}
                  Select
                </span>
              </div>
              <span className="text-blue-600 font-medium">TASCORA Command</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

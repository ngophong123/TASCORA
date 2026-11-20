import type { DashboardRole } from "@/data/dashboard/types"

export type CommandCategory = "Navigation" | "Role Mode" | "Quick Actions"

export type CommandIconKey =
  | "LayoutDashboard"
  | "ShoppingBag"
  | "MessageSquare"
  | "Settings"
  | "Compass"
  | "Bookmark"
  | "CreditCard"
  | "Briefcase"
  | "Wallet"
  | "ArrowRightLeft"
  | "PlusCircle"

export interface CommandItemDefinition {
  id: string
  title: string
  subtitle?: string
  category: CommandCategory
  iconKey: CommandIconKey
  shortcut?: string
  href?: string
  kind: "navigate" | "switch-role"
}

export function getCommandPaletteItems(role: DashboardRole): CommandItemDefinition[] {
  const list: CommandItemDefinition[] = [
    {
      id: "nav-overview",
      title: "Overview",
      subtitle: "Main dashboard orders & activity",
      category: "Navigation",
      iconKey: "LayoutDashboard",
      href: "/dashboard",
      kind: "navigate",
    },
    {
      id: "nav-orders",
      title: "Orders",
      subtitle: "View active and completed orders",
      category: "Navigation",
      iconKey: "ShoppingBag",
      href: "/dashboard/orders",
      kind: "navigate",
    },
    {
      id: "nav-messages",
      title: "Messages",
      subtitle: "Client and freelancer conversation threads",
      category: "Navigation",
      iconKey: "MessageSquare",
      href: "/dashboard/messages",
      kind: "navigate",
    },
    {
      id: "nav-settings",
      title: "Settings",
      subtitle: "Profile, KYC, and account preferences",
      category: "Navigation",
      iconKey: "Settings",
      href: "/dashboard/settings",
      kind: "navigate",
    },
    {
      id: "nav-services",
      title: "Browse Services Catalog",
      subtitle: "Explore verified services and specialists",
      category: "Navigation",
      iconKey: "Compass",
      href: "/services",
      kind: "navigate",
    },
  ]

  if (role === "CLIENT") {
    list.push(
      {
        id: "nav-saved",
        title: "Saved Services",
        subtitle: "Bookmarked services for your next project",
        category: "Navigation",
        iconKey: "Bookmark",
        href: "/dashboard/saved",
        kind: "navigate",
      },
      {
        id: "nav-payments",
        title: "Payments & Billing",
        subtitle: "Server-confirmed order payment and refund history",
        category: "Navigation",
        iconKey: "CreditCard",
        href: "/dashboard/payments",
        kind: "navigate",
      }
    )
  } else {
    list.push(
      {
        id: "nav-gigs",
        title: "My Gigs",
        subtitle: "Manage your service listings and publication status",
        category: "Navigation",
        iconKey: "Briefcase",
        href: "/dashboard/gigs",
        kind: "navigate",
      },
      {
        id: "nav-earnings",
        title: "Earnings",
        subtitle: "Ledger balances and payout request status",
        category: "Navigation",
        iconKey: "Wallet",
        href: "/dashboard/earnings",
        kind: "navigate",
      }
    )
  }

  list.push({
    id: "role-switch",
    title: role === "CLIENT" ? "Switch to Freelancer Mode" : "Switch to Client Mode",
    subtitle: `Currently active as ${role}`,
    category: "Role Mode",
    iconKey: "ArrowRightLeft",
    shortcut: "Tab",
    kind: "switch-role",
  })

  if (role === "FREELANCER") {
    list.push({
      id: "action-new-gig",
      title: "Create New Gig Listing",
      subtitle: "Launch a new specialized freelance service",
      category: "Quick Actions",
      iconKey: "PlusCircle",
      href: "/dashboard/gigs/new",
      kind: "navigate",
    })
  } else {
    list.push({
      id: "action-post-job",
      title: "Explore Talent for Hire",
      subtitle: "Search verified freelance specialists and services",
      category: "Quick Actions",
      iconKey: "Compass",
      href: "/services",
      kind: "navigate",
    })
  }

  return list
}

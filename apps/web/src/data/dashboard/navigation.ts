import { type NavItem } from "./types"

export const CLIENT_NAV_ITEMS: NavItem[] = [
  {
    id: "nav-overview",
    label: "Overview",
    href: "/dashboard",
    iconName: "LayoutDashboard",
    role: "CLIENT",
  },
  {
    id: "nav-orders",
    label: "Orders",
    href: "/dashboard/orders",
    iconName: "ShoppingBag",
    badge: 3,
    badgeVariant: "default",
    role: "CLIENT",
  },
  {
    id: "nav-messages",
    label: "Messages",
    href: "/dashboard/messages",
    iconName: "MessageSquare",
    badge: 2,
    badgeVariant: "gradient",
    role: "CLIENT",
  },
  {
    id: "nav-saved",
    label: "Saved",
    href: "/dashboard/saved",
    iconName: "Bookmark",
    role: "CLIENT",
  },
  {
    id: "nav-payments",
    label: "Payments",
    href: "/dashboard/payments",
    iconName: "CreditCard",
    role: "CLIENT",
  },
  {
    id: "nav-settings",
    label: "Settings",
    href: "/dashboard/settings",
    iconName: "Settings",
    role: "CLIENT",
  },
]

export const FREELANCER_NAV_ITEMS: NavItem[] = [
  {
    id: "nav-overview",
    label: "Overview",
    href: "/dashboard",
    iconName: "LayoutDashboard",
    role: "FREELANCER",
  },
  {
    id: "nav-orders",
    label: "Orders",
    href: "/dashboard/orders",
    iconName: "ClipboardList",
    badge: 4,
    badgeVariant: "default",
    role: "FREELANCER",
  },
  {
    id: "nav-gigs",
    label: "My Gigs",
    href: "/dashboard/gigs",
    iconName: "Briefcase",
    role: "FREELANCER",
  },
  {
    id: "nav-messages",
    label: "Messages",
    href: "/dashboard/messages",
    iconName: "MessageSquare",
    badge: 2,
    badgeVariant: "gradient",
    role: "FREELANCER",
  },
  {
    id: "nav-earnings",
    label: "Earnings",
    href: "/dashboard/earnings",
    iconName: "Wallet",
    role: "FREELANCER",
  },
  {
    id: "nav-settings",
    label: "Settings",
    href: "/dashboard/settings",
    iconName: "Settings",
    role: "FREELANCER",
  },
]

export const CLIENT_BOTTOM_TABS: NavItem[] = [
  {
    id: "tab-overview",
    label: "Overview",
    href: "/dashboard",
    iconName: "LayoutDashboard",
    role: "CLIENT",
  },
  {
    id: "tab-orders",
    label: "Orders",
    href: "/dashboard/orders",
    iconName: "ShoppingBag",
    badge: 3,
    role: "CLIENT",
  },
  {
    id: "tab-messages",
    label: "Messages",
    href: "/dashboard/messages",
    iconName: "MessageSquare",
    badge: 2,
    role: "CLIENT",
  },
  {
    id: "tab-settings",
    label: "Settings",
    href: "/dashboard/settings",
    iconName: "Settings",
    role: "CLIENT",
  },
]

export const FREELANCER_BOTTOM_TABS: NavItem[] = [
  {
    id: "tab-overview",
    label: "Overview",
    href: "/dashboard",
    iconName: "LayoutDashboard",
    role: "FREELANCER",
  },
  {
    id: "tab-orders",
    label: "Orders",
    href: "/dashboard/orders",
    iconName: "ClipboardList",
    badge: 4,
    role: "FREELANCER",
  },
  {
    id: "tab-gigs",
    label: "My Gigs",
    href: "/dashboard/gigs",
    iconName: "Briefcase",
    role: "FREELANCER",
  },
  {
    id: "tab-earnings",
    label: "Earnings",
    href: "/dashboard/earnings",
    iconName: "Wallet",
    role: "FREELANCER",
  },
]

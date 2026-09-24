export type DashboardRole = "CLIENT" | "FREELANCER"

export interface NavItem {
  id: string
  label: string
  href: string
  iconName: string
  badge?: string | number
  badgeVariant?: "default" | "success" | "warning" | "gradient"
  role: "CLIENT" | "FREELANCER" | "BOTH"
}

export type NotificationType = "order" | "message" | "payment" | "system"

export interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: NotificationType
  href?: string
  role: "CLIENT" | "FREELANCER" | "BOTH"
}

export interface CommandAction {
  id: string
  title: string
  subtitle?: string
  category: "Navigation" | "Actions" | "Switch Role" | "Account"
  shortcut?: string
  iconName: string
  perform: () => void
}

export interface ToastItem {
  id: string
  title: string
  message?: string
  type?: "success" | "info" | "warning" | "error"
  duration?: number
}

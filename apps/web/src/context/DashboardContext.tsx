"use client"

import * as React from "react"
import { type DashboardRole, type NotificationItem, type ToastItem } from "@/data/dashboard/types"
import { MOCK_NOTIFICATIONS } from "@/data/dashboard/notifications"
import { INITIAL_ORDERS, type DashboardOrder, type DeliveryFile } from "@/data/dashboard/orders"

interface DashboardContextType {
  role: DashboardRole
  setRole: (role: DashboardRole) => void
  toggleRole: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  isMobileDrawerOpen: boolean
  setIsMobileDrawerOpen: (open: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  toast: ToastItem | null
  showToast: (toast: Omit<ToastItem, "id">) => void
  dismissToast: () => void

  // Orders State & Actions
  orders: DashboardOrder[]
  selectedOrderId: string | null
  setSelectedOrderId: (id: string | null) => void
  approveMilestone: (orderId: string, milestoneId: string) => void
  requestRevision: (orderId: string, note: string) => void
  deliverWork: (orderId: string, milestoneId: string, note: string, files: DeliveryFile[]) => void
}

const DashboardContext = React.createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Role State (Client / Freelancer)
  const [role, setRoleState] = React.useState<DashboardRole>("CLIENT")
  // Sidebar State (256px / 72px)
  const [sidebarCollapsed, setSidebarCollapsedState] = React.useState<boolean>(false)
  // Mobile Off-canvas Drawer
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false)
  // Command Palette (Cmd+K)
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)
  // Notifications
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(MOCK_NOTIFICATIONS)
  // Toast
  const [toast, setToast] = React.useState<ToastItem | null>(null)

  // Orders State
  const [orders, setOrders] = React.useState<DashboardOrder[]>(INITIAL_ORDERS)
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)

  // Initialize from localStorage safely
  React.useEffect(() => {
    try {
      const savedRole = localStorage.getItem("tascora_dashboard_role") as DashboardRole | null
      if (savedRole === "CLIENT" || savedRole === "FREELANCER") {
        setRoleState(savedRole)
      }
      const savedCollapse = localStorage.getItem("tascora_sidebar_collapsed")
      if (savedCollapse !== null) {
        setSidebarCollapsedState(savedCollapse === "true")
      }
      const savedOrders = localStorage.getItem("tascora_dashboard_orders")
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Listen for global Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const setRole = React.useCallback((newRole: DashboardRole) => {
    setRoleState(newRole)
    try {
      localStorage.setItem("tascora_dashboard_role", newRole)
    } catch {}
  }, [])

  const toggleRole = React.useCallback(() => {
    setRoleState((prev) => {
      const next = prev === "CLIENT" ? "FREELANCER" : "CLIENT"
      try {
        localStorage.setItem("tascora_dashboard_role", next)
      } catch {}
      return next
    })
  }, [])

  const setSidebarCollapsed = React.useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed)
    try {
      localStorage.setItem("tascora_sidebar_collapsed", String(collapsed))
    } catch {}
  }, [])

  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev
      try {
        localStorage.setItem("tascora_sidebar_collapsed", String(next))
      } catch {}
      return next
    })
  }, [])

  // Notification actions
  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read && (n.role === "BOTH" || n.role === role)).length
  }, [notifications, role])

  // Toast actions
  const dismissToast = React.useCallback(() => {
    setToast(null)
  }, [])

  const showToast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}`
    setToast({ ...item, id })
    const duration = item.duration || 4000
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, duration)
  }, [])

  // Order Actions
  const approveMilestone = React.useCallback(
    (orderId: string, milestoneId: string) => {
      setOrders((prev) => {
        const nextOrders = prev.map((order) => {
          if (order.id !== orderId) return order

          let allCompleted = true
          const updatedMilestones = order.milestones.map((m, idx) => {
            if (m.id === milestoneId) {
              return { ...m, status: "completed" as const, approvedAt: "Today, just now" }
            }
            // If previous milestone completed and next was pending, advance it
            if (m.status === "pending" && order.milestones[idx - 1]?.id === milestoneId) {
              return { ...m, status: "in_progress" as const }
            }
            if (m.status !== "completed") {
              allCompleted = false
            }
            return m
          })

          const newStatus = allCompleted ? ("completed" as const) : ("active" as const)

          return {
            ...order,
            status: newStatus,
            milestones: updatedMilestones,
          }
        })

        try {
          localStorage.setItem("tascora_dashboard_orders", JSON.stringify(nextOrders))
        } catch {}

        return nextOrders
      })

      showToast({
        title: "Payment Released & Milestone Approved",
        message: "Escrow funds have been successfully transferred to the specialist's wallet.",
        type: "success",
      })

      // Add notification
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Milestone payment released for ${orderId}`,
          description: "Escrow contract updated with digital receipt signature.",
          timestamp: "Just now",
          read: false,
          type: "payment",
          role: "BOTH",
        },
        ...prev,
      ])
    },
    [showToast]
  )

  const requestRevision = React.useCallback(
    (orderId: string, note: string) => {
      setOrders((prev) => {
        const nextOrders = prev.map((order) => {
          if (order.id !== orderId) return order

          const updatedMilestones = order.milestones.map((m) =>
            m.status === "in_review" ? { ...m, status: "in_progress" as const } : m
          )

          const newRevision = {
            id: `rev-${Date.now()}`,
            requestedAt: "Today, just now",
            note,
          }

          return {
            ...order,
            status: "active" as const,
            milestones: updatedMilestones,
            revisions: [newRevision, ...order.revisions],
          }
        })

        try {
          localStorage.setItem("tascora_dashboard_orders", JSON.stringify(nextOrders))
        } catch {}

        return nextOrders
      })

      showToast({
        title: "Revision Request Submitted",
        message: "The specialist has been notified with your change instructions.",
        type: "info",
      })

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Revision requested on ${orderId}`,
          description: note.slice(0, 75) + "...",
          timestamp: "Just now",
          read: false,
          type: "order",
          role: "BOTH",
        },
        ...prev,
      ])
    },
    [showToast]
  )

  const deliverWork = React.useCallback(
    (orderId: string, milestoneId: string, note: string, files: DeliveryFile[]) => {
      setOrders((prev) => {
        const nextOrders = prev.map((order) => {
          if (order.id !== orderId) return order

          const updatedMilestones = order.milestones.map((m) =>
            m.id === milestoneId ? { ...m, status: "in_review" as const } : m
          )

          const newDelivery = {
            id: `del-${Date.now()}`,
            milestoneId,
            note,
            submittedAt: "Today, just now",
            files:
              files.length > 0
                ? files
                : [{ name: "deliverables-package.zip", size: "18.4 MB", type: "zip" as const }],
          }

          return {
            ...order,
            status: "delivered" as const,
            milestones: updatedMilestones,
            deliveries: [newDelivery, ...order.deliveries],
          }
        })

        try {
          localStorage.setItem("tascora_dashboard_orders", JSON.stringify(nextOrders))
        } catch {}

        return nextOrders
      })

      showToast({
        title: "Milestone Deliverable Submitted",
        message: "Files delivered! The client has been notified to review and release payment.",
        type: "success",
      })

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `New files delivered for ${orderId}`,
          description: note.slice(0, 75) + "...",
          timestamp: "Just now",
          read: false,
          type: "order",
          role: "BOTH",
        },
        ...prev,
      ])
    },
    [showToast]
  )

  const value = React.useMemo(
    () => ({
      role,
      setRole,
      toggleRole,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      isMobileDrawerOpen,
      setIsMobileDrawerOpen,
      commandPaletteOpen,
      setCommandPaletteOpen,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      toast,
      showToast,
      dismissToast,
      orders,
      selectedOrderId,
      setSelectedOrderId,
      approveMilestone,
      requestRevision,
      deliverWork,
    }),
    [
      role,
      setRole,
      toggleRole,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      isMobileDrawerOpen,
      commandPaletteOpen,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      toast,
      showToast,
      dismissToast,
      orders,
      selectedOrderId,
      approveMilestone,
      requestRevision,
      deliverWork,
    ]
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = React.useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}

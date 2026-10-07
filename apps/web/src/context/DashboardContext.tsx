"use client"

import * as React from "react"
import { type DashboardRole, type NotificationItem, type ToastItem } from "@/data/dashboard/types"
import { requestData, jsonRequest, type Order, type Profile } from "@/lib/marketplace"
import { dashboardOrder } from "@/lib/dashboard-adapters"
import { useApiResource } from "@/hooks/useApiResource"
import { type DashboardOrder, type DeliveryFile } from "@/data/dashboard/orders"

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
  notificationLoading: boolean
  notificationError: string
  reloadNotifications: () => void
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  toast: ToastItem | null
  showToast: (toast: Omit<ToastItem, "id">) => void
  dismissToast: () => void

  account: {
    id: string
    email: string
    role: string
    buyerProfile: Profile | null
    sellerProfile: Profile | null
  } | null
  rawOrders: Order[]
  ordersLoading: boolean
  ordersError: string
  reloadOrders: () => void
  // Orders State & Actions
  orders: DashboardOrder[]
  selectedOrderId: string | null
  setSelectedOrderId: (id: string | null) => void
  approveMilestone: (orderId: string, milestoneId: string) => Promise<void>
  requestRevision: (orderId: string, note: string) => Promise<void>
  deliverWork: (
    orderId: string,
    milestoneId: string,
    note: string,
    files: DeliveryFile[]
  ) => Promise<void>
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
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  // Toast
  const [toast, setToast] = React.useState<ToastItem | null>(null)

  // Orders State
  const accountResource = useApiResource<{
    id: string
    email: string
    role: string
    buyerProfile: Profile | null
    sellerProfile: Profile | null
  }>("/api/v1/profile/me")
  const account = accountResource.data
  const reloadAccount = accountResource.reload
  React.useEffect(() => {
    const change = (event: StorageEvent) => {
      if (event.key === "user" || event.key === "token") reloadAccount()
    }
    window.addEventListener("storage", change)
    return () => window.removeEventListener("storage", change)
  }, [reloadAccount])
  React.useEffect(() => {
    const reload = reloadAccount
    window.addEventListener("profile-updated", reload)
    return () => window.removeEventListener("profile-updated", reload)
  }, [reloadAccount])
  const orderResource = useApiResource<Order[]>(
    account ? `/api/v1/orders/${role === "FREELANCER" ? "my-sales" : "my-purchases"}` : null
  )
  const notificationResource = useApiResource<
    {
      id: string
      title: string
      message: string
      createdAt: string
      isRead: boolean
      type: string
    }[]
  >(account ? "/api/v1/notifications" : null)
  const rawOrders = React.useMemo(() => orderResource.data || [], [orderResource.data])
  const orders = React.useMemo(
    () => rawOrders.map((order) => dashboardOrder(order, role === "FREELANCER")),
    [rawOrders, role]
  )
  const ordersLoading = accountResource.loading || Boolean(account && orderResource.loading)
  const ordersError = accountResource.error || orderResource.error
  const reloadOrders = orderResource.reload
  const initializedAccount = React.useRef("")
  React.useEffect(() => {
    if (account && initializedAccount.current !== account.id) {
      initializedAccount.current = account.id
      setRoleState(account.sellerProfile ? "FREELANCER" : "CLIENT")
    }
  }, [account])
  React.useEffect(() => {
    setNotifications(
      (notificationResource.data || []).map((n) => ({
        id: n.id,
        title: n.title,
        description: n.message,
        timestamp: new Date(n.createdAt).toLocaleString(),
        read: n.isRead,
        type: n.type === "NEW_MESSAGE" ? "message" : n.type === "ORDER_UPDATE" ? "order" : "system",
        role: "BOTH",
      }))
    )
  }, [notificationResource.data])
  React.useEffect(() => {
    if (!account) return
    const timer = setInterval(notificationResource.reload, 15000)
    return () => clearInterval(timer)
  }, [account, notificationResource.reload])
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)

  // Initialize from localStorage safely
  React.useEffect(() => {
    try {
      const savedCollapse = localStorage.getItem("tascora_sidebar_collapsed")
      if (savedCollapse !== null) {
        setSidebarCollapsedState(savedCollapse === "true")
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

  const setRole = React.useCallback(
    (newRole: DashboardRole) => {
      if (newRole === "FREELANCER" && !account?.sellerProfile) return
      setRoleState(newRole)
      try {
        localStorage.setItem("tascora_dashboard_role", newRole)
      } catch {}
    },
    [account]
  )

  const toggleRole = React.useCallback(() => {
    if (account?.sellerProfile)
      setRoleState((prev) => (prev === "CLIENT" ? "FREELANCER" : "CLIENT"))
  }, [account])

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

  const reloadNotifications = notificationResource.reload
  React.useEffect(() => {
    window.addEventListener("notifications-updated", reloadNotifications)
    return () => window.removeEventListener("notifications-updated", reloadNotifications)
  }, [reloadNotifications])
  // Read status is persisted before local UI updates.
  const markAsRead = React.useCallback(
    (id: string) => {
      void requestData(`/api/v1/notifications/${id}/read`, jsonRequest("PUT"))
        .then(() =>
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        )
        .catch(() => reloadNotifications())
    },
    [reloadNotifications]
  )
  const markAllAsRead = React.useCallback(() => {
    void requestData("/api/v1/notifications/read-all", jsonRequest("PUT"))
      .then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))))
      .catch(() => reloadNotifications())
  }, [reloadNotifications])

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

  const changeOrder = React.useCallback(
    async (orderId: string, status: string, message?: string) => {
      await requestData(
        `/api/v1/orders/${orderId}/status`,
        jsonRequest("POST", { status, message })
      )
      reloadOrders()
      showToast({
        title: "Order updated",
        message: "The server saved the order status. Financial settlement is unavailable.",
        type: "success",
      })
    },
    [reloadOrders, showToast]
  )
  const approveMilestone = React.useCallback(
    async (id: string) => changeOrder(id, "COMPLETED"),
    [changeOrder]
  )
  const requestRevision = React.useCallback(
    async (id: string, note: string) => changeOrder(id, "IN_REVISION", note),
    [changeOrder]
  )
  const deliverWork = React.useCallback(
    async (id: string, milestone: string, note: string, files: DeliveryFile[]) => {
      void milestone
      await requestData(
        `/api/v1/orders/${id}/delivery`,
        jsonRequest("POST", { message: note, files: files.flatMap((f) => (f.url ? [f.url] : [])) })
      )
      reloadOrders()
    },
    [reloadOrders]
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
      notificationLoading:
        accountResource.loading || Boolean(account && notificationResource.loading),
      notificationError: accountResource.error || notificationResource.error,
      reloadNotifications,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      toast,
      showToast,
      dismissToast,
      account,
      rawOrders,
      ordersLoading,
      ordersError,
      reloadOrders,
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
      accountResource.loading,
      accountResource.error,
      notificationResource.loading,
      notificationResource.error,
      reloadNotifications,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      toast,
      showToast,
      dismissToast,
      account,
      rawOrders,
      ordersLoading,
      ordersError,
      reloadOrders,
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

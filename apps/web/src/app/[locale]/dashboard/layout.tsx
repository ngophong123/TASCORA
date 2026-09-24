import type { Metadata } from "next"
import { DashboardProvider } from "@/context/DashboardContext"
import { DashboardSidebar } from "@/components/dashboard/shell/DashboardSidebar"
import { DashboardTopbar } from "@/components/dashboard/shell/DashboardTopbar"
import { MobileDashboardNav } from "@/components/dashboard/shell/MobileDashboardNav"
import { CommandPalette } from "@/components/dashboard/ui/CommandPalette"
import { ToastContainer } from "@/components/ui/Toast"

export const metadata: Metadata = {
  title: "Dashboard | TASCORA",
  description: "Role-based marketplace workspace for clients and creators.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#FAFAFC] flex flex-row">
        {/* Desktop Collapsible Sidebar */}
        <DashboardSidebar />

        {/* Main Application Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar with Role Switcher, Search & Notifications */}
          <DashboardTopbar />

          {/* Page Content Viewport */}
          <main className="flex-1 bg-[#FAFAFC] p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile Navigations (Off-Canvas Drawer & Bottom Tab Bar) */}
        <MobileDashboardNav />

        {/* Global Command Palette (Cmd+K) */}
        <CommandPalette />

        {/* Global Toast Banner Container */}
        <ToastContainer />
      </div>
    </DashboardProvider>
  )
}

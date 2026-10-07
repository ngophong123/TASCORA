"use client"

import * as React from "react"
import { User, Shield, Bell, CreditCard, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/Switch"
import { useDashboard } from "@/context/DashboardContext"
import { AccountOnboardingPanel } from "@/components/dashboard/AccountOnboardingPanel"

type SettingsTab = "profile" | "security" | "notifications" | "billing"

export default function SettingsPage() {
  const { role, showToast } = useDashboard()

  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile")

  // Security states
  const [security, setSecurity] = React.useState({
    twoFactor: false,
    sessionTimeout: true,
    loginAlerts: true,
  })

  // Notification toggles
  const [notifications, setNotifications] = React.useState({
    orderMilestones: true,
    directMessages: true,
    emailDigest: false,
    soundAlerts: true,
    marketingUpdates: false,
  })

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault()
    showToast({
      title: "Security preferences are unavailable",
      message: "Two-factor authentication is not implemented.",
      type: "info",
    })
  }

  const handleSaveNotifications = () => {
    showToast({ title: "Notification preferences are not implemented", type: "info" })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A23]">
          Account & Workspace Settings
        </h1>
        <p className="text-sm text-[#4B4B5C] mt-1">
          Manage your personal profile, authentication credentials, security policies, and
          notifications.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 bg-[#F4F4F8] p-1 rounded-xl w-fit">
        {(
          [
            { id: "profile", label: "Profile Details", icon: User },
            { id: "security", label: "Security & Login", icon: Shield },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "billing", label: "Billing & Currency", icon: CreditCard },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-[#6B6B7B] hover:text-[#0A0A23]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: Profile */}
      {activeTab === "profile" && <AccountOnboardingPanel mode={role} />}

      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
            <h2 className="text-base font-semibold text-[#0A0A23] pb-3 border-b border-[rgba(15,15,30,0.06)]">
              Authentication & Security Controls
            </h2>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(15,15,30,0.08)] bg-[#FAFAFC]">
              <div className="flex items-center gap-3.5">
                <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-[#0A0A23]">
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-[11px] text-[#6B6B7B]">
                    Secure your account with Google Authenticator or hardware FIDO2 keys.
                  </p>
                </div>
              </div>

              <Switch
                disabled
                checked={security.twoFactor}
                onCheckedChange={(val) => {
                  setSecurity({ ...security, twoFactor: val })
                  showToast({
                    title: val ? "2FA Enabled" : "2FA Disabled",
                    message: `Two-factor authentication is now ${val ? "active" : "disabled"}.`,
                    type: val ? "success" : "warning",
                  })
                }}
              />
            </div>

            {/* Password Change Box */}
            <form onSubmit={handleSaveSecurity} className="space-y-4 pt-2">
              <h3 className="text-xs font-semibold text-[#0A0A23]">Change Password</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#6B6B7B] block mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3 py-2 text-xs text-[#0A0A23] outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6B6B7B] block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3 py-2 text-xs text-[#0A0A23] outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6B6B7B] block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3 py-2 text-xs text-[#0A0A23] outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8.5 rounded-xl"
                >
                  Update Password
                </Button>
              </div>
            </form>

            {/* Connected Accounts */}
            <div className="space-y-3 pt-3 border-t border-[rgba(15,15,30,0.06)]">
              <h3 className="text-xs font-semibold text-[#0A0A23]">Connected OAuth Accounts</h3>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[rgba(15,15,30,0.08)] bg-white">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-[#0A0A23]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <div>
                    <div className="text-xs font-semibold text-[#0A0A23]">GitHub</div>
                    <div className="text-[11px] text-emerald-600">
                      Connected as @alexandre-moreau
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs text-[#4B4B5C] h-7 px-2.5">
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(15,15,30,0.06)]">
            <div>
              <h2 className="text-base font-semibold text-[#0A0A23]">Notification Rules</h2>
              <p className="text-xs text-[#6B6B7B]">
                Choose when and where you receive project alerts and communications.
              </p>
            </div>
            <Button
              onClick={handleSaveNotifications}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8.5 px-3 rounded-xl"
            >
              Save Preferences
            </Button>
          </div>

          <div className="space-y-4 divide-y divide-[rgba(15,15,30,0.04)]">
            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-semibold text-[#0A0A23]">
                  Milestone Deliverables & Signoffs
                </h4>
                <p className="text-[11px] text-[#6B6B7B]">
                  Instant alerts when deliverables are submitted or escrow is released.
                </p>
              </div>
              <Switch
                disabled
                checked={notifications.orderMilestones}
                onCheckedChange={(val) =>
                  setNotifications({ ...notifications, orderMilestones: val })
                }
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-semibold text-[#0A0A23]">Direct Chat Messages</h4>
                <p className="text-[11px] text-[#6B6B7B]">
                  Receive notifications for new messages in the 3-pane inbox.
                </p>
              </div>
              <Switch
                disabled
                checked={notifications.directMessages}
                onCheckedChange={(val) =>
                  setNotifications({ ...notifications, directMessages: val })
                }
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-semibold text-[#0A0A23]">Weekly Performance Digest</h4>
                <p className="text-[11px] text-[#6B6B7B]">
                  Consolidated email breakdown of earnings, impressions, and order views.
                </p>
              </div>
              <Switch
                disabled
                checked={notifications.emailDigest}
                onCheckedChange={(val) => setNotifications({ ...notifications, emailDigest: val })}
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-xs font-semibold text-[#0A0A23]">Auditory Sound Effects</h4>
                <p className="text-[11px] text-[#6B6B7B]">
                  Play gentle chime on incoming chat message.
                </p>
              </div>
              <Switch
                disabled
                checked={notifications.soundAlerts}
                onCheckedChange={(val) => setNotifications({ ...notifications, soundAlerts: val })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Billing & Currency */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          <div className="pb-3 border-b border-[rgba(15,15,30,0.06)]">
            <h2 className="text-base font-semibold text-[#0A0A23]">
              Currency & Tax Identification
            </h2>
            <p className="text-xs text-[#6B6B7B]">
              Default accounting currency for escrow milestones and automated receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#0A0A23] block mb-1.5">
                Primary Currency
              </label>
              <select className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3 py-2 text-xs text-[#0A0A23] outline-none focus:bg-white focus:border-blue-500">
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0A0A23] block mb-1.5">
                Tax Identification Number
              </label>
              <input
                type="text"
                defaultValue="FR-VAT 849201948"
                className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3 py-2 text-xs font-mono text-[#0A0A23] outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[rgba(15,15,30,0.06)]">
            <Button
              onClick={() =>
                showToast({
                  title: "Billing Preferences Updated",
                  message: "Invoicing currency and VAT ID updated.",
                  type: "success",
                })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8.5 px-4 rounded-xl"
            >
              Update Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

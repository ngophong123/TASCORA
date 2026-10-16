"use client"

import { useState } from "react"
import { User, Shield, Bell, CreditCard } from "lucide-react"
import { useDashboard } from "@/context/DashboardContext"
import { AccountOnboardingPanel } from "@/components/dashboard/AccountOnboardingPanel"

type SettingsTab = "profile" | "security" | "notifications" | "billing"
const tabs = [
  { id: "profile", label: "Profile details", icon: User },
  { id: "security", label: "Security & login", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & currency", icon: CreditCard },
] as const
const unavailable = {
  security: {
    title: "Security preferences",
    description:
      "Password changes, two-factor authentication and connected account management are not available yet. No changes can be submitted from this page.",
  },
  notifications: {
    title: "Notification preferences",
    description:
      "Notification preferences cannot be changed yet. View and mark your existing notifications as read in Notifications.",
  },
  billing: {
    title: "Billing preferences",
    description:
      "Currency and tax identification preferences are not available yet. This page does not save billing information.",
  },
}

export default function SettingsPage() {
  const { role } = useDashboard()
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Your workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Account settings
        </h1>
        <p className="mt-2 text-base text-[var(--text-secondary)]">
          Manage your profile and review available account preferences.
        </p>
      </header>
      <nav
        aria-label="Settings sections"
        className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={activeTab === id}
            aria-controls={`settings-${id}`}
            onClick={() => setActiveTab(id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${activeTab === id ? "bg-[var(--primary-subtle)] text-[var(--primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--subtle)]"}`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
      {tabs.map(({ id, label }) => (
        <section key={id} id={`settings-${id}`} aria-label={label} hidden={activeTab !== id}>
          {activeTab !== id ? null : id === "profile" ? (
            <AccountOnboardingPanel mode={role} />
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <span className="inline-block rounded-md bg-[var(--subtle)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                Unavailable
              </span>
              <h2 className="mt-5 text-xl font-semibold text-[var(--foreground)]">
                {unavailable[id].title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
                {unavailable[id].description}
              </p>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

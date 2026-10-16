"use client"

import * as React from "react"
import { requestData, jsonRequest, uploadFile } from "@/lib/marketplace"
import { apiFetch } from "@/lib/auth-client"
import { Link } from "@/i18n/routing"

interface Profile {
  firstName: string | null
  lastName: string | null
  bio: string | null
  professionalTitle?: string | null
  hourlyRate?: string | null
  status?: string
}
interface Account {
  email: string
  buyerProfile: Profile | null
  sellerProfile: Profile | null
}
export function AccountOnboardingPanel({ mode }: { mode?: "CLIENT" | "FREELANCER" } = {}) {
  const [account, setAccount] = React.useState<Account | null>(null)
  const [status, setStatus] = React.useState("Loading your account…")
  const [busy, setBusy] = React.useState(false)
  const [identityRevision, setIdentityRevision] = React.useState(0)
  React.useEffect(() => {
    const change = (event: StorageEvent) => {
      if (event.key === "user" || event.key === "token") {
        setAccount(null)
        setIdentityRevision((n) => n + 1)
      }
    }
    window.addEventListener("storage", change)
    return () => window.removeEventListener("storage", change)
  }, [])
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    bio: "",
    professionalTitle: "",
    hourlyRate: "",
  })
  React.useEffect(() => {
    let active = true
    async function load() {
      if (!localStorage.getItem("user")) {
        setStatus("Sign in to manage your account.")
        return
      }
      try {
        const response = await apiFetch("/api/v1/profile/me")
        if (!response.ok) throw new Error("Sign in to manage your account.")
        const result = await response.json()
        if (!active) return
        const data = result.data as Account
        setAccount(data)
        const profile =
          mode === "CLIENT" ? data.buyerProfile : data.sellerProfile || data.buyerProfile
        setForm({
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || "",
          bio: profile?.bio || "",
          professionalTitle: profile?.professionalTitle || "",
          hourlyRate: profile?.hourlyRate || "",
        })
        setStatus("")
      } catch (error) {
        if (active) setStatus(error instanceof Error ? error.message : "Account unavailable.")
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [mode, identityRevision])
  async function save(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      const seller = mode !== "CLIENT" && Boolean(account?.sellerProfile)
      const body = seller
        ? { ...form, hourlyRate: Number(form.hourlyRate) }
        : { firstName: form.firstName, lastName: form.lastName, bio: form.bio }
      const response = await apiFetch(
        seller
          ? ["DRAFT", "REJECTED"].includes(account?.sellerProfile?.status || "")
            ? "/api/v1/onboarding/seller/step/1"
            : "/api/v1/profile/seller"
          : "/api/v1/profile/buyer",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )
      if (!response.ok) throw new Error("Unable to save your profile. Check the required fields.")
      const saved = await response.json()
      if (!saved.success) throw new Error("Profile save failed.")
      setAccount((previous) =>
        previous && saved.data
          ? { ...previous, [seller ? "sellerProfile" : "buyerProfile"]: saved.data }
          : previous
      )
      window.dispatchEvent(new Event("profile-updated"))
      setStatus("Profile saved.")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile save failed.")
    } finally {
      setBusy(false)
    }
  }
  async function submit() {
    setBusy(true)
    try {
      const response = await apiFetch("/api/v1/onboarding/seller/submit", { method: "POST" })
      if (!response.ok)
        throw new Error("Complete and save all seller profile fields before submitting.")
      const submitted = await response.json()
      if (!submitted.success || !submitted.data)
        throw new Error("Submission did not return a saved profile.")
      setStatus("Seller profile submitted for review.")
      setAccount((previous) =>
        previous ? { ...previous, sellerProfile: submitted.data } : previous
      )
      window.dispatchEvent(new Event("profile-updated"))
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Submission failed.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="rounded-xl border border-border-default bg-bg-surface p-5 sm:p-6 space-y-4">
      <h2 className="text-lg font-semibold">Your account</h2>
      <p role="status" className="text-sm text-text-secondary">
        {status}
      </p>
      {!account ? (
        <Link href="/login" className="underline">
          Sign in
        </Link>
      ) : (
        <>
          <p className="break-words text-sm text-text-secondary">
            {account.email}
            {account.sellerProfile?.status && ` · Seller status: ${account.sellerProfile.status}`}
          </p>
          <label className="block text-sm font-medium text-foreground">
            Avatar (public on your marketplace profile)
            <input
              disabled={busy}
              className="mt-2 block min-h-11 w-full max-w-md rounded-lg border border-border-default bg-bg-subtle p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-bg-surface file:px-3 file:py-2 file:text-primary"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  setBusy(true)
                  void uploadFile(file)
                    .then((reference) =>
                      requestData(
                        mode !== "CLIENT" && account.sellerProfile
                          ? "/api/v1/profile/seller"
                          : "/api/v1/profile/buyer",
                        jsonRequest("PUT", { avatar: reference })
                      )
                    )
                    .then(() => {
                      window.dispatchEvent(new Event("profile-updated"))
                      setStatus("Avatar saved.")
                    })
                    .catch((error: Error) => setStatus(error.message))
                    .finally(() => setBusy(false))
                }
              }}
            />
          </label>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {(
              [
                "firstName",
                "lastName",
                "bio",
                ...(mode !== "CLIENT" && account.sellerProfile
                  ? ["professionalTitle", "hourlyRate"]
                  : []),
              ] as (keyof typeof form)[]
            ).map((field) => (
              <label key={field} className="block text-sm font-medium text-foreground">
                {
                  {
                    firstName: "First name",
                    lastName: "Last name",
                    bio: "About you",
                    professionalTitle: "Professional title",
                    hourlyRate: "Hourly rate",
                  }[field]
                }
                <input
                  required
                  type={field === "hourlyRate" ? "number" : "text"}
                  min={field === "hourlyRate" ? "0.01" : undefined}
                  step={field === "hourlyRate" ? "0.01" : undefined}
                  value={form[field]}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, [field]: event.target.value }))
                  }
                  className="mt-2 block min-h-11 w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-base font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/20"
                />
              </label>
            ))}
            <button
              disabled={busy}
              className="min-h-11 w-fit rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm font-semibold hover:bg-bg-subtle disabled:opacity-50"
            >
              Save profile
            </button>
          </form>
          {mode !== "CLIENT" &&
            ["DRAFT", "REJECTED"].includes(account.sellerProfile?.status || "") && (
              <button
                disabled={busy}
                onClick={() => void submit()}
                className="min-h-11 w-fit rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm font-semibold hover:bg-bg-subtle disabled:opacity-50"
              >
                Submit seller profile for review
              </button>
            )}
        </>
      )}
    </section>
  )
}

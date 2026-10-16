"use client"

import * as React from "react"
import { Link, useRouter } from "@/i18n/routing"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Layers,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/context/DashboardContext"
import { requestData, jsonRequest, uploadFile, type Service } from "@/lib/marketplace"
import { useApiResource } from "@/hooks/useApiResource"
import { UploadImage } from "@/components/ui/UploadImage"
import { ApiState } from "@/components/feedback/ApiState"

const STEPS = [
  { id: 1, label: "Overview", icon: Layers },
  { id: 2, label: "Pricing & Tiers", icon: DollarSign },
  { id: 3, label: "Description & FAQ", icon: FileText },
  { id: 4, label: "Gallery & Media", icon: ImageIcon },
  { id: 5, label: "Publish", icon: CheckCircle2 },
]

export function GigWizard({ serviceId }: { serviceId?: string } = {}) {
  const router = useRouter()
  const { showToast } = useDashboard()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const categories = useApiResource<{ id: string; name: string; slug: string }[]>(
    "/api/v1/marketplace/categories"
  )
  const existing = useApiResource<Service[]>(serviceId ? "/api/v1/services/seller/me" : null)
  const [draftId, setDraftId] = React.useState(serviceId || "")
  const [error, setError] = React.useState("")
  const blankTier = { title: "", description: "", price: 0, deliveryDays: 1, revisions: "0" }
  const [formData, setFormData] = React.useState({
    title: "",
    category: "",
    subcategory: "",
    tags: [] as string[],
    newTag: "",
    tiers: { basic: { ...blankTier }, standard: { ...blankTier }, premium: { ...blankTier } },
    description: "",
    requirements: "",
    faqs: [] as { question: string; answer: string }[],
    coverImage: "",
  })
  React.useEffect(() => {
    if (!serviceId || !existing.data) return
    const service = existing.data.find((s) => s.id === serviceId)
    if (!service) {
      setError("Service not found or unauthorized.")
      return
    }
    setFormData((prev) => ({
      ...prev,
      title: service.title,
      category: service.category.id,
      description: service.description,
      tags: service.tags?.map((t) => t.tag.name) || [],
      requirements: service.requirements?.[0]?.description || "",
      faqs: service.faqs || [],
      coverImage: service.images[0]?.url || "",
      tiers: Object.fromEntries(
        ["basic", "standard", "premium"].map((key) => {
          const p = service.packages.find((p) => p.type === key.toUpperCase())
          return [
            key,
            p
              ? {
                  title: p.title,
                  description: p.description,
                  price: Number(p.price),
                  deliveryDays: p.deliveryDays,
                  revisions: String(p.revisions),
                }
              : { title: "", description: "", price: 0, deliveryDays: 1, revisions: "0" },
          ]
        })
      ) as typeof prev.tiers,
    }))
  }, [existing.data, serviceId])

  const handleAddTag = () => {
    if (!formData.newTag.trim()) return
    if (formData.tags.includes(formData.newTag.trim().toLowerCase())) return
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, prev.newTag.trim().toLowerCase()],
      newTag: "",
    }))
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question: "What is your typical turnaround time?",
          answer: "Turnaround begins immediately upon requirement signoff.",
        },
      ],
    }))
  }

  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }

  const handlePublish = async () => {
    setIsSubmitting(true)
    setError("")
    try {
      const packages = Object.entries(formData.tiers)
        .filter(([, p]) => p.title.trim())
        .map(([type, p]) => ({
          ...p,
          type: type.toUpperCase(),
          revisions: Number(p.revisions),
          features:
            existing.data
              ?.find((s) => s.id === serviceId)
              ?.packages.find((pkg) => pkg.type === type.toUpperCase())?.features || [],
        }))
      if (!packages.length) throw new Error("Complete at least one package.")
      let id = draftId
      if (!id) {
        const draft = await requestData<{ id: string }>(
          "/api/v1/services",
          jsonRequest("POST", {
            title: formData.title,
            categoryId: formData.category,
            description: formData.description,
          })
        )
        id = draft.id
        setDraftId(id)
      }
      await requestData(
        `/api/v1/marketplace/services/${id}/content`,
        jsonRequest("PUT", {
          title: formData.title,
          categoryId: formData.category,
          description: formData.description,
          packages,
          images: formData.coverImage ? [formData.coverImage] : [],
          faqs: formData.faqs,
          requirements: formData.requirements,
          tags: formData.tags,
        })
      )
      showToast({
        title: "Service draft saved",
        message: "An administrator must review the service before it is published.",
        type: "success",
      })
      router.push("/dashboard/gigs")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save service.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ApiState
        loading={categories.loading || Boolean(serviceId && existing.loading)}
        error={error || categories.error || existing.error}
        retry={categories.error ? categories.reload : existing.error ? existing.reload : undefined}
      />
      <label className="block rounded-xl border p-3 text-sm">
        Service cover (published with your service)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={isSubmitting}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              setIsSubmitting(true)
              void uploadFile(file)
                .then((reference) => setFormData((prev) => ({ ...prev, coverImage: reference })))
                .catch((error: Error) => setError(error.message))
                .finally(() => setIsSubmitting(false))
            }
          }}
        />
      </label>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/gigs">
            <button
              type="button"
              aria-label="Back to my services"
              className="flex h-11 w-11 items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--subtle)] rounded-xl transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-[var(--foreground)]">Create a New Service</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]?.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              showToast({
                title: "Draft not saved yet",
                message:
                  "Your edits remain in this form. Use the final step to save your service for review.",
                type: "info",
              })
            }}
            className="text-sm text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--subtle)]"
          >
            Draft status
          </Button>
        </div>
      </div>

      {/* Stepper Timeline Bar */}
      <div className="bg-[var(--surface)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)] ">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-[var(--border)] -z-0" />
          <div
            className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-[var(--primary)] transition-colors motion-reduce:transition-none duration-300 -z-0"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step) => {
            const isDone = step.id < currentStep
            const isCurrent = step.id === currentStep
            const Icon = step.icon

            return (
              <button
                key={step.id}
                type="button"
                aria-label={`Step ${step.id}: ${step.label}`}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => setCurrentStep(step.id)}
                data-testid={`wizard-step-${step.id}`}
                className="flex flex-col items-center gap-1.5 z-10 group"
              >
                <div
                  className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-semibold transition-colors motion-reduce:transition-none ${
                    isDone
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : isCurrent
                        ? "bg-[var(--surface)] text-[var(--primary)] ring-2 ring-[var(--focus-ring)] shadow-sm"
                        : "bg-[var(--subtle)] text-[var(--text-muted)]"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span
                  data-testid="wizard-step-label"
                  className={`text-xs font-medium hidden sm:block ${
                    isCurrent ? "text-[var(--primary)] font-semibold" : "text-[var(--text-muted)]"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Form Body Card */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 sm:p-8  space-y-6">
        {/* STEP 1: Overview */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Gig Overview & Categorization
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Craft a punchy title and select tags so buyers find your service via search.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] block mb-1.5">
                  Gig Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    aria-label="Service title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="wizard-gig-title-input"
                    className="min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--subtle)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)]  focus:bg-[var(--surface)] focus:border-[var(--focus-ring)] focus:ring-1 focus:ring-[var(--focus-ring)]"
                  />
                </div>
                <span className="text-xs text-[var(--text-muted)] mt-1 block">
                  Keep it clear and focused on the value delivered to clients.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--foreground)] block mb-1.5">
                    Category
                  </label>
                  <select
                    aria-label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--subtle)] px-3.5 py-2.5 text-sm text-[var(--foreground)]  focus:bg-[var(--surface)] focus:border-[var(--focus-ring)]"
                  >
                    <option value="">Choose a category</option>
                    {(categories.data || []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--foreground)] block mb-1.5">
                    Subcategory
                  </label>
                  <input
                    disabled
                    placeholder="Choose the actual category above"
                    type="text"
                    aria-label="Subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--subtle)] px-3.5 py-2.5 text-sm text-[var(--foreground)]  focus:bg-[var(--surface)] focus:border-[var(--focus-ring)]"
                  />
                </div>
              </div>

              {/* Search Tags */}
              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] block mb-1.5">
                  Search Tags (Up to 5)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] text-sm font-medium border border-[var(--border)]"
                    >
                      #{tag}
                      <button
                        type="button"
                        aria-label={`Remove tag ${tag}`}
                        onClick={() => handleRemoveTag(tag)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    aria-label="Add a search tag"
                    value={formData.newTag}
                    onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag and press Enter..."
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--subtle)] px-3.5 py-2 text-sm text-[var(--foreground)]  focus:bg-[var(--surface)] focus:border-[var(--focus-ring)]"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    className="text-sm text-[var(--foreground)] h-11"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pricing & Tiers */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Scope & Pricing Tiers
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Configure 3 transparent pricing packages with clear turnaround and revisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* BASIC */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--subtle)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <span className="text-sm font-semibold text-[var(--foreground)]">BASIC TIER</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200/60 text-[var(--text-secondary)]">
                    Starter
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                    Tier Title
                  </label>
                  <input
                    type="text"
                    aria-label="Basic package title"
                    value={formData.tiers.basic.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tiers: {
                          ...formData.tiers,
                          basic: { ...formData.tiers.basic, title: e.target.value },
                        },
                      })
                    }
                    className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    aria-label="Basic price in USD"
                    value={formData.tiers.basic.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tiers: {
                          ...formData.tiers,
                          basic: { ...formData.tiers.basic, price: Number(e.target.value) },
                        },
                      })
                    }
                    className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm tabular-nums font-semibold text-[var(--foreground)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      aria-label="Basic delivery days"
                      value={formData.tiers.basic.deliveryDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            basic: {
                              ...formData.tiers.basic,
                              deliveryDays: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                      Revisions
                    </label>
                    <input
                      type="text"
                      aria-label="Basic revisions"
                      value={formData.tiers.basic.revisions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            basic: { ...formData.tiers.basic, revisions: e.target.value },
                          },
                        })
                      }
                      className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* STANDARD */}
              <div className="p-4 rounded-xl border-2 border-blue-500 bg-[var(--primary-subtle)] space-y-3 relative shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="text-sm font-semibold text-[var(--primary)]">STANDARD TIER</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--primary)] text-white">
                    Popular
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--primary)] block mb-1">
                    Tier Title
                  </label>
                  <input
                    type="text"
                    aria-label="Standard package title"
                    value={formData.tiers.standard.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tiers: {
                          ...formData.tiers,
                          standard: { ...formData.tiers.standard, title: e.target.value },
                        },
                      })
                    }
                    className="min-h-11 min-w-0 w-full rounded-lg border border-blue-300 bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--primary)] block mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    aria-label="Standard price in USD"
                    value={formData.tiers.standard.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tiers: {
                          ...formData.tiers,
                          standard: { ...formData.tiers.standard, price: Number(e.target.value) },
                        },
                      })
                    }
                    className="min-h-11 min-w-0 w-full rounded-lg border border-blue-300 bg-[var(--surface)] px-2.5 py-1.5 text-sm tabular-nums font-semibold text-[var(--primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-[var(--primary)] block mb-1">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      aria-label="Standard delivery days"
                      value={formData.tiers.standard.deliveryDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            standard: {
                              ...formData.tiers.standard,
                              deliveryDays: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="min-h-11 min-w-0 w-full rounded-lg border border-blue-300 bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--primary)] block mb-1">
                      Revisions
                    </label>
                    <input
                      type="text"
                      aria-label="Standard revisions"
                      value={formData.tiers.standard.revisions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            standard: { ...formData.tiers.standard, revisions: e.target.value },
                          },
                        })
                      }
                      className="min-h-11 min-w-0 w-full rounded-lg border border-blue-300 bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* PREMIUM */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--subtle)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    PREMIUM TIER
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    Enterprise
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                    Tier Title
                  </label>
                  <input
                    type="text"
                    aria-label="Premium package title"
                    value={formData.tiers.premium.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tiers: {
                          ...formData.tiers,
                          premium: { ...formData.tiers.premium, title: e.target.value },
                        },
                      })
                    }
                    className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    aria-label="Premium price in USD"
                    value={formData.tiers.premium.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tiers: {
                          ...formData.tiers,
                          premium: { ...formData.tiers.premium, price: Number(e.target.value) },
                        },
                      })
                    }
                    className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm tabular-nums font-semibold text-[var(--foreground)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      aria-label="Premium delivery days"
                      value={formData.tiers.premium.deliveryDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            premium: {
                              ...formData.tiers.premium,
                              deliveryDays: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                      Revisions
                    </label>
                    <input
                      type="text"
                      aria-label="Premium revisions"
                      value={formData.tiers.premium.revisions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            premium: { ...formData.tiers.premium, revisions: e.target.value },
                          },
                        })
                      }
                      className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Description & FAQ */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Description & Client Requirements
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Detail what is included, expected client inputs, and frequently asked questions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] block mb-1.5">
                  Detailed Service Description
                </label>
                <textarea
                  rows={4}
                  aria-label="Detailed service description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 text-sm text-[var(--foreground)]  focus:bg-[var(--surface)] focus:border-[var(--focus-ring)]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] block mb-1.5">
                  Buyer Requirements (What you need to start)
                </label>
                <textarea
                  rows={2}
                  aria-label="Buyer requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--subtle)] p-3 text-sm text-[var(--foreground)]  focus:bg-[var(--surface)] focus:border-[var(--focus-ring)]"
                />
              </div>

              {/* FAQs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[var(--foreground)]">
                    Frequently Asked Questions
                  </label>
                  <Button
                    type="button"
                    onClick={handleAddFaq}
                    variant="outline"
                    size="sm"
                    className="h-11 text-xs text-[var(--primary)] border-[var(--border)] hover:bg-[var(--primary-subtle)]"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add FAQ
                  </Button>
                </div>

                {formData.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--subtle)] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--foreground)]">
                        Question #{index + 1}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove FAQ ${index + 1}`}
                        onClick={() => handleRemoveFaq(index)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-rose-600 text-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      aria-label={`FAQ ${index + 1} question`}
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...formData.faqs]
                        const targetFaq = updated[index]
                        if (targetFaq) {
                          targetFaq.question = e.target.value
                          setFormData({ ...formData, faqs: updated })
                        }
                      }}
                      className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--foreground)]"
                    />
                    <textarea
                      rows={2}
                      aria-label={`FAQ ${index + 1} answer`}
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...formData.faqs]
                        const targetFaq = updated[index]
                        if (targetFaq) {
                          targetFaq.answer = e.target.value
                          setFormData({ ...formData, faqs: updated })
                        }
                      }}
                      className="min-h-11 min-w-0 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--foreground)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Gallery & Media */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Showcase & Gallery
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Upload high-resolution service previews and link portfolio repositories.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] block mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  aria-label="Cover image reference"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--subtle)] px-3.5 py-2 text-sm text-[var(--foreground)]"
                />
              </div>

              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden border border-[var(--border)] h-56 w-full bg-[var(--subtle)] flex items-center justify-center">
                <UploadImage
                  source={formData.coverImage}
                  alt="Gig cover draft visual preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Publish */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Review & Save draft for review
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Check your service details before saving the draft for administrator review.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--primary-subtle)] space-y-4">
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <UploadImage
                  source={formData.coverImage}
                  alt="Marketplace gig summary cover thumbnail"
                  className="h-20 w-32 rounded-xl object-cover border border-[var(--border)] shadow-xs"
                />
                <div>
                  <span className="text-xs font-semibold text-[var(--primary)] bg-[var(--primary-subtle)] px-2 py-0.5 rounded-full break-all">
                    {categories.data?.find((category) => category.id === formData.category)?.name ||
                      "Choose a category"}
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mt-1">
                    {formData.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)] mt-2">
                    <span>
                      Starting at{" "}
                      <strong className="text-[var(--primary)] tabular-nums font-semibold">
                        ${formData.tiers.basic.price}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>{formData.tags.length} Search Tags</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] text-sm">
                <div>
                  <span className="text-[var(--text-muted)] block text-xs">Basic Tier</span>
                  <span className="tabular-nums font-semibold text-[var(--foreground)]">
                    ${formData.tiers.basic.price}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-xs">Standard Tier</span>
                  <span className="tabular-nums font-semibold text-[var(--foreground)]">
                    ${formData.tiers.standard.price}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-xs">Premium Tier</span>
                  <span className="tabular-nums font-semibold text-[var(--foreground)]">
                    ${formData.tiers.premium.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            data-testid="wizard-prev-btn"
            className="text-sm text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--subtle)] disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              data-testid="wizard-next-btn"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold px-4 h-11 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handlePublish()}
              disabled={
                isSubmitting ||
                categories.loading ||
                Boolean(serviceId && existing.loading) ||
                Boolean(categories.error || existing.error)
              }
              data-testid="wizard-publish-btn"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold px-6 h-11 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving draft...</span>
                </>
              ) : (
                <>
                  <span>Save draft for review</span>
                  <Sparkles className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

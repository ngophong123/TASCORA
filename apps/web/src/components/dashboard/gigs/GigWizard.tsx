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
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/context/DashboardContext"

const STEPS = [
  { id: 1, label: "Overview", icon: Layers },
  { id: 2, label: "Pricing & Tiers", icon: DollarSign },
  { id: 3, label: "Description & FAQ", icon: FileText },
  { id: 4, label: "Gallery & Media", icon: ImageIcon },
  { id: 5, label: "Publish", icon: CheckCircle2 },
]

export function GigWizard() {
  const router = useRouter()
  const { showToast } = useDashboard()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form State
  const [formData, setFormData] = React.useState({
    title: "I will engineer enterprise-grade Next.js 15 & Node.js microservices",
    category: "Web Development",
    subcategory: "Full-Stack Development",
    tags: ["nextjs", "typescript", "docker", "prisma"],
    newTag: "",

    // Tiers
    tiers: {
      basic: {
        title: "Starter Boilerplate",
        description: "App Router scaffolding with strict TypeScript, Tailwind CSS, and Docker configs.",
        price: 250,
        deliveryDays: 2,
        revisions: "2",
      },
      standard: {
        title: "Full Production Setup",
        description: "PostgreSQL, Prisma ORM, Redis caching, JWT auth, and Stripe webhook handling.",
        price: 450,
        deliveryDays: 4,
        revisions: "4",
      },
      premium: {
        title: "Enterprise Architecture",
        description: "Kubernetes configs, multi-tenancy, CI/CD telemetry, and 30 days priority support.",
        price: 950,
        deliveryDays: 7,
        revisions: "Unlimited",
      },
    },

    description:
      "Enterprise web architecture with battle-tested performance, comprehensive test suites, and Docker containerization tailored for high-growth tech startups.",
    requirements:
      "Please provide your API specifications, preferred cloud provider credentials, and design tokens.",

    faqs: [
      {
        question: "Do you include automated CI/CD pipelines?",
        answer: "Yes, GitHub Actions workflows for automated linting, test suites, and staging deploys are provided in all tiers.",
      },
    ],
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
  })

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

  const handlePublish = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      showToast({
        title: "Gig Published Successfully!",
        message: "Your new service is live in the Tascora marketplace.",
        type: "success",
      })
      router.push("/dashboard/gigs")
    }, 1200)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(15,15,30,0.06)]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/gigs">
            <button className="p-2 text-[#6B6B7B] hover:text-[#0B0B14] hover:bg-[#F4F4F8] rounded-xl transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-[#0B0B14]">
              Create a New Service
            </h1>
            <p className="text-xs text-[#6B6B7B]">
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
                title: "Draft Saved",
                message: "Your gig draft has been saved locally.",
                type: "info",
              })
            }}
            className="text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8]"
          >
            Save Draft
          </Button>
        </div>
      </div>

      {/* Stepper Timeline Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[rgba(15,15,30,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-[#EFEFF4] -z-0" />
          <div
            className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
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
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center gap-1.5 z-10 group"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-blue-600 text-white shadow-xs"
                      : isCurrent
                      ? "bg-white text-blue-700 ring-2 ring-blue-600 shadow-sm"
                      : "bg-[#F4F4F8] text-[#6B6B7B]"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span
                  className={`text-[11px] font-medium hidden sm:block ${
                    isCurrent ? "text-blue-900 font-semibold" : "text-[#6B6B7B]"
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
      <div className="bg-white rounded-2xl border border-[rgba(15,15,30,0.08)] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
        {/* STEP 1: Overview */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[#0B0B14]">
                Gig Overview & Categorization
              </h2>
              <p className="text-xs text-[#6B6B7B]">
                Craft a punchy title and select tags so buyers find your service via search.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#0B0B14] block mb-1.5">
                  Gig Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#0B0B14] placeholder:text-[#6B6B7B] outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[11px] text-[#6B6B7B] mt-1 block">
                  Keep it clear and focused on the value delivered to clients.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#0B0B14] block mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#0B0B14] outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0B0B14] block mb-1.5">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#0B0B14] outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Search Tags */}
              <div>
                <label className="text-xs font-semibold text-[#0B0B14] block mb-1.5">
                  Search Tags (Up to 5)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag and press Enter..."
                    className="flex-1 rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3.5 py-2 text-xs text-[#0B0B14] outline-none focus:bg-white focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    className="text-xs text-[#0B0B14] h-8.5"
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
              <h2 className="text-base font-semibold text-[#0B0B14]">
                Scope & Pricing Tiers
              </h2>
              <p className="text-xs text-[#6B6B7B]">
                Configure 3 transparent pricing packages with clear turnaround and revisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* BASIC */}
              <div className="p-4 rounded-xl border border-[rgba(15,15,30,0.1)] bg-[#FAFAFC] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(15,15,30,0.06)]">
                  <span className="text-xs font-bold text-[#0B0B14]">BASIC TIER</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200/60 text-[#4B4B5C]">
                    Starter
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#6B6B7B] block mb-1">
                    Tier Title
                  </label>
                  <input
                    type="text"
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
                    className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2.5 py-1.5 text-xs text-[#0B0B14]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#6B6B7B] block mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
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
                    className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#0B0B14]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-[#6B6B7B] block mb-1">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      value={formData.tiers.basic.deliveryDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            basic: { ...formData.tiers.basic, deliveryDays: Number(e.target.value) },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#6B6B7B] block mb-1">
                      Revisions
                    </label>
                    <input
                      type="text"
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
                      className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* STANDARD */}
              <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/20 space-y-3 relative shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <span className="text-xs font-bold text-blue-900">STANDARD TIER</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                    Popular
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-blue-900 block mb-1">
                    Tier Title
                  </label>
                  <input
                    type="text"
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
                    className="w-full rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-xs text-[#0B0B14]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-blue-900 block mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
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
                    className="w-full rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-blue-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-blue-900 block mb-1">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      value={formData.tiers.standard.deliveryDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            standard: { ...formData.tiers.standard, deliveryDays: Number(e.target.value) },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-blue-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-blue-900 block mb-1">
                      Revisions
                    </label>
                    <input
                      type="text"
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
                      className="w-full rounded-lg border border-blue-300 bg-white px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* PREMIUM */}
              <div className="p-4 rounded-xl border border-[rgba(15,15,30,0.1)] bg-[#FAFAFC] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(15,15,30,0.06)]">
                  <span className="text-xs font-bold text-[#0B0B14]">PREMIUM TIER</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    Enterprise
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#6B6B7B] block mb-1">
                    Tier Title
                  </label>
                  <input
                    type="text"
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
                    className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2.5 py-1.5 text-xs text-[#0B0B14]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#6B6B7B] block mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
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
                    className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#0B0B14]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-[#6B6B7B] block mb-1">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      value={formData.tiers.premium.deliveryDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tiers: {
                            ...formData.tiers,
                            premium: { ...formData.tiers.premium, deliveryDays: Number(e.target.value) },
                          },
                        })
                      }
                      className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#6B6B7B] block mb-1">
                      Revisions
                    </label>
                    <input
                      type="text"
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
                      className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2 py-1 text-xs"
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
              <h2 className="text-base font-semibold text-[#0B0B14]">
                Description & Client Requirements
              </h2>
              <p className="text-xs text-[#6B6B7B]">
                Detail what is included, expected client inputs, and frequently asked questions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#0B0B14] block mb-1.5">
                  Detailed Service Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] p-3 text-xs text-[#0B0B14] outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B0B14] block mb-1.5">
                  Buyer Requirements (What you need to start)
                </label>
                <textarea
                  rows={2}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] p-3 text-xs text-[#0B0B14] outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* FAQs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0B0B14]">
                    Frequently Asked Questions
                  </label>
                  <Button
                    type="button"
                    onClick={handleAddFaq}
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] text-blue-700 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add FAQ
                  </Button>
                </div>

                {formData.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-[rgba(15,15,30,0.08)] bg-[#FAFAFC] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#0B0B14]">
                        Question #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="text-[#6B6B7B] hover:text-rose-600 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...formData.faqs]
                        updated[index].question = e.target.value
                        setFormData({ ...formData, faqs: updated })
                      }}
                      className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white px-2.5 py-1.5 text-xs text-[#0B0B14]"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...formData.faqs]
                        updated[index].answer = e.target.value
                        setFormData({ ...formData, faqs: updated })
                      }}
                      className="w-full rounded-lg border border-[rgba(15,15,30,0.1)] bg-white p-2 text-xs text-[#0B0B14]"
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
              <h2 className="text-base font-semibold text-[#0B0B14]">
                Showcase & Gallery
              </h2>
              <p className="text-xs text-[#6B6B7B]">
                Upload high-resolution service previews and link portfolio repositories.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#0B0B14] block mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full rounded-xl border border-[rgba(15,15,30,0.12)] bg-[#FAFAFC] px-3.5 py-2 text-xs text-[#0B0B14]"
                />
              </div>

              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(15,15,30,0.1)] h-56 w-full bg-[#FAFAFC] flex items-center justify-center">
                <img
                  src={formData.coverImage}
                  alt="Gig cover preview"
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
              <h2 className="text-base font-semibold text-[#0B0B14]">
                Review & Publish to Marketplace
              </h2>
              <p className="text-xs text-[#6B6B7B]">
                Verify your service specifications before making it live to global clients.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/20 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={formData.coverImage}
                  alt="Gig cover"
                  className="h-20 w-32 rounded-xl object-cover border border-blue-200 shadow-xs"
                />
                <div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {formData.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#0B0B14] mt-1">
                    {formData.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#6B6B7B] mt-2">
                    <span>
                      Starting at <strong className="text-blue-700 font-mono font-bold">${formData.tiers.basic.price}</strong>
                    </span>
                    <span>•</span>
                    <span>{formData.tags.length} Search Tags</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-blue-100 text-xs">
                <div>
                  <span className="text-[#6B6B7B] block text-[10px]">Basic Tier</span>
                  <span className="font-mono font-semibold text-[#0B0B14]">${formData.tiers.basic.price}</span>
                </div>
                <div>
                  <span className="text-[#6B6B7B] block text-[10px]">Standard Tier</span>
                  <span className="font-mono font-semibold text-[#0B0B14]">${formData.tiers.standard.price}</span>
                </div>
                <div>
                  <span className="text-[#6B6B7B] block text-[10px]">Premium Tier</span>
                  <span className="font-mono font-semibold text-[#0B0B14]">${formData.tiers.premium.price}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Standard escrow protection and automated milestone invoicing are activated for this gig.
              </span>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(15,15,30,0.06)]">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="text-xs text-[#4B4B5C] border-[rgba(15,15,30,0.12)] hover:bg-[#F4F4F8] disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-bold px-6 h-9 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Publishing Gig...</span>
                </>
              ) : (
                <>
                  <span>Publish to Marketplace</span>
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

"use client"
import { useApiResource } from "@/hooks/useApiResource"
import { ApiState } from "@/components/feedback/ApiState"
import { Link } from "@/i18n/routing"
import { Code2, Palette, TrendingUp, Cpu, Languages, Briefcase, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

const DETAILED_CATEGORIES = [
  {
    title: "Programming & Technology",
    slug: "programming",
    icon: Code2,
    description:
      "Architectural engineering, full-stack web applications, distributed cloud systems, and smart contract development.",
    subcategories: [
      "Web Application Development (Next.js, React)",
      "Backend APIs & Microservices (Node.js, Go)",
      "Database Architecture & Performance Tuning",
      "DevOps, Docker & Kubernetes CI/CD",
      "Mobile App Development (React Native, Flutter)",
      "Security Audits & Penetration Testing",
    ],
  },
  {
    title: "Graphics & Design",
    slug: "design",
    icon: Palette,
    description:
      "Editorial brand identity, high-conversion SaaS interfaces, 3D industrial renderings, and comprehensive design systems.",
    subcategories: [
      "Brand Identity & Visual Guidelines",
      "UI/UX Design for Web & Mobile",
      "Design Systems in Figma",
      "3D Modeling & Product Rendering",
      "Motion Graphics & Micro-interactions",
      "Illustration & Typography Craft",
    ],
  },
  {
    title: "AI & Automation",
    slug: "ai",
    icon: Cpu,
    description:
      "Custom autonomous agents, enterprise LLM fine-tuning, vector database pipelines, and intelligent workflow automation.",
    subcategories: [
      "Autonomous Agent Architecture",
      "LLM Integration & Prompt Engineering",
      "RAG & Vector Database Systems",
      "Computer Vision & Speech Models",
      "Business Workflow Automation",
      "Fine-Tuning Open Source Models",
    ],
  },
  {
    title: "Digital Marketing",
    slug: "marketing",
    icon: TrendingUp,
    description:
      "Data-backed growth strategy, programmatic SEO, enterprise paid acquisition, and funnel conversion optimization.",
    subcategories: [
      "Technical & Programmatic SEO",
      "Paid Performance Advertising",
      "B2B SaaS Growth Marketing",
      "Conversion Rate Optimization (CRO)",
      "Content Strategy & Distribution",
      "Marketing Analytics & Attribution",
    ],
  },
  {
    title: "Writing & Translation",
    slug: "writing",
    icon: Languages,
    description:
      "High-impact technical whitepapers, developer documentation, native localization, and thought-leadership copywriting.",
    subcategories: [
      "Technical Writing & API Docs",
      "Whitepapers & Research Briefs",
      "B2B Thought Leadership Copy",
      "Professional Software Localization",
      "Press Releases & Executive Statements",
      "Grant & Proposal Writing",
    ],
  },
  {
    title: "Business & Consulting",
    slug: "business",
    icon: Briefcase,
    description:
      "Executive strategic advisory, startup pitch decks, financial valuation models, and legal contract compliance.",
    subcategories: [
      "Financial Modeling & Forecasting",
      "Startup Pitch Decks & Investor Materials",
      "Market Research & Competitive Intelligence",
      "Product Strategy & Roadmap Consulting",
      "Fractional CTO / Design Advisory",
      "Contract & IP Legal Guidance",
    ],
  },
]

export default function CategoriesPage() {
  const resource = useApiResource<
    {
      id: string
      name: string
      slug: string
      parentId: string | null
      description: string | null
      _count: { services: number }
    }[]
  >("/api/v1/marketplace/categories")
  const liveCategories = (resource.data || [])
    .filter((c) => !c.parentId)
    .map((c) => ({
      title: c.name,
      slug: c.slug,
      icon: DETAILED_CATEGORIES.find((example) => example.slug === c.slug)?.icon || Briefcase,
      description:
        c.description ||
        DETAILED_CATEGORIES.find((example) => example.slug === c.slug)?.description ||
        "",
      serviceCount: `${c._count.services} active services`,
      subcategories: (resource.data || [])
        .filter((child) => child.parentId === c.id)
        .map((child) => child.name),
    }))

  const t = useTranslations("categoriesPage")

  if (resource.loading || resource.error)
    return (
      <div className="container mx-auto px-4 py-10">
        <ApiState loading={resource.loading} error={resource.error} retry={resource.reload} />
      </div>
    )
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs text-primary font-semibold tracking-wide uppercase mb-4">
          <span>{t("badge")}</span>
        </div>
        <h1 className="stripe-hero-heading text-slate-900 dark:text-white">
          Explore by <span className="stripe-gradient-text">Expertise</span>
        </h1>
        <p className="stripe-subheading text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Grid of Detailed Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {liveCategories.map((cat) => {
          const Icon = cat.icon
          return (
            <div
              key={cat.slug}
              className="stripe-card rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {cat.serviceCount}
                  </span>
                </div>

                <h2 className="font-display text-2xl text-slate-900 dark:text-white font-bold group-hover:text-primary transition-colors">
                  {cat.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                  {cat.description}
                </p>

                {/* Subcategory Pills */}
                <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">
                    {t("popularDomains")}
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {cat.subcategories.map((sub, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        <Link href={`/explore?category=${cat.slug}&q=${encodeURIComponent(sub)}`}>
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-slate-200/60 dark:border-slate-800">
                <Link
                  href={`/explore?category=${cat.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-indigo-600 transition-colors group/link"
                >
                  <span>{t("exploreCategory", { title: cat.title })}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

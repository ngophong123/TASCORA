import { Link } from "@/i18n/routing"
import {
  Code2,
  Palette,
  TrendingUp,
  Cpu,
  Languages,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { useTranslations } from "next-intl"

const DETAILED_CATEGORIES = [
  {
    title: "Programming & Technology",
    slug: "programming",
    icon: Code2,
    description: "Architectural engineering, full-stack web applications, distributed cloud systems, and smart contract development.",
    serviceCount: "1,240+ Active Services",
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
    description: "Editorial brand identity, high-conversion SaaS interfaces, 3D industrial renderings, and comprehensive design systems.",
    serviceCount: "980+ Active Services",
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
    description: "Custom autonomous agents, enterprise LLM fine-tuning, vector database pipelines, and intelligent workflow automation.",
    serviceCount: "640+ Active Services",
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
    description: "Data-backed growth strategy, programmatic SEO, enterprise paid acquisition, and funnel conversion optimization.",
    serviceCount: "810+ Active Services",
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
    description: "High-impact technical whitepapers, developer documentation, native localization, and thought-leadership copywriting.",
    serviceCount: "450+ Active Services",
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
    description: "Executive strategic advisory, startup pitch decks, financial valuation models, and legal contract compliance.",
    serviceCount: "520+ Active Services",
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
  const t = useTranslations("categoriesPage")

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-blue-600 font-medium mb-3">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>{t("badge")}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary font-medium tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-3 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Grid of Detailed Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DETAILED_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <div
              key={cat.slug}
              className="rounded-2xl border border-border bg-surface p-7 flex flex-col justify-between transition-all duration-300 hover:border-blue-600/40 hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold text-text-muted">{cat.serviceCount}</span>
                </div>

                <h2 className="font-display text-2xl text-text-primary font-medium group-hover:text-blue-600 transition-colors">
                  {cat.title}
                </h2>

                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Subcategory Pills */}
                <div className="mt-6 pt-5 border-t border-border/50">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block mb-2.5">
                    {t("popularDomains")}
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {cat.subcategories.map((sub, i) => (
                      <li key={i} className="flex items-center gap-2 hover:text-text-primary transition-colors">
                        <span className="h-1 w-1 rounded-full bg-blue-600/60" />
                        <Link href={`/explore?category=${cat.slug}&q=${encodeURIComponent(sub)}`}>
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-border/40">
                <Link
                  href={`/explore?category=${cat.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>{t("exploreCategory", { title: cat.title })}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Centralized Category Accent Map & Design Tokens
 *
 * Provides consistent, subtle color accents for categories and disciplines across
 * TASCORA (service cards, category grids, pills, filters, and icons).
 *
 * Guiding principle: 80-90% neutral base + 10-20% intentional category accent.
 */

export interface CategoryAccent {
  key: string
  label: string
  color: string // Tailwind color key
  textClass: string
  bgSoftClass: string
  borderSoftClass: string
  borderHoverClass: string
  pillClass: string
  iconBgGradient: string
  iconColorClass: string
  accentLineGradient: string
}

export type CategoryAccentKey =
  "web" | "design" | "ai" | "brand" | "mobile" | "video" | "seo" | "writing" | "devops" | "default"

export const CATEGORY_ACCENT_MAP: Record<CategoryAccentKey, CategoryAccent> = {
  // Web & Full-Stack Development -> Blue / Indigo
  web: {
    key: "web",
    label: "Web Development",
    color: "blue",
    textClass: "text-blue-600 dark:text-blue-400",
    bgSoftClass: "bg-blue-50/80 dark:bg-blue-950/40",
    borderSoftClass: "border-blue-200/70 dark:border-blue-800/60",
    borderHoverClass: "hover:border-blue-400/80 dark:hover:border-blue-600",
    pillClass:
      "bg-blue-50/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(79, 70, 229, 0.06) 100%)",
    iconColorClass: "text-blue-600 dark:text-blue-400",
    accentLineGradient: "linear-gradient(90deg, #2563eb, #4f46e5)",
  },

  // UI/UX & Product Design -> Violet / Pink
  design: {
    key: "design",
    label: "UI/UX & Product Design",
    color: "violet",
    textClass: "text-violet-600 dark:text-violet-400",
    bgSoftClass: "bg-violet-50/80 dark:bg-violet-950/40",
    borderSoftClass: "border-violet-200/70 dark:border-violet-800/60",
    borderHoverClass: "hover:border-violet-400/80 dark:hover:border-violet-600",
    pillClass:
      "bg-violet-50/80 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(236, 72, 153, 0.06) 100%)",
    iconColorClass: "text-violet-600 dark:text-violet-400",
    accentLineGradient: "linear-gradient(90deg, #7c3aed, #ec4899)",
  },

  // AI & Automation -> Purple / Cyan
  ai: {
    key: "ai",
    label: "AI & Automation",
    color: "purple",
    textClass: "text-purple-600 dark:text-purple-400",
    bgSoftClass: "bg-purple-50/80 dark:bg-purple-950/40",
    borderSoftClass: "border-purple-200/70 dark:border-purple-800/60",
    borderHoverClass: "hover:border-purple-400/80 dark:hover:border-purple-600",
    pillClass:
      "bg-purple-50/80 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)",
    iconColorClass: "text-purple-600 dark:text-purple-400",
    accentLineGradient: "linear-gradient(90deg, #9333ea, #06b6d4)",
  },

  // Brand Identity -> Pink / Orange
  brand: {
    key: "brand",
    label: "Logo & Brand Identity",
    color: "pink",
    textClass: "text-pink-600 dark:text-pink-400",
    bgSoftClass: "bg-pink-50/80 dark:bg-pink-950/40",
    borderSoftClass: "border-pink-200/70 dark:border-pink-800/60",
    borderHoverClass: "hover:border-pink-400/80 dark:hover:border-pink-600",
    pillClass:
      "bg-pink-50/80 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border border-pink-200/70 dark:border-pink-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(249, 115, 22, 0.06) 100%)",
    iconColorClass: "text-pink-600 dark:text-pink-400",
    accentLineGradient: "linear-gradient(90deg, #ec4899, #f97316)",
  },

  // Mobile App Development -> Blue / Cyan
  mobile: {
    key: "mobile",
    label: "Mobile App Development",
    color: "sky",
    textClass: "text-sky-600 dark:text-sky-400",
    bgSoftClass: "bg-sky-50/80 dark:bg-sky-950/40",
    borderSoftClass: "border-sky-200/70 dark:border-sky-800/60",
    borderHoverClass: "hover:border-sky-400/80 dark:hover:border-sky-600",
    pillClass:
      "bg-sky-50/80 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(6, 182, 212, 0.06) 100%)",
    iconColorClass: "text-sky-600 dark:text-sky-400",
    accentLineGradient: "linear-gradient(90deg, #0284c7, #06b6d4)",
  },

  // Video & 3D Animation -> Purple / Pink
  video: {
    key: "video",
    label: "Video & 3D Animation",
    color: "fuchsia",
    textClass: "text-fuchsia-600 dark:text-fuchsia-400",
    bgSoftClass: "bg-fuchsia-50/80 dark:bg-fuchsia-950/40",
    borderSoftClass: "border-fuchsia-200/70 dark:border-fuchsia-800/60",
    borderHoverClass: "hover:border-fuchsia-400/80 dark:hover:border-fuchsia-600",
    pillClass:
      "bg-fuchsia-50/80 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(192, 38, 211, 0.12) 0%, rgba(244, 63, 94, 0.06) 100%)",
    iconColorClass: "text-fuchsia-600 dark:text-fuchsia-400",
    accentLineGradient: "linear-gradient(90deg, #c026d3, #f43f5e)",
  },

  // Technical SEO & Marketing -> Emerald / Cyan
  seo: {
    key: "seo",
    label: "Technical SEO & Growth",
    color: "emerald",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgSoftClass: "bg-emerald-50/80 dark:bg-emerald-950/40",
    borderSoftClass: "border-emerald-200/70 dark:border-emerald-800/60",
    borderHoverClass: "hover:border-emerald-400/80 dark:hover:border-emerald-600",
    pillClass:
      "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(14, 165, 233, 0.06) 100%)",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
    accentLineGradient: "linear-gradient(90deg, #059669, #0ea5e9)",
  },

  // Technical Writing -> Indigo / Blue
  writing: {
    key: "writing",
    label: "Technical Writing",
    color: "indigo",
    textClass: "text-indigo-600 dark:text-indigo-400",
    bgSoftClass: "bg-indigo-50/80 dark:bg-indigo-950/40",
    borderSoftClass: "border-indigo-200/70 dark:border-indigo-800/60",
    borderHoverClass: "hover:border-indigo-400/80 dark:hover:border-indigo-600",
    pillClass:
      "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%)",
    iconColorClass: "text-indigo-600 dark:text-indigo-400",
    accentLineGradient: "linear-gradient(90deg, #4f46e5, #2563eb)",
  },

  // DevOps & Cloud Infrastructure -> Cyan / Teal
  devops: {
    key: "devops",
    label: "DevOps & Cloud",
    color: "cyan",
    textClass: "text-cyan-600 dark:text-cyan-400",
    bgSoftClass: "bg-cyan-50/80 dark:bg-cyan-950/40",
    borderSoftClass: "border-cyan-200/70 dark:border-cyan-800/60",
    borderHoverClass: "hover:border-cyan-400/80 dark:hover:border-cyan-600",
    pillClass:
      "bg-cyan-50/80 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200/70 dark:border-cyan-800/60",
    iconBgGradient:
      "linear-gradient(135deg, rgba(8, 145, 178, 0.12) 0%, rgba(13, 148, 136, 0.06) 100%)",
    iconColorClass: "text-cyan-600 dark:text-cyan-400",
    accentLineGradient: "linear-gradient(90deg, #0891b2, #0d9488)",
  },

  // Default fallback -> Brand Primary Indigo
  default: {
    key: "default",
    label: "Specialist Service",
    color: "primary",
    textClass: "text-primary dark:text-indigo-400",
    bgSoftClass: "bg-primary/5 dark:bg-primary/10",
    borderSoftClass: "border-primary/20 dark:border-primary/30",
    borderHoverClass: "hover:border-primary/50 dark:hover:border-primary/60",
    pillClass:
      "bg-primary/5 text-primary dark:bg-primary/15 dark:text-indigo-300 border border-primary/20 dark:border-primary/30",
    iconBgGradient:
      "linear-gradient(135deg, rgba(99, 91, 255, 0.12) 0%, rgba(79, 70, 229, 0.06) 100%)",
    iconColorClass: "text-primary dark:text-indigo-400",
    accentLineGradient: "linear-gradient(90deg, #635bff, #7c3aed)",
  },
}

/**
 * Resolves a category accent based on input category name, subcategory, or slug.
 */
export function getCategoryAccent(input?: string | null): CategoryAccent {
  if (!input) return CATEGORY_ACCENT_MAP.default

  const normalized = input.toLowerCase().trim()

  if (
    normalized.includes("web") ||
    normalized.includes("frontend") ||
    normalized.includes("programming") ||
    normalized.includes("full-stack")
  ) {
    return CATEGORY_ACCENT_MAP.web
  }
  if (
    normalized.includes("ui") ||
    normalized.includes("ux") ||
    normalized.includes("product design") ||
    normalized.includes("design") ||
    normalized.includes("figma")
  ) {
    return CATEGORY_ACCENT_MAP.design
  }
  if (
    normalized.includes("ai") ||
    normalized.includes("automation") ||
    normalized.includes("agent") ||
    normalized.includes("llm") ||
    normalized.includes("machine learning")
  ) {
    return CATEGORY_ACCENT_MAP.ai
  }
  if (
    normalized.includes("logo") ||
    normalized.includes("brand") ||
    normalized.includes("identity")
  ) {
    return CATEGORY_ACCENT_MAP.brand
  }
  if (
    normalized.includes("mobile") ||
    normalized.includes("react native") ||
    normalized.includes("flutter") ||
    normalized.includes("ios") ||
    normalized.includes("android")
  ) {
    return CATEGORY_ACCENT_MAP.mobile
  }
  if (
    normalized.includes("video") ||
    normalized.includes("3d") ||
    normalized.includes("animation") ||
    normalized.includes("motion")
  ) {
    return CATEGORY_ACCENT_MAP.video
  }
  if (
    normalized.includes("seo") ||
    normalized.includes("growth") ||
    normalized.includes("marketing")
  ) {
    return CATEGORY_ACCENT_MAP.seo
  }
  if (
    normalized.includes("writing") ||
    normalized.includes("docs") ||
    normalized.includes("whitepaper") ||
    normalized.includes("content")
  ) {
    return CATEGORY_ACCENT_MAP.writing
  }
  if (
    normalized.includes("devops") ||
    normalized.includes("cloud") ||
    normalized.includes("kubernetes") ||
    normalized.includes("docker")
  ) {
    return CATEGORY_ACCENT_MAP.devops
  }

  return CATEGORY_ACCENT_MAP.default
}

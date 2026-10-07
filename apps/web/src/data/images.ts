/**
 * TASCORA Centralized Local Image Registry
 *
 * All photography assets, avatars, gig covers, and gallery assets are stored locally
 * in /images/ and exported from this single source of truth.
 *
 * Every image is a persistent local asset ensuring zero dependence on external CDNs.
 */

export interface ImageAsset {
  src: string
  alt: string
  width?: number
  height?: number
}

/**
 * Direct persistent image paths dictionary: export const images = { heroGigCover: "...", ... }
 */
export const images = {
  // Hero & Landing Section
  heroGigCover: "/images/services/programming/full-stack-nextjs-node.jpg",
  coverDeveloperWorkspace: "/images/services/programming/developer-workstation-dual-monitors.jpg",

  // Specialist Avatars (Real Persistent Local Portraits)
  avatarAlexandre: "/images/avatars/alexandre-moreau.jpg",
  avatarHelena: "/images/avatars/helena-rostova.jpg",
  avatarMarcus: "/images/avatars/marcus-vance.jpg",
  avatarSophia: "/images/avatars/sophia-chen.jpg",
  avatarDmitri: "/images/avatars/dmitri-volkov.jpg",
  avatarChloe: "/images/avatars/chloe-laurent.jpg",
  avatarAdmin: "/images/avatars/default-avatar.jpg",
  avatarReviewer1: "/images/avatars/client-marcus.jpg",
  avatarReviewer2: "/images/avatars/reviewer-sarah.jpg",
  avatarClientMarcus: "/images/avatars/client-marcus.jpg",
  avatarClientEmily: "/images/avatars/client-emily.jpg",

  // Marketplace Gigs & Services Cover Cards (Real Photography)
  gigWebDevelopment: "/images/services/programming/full-stack-nextjs-node.jpg",
  gigBrandIdentity: "/images/services/design/luxury-brand-identity-stationery.jpg",
  gigAiAgents: "/images/services/ai/llm-rag-fine-tuning-code.jpg",
  gigSeoGrowth: "/images/services/marketing/technical-seo-analytics-growth.jpg",
  gigCybersecurity: "/images/services/programming/cybersecurity-soc-monitor.jpg",
  gig3dMotion: "/images/services/design/motion-graphics-3d-workstation.jpg",
  gigMobileApp: "/images/services/programming/mobile-app-engineering.jpg",
  gigCloudDevOps: "/images/services/programming/cloud-devops-infrastructure.jpg",

  // Service Detail Media Gallery (Real Photography)
  galleryCodeArchitecture: "/images/services/gallery/code-architecture-blueprint.jpg",
  galleryAnalyticsDashboard: "/images/services/gallery/analytics-revenue-metrics.jpg",
  galleryInfrastructure: "/images/services/gallery/cloud-server-datacenter.jpg",
} as const

export type ImageKey = keyof typeof images

/**
 * Themed Service Covers map by slug / id (Real Photography)
 */
export const serviceImages = {
  "fullstack-nextjs": "/images/services/programming/full-stack-nextjs-node.jpg",
  "brand-identity": "/images/services/design/luxury-brand-identity-stationery.jpg",
  "ai-agents": "/images/services/ai/llm-rag-fine-tuning-code.jpg",
  "seo-growth": "/images/services/marketing/technical-seo-analytics-growth.jpg",
  "cybersecurity-audit": "/images/services/programming/cybersecurity-soc-monitor.jpg",
  "3d-motion": "/images/services/design/motion-graphics-3d-workstation.jpg",
  "mobile-app": "/images/services/programming/mobile-app-engineering.jpg",
  "cloud-devops": "/images/services/programming/cloud-devops-infrastructure.jpg",
  "hero-gig-cover": "/images/services/programming/full-stack-nextjs-node.jpg",
  "gallery-code-architecture": "/images/services/gallery/code-architecture-blueprint.jpg",
  "gallery-analytics-dashboard": "/images/services/gallery/analytics-revenue-metrics.jpg",
  "gallery-infrastructure": "/images/services/gallery/cloud-server-datacenter.jpg",
} as const

export type ServiceImageSlug = keyof typeof serviceImages

/**
 * Category Fallback Photography Covers map
 */
export const categoryImages = {
  programming: "/images/services/programming/full-stack-nextjs-node.jpg",
  design: "/images/services/design/luxury-brand-identity-stationery.jpg",
  ai: "/images/services/ai/neural-network-ai-workstation.jpg",
  mobile: "/images/services/programming/mobile-app-engineering.jpg",
  devops: "/images/services/programming/cloud-devops-infrastructure.jpg",
  branding: "/images/services/design/visual-brand-guidelines-swatches.jpg",
  video: "/images/services/video/video-production-studio-editing.jpg",
  marketing: "/images/services/marketing/technical-seo-analytics-growth.jpg",
  writing: "/images/services/writing/technical-documentation-editorial.jpg",
  business: "/images/services/business/enterprise-consulting-boardroom.jpg",
} as const

export type CategoryImageKey = keyof typeof categoryImages

/**
 * Helper to get a category fallback cover photo
 */
export function getCategoryFallbackImage(categorySlug?: string): string {
  if (!categorySlug) return categoryImages.programming
  const normalized = categorySlug.toLowerCase()
  if (normalized in categoryImages) {
    return categoryImages[normalized as CategoryImageKey]
  }
  return categoryImages.programming
}

/**
 * Rich Image Metadata with meaningful semantic alt text and standard dimensions.
 */
export const imageDetails: Record<ImageKey, ImageAsset> = {
  heroGigCover: {
    src: images.heroGigCover,
    alt: "Full-Stack Next.js 15 & Autonomous AI Agent Workflow Engine service cover illustration",
    width: 800,
    height: 500,
  },
  coverDeveloperWorkspace: {
    src: images.coverDeveloperWorkspace,
    alt: "Modern clean software engineering workspace with dual displays and minimal desk setup",
    width: 1400,
    height: 400,
  },
  avatarAlexandre: {
    src: images.avatarAlexandre,
    alt: "Alexandre Moreau - Senior Full-Stack Architect portrait",
    width: 200,
    height: 200,
  },
  avatarHelena: {
    src: images.avatarHelena,
    alt: "Helena Rostova - Principal Brand and UI/UX Designer portrait",
    width: 200,
    height: 200,
  },
  avatarMarcus: {
    src: images.avatarMarcus,
    alt: "Marcus Vance - AI Systems Engineer and Research Lead portrait",
    width: 200,
    height: 200,
  },
  avatarSophia: {
    src: images.avatarSophia,
    alt: "Sophia Lindqvist - B2B SaaS Growth Marketer and Technical SEO Consultant portrait",
    width: 200,
    height: 200,
  },
  avatarDmitri: {
    src: images.avatarDmitri,
    alt: "Dmitri Volkov - Enterprise Cybersecurity Audit Engineer portrait",
    width: 200,
    height: 200,
  },
  avatarChloe: {
    src: images.avatarChloe,
    alt: "Chloe Dubois - 3D Product Motion Designer and Animator portrait",
    width: 200,
    height: 200,
  },
  avatarAdmin: {
    src: images.avatarAdmin,
    alt: "TASCORA Platform Trust and Safety Administrator profile avatar",
    width: 200,
    height: 200,
  },
  avatarReviewer1: {
    src: images.avatarReviewer1,
    alt: "David Chen - Verified enterprise client reviewer avatar",
    width: 200,
    height: 200,
  },
  avatarReviewer2: {
    src: images.avatarReviewer2,
    alt: "Elena Rostova - Verified startup client reviewer avatar",
    width: 200,
    height: 200,
  },
  avatarClientMarcus: {
    src: images.avatarClientMarcus,
    alt: "Marcus Thorne - VP of Product Engineering client avatar",
    width: 200,
    height: 200,
  },
  avatarClientEmily: {
    src: images.avatarClientEmily,
    alt: "Emily Zhang - Head of Digital Operations client avatar",
    width: 200,
    height: 200,
  },
  gigWebDevelopment: {
    src: images.gigWebDevelopment,
    alt: "Full-Stack Next.js 15 and Node.js production web architecture showcase card illustration",
    width: 800,
    height: 500,
  },
  gigBrandIdentity: {
    src: images.gigBrandIdentity,
    alt: "Luxury editorial brand identity and Figma UI/UX design system card illustration",
    width: 800,
    height: 500,
  },
  gigAiAgents: {
    src: images.gigAiAgents,
    alt: "Autonomous AI agents and neural retrieval-augmented generation pipeline card illustration",
    width: 800,
    height: 500,
  },
  gigSeoGrowth: {
    src: images.gigSeoGrowth,
    alt: "High-growth B2B SaaS programmatic SEO and conversion analytics card illustration",
    width: 800,
    height: 500,
  },
  gigCybersecurity: {
    src: images.gigCybersecurity,
    alt: "Enterprise cybersecurity penetration audit and CVE remediation scan card illustration",
    width: 800,
    height: 500,
  },
  gig3dMotion: {
    src: images.gig3dMotion,
    alt: "High-end 3D product rendering and WebGL motion graphics showcase card illustration",
    width: 800,
    height: 500,
  },
  gigMobileApp: {
    src: images.gigMobileApp,
    alt: "Cross-platform React Native and iOS mobile application architecture card illustration",
    width: 800,
    height: 500,
  },
  gigCloudDevOps: {
    src: images.gigCloudDevOps,
    alt: "Cloud infrastructure provisioning and automated zero-downtime CI/CD pipeline card illustration",
    width: 800,
    height: 500,
  },
  galleryCodeArchitecture: {
    src: images.galleryCodeArchitecture,
    alt: "Modular clean code architecture blueprint with strict TypeScript and ESLint standards illustration",
    width: 800,
    height: 500,
  },
  galleryAnalyticsDashboard: {
    src: images.galleryAnalyticsDashboard,
    alt: "Real-time production throughput monitoring and latency telemetry dashboard illustration",
    width: 800,
    height: 500,
  },
  galleryInfrastructure: {
    src: images.galleryInfrastructure,
    alt: "Scalable cloud container topology with Kubernetes and PostgreSQL clustering blueprint illustration",
    width: 800,
    height: 500,
  },
}

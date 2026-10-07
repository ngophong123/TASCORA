export interface MegaMenuItem {
  id: string
  title: string
  description: string
  href: string
  iconName: string
  badge?: string
}

export interface MegaMenuColumn {
  id: string
  title: string
  items: MegaMenuItem[]
}

export const EXPLORE_SERVICES_MENU: MegaMenuColumn[] = [
  {
    id: "engineeringCloud",
    title: "Engineering & Cloud",
    items: [
      {
        id: "fullStack",
        title: "Full-Stack Development",
        description: "Next.js, React, Node.js, and modern TypeScript architecture.",
        href: "/explore?category=programming",
        iconName: "Code2",
      },
      {
        id: "cloudDevOps",
        title: "Cloud Infrastructure & DevOps",
        description: "Docker, Kubernetes, AWS, and zero-downtime CI/CD.",
        href: "/explore?category=programming&q=devops",
        iconName: "Cloud",
      },
      {
        id: "smartContracts",
        title: "Smart Contracts & Web3",
        description: "Audited Solidity contracts and protocol architecture.",
        href: "/explore?category=programming&q=web3",
        iconName: "Cpu",
      },
    ],
  },
  {
    id: "aiDataSystems",
    title: "AI & Data Systems",
    items: [
      {
        id: "aiAgents",
        title: "Autonomous AI Agents",
        description: "Custom LangChain, AutoGen, and tool-augmented agent workflows.",
        href: "/explore?category=ai",
        iconName: "Sparkles",
        badge: "Hot",
      },
      {
        id: "llmRag",
        title: "LLM Fine-Tuning & RAG",
        description: "Vector databases, embeddings, and enterprise retrieval systems.",
        href: "/explore?category=ai&q=rag",
        iconName: "Terminal",
      },
      {
        id: "computerVision",
        title: "Computer Vision & Audio",
        description: "Multimodal AI models for production detection and speech.",
        href: "/explore?category=ai&q=vision",
        iconName: "ScanFace",
      },
    ],
  },
  {
    id: "designProductCraft",
    title: "Design & Product Craft",
    items: [
      {
        id: "designSystems",
        title: "Design Systems & UI/UX",
        description: "Figma tokens, accessible components, and SaaS workflows.",
        href: "/explore?category=design",
        iconName: "Palette",
      },
      {
        id: "brandIdentity",
        title: "Editorial Brand Identity",
        description: "Bespoke logos, typography guidelines, and brand books.",
        href: "/explore?category=design&q=branding",
        iconName: "PenTool",
      },
      {
        id: "motion3d",
        title: "3D Motion & Product Renders",
        description: "Cinema4D, Blender, and WebGL interactive experiences.",
        href: "/explore?category=design&q=3d",
        iconName: "Layers",
      },
    ],
  },
]

export const CATEGORIES_MENU: MegaMenuColumn[] = [
  {
    id: "technical",
    title: "Technical",
    items: [
      {
        id: "catProgramming",
        title: "Programming & Tech",
        description: "1,240+ specialized developers and engineers.",
        href: "/explore?category=programming",
        iconName: "Code2",
      },
      {
        id: "catAi",
        title: "AI & Machine Learning",
        description: "640+ research and automation practitioners.",
        href: "/explore?category=ai",
        iconName: "Cpu",
      },
    ],
  },
  {
    id: "creative",
    title: "Creative",
    items: [
      {
        id: "catDesign",
        title: "Graphics & Design",
        description: "980+ digital craftspeople and art directors.",
        href: "/explore?category=design",
        iconName: "Palette",
      },
      {
        id: "catVideo",
        title: "Video & Motion",
        description: "410+ commercial animators and editors.",
        href: "/explore?category=video",
        iconName: "Film",
      },
    ],
  },
  {
    id: "growthStrategy",
    title: "Growth & Strategy",
    items: [
      {
        id: "catMarketing",
        title: "Digital Marketing",
        description: "810+ technical SEO and growth specialists.",
        href: "/explore?category=marketing",
        iconName: "TrendingUp",
      },
      {
        id: "catBusiness",
        title: "Business Consulting",
        description: "520+ strategic advisors and fractional executives.",
        href: "/explore?category=business",
        iconName: "Briefcase",
      },
    ],
  },
]

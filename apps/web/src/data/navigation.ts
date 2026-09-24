export interface MegaMenuItem {
  title: string
  description: string
  href: string
  iconName: string
  badge?: string
}

export interface MegaMenuColumn {
  title: string
  items: MegaMenuItem[]
}

export const EXPLORE_SERVICES_MENU: MegaMenuColumn[] = [
  {
    title: "Engineering & Cloud",
    items: [
      {
        title: "Full-Stack Development",
        description: "Next.js, React, Node.js, and modern TypeScript architecture.",
        href: "/explore?category=programming",
        iconName: "Code2",
      },
      {
        title: "Cloud Infrastructure & DevOps",
        description: "Docker, Kubernetes, AWS, and zero-downtime CI/CD.",
        href: "/explore?category=programming&q=devops",
        iconName: "Cloud",
      },
      {
        title: "Smart Contracts & Web3",
        description: "Audited Solidity contracts and protocol architecture.",
        href: "/explore?category=programming&q=web3",
        iconName: "Cpu",
      },
    ],
  },
  {
    title: "AI & Data Systems",
    items: [
      {
        title: "Autonomous AI Agents",
        description: "Custom LangChain, AutoGen, and tool-augmented agent workflows.",
        href: "/explore?category=ai",
        iconName: "Sparkles",
        badge: "Hot",
      },
      {
        title: "LLM Fine-Tuning & RAG",
        description: "Vector databases, embeddings, and enterprise retrieval systems.",
        href: "/explore?category=ai&q=rag",
        iconName: "Terminal",
      },
      {
        title: "Computer Vision & Audio",
        description: "Multimodal AI models for production detection and speech.",
        href: "/explore?category=ai&q=vision",
        iconName: "ScanFace",
      },
    ],
  },
  {
    title: "Design & Product Craft",
    items: [
      {
        title: "Design Systems & UI/UX",
        description: "Figma tokens, accessible components, and SaaS workflows.",
        href: "/explore?category=design",
        iconName: "Palette",
      },
      {
        title: "Editorial Brand Identity",
        description: "Bespoke logos, typography guidelines, and brand books.",
        href: "/explore?category=design&q=branding",
        iconName: "PenTool",
      },
      {
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
    title: "Technical",
    items: [
      {
        title: "Programming & Tech",
        description: "1,240+ specialized developers and engineers.",
        href: "/explore?category=programming",
        iconName: "Code2",
      },
      {
        title: "AI & Machine Learning",
        description: "640+ research and automation practitioners.",
        href: "/explore?category=ai",
        iconName: "Cpu",
      },
    ],
  },
  {
    title: "Creative",
    items: [
      {
        title: "Graphics & Design",
        description: "980+ digital craftspeople and art directors.",
        href: "/explore?category=design",
        iconName: "Palette",
      },
      {
        title: "Video & Motion",
        description: "410+ commercial animators and editors.",
        href: "/explore?category=video",
        iconName: "Film",
      },
    ],
  },
  {
    title: "Growth & Strategy",
    items: [
      {
        title: "Digital Marketing",
        description: "810+ technical SEO and growth specialists.",
        href: "/explore?category=marketing",
        iconName: "TrendingUp",
      },
      {
        title: "Business Consulting",
        description: "520+ strategic advisors and fractional executives.",
        href: "/explore?category=business",
        iconName: "Briefcase",
      },
    ],
  },
]

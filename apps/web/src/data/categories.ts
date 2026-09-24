import { AccentColor } from "@/lib/gradients"

export interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string
  fromPrice: number
  iconName: string
  highlight?: boolean
  accent?: AccentColor
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Web Development",
    slug: "programming",
    description: "Next.js, modern React, full-stack microservices.",
    fromPrice: 150,
    iconName: "Code2",
    highlight: true,
    accent: "blue",
  },
  {
    id: "cat-2",
    name: "UI/UX & Product Design",
    slug: "design",
    description: "Design systems, conversion-driven SaaS interfaces.",
    fromPrice: 120,
    iconName: "Palette",
    highlight: true,
    accent: "violet",
  },
  {
    id: "cat-3",
    name: "AI & Automation",
    slug: "ai",
    description: "Custom autonomous agents, LLM pipelines, RAG.",
    fromPrice: 200,
    iconName: "Cpu",
    highlight: true,
    accent: "indigo",
  },
  {
    id: "cat-4",
    name: "Logo & Brand Identity",
    slug: "design",
    description: "Distinctive typography, guidelines, visual marks.",
    fromPrice: 95,
    iconName: "PenTool",
    accent: "pink",
  },
  {
    id: "cat-5",
    name: "Mobile App Development",
    slug: "programming",
    description: "High-performance React Native and Flutter apps.",
    fromPrice: 250,
    iconName: "Smartphone",
    accent: "teal",
  },
  {
    id: "cat-6",
    name: "Video & 3D Animation",
    slug: "design",
    description: "Interactive WebGL, product renders, kinetic type.",
    fromPrice: 180,
    iconName: "Film",
    accent: "amber",
  },
  {
    id: "cat-7",
    name: "Technical SEO & Growth",
    slug: "marketing",
    description: "Programmatic SEO, paid conversion funnels.",
    fromPrice: 140,
    iconName: "TrendingUp",
    accent: "indigo",
  },
  {
    id: "cat-8",
    name: "Technical Writing",
    slug: "writing",
    description: "API documentation, developer guides, whitepapers.",
    fromPrice: 85,
    iconName: "BookOpen",
    accent: "teal",
  },
]

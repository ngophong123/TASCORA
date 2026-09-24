import { AccentColor } from "@/lib/gradients"

export interface FreelancerProfile {
  id: string
  name: string
  title: string
  avatarInitials: string
  gradient: string
  accent?: AccentColor
  skills: string[]
  rating: number
  reviewsCount: number
  startingPrice: number
  available: boolean
}

export const FEATURED_FREELANCERS_DATA: FreelancerProfile[] = [
  {
    id: "f-1",
    name: "Alexandre Moreau",
    title: "Senior Full-Stack Architect",
    avatarInitials: "AM",
    gradient: "from-blue-600 to-sky-500",
    accent: "blue",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
    rating: 4.99,
    reviewsCount: 42,
    startingPrice: 350,
    available: true,
  },
  {
    id: "f-2",
    name: "Helena Rostova",
    title: "Principal Brand & Product Designer",
    avatarInitials: "HR",
    gradient: "from-teal-600 to-emerald-500",
    accent: "teal",
    skills: ["Design Systems", "Figma", "SaaS UX", "Typography"],
    rating: 5.0,
    reviewsCount: 38,
    startingPrice: 280,
    available: true,
  },
  {
    id: "f-3",
    name: "Marcus Vance",
    title: "AI Engineer & Research Lead",
    avatarInitials: "MV",
    gradient: "from-purple-600 to-violet-500",
    accent: "violet",
    skills: ["LangChain", "RAG Systems", "Python", "FastAPI"],
    rating: 4.96,
    reviewsCount: 29,
    startingPrice: 420,
    available: false,
  },
  {
    id: "f-4",
    name: "Sophia Lindqvist",
    title: "B2B SaaS Growth & SEO Strategist",
    avatarInitials: "SL",
    gradient: "from-pink-600 to-rose-500",
    accent: "pink",
    skills: ["Programmatic SEO", "Attribution", "Funnel CRO"],
    rating: 4.94,
    reviewsCount: 51,
    startingPrice: 190,
    available: true,
  },
]

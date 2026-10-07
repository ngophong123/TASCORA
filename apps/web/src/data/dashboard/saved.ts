import { images } from "../images"

export interface SavedSpecialist {
  id: string
  name: string
  title: string
  avatar: string
  badge: "TOP_RATED" | "PRO_VERIFIED" | "LEVEL_2"
  hourlyRate: number
  rating: number
  reviewsCount: number
  location: string
  responseTime: string
  skills: string[]
  completedProjects: number
  savedAt: string
}

export interface SavedGigItem {
  id: string
  title: string
  sellerName: string
  sellerAvatar: string
  coverImage: string
  rating: number
  reviewsCount: number
  startingPrice: number
  category: string
  deliveryDays: number
  savedAt: string
}

export const SAVED_SPECIALISTS: SavedSpecialist[] = [
  {
    id: "spec-1",
    name: "Alexandre Moreau",
    title: "Senior Full-Stack Architect",
    avatar: images.avatarAlexandre,
    badge: "TOP_RATED",
    hourlyRate: 95,
    rating: 4.9,
    reviewsCount: 48,
    location: "Paris, France",
    responseTime: "< 30m",
    skills: ["Next.js 15", "TypeScript", "Prisma", "Docker", "PostgreSQL"],
    completedProjects: 62,
    savedAt: "Saved 2 days ago",
  },
  {
    id: "spec-2",
    name: "Sophia Rodriguez",
    title: "AI & Machine Learning Engineer",
    avatar: images.avatarSophia,
    badge: "TOP_RATED",
    hourlyRate: 120,
    rating: 5.0,
    reviewsCount: 34,
    location: "Austin, TX",
    responseTime: "< 1h",
    skills: ["LangChain", "Python", "pgvector", "RAG Pipelines", "Claude API"],
    completedProjects: 41,
    savedAt: "Saved last week",
  },
  {
    id: "spec-3",
    name: "David Kael",
    title: "Lead Brand & Product Designer",
    avatar: images.avatarReviewer1,
    badge: "PRO_VERIFIED",
    hourlyRate: 85,
    rating: 4.8,
    reviewsCount: 52,
    location: "Berlin, Germany",
    responseTime: "< 2h",
    skills: ["Figma", "Design Systems", "3D Glassmorphism", "Branding"],
    completedProjects: 78,
    savedAt: "Saved 2 weeks ago",
  },
  {
    id: "spec-4",
    name: "Elena Rostova",
    title: "Senior WebGL & Creative Developer",
    avatar: images.avatarReviewer2,
    badge: "TOP_RATED",
    hourlyRate: 110,
    rating: 4.95,
    reviewsCount: 67,
    location: "Stockholm, Sweden",
    responseTime: "< 45m",
    skills: ["Three.js", "GLSL Shaders", "GSAP ScrollTrigger", "Web Audio"],
    completedProjects: 55,
    savedAt: "Saved 3 weeks ago",
  },
]

export const SAVED_GIGS: SavedGigItem[] = [
  {
    id: "sgig-1",
    title: "Production Next.js 15 & Node.js Scalable Architecture",
    sellerName: "Alexandre Moreau",
    sellerAvatar: images.avatarAlexandre,
    coverImage: images.gigWebDevelopment,
    rating: 4.96,
    reviewsCount: 42,
    startingPrice: 250,
    category: "Web Development",
    deliveryDays: 2,
    savedAt: "Sep 18, 2026",
  },
  {
    id: "sgig-2",
    title: "Autonomous AI Agents & LLM RAG Pipeline Integration",
    sellerName: "Sophia Rodriguez",
    sellerAvatar: images.avatarSophia,
    coverImage: images.gigAiAgents,
    rating: 5.0,
    reviewsCount: 19,
    startingPrice: 350,
    category: "Artificial Intelligence",
    deliveryDays: 3,
    savedAt: "Sep 14, 2026",
  },
]

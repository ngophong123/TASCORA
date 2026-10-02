import { faker } from "@faker-js/faker"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"
import bcrypt from "bcryptjs"
import {
  generateAllOrders,
  generateAllReviews,
  writeOrdersDataFile,
  writeReviewsDataFile,
} from "./phase3-generators"
import {
  generateAllConversations,
  generateAllNotifications,
  generatePaymentsData,
  writeMessagesDataFile,
  writeNotificationsDataFile,
  writePaymentsDataFile,
} from "./phase4-generators"

// Load environment variables (.env.local has priority over .env)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

// ---------------------------------------------------------------------------
// 1. REPRODUCIBLE SEED CONFIGURATION
// ---------------------------------------------------------------------------
const SEED = 42
faker.seed(SEED)

// ---------------------------------------------------------------------------
// 2. ADMIN CREDENTIALS (from ENV only; fallback placeholders in comments)
// ---------------------------------------------------------------------------
// Read from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.local (fallback example: admin@example.com / changeme123)
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com"
const ADMIN_RAW_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "changeme123"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_RAW_PASSWORD, 10)

// ---------------------------------------------------------------------------
// 3. TYPES DEFINITIONS (Users & Freelancers)
// ---------------------------------------------------------------------------
export type UserRole = "client" | "freelancer" | "both" | "admin"
export type UserAccountStatus = "active" | "suspended" | "inactive"
export type SellerLevel = "NEW" | "LEVEL_1" | "LEVEL_2" | "TOP_RATED"
export type AccentColor = "blue" | "violet" | "pink" | "teal" | "amber" | "indigo"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  title: string
  avatarInitials: string
  avatar?: string
  gradient: string
  accent: AccentColor
  bio: string
  country: string
  city?: string
  memberSince: string
  languages: string[]
  skills: string[]
  responseTime: string
  completionRate: number
  rating: number
  reviewsCount: number
  startingPrice: number
  available: boolean
  isVerified: boolean
  isOnline: boolean
  isPro: boolean
  level: SellerLevel
  status: UserAccountStatus
  company?: string
  completedOrders: number
  passwordHash?: string
}

// ---------------------------------------------------------------------------
// 4. TYPES DEFINITIONS (Gigs & Packages)
// ---------------------------------------------------------------------------
export interface GigSeller {
  id: string
  name: string
  avatarInitials: string
  avatar?: string
  gradient: string
  level: SellerLevel
  isOnline: boolean
  isPro: boolean
  country: string
  languages: string[]
}

export interface GigPackageTier {
  type: "BASIC" | "STANDARD" | "PREMIUM"
  name: string
  price: number
  deliveryDays: number
  revisions: number | "unlimited"
  description: string
  features: string[]
}

export interface GigAddon {
  id: string
  name: string
  price: number
  deliveryDaysDelta?: number
  description: string
}

export interface GigFAQItem {
  id?: string
  q: string
  a: string
}

export interface GigGalleryItem {
  url: string
  alt?: string
}

export interface GigStats {
  impressions: number
  clicks: number
  orders: number
  revenue: number
  conversionRate: number
}

export interface Gig {
  id: string
  slug: string
  title: string
  description: string
  categorySlug: string
  categoryName: string
  subCategorySlug: string
  subCategoryName: string
  startingPrice: number
  deliveryDays: number
  rating: number
  reviewsCount: number
  coverGradient: string
  accentColor: string
  badgeText?: string
  seller: GigSeller
  tags: string[]
  createdAt: string
  featured?: boolean
  status?: "active" | "draft" | "paused"
  packages: GigPackageTier[]
  addons: GigAddon[]
  faqs: GigFAQItem[]
  gallery: GigGalleryItem[]
  stats: GigStats
}

// ---------------------------------------------------------------------------
// 5. COLOR PALETTES & DOMAINS
// ---------------------------------------------------------------------------
const ACCENT_PALETTES: Array<{ accent: AccentColor; gradient: string; hex: string }> = [
  { accent: "blue", gradient: "from-blue-600 via-sky-500 to-indigo-600", hex: "#2563EB" },
  { accent: "teal", gradient: "from-teal-600 via-emerald-500 to-cyan-500", hex: "#0D9488" },
  { accent: "violet", gradient: "from-purple-600 via-violet-500 to-fuchsia-600", hex: "#7C3AED" },
  { accent: "pink", gradient: "from-pink-600 via-rose-500 to-red-500", hex: "#DB2777" },
  { accent: "amber", gradient: "from-amber-600 via-orange-500 to-yellow-500", hex: "#D97706" },
  { accent: "indigo", gradient: "from-indigo-600 via-blue-600 to-violet-600", hex: "#4338CA" },
]

const DOMAIN_SKILLS: Record<string, { titles: string[]; skills: string[]; basePrice: number }> = {
  webdev: {
    titles: [
      "Senior Full-Stack Architect",
      "Next.js & React 19 Core Engineer",
      "Distributed Backend & Node.js Specialist",
      "TypeScript & Performance Engineer",
    ],
    skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS", "Redis", "GraphQL"],
    basePrice: 280,
  },
  design: {
    titles: [
      "Principal Brand & Product Designer",
      "Design Systems & SaaS UX Architect",
      "Senior Product Visual Designer",
      "Design Technologist & Figma Specialist",
    ],
    skills: ["Figma", "Design Systems", "SaaS UX", "Prototyping", "Design Tokens", "Typography", "User Research"],
    basePrice: 220,
  },
  ai: {
    titles: [
      "AI Systems Architect & LLM Engineer",
      "Autonomous Agent & LangChain Specialist",
      "Machine Learning Pipeline Engineer",
      "Computer Vision & Multimodal Researcher",
    ],
    skills: ["LangChain", "RAG Systems", "Python", "FastAPI", "Vector Databases", "OpenAI API", "PyTorch"],
    basePrice: 380,
  },
  mobile: {
    titles: [
      "Senior React Native & Cross-Platform Engineer",
      "Mobile Architecture & Performance Lead",
      "iOS & Flutter Mobile Specialist",
    ],
    skills: ["React Native", "Expo", "TypeScript", "iOS Swift", "Android Kotlin", "Offline-First", "Mobile CI/CD"],
    basePrice: 260,
  },
  video: {
    titles: [
      "3D Motion Designer & WebGL Creative Director",
      "Commercial Video Editor & Animator",
      "Cinema4D & Interactive 3D Artist",
    ],
    skills: ["Cinema4D", "Blender", "After Effects", "Three.js", "WebGL", "Sound Design", "Color Grading"],
    basePrice: 240,
  },
  writing: {
    titles: [
      "API Documentation & Developer Content Architect",
      "Fintech & Deep-Tech Whitepaper Author",
      "Lead Technical Communicator",
    ],
    skills: ["Technical Writing", "OpenAPI", "Mintlify", "Developer Guides", "Whitepapers", "SDK Reference"],
    basePrice: 160,
  },
  marketing: {
    titles: [
      "B2B SaaS Growth & Technical SEO Strategist",
      "Programmatic SEO & Acquisition Lead",
      "Paid Performance & Funnel Optimization Director",
    ],
    skills: ["Programmatic SEO", "Technical SEO", "Attribution Modeling", "Funnel CRO", "Google Analytics 4"],
    basePrice: 200,
  },
}

// ---------------------------------------------------------------------------
// 6. FIXED KNOWN ENTITIES (Phase 1 Users)
// ---------------------------------------------------------------------------
export const SEED_ADMIN_USER: UserProfile = {
  id: "usr-admin",
  name: "TASCORA System Administrator",
  email: ADMIN_EMAIL,
  role: "admin",
  title: "Platform Trust, Safety & Operations Director",
  avatarInitials: "AD",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  gradient: "from-blue-700 via-indigo-600 to-violet-700",
  accent: "blue",
  bio: "Platform Administrator overseeing dispute arbitration, automated milestone escrow reconciliation, and platform compliance policies.",
  country: "United States",
  city: "San Francisco",
  memberSince: "2023-01-01",
  languages: ["English", "French"],
  skills: ["Platform Governance", "Escrow Arbitration", "Security Compliance", "Identity Verification"],
  responseTime: "Instant (< 5 mins)",
  completionRate: 100,
  rating: 5.0,
  reviewsCount: 0,
  startingPrice: 0,
  available: true,
  isVerified: true,
  isOnline: true,
  isPro: true,
  level: "TOP_RATED",
  status: "active",
  company: "TASCORA Global Inc.",
  completedOrders: 0,
  passwordHash: ADMIN_PASSWORD_HASH,
}

const FIXED_FEATURED_FREELANCERS: UserProfile[] = [
  {
    id: "f-1",
    name: "Alexandre Moreau",
    email: "alexandre.moreau@tascora.test",
    role: "both",
    title: "Senior Full-Stack Architect",
    avatarInitials: "AM",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    gradient: "from-blue-600 to-sky-500",
    accent: "blue",
    bio: "Principal Software Architect with 12+ years of experience designing high-throughput distributed systems, Next.js applications, and secure microservices.",
    country: "France",
    city: "Paris",
    memberSince: "2023-02-15",
    languages: ["English", "French"],
    skills: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
    responseTime: "1 hour",
    completionRate: 99,
    rating: 4.99,
    reviewsCount: 42,
    startingPrice: 250,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: true,
    level: "TOP_RATED",
    status: "active",
    completedOrders: 114,
  },
  {
    id: "f-2",
    name: "Helena Rostova",
    email: "helena.rostova@tascora.test",
    role: "freelancer",
    title: "Principal Brand & Product Designer",
    avatarInitials: "HR",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    gradient: "from-teal-600 to-emerald-500",
    accent: "teal",
    bio: "Digital product designer specializing in design systems, typographic identity, and conversion-centered SaaS interfaces for Series A-C startups.",
    country: "Estonia",
    city: "Tallinn",
    memberSince: "2023-05-10",
    languages: ["English", "Estonian", "German"],
    skills: ["Design Systems", "Figma", "SaaS UX", "Typography"],
    responseTime: "2 hours",
    completionRate: 100,
    rating: 5.0,
    reviewsCount: 38,
    startingPrice: 280,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: true,
    level: "TOP_RATED",
    status: "active",
    completedOrders: 86,
  },
  {
    id: "f-3",
    name: "Marcus Vance",
    email: "marcus.vance@tascora.test",
    role: "freelancer",
    title: "AI Engineer & Research Lead",
    avatarInitials: "MV",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    gradient: "from-purple-600 to-violet-500",
    accent: "violet",
    bio: "AI practitioner developing production RAG architectures, local LLM fine-tuning pipelines, and autonomous agent systems for enterprise knowledge bases.",
    country: "United States",
    city: "Austin",
    memberSince: "2023-08-20",
    languages: ["English"],
    skills: ["LangChain", "RAG Systems", "Python", "FastAPI"],
    responseTime: "3 hours",
    completionRate: 98,
    rating: 4.96,
    reviewsCount: 29,
    startingPrice: 420,
    available: false,
    isVerified: true,
    isOnline: false,
    isPro: true,
    level: "TOP_RATED",
    status: "active",
    completedOrders: 54,
  },
  {
    id: "f-4",
    name: "Sophia Lindqvist",
    email: "sophia.lindqvist@tascora.test",
    role: "freelancer",
    title: "B2B SaaS Growth & SEO Strategist",
    avatarInitials: "SL",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    gradient: "from-pink-600 to-rose-500",
    accent: "pink",
    bio: "Technical growth marketer focused on programmatic SEO architectures, multi-touch attribution pipelines, and landing page conversion optimization.",
    country: "Sweden",
    city: "Stockholm",
    memberSince: "2023-11-04",
    languages: ["English", "Swedish"],
    skills: ["Programmatic SEO", "Attribution", "Funnel CRO"],
    responseTime: "1 hour",
    completionRate: 97,
    rating: 4.94,
    reviewsCount: 51,
    startingPrice: 190,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: false,
    level: "LEVEL_2",
    status: "active",
    completedOrders: 72,
  },
]

const FIXED_CLIENTS: UserProfile[] = [
  {
    id: "usr-client-1",
    name: "Marcus Thorne",
    email: "marcus.thorne@fintechcorp.io",
    role: "client",
    title: "VP of Product Engineering",
    company: "Fintech Corp Ltd",
    avatarInitials: "MT",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    gradient: "from-blue-600 to-indigo-700",
    accent: "blue",
    bio: "Overseeing engineering and cloud infrastructure for cross-border banking rails and decentralized settlements.",
    country: "United Kingdom",
    city: "London",
    memberSince: "2024-01-10",
    languages: ["English"],
    skills: ["FinTech", "Engineering Management", "Escrow Workflows"],
    responseTime: "within 2 hours",
    completionRate: 100,
    rating: 5.0,
    reviewsCount: 18,
    startingPrice: 0,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: true,
    level: "TOP_RATED",
    status: "active",
    completedOrders: 18,
  },
  {
    id: "usr-client-2",
    name: "David Sterling",
    email: "david.sterling@apexcap.com",
    role: "client",
    title: "Managing Partner",
    company: "Apex Capital Ventures",
    avatarInitials: "DS",
    gradient: "from-teal-600 to-cyan-700",
    accent: "teal",
    bio: "Venture capitalist backing early-stage infrastructure, AI tooling, and enterprise productivity software.",
    country: "United States",
    city: "New York",
    memberSince: "2024-03-01",
    languages: ["English"],
    skills: ["Venture Capital", "Due Diligence", "SaaS Strategy"],
    responseTime: "within 4 hours",
    completionRate: 100,
    rating: 4.9,
    reviewsCount: 12,
    startingPrice: 0,
    available: true,
    isVerified: true,
    isOnline: false,
    isPro: true,
    level: "LEVEL_2",
    status: "active",
    completedOrders: 14,
  },
  {
    id: "usr-client-3",
    name: "Emily Zhang",
    email: "emily.zhang@nexusventures.sg",
    role: "client",
    title: "Head of Digital Operations",
    company: "Nexus AI Ventures",
    avatarInitials: "EZ",
    gradient: "from-violet-600 to-purple-700",
    accent: "violet",
    bio: "Leading rapid software prototyping and growth sprints for hyper-growth portfolio companies across APAC.",
    country: "Singapore",
    city: "Singapore",
    memberSince: "2024-04-18",
    languages: ["English", "Mandarin"],
    skills: ["Product Management", "Growth Operations", "AI Prototyping"],
    responseTime: "within 1 hour",
    completionRate: 100,
    rating: 5.0,
    reviewsCount: 22,
    startingPrice: 0,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: true,
    level: "TOP_RATED",
    status: "active",
    completedOrders: 25,
  },
  {
    id: "usr-client-4",
    name: "Rachel Adams",
    email: "rachel.adams@horizonhealth.ca",
    role: "client",
    title: "Chief Technology Officer",
    company: "Horizon Health Technologies",
    avatarInitials: "RA",
    gradient: "from-pink-600 to-rose-700",
    accent: "pink",
    bio: "Building HIPAA-compliant telemedicine patient experiences and scalable HL7 FHIR integrations.",
    country: "Canada",
    city: "Toronto",
    memberSince: "2024-06-05",
    languages: ["English", "French"],
    skills: ["HealthTech", "Security Audits", "HIPAA Compliance"],
    responseTime: "within 3 hours",
    completionRate: 100,
    rating: 4.95,
    reviewsCount: 9,
    startingPrice: 0,
    available: true,
    isVerified: true,
    isOnline: false,
    isPro: false,
    level: "LEVEL_2",
    status: "active",
    completedOrders: 11,
  },
  {
    id: "usr-client-5",
    name: "Liam O'Connor",
    email: "liam.oconnor@novadynamics.ie",
    role: "client",
    title: "Co-Founder & CEO",
    company: "Nova Dynamics AI",
    avatarInitials: "LO",
    gradient: "from-indigo-600 to-blue-700",
    accent: "indigo",
    bio: "Scaling generative workflow automation pipelines for European industrial logistics and freight forwarding.",
    country: "Ireland",
    city: "Dublin",
    memberSince: "2024-08-12",
    languages: ["English"],
    skills: ["Startup Leadership", "AI Workflow Automation", "Contract Negotiation"],
    responseTime: "within 2 hours",
    completionRate: 98,
    rating: 4.88,
    reviewsCount: 7,
    startingPrice: 0,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: false,
    level: "LEVEL_1",
    status: "active",
    completedOrders: 9,
  },
]

const SPECIFIC_EDGE_CASES: UserProfile[] = [
  {
    id: "usr-edge-overflow",
    name: "Dr. Bartholomew Alexander Montgomery-Fitzgerald III",
    email: "bart.montgomery.fitzgerald.the.third@hyperbolic-enterprises-global.test",
    role: "freelancer",
    title: "Executive Distinguished Systems Architect & Global Enterprise Transformation Lead Specialist",
    avatarInitials: "BM",
    gradient: "from-indigo-700 via-purple-700 to-pink-700",
    accent: "indigo",
    bio: "Over twenty-five years architecting mission-critical distributed consensus networks, zero-latency financial transmission conduits, and fault-tolerant multi-cloud enterprise application fabrics across heterogeneous banking conglomerates worldwide. Specializes in deep cryptographic formal verification, ultra-scale streaming microservices, resilient disaster topologies, and cross-border regulatory governance.",
    country: "United Kingdom",
    city: "Stratford-upon-Avon, Warwickshire",
    memberSince: "2023-01-15",
    languages: ["English", "Latin", "Ancient Greek", "German", "French"],
    skills: ["High-Throughput Systems", "Formal Verification", "Distributed Consensus", "Disaster Recovery", "Zero-Latency C++", "Enterprise Kubernetes", "Heterogeneous Architectures"],
    responseTime: "within 2 hours",
    completionRate: 100,
    rating: 4.98,
    reviewsCount: 164,
    startingPrice: 850,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: true,
    level: "TOP_RATED",
    status: "active",
    completedOrders: 142,
  },
  {
    id: "usr-edge-brandnew",
    name: "Oliver Bennett",
    email: "oliver.bennett.dev@tascora.test",
    role: "freelancer",
    title: "Junior React & TypeScript Developer",
    avatarInitials: "OB",
    gradient: "from-sky-500 to-blue-600",
    accent: "blue",
    bio: "Passionate front-end developer eager to build clean, accessible components in Next.js and Tailwind CSS. Newly registered on TASCORA and ready for first project engagements.",
    country: "Australia",
    city: "Melbourne",
    memberSince: "2026-03-25",
    languages: ["English"],
    skills: ["React", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"],
    responseTime: "within 30 mins",
    completionRate: 0,
    rating: 0.0,
    reviewsCount: 0,
    startingPrice: 65,
    available: true,
    isVerified: false,
    isOnline: true,
    isPro: false,
    level: "NEW",
    status: "active",
    completedOrders: 0,
  },
  {
    id: "usr-edge-fast-response",
    name: "Chloe Nguyen (Minh Chau)",
    email: "chloe.nguyen@cloudops.vn",
    role: "freelancer",
    title: "DevOps & Zero-Downtime CI/CD Specialist",
    avatarInitials: "CN",
    gradient: "from-teal-500 to-emerald-600",
    accent: "teal",
    bio: "Automation maniac maintaining 99.999% uptime pipelines. Specializes in Docker, Terraform, AWS ECS Fargate, and zero-downtime blue/green deployment orchestration.",
    country: "Vietnam",
    city: "Hanoi",
    memberSince: "2023-09-12",
    languages: ["Vietnamese", "English"],
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions", "CI/CD", "Linux"],
    responseTime: "0-day (< 15 mins)",
    completionRate: 100,
    rating: 5.0,
    reviewsCount: 74,
    startingPrice: 210,
    available: true,
    isVerified: true,
    isOnline: true,
    isPro: true,
    level: "TOP_RATED",
    status: "active",
    completedOrders: 82,
  },
  {
    id: "usr-edge-slow-response",
    name: "Torsten Lindemann",
    email: "torsten.lindemann@sap-audit.de",
    role: "freelancer",
    title: "Enterprise SAP & Cloud Migration Consultant",
    avatarInitials: "TL",
    gradient: "from-amber-600 to-stone-700",
    accent: "amber",
    bio: "Providing quarterly architectural audits and strategic migration planning for SAP S/4HANA transitions. Engages in high-touch, async consultative deliveries.",
    country: "Germany",
    city: "Munich",
    memberSince: "2023-04-10",
    languages: ["German", "English"],
    skills: ["Enterprise Architecture", "SAP S/4HANA", "Cloud Migration", "Compliance Auditing"],
    responseTime: "Within a week",
    completionRate: 94,
    rating: 4.82,
    reviewsCount: 26,
    startingPrice: 650,
    available: true,
    isVerified: true,
    isOnline: false,
    isPro: true,
    level: "LEVEL_2",
    status: "active",
    completedOrders: 31,
  },
  {
    id: "usr-edge-suspended",
    name: "Sergei Romanov",
    email: "sergei.romanov.inactive@tascora.test",
    role: "freelancer",
    title: "Legacy Web3 Contract Engineer",
    avatarInitials: "SR",
    gradient: "from-rose-700 to-slate-800",
    accent: "pink",
    bio: "Account currently suspended pending credential reverification and policy audit review.",
    country: "Cyprus",
    city: "Limassol",
    memberSince: "2023-06-01",
    languages: ["Russian", "English"],
    skills: ["Solidity", "Smart Contracts", "Truffle", "EVM"],
    responseTime: "N/A (Suspended)",
    completionRate: 81,
    rating: 3.75,
    reviewsCount: 19,
    startingPrice: 150,
    available: false,
    isVerified: false,
    isOnline: false,
    isPro: false,
    level: "NEW",
    status: "suspended",
    completedOrders: 21,
  },
]

function generateBulkUsers(): UserProfile[] {
  const users: UserProfile[] = []
  const domainKeys = Object.keys(DOMAIN_SKILLS)

  const INTERNATIONAL_COUNTRIES = [
    { country: "United States", cities: ["San Francisco", "Seattle", "New York", "Chicago", "Austin"] },
    { country: "Vietnam", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang"] },
    { country: "Germany", cities: ["Berlin", "Hamburg", "Frankfurt"] },
    { country: "United Kingdom", cities: ["London", "Manchester", "Edinburgh"] },
    { country: "Japan", cities: ["Tokyo", "Osaka", "Kyoto"] },
    { country: "Canada", cities: ["Vancouver", "Montreal", "Ottawa"] },
    { country: "Singapore", cities: ["Singapore"] },
    { country: "Netherlands", cities: ["Amsterdam", "Rotterdam", "Utrecht"] },
    { country: "France", cities: ["Lyon", "Bordeaux", "Marseille"] },
    { country: "Australia", cities: ["Sydney", "Brisbane", "Perth"] },
    { country: "Sweden", cities: ["Gothenburg", "Malmo"] },
    { country: "Brazil", cities: ["Sao Paulo", "Florianopolis"] },
  ]

  const VIETNAMESE_NAMES = [
    { first: "Minh", last: "Nguyen", city: "Hanoi" },
    { first: "Mai", last: "Tran", city: "Ho Chi Minh City" },
    { first: "Hoang", last: "Le", city: "Da Nang" },
    { first: "Anh", last: "Pham", city: "Hanoi" },
  ]

  for (let i = 1; i <= 31; i++) {
    const isBoth = i <= 10
    const role: UserRole = isBoth ? "both" : "freelancer"
    const domainKey = domainKeys[(i - 1) % domainKeys.length]
    const domain = DOMAIN_SKILLS[domainKey]
    const palette = ACCENT_PALETTES[(i - 1) % ACCENT_PALETTES.length]

    let firstName: string
    let lastName: string
    let country: string
    let city: string

    if (i % 8 === 0 && VIETNAMESE_NAMES[i / 8 - 1]) {
      const vn = VIETNAMESE_NAMES[i / 8 - 1]
      firstName = vn.first
      lastName = vn.last
      country = "Vietnam"
      city = vn.city
    } else {
      firstName = faker.person.firstName()
      lastName = faker.person.lastName()
      const loc = INTERNATIONAL_COUNTRIES[(i - 1) % INTERNATIONAL_COUNTRIES.length]
      country = loc.country
      city = loc.cities[(i - 1) % loc.cities.length]
    }

    const fullName = `${firstName} ${lastName}`
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
    const title = domain.titles[(i - 1) % domain.titles.length]

    const ratingBase = i % 7 === 0 ? 4.32 : i % 5 === 0 ? 4.65 : 4.88 + ((i % 12) * 0.01)
    const rating = Math.min(5.0, Math.round(ratingBase * 100) / 100)
    const reviewsCount = 12 + ((i * 17) % 115)
    const completedOrders = reviewsCount + Math.floor(reviewsCount * 0.3)

    const level: SellerLevel =
      reviewsCount > 80 ? "TOP_RATED" : reviewsCount > 30 ? "LEVEL_2" : reviewsCount > 10 ? "LEVEL_1" : "NEW"

    const responseTimes = ["within 1 hour", "within 2 hours", "within 4 hours", "within 12 hours", "within 24 hours"]
    const responseTime = responseTimes[i % responseTimes.length]

    const year = 2023 + (i % 3)
    const month = String(1 + (i % 12)).padStart(2, "0")
    const day = String(1 + ((i * 3) % 28)).padStart(2, "0")
    const memberSince = `${year}-${month}-${day}`

    const languages = ["English"]
    if (country === "Vietnam") languages.push("Vietnamese")
    else if (country === "France") languages.push("French")
    else if (country === "Germany") languages.push("German")
    else if (country === "Japan") languages.push("Japanese")
    else if (country === "Sweden") languages.push("Swedish")
    else if (country === "Brazil") languages.push("Portuguese")

    const skillsCount = 4 + (i % 3)
    const userSkills = domain.skills.slice(0, skillsCount)

    const bioSentences = [
      `Passionate ${title.toLowerCase()} focused on architecting resilient, production-tested digital experiences.`,
      `Collaborates closely with founders and venture teams to deliver measurable product velocity and clean code.`,
      `Over ${5 + (i % 8)} years delivering specialized solutions across modern ${domainKey === "webdev" ? "web and cloud systems" : "product disciplines"}.`,
    ]

    users.push({
      id: `usr-${10 + i}`,
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@tascora.test`,
      role,
      title,
      avatarInitials: initials,
      gradient: palette.gradient,
      accent: palette.accent,
      bio: bioSentences.join(" "),
      country,
      city,
      memberSince,
      languages,
      skills: userSkills,
      responseTime,
      completionRate: 95 + (i % 6),
      rating,
      reviewsCount,
      startingPrice: domain.basePrice + ((i * 15) % 90),
      available: i % 9 !== 0,
      isVerified: i % 4 !== 0,
      isOnline: i % 2 === 0,
      isPro: level === "TOP_RATED" || i % 3 === 0,
      level,
      status: "active",
      completedOrders,
    })
  }

  return users
}

export function generateAllUsers(): UserProfile[] {
  const bulkUsers = generateBulkUsers()

  return [
    SEED_ADMIN_USER,
    ...FIXED_FEATURED_FREELANCERS,
    ...FIXED_CLIENTS,
    ...SPECIFIC_EDGE_CASES,
    ...bulkUsers,
  ]
}

// ---------------------------------------------------------------------------
// 7. PHASE 2: GIGS GENERATOR (60-80 Gigs, Packages, Add-ons, FAQs, Galleries)
// ---------------------------------------------------------------------------
const GALLERY_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80",
]

interface CategoryConfig {
  slug: string
  name: string
  subcategories: Array<{ slug: string; name: string }>
}

const CATEGORIES: CategoryConfig[] = [
  {
    slug: "programming",
    name: "Web Development",
    subcategories: [
      { slug: "nextjs", name: "Next.js & React 19" },
      { slug: "fullstack", name: "Full-Stack Node.js" },
      { slug: "cloud-devops", name: "Cloud & DevOps" },
      { slug: "smart-contracts", name: "Smart Contracts & Web3" },
      { slug: "mobile", name: "Mobile App Development" },
    ],
  },
  {
    slug: "design",
    name: "UI/UX & Product Design",
    subcategories: [
      { slug: "design-systems", name: "Design Systems & Figma" },
      { slug: "saas-ux", name: "SaaS Application UX" },
      { slug: "branding", name: "Logo & Brand Identity" },
      { slug: "3d-motion", name: "Video & 3D Animation" },
    ],
  },
  {
    slug: "ai",
    name: "AI & Automation",
    subcategories: [
      { slug: "agents", name: "Autonomous AI Agents" },
      { slug: "rag-systems", name: "LLM Fine-Tuning & RAG" },
      { slug: "computer-vision", name: "Computer Vision & ML" },
    ],
  },
  {
    slug: "marketing",
    name: "Technical SEO & Growth",
    subcategories: [
      { slug: "programmatic-seo", name: "Programmatic SEO Architecture" },
      { slug: "cro-funnels", name: "Conversion Rate Optimization" },
      { slug: "attribution", name: "Attribution & Analytics" },
    ],
  },
  {
    slug: "writing",
    name: "Technical Writing",
    subcategories: [
      { slug: "api-docs", name: "API & Developer Documentation" },
      { slug: "whitepapers", name: "Fintech & Web3 Whitepapers" },
      { slug: "architecture-specs", name: "System Architecture Specs" },
    ],
  },
]

// Structured Gig Catalog Seed Templates (70 Gigs Total)
const GIG_CATALOG_TEMPLATES = [
  // WEB DEVELOPMENT (14)
  {
    catIndex: 0,
    subIndex: 0,
    title: "Full-Stack Next.js 15 & Node.js Production Architecture with Clean Code",
    basePrice: 250,
    stdPrice: 450,
    premPrice: 850,
    tags: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    badge: "Best Seller",
    featured: true,
  },
  {
    catIndex: 0,
    subIndex: 0,
    title: "High-Converting SaaS Landing Page in Next.js & Framer Motion",
    basePrice: 180,
    stdPrice: 320,
    premPrice: 590,
    tags: ["Next.js", "Framer Motion", "Tailwind CSS", "SEO"],
  },
  {
    catIndex: 0,
    subIndex: 1,
    title: "Scalable GraphQL & REST Microservices Backend in NestJS and Redis",
    basePrice: 320,
    stdPrice: 620,
    premPrice: 1100,
    tags: ["NestJS", "Node.js", "GraphQL", "Redis", "Docker"],
    featured: true,
  },
  {
    catIndex: 0,
    subIndex: 1,
    title: "High-Performance Go (Golang) Microservice Engine with gRPC & RabbitMQ",
    basePrice: 380,
    stdPrice: 720,
    premPrice: 1250,
    tags: ["Golang", "gRPC", "RabbitMQ", "Microservices"],
  },
  {
    catIndex: 0,
    subIndex: 2,
    title: "Zero-Downtime AWS ECS & Terraform Infrastructure as Code Setup",
    basePrice: 290,
    stdPrice: 580,
    premPrice: 980,
    tags: ["AWS", "Terraform", "Docker", "CI/CD"],
    badge: "Pro Choice",
  },
  {
    catIndex: 0,
    subIndex: 2,
    title: "Kubernetes Production Cluster Setup with ArgoCD GitOps Pipeline",
    basePrice: 450,
    stdPrice: 850,
    premPrice: 1500,
    tags: ["Kubernetes", "GitOps", "ArgoCD", "Helm"],
  },
  {
    catIndex: 0,
    subIndex: 3,
    title: "Audited Solidity Smart Contracts with Formal ERC-20 & ERC-721 Security",
    basePrice: 420,
    stdPrice: 790,
    premPrice: 1400,
    tags: ["Solidity", "Web3", "Ethereum", "Smart Contracts"],
    badge: "Top Rated",
  },
  {
    catIndex: 0,
    subIndex: 3,
    title: "DeFi Staking Protocol & Cross-Chain Bridge Web3 Integration",
    basePrice: 520,
    stdPrice: 950,
    premPrice: 1650,
    tags: ["DeFi", "Solidity", "EVM", "Ethers.js"],
  },
  {
    catIndex: 0,
    subIndex: 4,
    title: "Cross-Platform React Native & Expo Mobile App with Offline SQLite Sync",
    basePrice: 310,
    stdPrice: 590,
    premPrice: 1050,
    tags: ["React Native", "Expo", "TypeScript", "Mobile"],
    featured: true,
  },
  {
    catIndex: 0,
    subIndex: 4,
    title: "Native iOS Swift 6 & SwiftUI Application with Biometric Authentication",
    basePrice: 350,
    stdPrice: 680,
    premPrice: 1190,
    tags: ["Swift", "SwiftUI", "iOS", "CoreData"],
  },
  {
    catIndex: 0,
    subIndex: 4,
    title: "High-Performance Flutter Mobile App with BLoC Pattern Architecture",
    basePrice: 280,
    stdPrice: 520,
    premPrice: 920,
    tags: ["Flutter", "Dart", "BLoC", "Cross-Platform"],
  },
  {
    catIndex: 0,
    subIndex: 0,
    title: "Next.js 15 E-Commerce Platform with Stripe Checkout & Webhook Pipeline",
    basePrice: 270,
    stdPrice: 490,
    premPrice: 890,
    tags: ["Next.js", "Stripe", "E-Commerce", "PostgreSQL"],
  },
  {
    catIndex: 0,
    subIndex: 0,
    title: "Serverless Cloudflare Workers & D1 Edge API with Global Sub-50ms Latency",
    basePrice: 210,
    stdPrice: 390,
    premPrice: 710,
    tags: ["Cloudflare", "Serverless", "Edge", "TypeScript"],
  },
  {
    catIndex: 0,
    subIndex: 1,
    title: "Real-Time WebSocket & Socket.io Collaborative Canvas Engine",
    basePrice: 260,
    stdPrice: 480,
    premPrice: 860,
    tags: ["WebSockets", "Socket.io", "Real-Time", "React"],
  },

  // UI/UX & PRODUCT DESIGN (10)
  {
    catIndex: 1,
    subIndex: 0,
    title: "Scalable Figma Design System with Design Tokens, Auto-Layout & Variables",
    basePrice: 280,
    stdPrice: 520,
    premPrice: 920,
    tags: ["Figma", "Design Systems", "Tokens", "UI Kit"],
    badge: "Best Seller",
    featured: true,
  },
  {
    catIndex: 1,
    subIndex: 1,
    title: "Complex B2B SaaS Dashboard UI/UX Design with Dark Mode & Mobile Flows",
    basePrice: 320,
    stdPrice: 590,
    premPrice: 1050,
    tags: ["SaaS UX", "Dashboard", "Figma", "Web App"],
    featured: true,
  },
  {
    catIndex: 1,
    subIndex: 1,
    title: "FinTech Banking & Payment Mobile App UI/UX with High-Fidelity Prototype",
    basePrice: 340,
    stdPrice: 640,
    premPrice: 1150,
    tags: ["Fintech", "Mobile UX", "Figma", "Prototyping"],
  },
  {
    catIndex: 1,
    subIndex: 0,
    title: "Accessible WCAG 2.1 AA Compliant Web Application UI Kit in Figma",
    basePrice: 240,
    stdPrice: 460,
    premPrice: 820,
    tags: ["Accessibility", "WCAG", "Figma", "Design System"],
  },
  {
    catIndex: 1,
    subIndex: 1,
    title: "E-Commerce User Journey Mapping & Checkout Flow Conversion Redesign",
    basePrice: 260,
    stdPrice: 480,
    premPrice: 870,
    tags: ["CRO", "E-Commerce", "UX Research", "Figma"],
  },
  {
    catIndex: 1,
    subIndex: 2,
    title: "Minimalist Modern Tech Logo & Vector Brand Identity System",
    basePrice: 190,
    stdPrice: 360,
    premPrice: 650,
    tags: ["Logo", "Branding", "Vector", "Identity"],
  },
  {
    catIndex: 1,
    subIndex: 2,
    title: "Complete Startup Brand Book, Custom Typography Guidelines & Pitch Deck",
    basePrice: 290,
    stdPrice: 550,
    premPrice: 990,
    tags: ["Brand Book", "Style Guide", "Pitch Deck", "Branding"],
    badge: "Pro Choice",
  },
  {
    catIndex: 1,
    subIndex: 2,
    title: "Custom 3D Brand Asset Pack & Vector Iconography Set for Web & Mobile",
    basePrice: 220,
    stdPrice: 420,
    premPrice: 750,
    tags: ["Iconography", "3D Icons", "Brand Assets", "Illustrator"],
  },
  {
    catIndex: 1,
    subIndex: 3,
    title: "Photorealistic 3D Product Commercial Render & Animation in Cinema4D",
    basePrice: 380,
    stdPrice: 710,
    premPrice: 1280,
    tags: ["Cinema4D", "3D Render", "Product Video", "Animation"],
    featured: true,
  },
  {
    catIndex: 1,
    subIndex: 3,
    title: "Interactive Three.js & WebGL 3D Experience for Modern Tech Marketing Sites",
    basePrice: 440,
    stdPrice: 820,
    premPrice: 1480,
    tags: ["Three.js", "WebGL", "Interactive 3D", "JavaScript"],
  },

  // AI & AUTOMATION (11)
  {
    catIndex: 2,
    subIndex: 0,
    title: "Autonomous AI Agent Workflow Architecture with LangChain, Tools & Memory",
    basePrice: 380,
    stdPrice: 690,
    premPrice: 1250,
    tags: ["LangChain", "AI Agents", "Python", "OpenAI"],
    badge: "Trending",
    featured: true,
  },
  {
    catIndex: 2,
    subIndex: 1,
    title: "Enterprise RAG Knowledge System with Vector Database & Citation Metadata",
    basePrice: 420,
    stdPrice: 790,
    premPrice: 1390,
    tags: ["RAG", "Vector DB", "Pinecone", "Embeddings"],
    featured: true,
  },
  {
    catIndex: 2,
    subIndex: 1,
    title: "Custom LLM Fine-Tuning Pipeline with LoRA / QLoRA on Llama 3 & Mistral",
    basePrice: 480,
    stdPrice: 890,
    premPrice: 1590,
    tags: ["LLM", "Fine-Tuning", "LoRA", "PyTorch"],
  },
  {
    catIndex: 2,
    subIndex: 0,
    title: "Multi-Agent Simulation & Decision Engine using CrewAI & AutoGen",
    basePrice: 390,
    stdPrice: 720,
    premPrice: 1280,
    tags: ["AutoGen", "CrewAI", "Multi-Agent", "Python"],
  },
  {
    catIndex: 2,
    subIndex: 2,
    title: "Real-Time Computer Vision Pipeline for Object Detection & Defect Tracking",
    basePrice: 360,
    stdPrice: 670,
    premPrice: 1180,
    tags: ["Computer Vision", "YOLO", "OpenCV", "PyTorch"],
  },
  {
    catIndex: 2,
    subIndex: 2,
    title: "Low-Latency Speech-to-Text & Audio Transcription Pipeline with Whisper AI",
    basePrice: 280,
    stdPrice: 510,
    premPrice: 890,
    tags: ["Whisper AI", "Audio", "Speech-to-Text", "FastAPI"],
  },
  {
    catIndex: 2,
    subIndex: 0,
    title: "AI Customer Support Agent with Zendesk API & Sentiment Intent Routing",
    basePrice: 310,
    stdPrice: 570,
    premPrice: 990,
    tags: ["Customer Support", "Zendesk", "AI Agent", "NLP"],
  },
  {
    catIndex: 2,
    subIndex: 1,
    title: "Enterprise Semantic Search Engine over Large PDF & Markdown Repositories",
    basePrice: 330,
    stdPrice: 610,
    premPrice: 1080,
    tags: ["Semantic Search", "Milvus", "Embeddings", "FastAPI"],
  },
  {
    catIndex: 2,
    subIndex: 0,
    title: "Automated Data Extraction & PDF OCR Pipeline using Multimodal Vision LLMs",
    basePrice: 270,
    stdPrice: 490,
    premPrice: 870,
    tags: ["OCR", "Vision LLM", "Data Extraction", "Python"],
  },
  {
    catIndex: 2,
    subIndex: 1,
    title: "Code Review & Security Vulnerability Detection AI Assistant for GitHub",
    basePrice: 340,
    stdPrice: 630,
    premPrice: 1110,
    tags: ["GitHub Actions", "Code Review", "AI Security", "DevSecOps"],
  },
  {
    catIndex: 2,
    subIndex: 0,
    title: "Autonomous Web Scraping & Synthetic Training Dataset Generation Pipeline",
    basePrice: 290,
    stdPrice: 530,
    premPrice: 940,
    tags: ["Web Scraping", "Playwright", "Synthetic Data", "AI"],
  },

  // TECHNICAL SEO & GROWTH (7)
  {
    catIndex: 3,
    subIndex: 0,
    title: "Programmatic SEO Architecture with Next.js ISR for 50,000+ Indexed Pages",
    basePrice: 290,
    stdPrice: 550,
    premPrice: 980,
    tags: ["Programmatic SEO", "Next.js ISR", "SEO", "SaaS Growth"],
    badge: "Best Seller",
    featured: true,
  },
  {
    catIndex: 3,
    subIndex: 1,
    title: "SaaS Conversion Rate Optimization (CRO) Audit & Multi-Variant Growth Plan",
    basePrice: 220,
    stdPrice: 410,
    premPrice: 740,
    tags: ["CRO", "Funnel", "A/B Testing", "Analytics"],
  },
  {
    catIndex: 3,
    subIndex: 2,
    title: "Full-Funnel Multi-Touch Attribution & Google Analytics 4 Server-Side Setup",
    basePrice: 260,
    stdPrice: 490,
    premPrice: 880,
    tags: ["GA4", "Attribution", "Server-Side GTM", "Tracking"],
  },
  {
    catIndex: 3,
    subIndex: 0,
    title: "Core Web Vitals & Technical Speed Audit for 100 Mobile Lighthouse Score",
    basePrice: 190,
    stdPrice: 350,
    premPrice: 620,
    tags: ["Core Web Vitals", "Lighthouse", "Speed Optimization", "Performance"],
  },
  {
    catIndex: 3,
    subIndex: 1,
    title: "B2B SaaS Cold Outbound Email Infrastructure & Deliverability Warmup Setup",
    basePrice: 230,
    stdPrice: 430,
    premPrice: 770,
    tags: ["Cold Email", "Deliverability", "DNS", "SPF/DKIM"],
  },
  {
    catIndex: 3,
    subIndex: 2,
    title: "Mixpanel & PostHog Event Taxonomy Architecture for Product Analytics",
    basePrice: 270,
    stdPrice: 510,
    premPrice: 910,
    tags: ["PostHog", "Mixpanel", "Product Analytics", "Telemetry"],
  },
  {
    catIndex: 3,
    subIndex: 0,
    title: "International Multi-Region Hreflang & Subfolder SEO Localization Engine",
    basePrice: 240,
    stdPrice: 450,
    premPrice: 810,
    tags: ["International SEO", "Hreflang", "Localization", "Growth"],
  },

  // TECHNICAL WRITING & DOCUMENTATION (7)
  {
    catIndex: 4,
    subIndex: 0,
    title: "Comprehensive OpenAPI 3.1 & Interactive Mintlify Developer Documentation",
    basePrice: 180,
    stdPrice: 340,
    premPrice: 620,
    tags: ["Mintlify", "OpenAPI", "API Docs", "Developer Experience"],
    badge: "Top Rated",
    featured: true,
  },
  {
    catIndex: 4,
    subIndex: 1,
    title: "FinTech, AI & Web3 Architecture Whitepaper with Formal Mathematical Proofs",
    basePrice: 420,
    stdPrice: 780,
    premPrice: 1390,
    tags: ["Whitepaper", "Fintech", "Tokenomics", "Research"],
    featured: true,
  },
  {
    catIndex: 4,
    subIndex: 0,
    title: "Developer SDK Quickstart Guides, Code Snippets & Postman Public Workspace",
    basePrice: 160,
    stdPrice: 310,
    premPrice: 560,
    tags: ["SDK Docs", "Postman", "Developer Guides", "API"],
  },
  {
    catIndex: 4,
    subIndex: 2,
    title: "System Architecture RFC & High-Level Engineering Specifications Document",
    basePrice: 280,
    stdPrice: 520,
    premPrice: 940,
    tags: ["RFC", "Architecture", "Engineering Specs", "Documentation"],
  },
  {
    catIndex: 4,
    subIndex: 0,
    title: "Self-Hosted Docusaurus Developer Portal with Search & Versioning",
    basePrice: 210,
    stdPrice: 390,
    premPrice: 710,
    tags: ["Docusaurus", "Markdown", "Documentation", "Algolia"],
  },
  {
    catIndex: 4,
    subIndex: 1,
    title: "Security & SOC2 Compliance Policy Documentation for Enterprise Audits",
    basePrice: 340,
    stdPrice: 630,
    premPrice: 1120,
    tags: ["SOC2", "Security Compliance", "Policy Docs", "Audits"],
  },
  {
    catIndex: 4,
    subIndex: 2,
    title: "Database Disaster Recovery & Runbook Incident Response Guidelines",
    basePrice: 250,
    stdPrice: 470,
    premPrice: 840,
    tags: ["Runbooks", "Incident Response", "SRE", "Disaster Recovery"],
  },

  // VIDEO & 3D ANIMATION (5 additional to reach 7 total video gigs)
  {
    catIndex: 1,
    subIndex: 3,
    title: "High-End 2D Motion Graphics & Kinetic Typography Explainer Video",
    basePrice: 280,
    stdPrice: 530,
    premPrice: 960,
    tags: ["Motion Graphics", "After Effects", "Explainer Video", "Typography"],
  },
  {
    catIndex: 1,
    subIndex: 3,
    title: "App Store & SaaS Promo Video with UI Screencasts & Sound Design",
    basePrice: 240,
    stdPrice: 450,
    premPrice: 820,
    tags: ["Promo Video", "App Store Video", "SaaS Video", "Sound Design"],
  },
  {
    catIndex: 1,
    subIndex: 3,
    title: "Custom Lottie Animations for Web & Mobile App Micro-Interactions",
    basePrice: 150,
    stdPrice: 280,
    premPrice: 510,
    tags: ["Lottie", "Micro-Interactions", "Bodymovin", "UI Animation"],
  },
  {
    catIndex: 1,
    subIndex: 3,
    title: "Blender 3D Isometric SaaS Scene & Architectural Tech Isometric Render",
    basePrice: 290,
    stdPrice: 550,
    premPrice: 990,
    tags: ["Blender", "Isometric 3D", "3D Scene", "Tech Art"],
  },
  {
    catIndex: 1,
    subIndex: 3,
    title: "Cinematic Product Reveal Trailer with Dynamic Particle Physics & CGI",
    basePrice: 420,
    stdPrice: 790,
    premPrice: 1420,
    tags: ["CGI", "Product Reveal", "Cinema4D", "Octane Render"],
  },

  // MOBILE APPS (4 additional to reach 7 total mobile gigs)
  {
    catIndex: 0,
    subIndex: 4,
    title: "Mobile App Store Optimization (ASO) & Fastlane Automated Release Pipeline",
    basePrice: 190,
    stdPrice: 360,
    premPrice: 650,
    tags: ["ASO", "Fastlane", "CI/CD", "App Store"],
  },
  {
    catIndex: 0,
    subIndex: 4,
    title: "Real-Time Chat & Geolocation Tracking Mobile App in React Native",
    basePrice: 340,
    stdPrice: 630,
    premPrice: 1130,
    tags: ["React Native", "Geolocation", "Chat", "WebSockets"],
  },
  {
    catIndex: 0,
    subIndex: 4,
    title: "Audio Streaming & Podcast Mobile Application with Background Playback",
    basePrice: 320,
    stdPrice: 600,
    premPrice: 1080,
    tags: ["Audio Streaming", "Flutter", "Mobile", "ExoPlayer"],
  },
  {
    catIndex: 0,
    subIndex: 4,
    title: "Secure FinTech Mobile Wallet UI with Biometric Vault & Push Notification Rails",
    basePrice: 380,
    stdPrice: 710,
    premPrice: 1270,
    tags: ["Fintech", "Mobile Wallet", "React Native", "Security"],
  },

  // ADDITIONAL WEB & DESIGN EXPANSIONS TO COMPLETE 65 BASE GIGS
  {
    catIndex: 0,
    subIndex: 0,
    title: "Headless Shopify Next.js Storefront with Algolia InstantSearch",
    basePrice: 310,
    stdPrice: 580,
    premPrice: 1040,
    tags: ["Shopify", "Headless", "Next.js", "Algolia"],
  },
  {
    catIndex: 0,
    subIndex: 1,
    title: "Multi-Tenant B2B SaaS Auth Engine with RBAC & Organization Invitations",
    basePrice: 280,
    stdPrice: 530,
    premPrice: 950,
    tags: ["Auth", "RBAC", "Multi-Tenant", "Node.js"],
  },
  {
    catIndex: 1,
    subIndex: 0,
    title: "Interactive Storybook UI Component Documentation with Automated Visual Regression",
    basePrice: 230,
    stdPrice: 430,
    premPrice: 780,
    tags: ["Storybook", "Visual Regression", "Design System", "React"],
  },
  {
    catIndex: 2,
    subIndex: 1,
    title: "Local Offline LLM In-Browser Inference Engine using WebGPU & Transformers.js",
    basePrice: 370,
    stdPrice: 690,
    premPrice: 1240,
    tags: ["WebGPU", "Local LLM", "Transformers.js", "AI"],
  },
  {
    catIndex: 4,
    subIndex: 1,
    title: "Developer Onboarding Runbooks & Architecture ADR Documentation Template",
    basePrice: 170,
    stdPrice: 320,
    premPrice: 580,
    tags: ["ADR", "Onboarding", "Runbooks", "Developer Docs"],
  },
]

// ---------------------------------------------------------------------------
// 8. SPECIFIC GIG EDGE CASES (5 deliberate entities)
// ---------------------------------------------------------------------------
interface SpecificGigEdgeCaseConfig {
  id: string
  slug: string
  title: string
  categorySlug: string
  categoryName: string
  subCategorySlug: string
  subCategoryName: string
  sellerId: string
  status?: "active" | "draft" | "paused"
  singlePackageOnly?: boolean
  maxAddons?: boolean
  zeroOrders?: boolean
  veryLongTitle?: boolean
}

const SPECIFIC_GIG_EDGE_CASES: SpecificGigEdgeCaseConfig[] = [
  // Edge Case 1: Single Package Only (Tests UI when STANDARD and PREMIUM are absent)
  {
    id: "gig-edge-single-tier",
    slug: "rapid-security-vulnerability-cve-audit",
    title: "Targeted Rapid Security Code Audit & Dependency CVE Scan",
    categorySlug: "programming",
    categoryName: "Web Development",
    subCategorySlug: "cloud-devops",
    subCategoryName: "Cloud & DevOps",
    sellerId: "f-1",
    singlePackageOnly: true,
  },
  // Edge Case 2: Very Long Title (Tests text wrap and overflow in cards and detail headers)
  {
    id: "gig-edge-overflow-title",
    slug: "enterprise-heterogeneous-multi-cloud-high-throughput-microservices",
    title: "Enterprise Heterogeneous Multi-Cloud High-Throughput Zero-Downtime Microservices Architecture with Formal Cryptographic Verification, Kubernetes Orchestration, and Distributed Transaction Observability",
    categorySlug: "programming",
    categoryName: "Web Development",
    subCategorySlug: "fullstack",
    subCategoryName: "Full-Stack Node.js",
    sellerId: "usr-edge-overflow",
    veryLongTitle: true,
  },
  // Edge Case 3: Zero Orders Yet (Tests empty review tabs and zero stats display)
  {
    id: "gig-edge-zero-orders",
    slug: "fresh-react-components-tailwind-ui",
    title: "Accessible Tailwind CSS & React 19 UI Component Library",
    categorySlug: "programming",
    categoryName: "Web Development",
    subCategorySlug: "nextjs",
    subCategoryName: "Next.js & React 19",
    sellerId: "usr-edge-brandnew",
    zeroOrders: true,
  },
  // Edge Case 4: Paused / Draft Gig (Tests My Gigs status filters)
  {
    id: "gig-edge-draft",
    slug: "internal-draft-quantum-computing-simulator",
    title: "Draft Experimental Quantum Computing Simulator with Qiskit & Python",
    categorySlug: "ai",
    categoryName: "AI & Automation",
    subCategorySlug: "agents",
    subCategoryName: "Autonomous AI Agents",
    sellerId: "f-3",
    status: "draft",
  },
  // Edge Case 5: Maximum Number of Add-ons (Tests checklist expansion and scroll)
  {
    id: "gig-edge-max-addons",
    slug: "fullstack-enterprise-cloud-suite-maximum-addons",
    title: "Full-Stack Enterprise Cloud SaaS Suite with Maximum Add-on Options",
    categorySlug: "programming",
    categoryName: "Web Development",
    subCategorySlug: "nextjs",
    subCategoryName: "Next.js & React 19",
    sellerId: "f-1",
    maxAddons: true,
  },
]

export function generateAllGigs(freelancers: UserProfile[]): Gig[] {
  const gigs: Gig[] = []

  // Ensure we can lookup freelancers easily
  const freelancerMap = new Map<string, UserProfile>()
  freelancers.forEach((f) => freelancerMap.set(f.id, f))

  // 1. GENERATE REGULAR 65 CATALOG GIGS
  GIG_CATALOG_TEMPLATES.forEach((tmpl, idx) => {
    const gigId = `gig-${idx + 1}`
    const category = CATEGORIES[tmpl.catIndex]
    const subcategory = category.subcategories[tmpl.subIndex]
    const palette = ACCENT_PALETTES[idx % ACCENT_PALETTES.length]

    // Distribute seller across all available freelancers
    // Keep first gig mapped to Alexandre Moreau (f-1)
    const seller = idx === 0 ? freelancerMap.get("f-1")! : freelancers[(idx + 1) % freelancers.length]

    // Create 3 Package Tiers
    const packages: GigPackageTier[] = [
      {
        type: "BASIC",
        name: "Starter Deliverable",
        price: tmpl.basePrice,
        deliveryDays: Math.max(2, Math.floor(tmpl.basePrice / 100)),
        revisions: 2,
        description: `Essential ${subcategory.name} setup tailored for early-stage validation, clean code structure, and fundamental deliverables.`,
        features: [
          `Core ${subcategory.name} Foundation`,
          "Detailed Code / Asset Documentation",
          "2 Iteration & Revision Rounds",
          "Linted & Strict TypeScript / Vector Deliverables",
          "Production Readiness Handover",
        ],
      },
      {
        type: "STANDARD",
        name: "Production Monorepo",
        price: tmpl.stdPrice,
        deliveryDays: Math.max(4, Math.floor(tmpl.stdPrice / 90)),
        revisions: 4,
        description: `Comprehensive production-ready release with full test suites, automated CI/CD integration, and high-load performance optimization.`,
        features: [
          "Everything in Starter Tier",
          "Automated Unit & Integration Test Suites",
          "High-Throughput Optimization & Indexing",
          "CI/CD Deployment Configuration",
          "4 Revisions Included",
          "Priority 48-Hour Turnaround Support",
        ],
      },
      {
        type: "PREMIUM",
        name: "Enterprise Architecture",
        price: tmpl.premPrice,
        deliveryDays: Math.max(7, Math.floor(tmpl.premPrice / 80)),
        revisions: "unlimited",
        description: `Full-scale enterprise execution with architecture blueprinting, multi-stage Docker / vector builds, and 30-day dedicated post-launch support.`,
        features: [
          "Everything in Production Monorepo",
          "Custom Multi-Cloud / Enterprise Provisioning",
          "Formal Security & Vulnerability Auditing",
          "Unlimited Revisions & Iteration Rounds",
          "30 Days Dedicated VIP SLA Support",
          "1-on-1 Architectural Walkthrough Call",
        ],
      },
    ]

    // Add-ons (2 to 4 items)
    const addons: GigAddon[] =
      idx === 0
        ? [
            {
              id: "express-delivery",
              name: "24-Hour Express Delivery",
              price: 50,
              deliveryDaysDelta: 1,
              description: "Prioritize project delivery within 24 hours",
            },
            {
              id: "extra-revision",
              name: "Additional Code Audit & Revision Round",
              price: 35,
              description: "Deep architectural & vulnerability review",
            },
          ]
        : [
            {
              id: "express-delivery",
              name: "24-Hour Express Delivery",
              price: Math.round(tmpl.basePrice * 0.25),
              deliveryDaysDelta: 1,
              description: "Expedited dedicated development prioritized over existing queue.",
            },
            {
              id: "extra-revision",
              name: "Additional Code Audit & Revision Round",
              price: Math.round(tmpl.basePrice * 0.15),
              description: "Deep architectural vulnerability review and code revision.",
            },
            {
              id: "vip-support",
              name: "14-Day Post-Launch Extended Warranty",
              price: Math.round(tmpl.basePrice * 0.3),
              description: "Direct Slack/Telegram channel access for bugfixes and questions.",
            },
          ]

    // FAQs (3 to 5 questions)
    const faqs: GigFAQItem[] = [
      {
        id: `faq-${idx}-1`,
        q: `What technology stack and standards are utilized?`,
        a: `All deliverables adhere strictly to production standards: Next.js 15+ App Router, React 19, strict TypeScript compiler settings, and Clean Architecture principles.`,
      },
      {
        id: `faq-${idx}-2`,
        q: `Is milestone escrow protection supported?`,
        a: `Yes, 100% of orders on TASCORA are funded into secure milestone escrow prior to commencement, ensuring total safety for both parties.`,
      },
      {
        id: `faq-${idx}-3`,
        q: `Can this deliverable be adapted to our specific custom infrastructure?`,
        a: `Absolutely. Standard and Premium tiers can be configured for AWS, Vercel, Fly.io, Cloudflare, or self-hosted Docker Kubernetes clusters.`,
      },
      {
        id: `faq-${idx}-4`,
        q: `How are revisions and feedback rounds coordinated?`,
        a: `Revisions can be requested directly inside the TASCORA dashboard with annotated attachments, diff notes, and automated version tracking.`,
      },
    ]

    // Gallery
    const gallery: GigGalleryItem[] = [
      { url: GALLERY_PLACEHOLDERS[idx % GALLERY_PLACEHOLDERS.length], alt: `${tmpl.title} preview 1` },
      { url: GALLERY_PLACEHOLDERS[(idx + 1) % GALLERY_PLACEHOLDERS.length], alt: `${tmpl.title} preview 2` },
      { url: GALLERY_PLACEHOLDERS[(idx + 2) % GALLERY_PLACEHOLDERS.length], alt: `${tmpl.title} preview 3` },
    ]

    // Stats
    const impressions = 450 + ((idx * 83) % 2900)
    const clicks = 25 + Math.floor(impressions * 0.08)
    const orders = 3 + Math.floor(clicks * 0.18)
    const revenue = orders * tmpl.stdPrice
    const conversionRate = Math.round((orders / clicks) * 1000) / 10

    const slug = tmpl.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    gigs.push({
      id: gigId,
      slug,
      title: tmpl.title,
      description: `Are you seeking a high-throughput, enterprise-grade ${subcategory.name} deliverable engineered for production scale?\n\nI specialize in building bulletproof platforms adhering to Clean Architecture principles, automated test coverage, and optimized performance.\n\n### What is included in this service:\n- **Full Architecture Blueprint**: Scalable modular design and clear boundaries.\n- **Modern Tooling**: Strict typing, automated formatting, and comprehensive documentation.\n- **Zero-Friction Delivery**: Milestone tracking, escrow security, and post-launch verification.`,
      categorySlug: category.slug,
      categoryName: category.name,
      subCategorySlug: subcategory.slug,
      subCategoryName: subcategory.name,
      startingPrice: tmpl.basePrice,
      deliveryDays: packages[0].deliveryDays,
      rating: seller.rating,
      reviewsCount: seller.reviewsCount,
      coverGradient: palette.gradient,
      accentColor: palette.hex,
      badgeText: tmpl.badge,
      seller: {
        id: seller.id,
        name: seller.name,
        avatarInitials: seller.avatarInitials,
        avatar: seller.avatar,
        gradient: seller.gradient,
        level: seller.level,
        isOnline: seller.isOnline,
        isPro: seller.isPro,
        country: seller.country,
        languages: seller.languages,
      },
      tags: tmpl.tags,
      createdAt: `2026-0${1 + (idx % 3)}-${String(10 + (idx % 18)).padStart(2, "0")}`,
      featured: tmpl.featured,
      status: "active",
      packages,
      addons,
      faqs,
      gallery,
      stats: {
        impressions,
        clicks,
        orders,
        revenue,
        conversionRate,
      },
    })
  })

  // 2. GENERATE THE 5 DELIBERATE EDGE CASES (reaching 70 total Gigs)
  SPECIFIC_GIG_EDGE_CASES.forEach((edge, edgeIdx) => {
    const seller = freelancerMap.get(edge.sellerId) || freelancers[0]
    const palette = ACCENT_PALETTES[(65 + edgeIdx) % ACCENT_PALETTES.length]

    let packages: GigPackageTier[]
    if (edge.singlePackageOnly) {
      packages = [
        {
          type: "BASIC",
          name: "Single Rapid CVE Audit Package",
          price: 350,
          deliveryDays: 2,
          revisions: 1,
          description: "Targeted single-package rapid code audit. Tests UI behavior when STANDARD and PREMIUM tiers are deliberately absent.",
          features: [
            "Complete Dependency Vulnerability Tree Scan",
            "Static Analysis AST Security Report",
            "Remediation Patch Pull Request",
            "Single Revision Included",
          ],
        },
      ]
    } else {
      packages = [
        {
          type: "BASIC",
          name: "Starter Package",
          price: 220,
          deliveryDays: 3,
          revisions: 2,
          description: "Essential starter deliverables.",
          features: ["Foundation Code", "Documentation", "2 Revisions"],
        },
        {
          type: "STANDARD",
          name: "Standard Package",
          price: 450,
          deliveryDays: 5,
          revisions: 4,
          description: "Standard production release.",
          features: ["Everything in Basic", "Unit Tests", "CI/CD Config", "4 Revisions"],
        },
        {
          type: "PREMIUM",
          name: "Premium Architecture",
          price: 850,
          deliveryDays: 8,
          revisions: "unlimited",
          description: "Comprehensive enterprise delivery with VIP SLA.",
          features: ["Everything in Standard", "Docker Multi-Stage", "SLA Support", "Unlimited Revisions"],
        },
      ]
    }

    let addons: GigAddon[]
    if (edge.maxAddons) {
      addons = [
        { id: "express-24h", name: "24-Hour Express Delivery", price: 100, deliveryDaysDelta: 1, description: "Instant priority pipeline" },
        { id: "docker-multistage", name: "Production Docker Multi-Stage Build", price: 80, description: "Minimal size distroless image" },
        { id: "e2e-playwright", name: "Comprehensive Playwright E2E Suite", price: 120, description: "Full user flow test automation" },
        { id: "openapi-schema", name: "Swagger / OpenAPI 3.1 Schema", price: 60, description: "Interactive documentation contract" },
        { id: "live-walkthrough", name: "1-Hour Live Architectural Video Session", price: 90, description: "Deep dive code explanation" },
        { id: "extended-support", name: "30-Day VIP Maintenance SLA", price: 150, description: "Dedicated bugfix channel" },
      ]
    } else {
      addons = [
        { id: "express-delivery", name: "24-Hour Express Delivery", price: 50, deliveryDaysDelta: 1, description: "Prioritize project delivery within 24 hours" },
        { id: "extra-revision", name: "Additional Code Audit & Revision Round", price: 35, description: "Deep architectural review" },
      ]
    }

    const faqs: GigFAQItem[] = [
      { q: "Can this service be customized?", a: "Yes, fully tailored to your specifications." },
      { q: "Is escrow supported?", a: "100% milestone protected." },
      { q: "What is the turnaround time?", a: "Strict adherence to agreed milestones." },
    ]

    const gallery: GigGalleryItem[] = [
      { url: GALLERY_PLACEHOLDERS[0], alt: `${edge.title} preview 1` },
      { url: GALLERY_PLACEHOLDERS[1], alt: `${edge.title} preview 2` },
    ]

    const stats = edge.zeroOrders
      ? { impressions: 140, clicks: 9, orders: 0, revenue: 0, conversionRate: 0 }
      : { impressions: 1250, clicks: 88, orders: 14, revenue: 14 * 450, conversionRate: 15.9 }

    gigs.push({
      id: edge.id,
      slug: edge.slug,
      title: edge.title,
      description: `Comprehensive service offering for ${edge.title}. Formatted to test edge conditions and interface reliability.`,
      categorySlug: edge.categorySlug,
      categoryName: edge.categoryName,
      subCategorySlug: edge.subCategorySlug,
      subCategoryName: edge.subCategoryName,
      startingPrice: packages[0].price,
      deliveryDays: packages[0].deliveryDays,
      rating: edge.zeroOrders ? 0.0 : seller.rating,
      reviewsCount: edge.zeroOrders ? 0 : seller.reviewsCount,
      coverGradient: palette.gradient,
      accentColor: palette.hex,
      badgeText: edge.status === "draft" ? "Draft" : edge.maxAddons ? "Max Options" : undefined,
      seller: {
        id: seller.id,
        name: seller.name,
        avatarInitials: seller.avatarInitials,
        avatar: seller.avatar,
        gradient: seller.gradient,
        level: seller.level,
        isOnline: seller.isOnline,
        isPro: seller.isPro,
        country: seller.country,
        languages: seller.languages,
      },
      tags: ["TypeScript", "Next.js", "Architecture", "Testing"],
      createdAt: "2026-02-01",
      featured: false,
      status: edge.status || "active",
      packages,
      addons,
      faqs,
      gallery,
      stats,
    })
  })

  return gigs
}

// ---------------------------------------------------------------------------
// 9. GENERATE AND WRITE OUTPUT FILES
// ---------------------------------------------------------------------------
export function writeFreelancersDataFile() {
  const allUsers = generateAllUsers()
  const featuredFreelancers = FIXED_FEATURED_FREELANCERS
  const allFreelancers = allUsers.filter((u) => u.role === "freelancer" || u.role === "both")
  const allClients = allUsers.filter((u) => u.role === "client" || u.role === "both")

  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/freelancers.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Users & Freelancers
 * 
 * Auto-generated deterministically with seed ${SEED} for QA & Playwright E2E tests.
 * Regenerate with: npm run seed
 * 
 * DO NOT hardcode real production credentials here.
 * Admin test credentials are read from process.env.SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 */

import { AccentColor } from "@/lib/gradients"

export type UserRole = "client" | "freelancer" | "both" | "admin"
export type UserAccountStatus = "active" | "suspended" | "inactive"
export type SellerLevel = "NEW" | "LEVEL_1" | "LEVEL_2" | "TOP_RATED"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  title: string
  avatarInitials: string
  avatar?: string
  gradient: string
  accent?: AccentColor
  bio: string
  country: string
  city?: string
  memberSince: string
  languages: string[]
  skills: string[]
  responseTime: string
  completionRate: number
  rating: number
  reviewsCount: number
  startingPrice: number
  available: boolean
  isVerified: boolean
  isOnline: boolean
  isPro: boolean
  level: SellerLevel
  status: UserAccountStatus
  company?: string
  completedOrders: number
  passwordHash?: string
}

/**
 * Backward compatibility alias for FreelancerProfile.
 * Matches existing imports across the frontend.
 */
export type FreelancerProfile = UserProfile

/**
 * Curated Featured Freelancers displayed on the homepage showcase.
 * Stable reference IDs: f-1, f-2, f-3, f-4.
 */
export const FEATURED_FREELANCERS_DATA: FreelancerProfile[] = ${JSON.stringify(featuredFreelancers, null, 2)}

/**
 * Seeded Admin User for local QA & auth testing.
 * Sourced from SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local.
 */
export const SEED_ADMIN_USER: UserProfile = ${JSON.stringify(SEED_ADMIN_USER, null, 2)}

/**
 * Known Test Entities for stable Playwright test assertions.
 */
export const KNOWN_TEST_USERS = {
  admin: SEED_ADMIN_USER,
  referenceFreelancer: FEATURED_FREELANCERS_DATA[0], // Alexandre Moreau (id: "f-1")
  edgeOverflow: ${JSON.stringify(SPECIFIC_EDGE_CASES[0], null, 2)},
  edgeBrandNew: ${JSON.stringify(SPECIFIC_EDGE_CASES[1], null, 2)},
  edgeFastResponse: ${JSON.stringify(SPECIFIC_EDGE_CASES[2], null, 2)},
  edgeSlowResponse: ${JSON.stringify(SPECIFIC_EDGE_CASES[3], null, 2)},
  edgeSuspended: ${JSON.stringify(SPECIFIC_EDGE_CASES[4], null, 2)},
}

/**
 * Complete set of all local seed users (${allUsers.length} total).
 */
export const ALL_USERS: UserProfile[] = ${JSON.stringify(allUsers, null, 2)}

/**
 * All active and available freelancers (${allFreelancers.length} total).
 */
export const ALL_FREELANCERS: FreelancerProfile[] = ${JSON.stringify(allFreelancers, null, 2)}

/**
 * All platform client profiles (${allClients.length} total).
 */
export const ALL_CLIENTS: UserProfile[] = ${JSON.stringify(allClients, null, 2)}

/**
 * Helper to lookup user by id.
 */
export function getUserById(id: string): UserProfile | undefined {
  return ALL_USERS.find((u) => u.id === id)
}

/**
 * Helper to lookup freelancer by id.
 */
export function getFreelancerById(id: string): FreelancerProfile | undefined {
  return ALL_FREELANCERS.find((f) => f.id === id)
}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated ${allUsers.length} users into ${outputPath}`)
}

export function writeGigsDataFile() {
  const allUsers = generateAllUsers()
  const allFreelancers = allUsers.filter((u) => u.role === "freelancer" || u.role === "both")
  const allGigs = generateAllGigs(allFreelancers)

  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/gigs.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Gigs & Services
 * 
 * Auto-generated deterministically with seed ${SEED} for QA & Playwright E2E tests.
 * Total Gigs: ${allGigs.length}
 * Regenerate with: npm run seed
 */

export type SellerLevel = "NEW" | "LEVEL_1" | "LEVEL_2" | "TOP_RATED"

export interface GigSeller {
  id: string
  name: string
  avatarInitials: string
  avatar?: string
  gradient: string
  level: SellerLevel
  isOnline: boolean
  isPro: boolean
  country: string
  languages: string[]
}

export interface GigPackageTier {
  type: "BASIC" | "STANDARD" | "PREMIUM"
  name: string
  price: number
  deliveryDays: number
  revisions: number | "unlimited"
  description: string
  features: string[]
}

export interface GigAddon {
  id: string
  name: string
  price: number
  deliveryDaysDelta?: number
  description: string
}

export interface GigFAQItem {
  id?: string
  q: string
  a: string
}

export interface GigGalleryItem {
  url: string
  alt?: string
}

export interface GigStats {
  impressions: number
  clicks: number
  orders: number
  revenue: number
  conversionRate: number
}

export interface Gig {
  id: string
  slug: string
  title: string
  description: string
  categorySlug: string
  categoryName: string
  subCategorySlug: string
  subCategoryName: string
  startingPrice: number
  deliveryDays: number
  rating: number
  reviewsCount: number
  coverGradient: string
  accentColor: string
  badgeText?: string
  seller: GigSeller
  tags: string[]
  createdAt: string
  featured?: boolean
  status?: "active" | "draft" | "paused"
  packages: GigPackageTier[]
  addons: GigAddon[]
  faqs: GigFAQItem[]
  gallery: GigGalleryItem[]
  stats: GigStats
}

/**
 * Fixed reference gig for Playwright test stability:
 * Tests in tests/e2e/marketplace/gig-detail-and-order.spec.ts rely on gig-1 / srv-1.
 */
export const KNOWN_TEST_GIGS = {
  referenceGig: ${JSON.stringify(allGigs[0], null, 2)},
  edgeSingleTier: ${JSON.stringify(allGigs.find((g) => g.id === "gig-edge-single-tier"), null, 2)},
  edgeOverflowTitle: ${JSON.stringify(allGigs.find((g) => g.id === "gig-edge-overflow-title"), null, 2)},
  edgeZeroOrders: ${JSON.stringify(allGigs.find((g) => g.id === "gig-edge-zero-orders"), null, 2)},
  edgeDraft: ${JSON.stringify(allGigs.find((g) => g.id === "gig-edge-draft"), null, 2)},
  edgeMaxAddons: ${JSON.stringify(allGigs.find((g) => g.id === "gig-edge-max-addons"), null, 2)},
}

/**
 * Complete set of all local seed gigs (${allGigs.length} total across all categories).
 */
export const MOCK_GIGS: Gig[] = ${JSON.stringify(allGigs, null, 2)}

/**
 * Lookup gig by ID or slug (compatible with srv-1 alias).
 */
export function getGigById(id: string): Gig | undefined {
  if (id === "srv-1") return MOCK_GIGS[0]
  return MOCK_GIGS.find((g) => g.id === id)
}

export function getGigBySlug(slug: string): Gig | undefined {
  return MOCK_GIGS.find((g) => g.slug === slug)
}

export function getGigsBySellerId(sellerId: string): Gig[] {
  return MOCK_GIGS.filter((g) => g.seller.id === sellerId)
}

export function getGigsByCategory(categorySlug: string): Gig[] {
  return MOCK_GIGS.filter((g) => g.categorySlug === categorySlug)
}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated ${allGigs.length} gigs into ${outputPath}`)
}

export function writeDashboardGigsDataFile() {
  const allUsers = generateAllUsers()
  const allFreelancers = allUsers.filter((u) => u.role === "freelancer" || u.role === "both")
  const allGigs = generateAllGigs(allFreelancers)

  // Top seller gigs for Dashboard view (Alexandre Moreau f-1 has gig-1, gig-2, gig-3 + edge draft/paused)
  const dashboardGigs = allGigs
    .filter((g) => g.seller.id === "f-1" || g.id === "gig-edge-draft" || g.id === "gig-edge-max-addons")
    .map((g) => {
      const basic = g.packages.find((p) => p.type === "BASIC") || g.packages[0]
      const standard = g.packages.find((p) => p.type === "STANDARD") || basic
      const premium = g.packages.find((p) => p.type === "PREMIUM") || standard

      return {
        id: g.id,
        title: g.title,
        slug: g.slug,
        category: g.categoryName,
        subcategory: g.subCategoryName,
        coverImage: g.gallery[0]?.url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
        status: g.status || "active",
        createdAt: g.createdAt,
        updatedAt: "2026-03-15",
        startingPrice: g.startingPrice,
        rating: g.rating,
        reviewsCount: g.reviewsCount,
        stats: g.stats,
        tiers: {
          basic: {
            name: "BASIC" as const,
            title: basic.name,
            description: basic.description,
            price: basic.price,
            deliveryDays: basic.deliveryDays,
            revisions: basic.revisions,
            features: basic.features,
          },
          standard: {
            name: "STANDARD" as const,
            title: standard.name,
            description: standard.description,
            price: standard.price,
            deliveryDays: standard.deliveryDays,
            revisions: standard.revisions,
            features: standard.features,
          },
          premium: {
            name: "PREMIUM" as const,
            title: premium.name,
            description: premium.description,
            price: premium.price,
            deliveryDays: premium.deliveryDays,
            revisions: premium.revisions,
            features: premium.features,
          },
        },
        description: g.description,
        requirements: "Please provide your project brief, repository access or Figma designs, and target cloud deployment environment.",
        tags: g.tags,
        faqs: g.faqs.map((f, i) => ({
          id: `faq-${i + 1}`,
          question: f.q,
          answer: f.a,
        })),
      }
    })

  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/dashboard/gigs.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Seller Dashboard Gigs
 * 
 * Auto-generated deterministically with seed ${SEED} for QA & Playwright E2E tests.
 * Regenerate with: npm run seed
 */

export interface GigTier {
  name: "BASIC" | "STANDARD" | "PREMIUM"
  title: string
  description: string
  price: number
  deliveryDays: number
  revisions: number | "unlimited"
  features: string[]
}

export interface GigFAQ {
  id: string
  question: string
  answer: string
}

export interface DashboardGig {
  id: string
  title: string
  slug: string
  category: string
  subcategory: string
  coverImage: string
  status: "active" | "draft" | "paused"
  createdAt: string
  updatedAt: string
  startingPrice: number
  rating: number
  reviewsCount: number
  stats: {
    impressions: number
    clicks: number
    orders: number
    revenue: number
    conversionRate: number
  }
  tiers: {
    basic: GigTier
    standard: GigTier
    premium: GigTier
  }
  description: string
  requirements: string
  tags: string[]
  faqs: GigFAQ[]
}

export const INITIAL_GIGS: DashboardGig[] = ${JSON.stringify(dashboardGigs, null, 2)}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated ${dashboardGigs.length} dashboard gigs into ${outputPath}`)
}

// ---------------------------------------------------------------------------
// 10. MAIN EXECUTION
// ---------------------------------------------------------------------------
function main() {
  console.log("==================================================")
  console.log("  TASCORA Deterministic Seed Generator (Phases 1-3)")
  console.log("==================================================")
  console.log(`Fixed Random Seed: ${SEED}`)
  console.log(`Admin Email: ${ADMIN_EMAIL}`)

  writeFreelancersDataFile()
  writeGigsDataFile()
  writeDashboardGigsDataFile()

  const allUsers = generateAllUsers()
  const allFreelancers = allUsers.filter((u) => u.role === "freelancer" || u.role === "both")
  const allGigs = generateAllGigs(allFreelancers)

  const allOrders = generateAllOrders(allGigs, allUsers)
  writeOrdersDataFile(allOrders)

  const allReviews = generateAllReviews(allOrders, allGigs, allUsers)
  writeReviewsDataFile(allReviews)

  const allConversations = generateAllConversations(allOrders, allUsers)
  writeMessagesDataFile(allConversations)

  const allNotifications = generateAllNotifications(allOrders, allUsers)
  writeNotificationsDataFile(allNotifications)

  const paymentsData = generatePaymentsData(allOrders, allUsers)
  writePaymentsDataFile(paymentsData)

  console.log("\nEntity Summary:")
  console.log(`- Total Users Generated: ${allUsers.length}`)
  console.log(`- Total Gigs Generated: ${allGigs.length}`)
  console.log(`  • Web Development: ${allGigs.filter((g) => g.categoryName === "Web Development").length}`)
  console.log(`  • UI/UX & Design: ${allGigs.filter((g) => g.categorySlug === "design").length}`)
  console.log(`  • AI & Automation: ${allGigs.filter((g) => g.categorySlug === "ai").length}`)
  console.log(`  • Technical SEO & Growth: ${allGigs.filter((g) => g.categorySlug === "marketing").length}`)
  console.log(`  • Technical Writing: ${allGigs.filter((g) => g.categorySlug === "writing").length}`)
  console.log(`- Total Orders Generated: ${allOrders.length}`)
  console.log(`  • Completed: ${allOrders.filter((o) => o.status === "completed").length}`)
  console.log(`  • Active: ${allOrders.filter((o) => o.status === "active").length}`)
  console.log(`  • Delivered: ${allOrders.filter((o) => o.status === "delivered").length}`)
  console.log(`  • Cancelled: ${allOrders.filter((o) => o.status === "cancelled").length}`)
  console.log(`- Total Reviews Generated: ${allReviews.length}`)
  console.log(`  • 5-Star: ${allReviews.filter((r) => r.rating === 5).length}`)
  console.log(`  • 4-Star: ${allReviews.filter((r) => r.rating === 4).length}`)
  console.log(`  • 3-Star: ${allReviews.filter((r) => r.rating === 3).length}`)
  console.log(`  • 1-Star: ${allReviews.filter((r) => r.rating === 1).length}`)
  console.log(`  • With Seller Responses: ${allReviews.filter((r) => r.sellerResponse).length}`)
  console.log(`- Total Conversations: ${allConversations.length}`)
  console.log(`- Total Notifications: ${allNotifications.length}`)
  console.log(`- Total Transactions: ${paymentsData.freelancerTransactions.length + paymentsData.clientInvoices.length}`)
  console.log("\nKnown Test Entities for Playwright & QA:")
  console.log(`  • Reference Gig: ${allGigs[0].title} (ID: gig-1, Slug: ${allGigs[0].slug})`)
  console.log(`  • Reference Order: ${allOrders[0].title} (ID: ${allOrders[0].id})`)
  console.log(`  • Reference Conversation: ${allConversations[0].id} (Order: ${allConversations[0].order.id})`)
  console.log(`  • Edge Case Disputed Order: ${allOrders.find((o) => o.id === "ORD-EDGE-1")?.id}`)
  console.log(`  • Edge Case Enterprise Order: ${allOrders.find((o) => o.id === "ORD-EDGE-2")?.id}`)
  console.log(`  • Edge Case Rapid 24h Order: ${allOrders.find((o) => o.id === "ORD-EDGE-3")?.id}`)
  console.log(`  • Edge Case Multi-Revision Order: ${allOrders.find((o) => o.id === "ORD-EDGE-4")?.id}`)
  console.log(`  • Edge Case Fresh Order: ${allOrders.find((o) => o.id === "ORD-EDGE-5")?.id}`)
  console.log(`  • Edge Case Critical Review: ${allReviews.find((r) => r.id === "rev-edge-critical")?.id}`)
  console.log(`  • Edge Case Long Case Study Review: ${allReviews.find((r) => r.id === "rev-edge-long")?.id}`)
  console.log(`  • Edge Case 1-Star Review: ${allReviews.find((r) => r.id === "rev-edge-1star")?.id}`)
  console.log("==================================================")
}

if (require.main === module || process.argv[1]?.includes("generate-seed-data")) {
  main()
}

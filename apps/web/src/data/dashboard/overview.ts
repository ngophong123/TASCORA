export interface SparklinePoint {
  value: number
}

export interface OverviewStatCardData {
  id: string
  label: string
  value: string
  delta: string
  isPositive: boolean
  sparkline: number[]
  subtext: string
  iconName: string
  iconColor: string
}

export interface ChartDataPoint {
  name: string
  amount: number
  secondary?: number
}

export interface ActiveOrderRow {
  id: string
  title: string
  counterpartName: string
  counterpartAvatar: string
  counterpartRole: string
  amount: string
  status: "in_progress" | "delivered" | "pending" | "completed"
  dueDate: string
  progressPercent: number
  currentMilestone: string
  totalMilestones: number
}

export interface ActivityItem {
  id: string
  type: "milestone" | "order" | "payment" | "review" | "message"
  title: string
  description: string
  timestamp: string
  user: {
    name: string
    avatar: string
  }
}

export interface ProfileChecklistItem {
  id: string
  label: string
  description: string
  completed: boolean
  points: number
}

export interface RecommendedSpecialist {
  id: string
  name: string
  title: string
  avatar: string
  rating: number
  reviewsCount: number
  hourlyRate: string
  skills: string[]
  isOnline: boolean
  level: "TOP_RATED" | "LEVEL_2"
}

// 1. Freelancer Stats
export const FREELANCER_STATS: OverviewStatCardData[] = [
  {
    id: "f-earnings",
    label: "Earnings this month",
    value: "$6,420.00",
    delta: "+18.4%",
    isPositive: true,
    sparkline: [3800, 4200, 4100, 4900, 5300, 5800, 6420],
    subtext: "vs. $5,420 last month",
    iconName: "DollarSign",
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    id: "f-orders",
    label: "Active orders",
    value: "5",
    delta: "+2",
    isPositive: true,
    sparkline: [2, 3, 3, 4, 3, 4, 5],
    subtext: "$2,850 in escrow queue",
    iconName: "ShoppingBag",
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "f-completion",
    label: "Completion rate",
    value: "99.4%",
    delta: "+0.6%",
    isPositive: true,
    sparkline: [96, 97, 98, 98, 99, 99, 99.4],
    subtext: "48 of 48 delivered on time",
    iconName: "CheckCircle2",
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "f-rating",
    label: "Client rating",
    value: "4.98",
    delta: "+0.02",
    isPositive: true,
    sparkline: [4.9, 4.92, 4.94, 4.95, 4.96, 4.97, 4.98],
    subtext: "114 verified reviews",
    iconName: "Star",
    iconColor: "text-amber-600 bg-amber-50",
  },
]

// 2. Client Stats
export const CLIENT_STATS: OverviewStatCardData[] = [
  {
    id: "c-projects",
    label: "Active projects",
    value: "4",
    delta: "+1 this week",
    isPositive: true,
    sparkline: [1, 2, 2, 3, 3, 4, 4],
    subtext: "3 milestones underway",
    iconName: "Briefcase",
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "c-spent",
    label: "Total spent",
    value: "$7,350.00",
    delta: "+$1,200",
    isPositive: true,
    sparkline: [3200, 4100, 4800, 5400, 6150, 6700, 7350],
    subtext: "Across 12 contracts",
    iconName: "CreditCard",
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "c-pending",
    label: "Pending deliveries",
    value: "2",
    delta: "Due in 48h",
    isPositive: false,
    sparkline: [1, 2, 1, 3, 2, 2, 2],
    subtext: "Awaiting your review",
    iconName: "Clock",
    iconColor: "text-amber-600 bg-amber-50",
  },
  {
    id: "c-saved",
    label: "Saved specialists",
    value: "14",
    delta: "+3 new",
    isPositive: true,
    sparkline: [6, 8, 9, 10, 11, 12, 14],
    subtext: "In your shortlists",
    iconName: "Bookmark",
    iconColor: "text-rose-600 bg-rose-50",
  },
]

// 3. Freelancer Earnings Chart Series (by time range)
export const FREELANCER_CHART_DATA: Record<"7d" | "30d" | "90d" | "12m", ChartDataPoint[]> = {
  "7d": [
    { name: "Mon", amount: 450, secondary: 1 },
    { name: "Tue", amount: 620, secondary: 2 },
    { name: "Wed", amount: 350, secondary: 1 },
    { name: "Thu", amount: 890, secondary: 2 },
    { name: "Fri", amount: 1200, secondary: 3 },
    { name: "Sat", amount: 750, secondary: 1 },
    { name: "Sun", amount: 980, secondary: 2 },
  ],
  "30d": [
    { name: "Sep 1", amount: 1250, secondary: 3 },
    { name: "Sep 5", amount: 1800, secondary: 4 },
    { name: "Sep 10", amount: 2400, secondary: 5 },
    { name: "Sep 15", amount: 3600, secondary: 7 },
    { name: "Sep 20", amount: 5100, secondary: 9 },
    { name: "Sep 22", amount: 6420, secondary: 11 },
  ],
  "90d": [
    { name: "July", amount: 14200, secondary: 28 },
    { name: "August", amount: 16800, secondary: 34 },
    { name: "September", amount: 19400, secondary: 41 },
  ],
  "12m": [
    { name: "Oct", amount: 8200 },
    { name: "Nov", amount: 9400 },
    { name: "Dec", amount: 11200 },
    { name: "Jan", amount: 12800 },
    { name: "Feb", amount: 11900 },
    { name: "Mar", amount: 14500 },
    { name: "Apr", amount: 15800 },
    { name: "May", amount: 16200 },
    { name: "Jun", amount: 18100 },
    { name: "Jul", amount: 19400 },
    { name: "Aug", amount: 21500 },
    { name: "Sep", amount: 23800 },
  ],
}

// 4. Client Spending Chart Series
export const CLIENT_CHART_DATA: Record<"7d" | "30d" | "90d" | "12m", ChartDataPoint[]> = {
  "7d": [
    { name: "Mon", amount: 250 },
    { name: "Tue", amount: 0 },
    { name: "Wed", amount: 450 },
    { name: "Thu", amount: 180 },
    { name: "Fri", amount: 680 },
    { name: "Sat", amount: 0 },
    { name: "Sun", amount: 350 },
  ],
  "30d": [
    { name: "Sep 1", amount: 800 },
    { name: "Sep 5", amount: 1450 },
    { name: "Sep 10", amount: 2800 },
    { name: "Sep 15", amount: 4100 },
    { name: "Sep 20", amount: 5900 },
    { name: "Sep 22", amount: 7350 },
  ],
  "90d": [
    { name: "July", amount: 4200 },
    { name: "August", amount: 5800 },
    { name: "September", amount: 7350 },
  ],
  "12m": [
    { name: "Oct", amount: 2200 },
    { name: "Nov", amount: 3100 },
    { name: "Dec", amount: 4500 },
    { name: "Jan", amount: 5200 },
    { name: "Feb", amount: 4800 },
    { name: "Mar", amount: 6100 },
    { name: "Apr", amount: 6900 },
    { name: "May", amount: 7400 },
    { name: "Jun", amount: 8200 },
    { name: "Jul", amount: 9500 },
    { name: "Aug", amount: 10400 },
    { name: "Sep", amount: 11800 },
  ],
}

// 5. Active Orders (Freelancer perspective)
export const FREELANCER_ACTIVE_ORDERS: ActiveOrderRow[] = [
  {
    id: "ORD-9481",
    title: "Next.js 15 & Node.js Production Architecture",
    counterpartName: "Marcus Thorne",
    counterpartAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "CTO, Fintech Corp",
    amount: "$450.00",
    status: "in_progress",
    dueDate: "Tomorrow, 18:00",
    progressPercent: 75,
    currentMilestone: "Milestone 2: Prisma API & Auth",
    totalMilestones: 3,
  },
  {
    id: "ORD-9472",
    title: "Enterprise Figma Design System & Tokens",
    counterpartName: "Sarah Lin",
    counterpartAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "Head of Product, SaaSly",
    amount: "$380.00",
    status: "delivered",
    dueDate: "Under Client Review",
    progressPercent: 100,
    currentMilestone: "Final Milestone: Component Library",
    totalMilestones: 2,
  },
  {
    id: "ORD-9465",
    title: "AI Autonomous RAG Pipeline with LangChain",
    counterpartName: "David Sterling",
    counterpartAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "VP Engineering, BioTech",
    amount: "$680.00",
    status: "in_progress",
    dueDate: "In 3 days",
    progressPercent: 40,
    currentMilestone: "Milestone 1: Vector Database Indexing",
    totalMilestones: 3,
  },
  {
    id: "ORD-9440",
    title: "High-Conversion SaaS Landing Page Animation",
    counterpartName: "Chloe Vance",
    counterpartAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "Founder, GrowthPulse",
    amount: "$520.00",
    status: "in_progress",
    dueDate: "In 5 days",
    progressPercent: 25,
    currentMilestone: "Milestone 1: Wireframe & Motion Prototype",
    totalMilestones: 2,
  },
  {
    id: "ORD-9418",
    title: "PostgreSQL Query Optimization & Database Sharding",
    counterpartName: "Kenji Sato",
    counterpartAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "Lead Architect, Nexus Gaming",
    amount: "$820.00",
    status: "completed",
    dueDate: "Completed Sep 20",
    progressPercent: 100,
    currentMilestone: "Completed All Milestones",
    totalMilestones: 4,
  },
]

// 6. Active Orders (Client perspective)
export const CLIENT_ACTIVE_ORDERS: ActiveOrderRow[] = [
  {
    id: "ORD-9481",
    title: "Next.js 15 & Node.js Production Architecture",
    counterpartName: "Alexandre Moreau",
    counterpartAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "Senior Full-Stack Architect",
    amount: "$450.00",
    status: "in_progress",
    dueDate: "Tomorrow, 18:00",
    progressPercent: 75,
    currentMilestone: "Milestone 2: Prisma API & Auth Boilerplate",
    totalMilestones: 3,
  },
  {
    id: "ORD-9472",
    title: "Enterprise Figma Design System & Tokens",
    counterpartName: "Elena Rostova",
    counterpartAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "Principal Product Designer",
    amount: "$380.00",
    status: "delivered",
    dueDate: "Action Required: Review Files",
    progressPercent: 100,
    currentMilestone: "Final Milestone: Component Tokens & Figma Kit",
    totalMilestones: 2,
  },
  {
    id: "ORD-9465",
    title: "AI Autonomous RAG Pipeline with LangChain",
    counterpartName: "Dr. Priya Patel",
    counterpartAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "Staff AI Engineer",
    amount: "$680.00",
    status: "in_progress",
    dueDate: "In 3 days",
    progressPercent: 40,
    currentMilestone: "Milestone 1: Vector Database Indexing",
    totalMilestones: 3,
  },
  {
    id: "ORD-9429",
    title: "Docker & Kubernetes Multi-Region CI/CD Pipeline",
    counterpartName: "Lucas Vance",
    counterpartAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    counterpartRole: "Cloud DevOps Specialist",
    amount: "$540.00",
    status: "pending",
    dueDate: "Starting Sep 24",
    progressPercent: 10,
    currentMilestone: "Milestone 1: Terraform Infra Spec",
    totalMilestones: 2,
  },
]

// 7. Recent Activity Feed
export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "payment",
    title: "Milestone 1 Escrow Released",
    description: "$450.00 transferred successfully to your balance wallet.",
    timestamp: "15m ago",
    user: { name: "Marcus Thorne", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" },
  },
  {
    id: "act-2",
    type: "review",
    title: "5.0 Rating Received",
    description: "'Incredible attention to detail and zero downtime delivery!'",
    timestamp: "1h ago",
    user: { name: "Sarah Lin", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80" },
  },
  {
    id: "act-3",
    type: "milestone",
    title: "Deliverable Uploaded",
    description: "Milestone 2 source code and OpenAPI spec pushed to Git repository.",
    timestamp: "3h ago",
    user: { name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
  },
  {
    id: "act-4",
    type: "order",
    title: "New Order Contract Initialized",
    description: "Contract #ORD-9465 with 3 milestones confirmed by client.",
    timestamp: "5h ago",
    user: { name: "David Sterling", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" },
  },
]

// 8. Profile Strength Checklist (Freelancer)
export const PROFILE_CHECKLIST: ProfileChecklistItem[] = [
  { id: "chk-1", label: "Profile picture & headline", description: "Clear professional portrait and craft title", completed: true, points: 25 },
  { id: "chk-2", label: "Skills & frameworks tagged", description: "Select at least 5 core technical competencies", completed: true, points: 25 },
  { id: "chk-3", label: "Identity & Stripe Escrow verified", description: "KYC and payout account connected", completed: true, points: 25 },
  { id: "chk-4", label: "Add 2+ Portfolio projects", description: "Showcase real code repositories or Figma links", completed: false, points: 15 },
  { id: "chk-5", label: "Enable Two-Factor Authentication (2FA)", description: "Secure your wallet and client messages", completed: false, points: 10 },
]

// 9. Recommended Specialists (Client)
export const RECOMMENDED_SPECIALISTS: RecommendedSpecialist[] = [
  {
    id: "rec-1",
    name: "Dr. Priya Patel",
    title: "Staff AI & LLM Systems Architect",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    rating: 4.99,
    reviewsCount: 88,
    hourlyRate: "$95/hr",
    skills: ["LangChain", "Python", "RAG", "pgvector"],
    isOnline: true,
    level: "TOP_RATED",
  },
  {
    id: "rec-2",
    name: "Elena Rostova",
    title: "Principal UI/UX & Design Systems Lead",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    rating: 4.98,
    reviewsCount: 142,
    hourlyRate: "$85/hr",
    skills: ["Figma Tokens", "Design Systems", "Next.js", "Tailwind"],
    isOnline: true,
    level: "TOP_RATED",
  },
  {
    id: "rec-3",
    name: "Lucas Vance",
    title: "Cloud Infrastructure & Kubernetes Architect",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    rating: 4.95,
    reviewsCount: 64,
    hourlyRate: "$90/hr",
    skills: ["AWS", "Docker", "Terraform", "CI/CD"],
    isOnline: false,
    level: "LEVEL_2",
  },
]

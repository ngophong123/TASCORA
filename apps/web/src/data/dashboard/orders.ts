export interface OrderMilestone {
  id: string
  title: string
  amount: number
  status: "completed" | "in_review" | "in_progress" | "pending"
  dueDate: string
  approvedAt?: string
}

export interface DeliveryFile {
  name: string
  size: string
  type: "zip" | "pdf" | "figma" | "code" | "image"
}

export interface OrderDelivery {
  id: string
  milestoneId: string
  note: string
  submittedAt: string
  files: DeliveryFile[]
}

export interface RevisionRequest {
  id: string
  requestedAt: string
  note: string
}

export interface DashboardOrder {
  id: string
  title: string
  category: string
  tier: "BASIC" | "STANDARD" | "PREMIUM"
  totalAmount: number
  status: "active" | "delivered" | "completed" | "cancelled"
  createdAt: string
  deliveryDate: string
  role: "CLIENT" | "FREELANCER" | "BOTH"
  client: {
    name: string
    email: string
    avatar: string
    company: string
  }
  freelancer: {
    name: string
    title: string
    avatar: string
    rating: number
    level: "TOP_RATED" | "LEVEL_2" | "LEVEL_1"
  }
  requirements: string
  milestones: OrderMilestone[]
  deliveries: OrderDelivery[]
  revisions: RevisionRequest[]
}

export const INITIAL_ORDERS: DashboardOrder[] = [
  {
    id: "ORD-9481",
    title: "Next.js 15 & Node.js Production Architecture with Clean Code",
    category: "Web Development",
    tier: "STANDARD",
    totalAmount: 450,
    status: "active",
    createdAt: "2026-09-18",
    deliveryDate: "Tomorrow, 18:00",
    role: "BOTH",
    client: {
      name: "Marcus Thorne",
      email: "marcus@fintechcorp.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp",
    },
    freelancer: {
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements: "Deploy a scalable pnpm monorepo with Next.js 15 App Router, PostgreSQL with Prisma ORM, JWT authentication cookies, and Docker Compose development environment.",
    milestones: [
      {
        id: "m-1",
        title: "Architecture Blueprint & Monorepo Setup",
        amount: 150,
        status: "completed",
        dueDate: "Sep 19, 2026",
        approvedAt: "Sep 19, 2026",
      },
      {
        id: "m-2",
        title: "Prisma Schema & JWT Auth Boilerplate",
        amount: 150,
        status: "in_progress",
        dueDate: "Sep 23, 2026",
      },
      {
        id: "m-3",
        title: "Docker Compose & Automated GitHub Actions CI/CD",
        amount: 150,
        status: "pending",
        dueDate: "Sep 26, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-1",
        milestoneId: "m-1",
        note: "Initial monorepo scaffold, turbo.json, and Next.js 15 configuration pushed to GitHub repository.",
        submittedAt: "Sep 19, 2026",
        files: [
          { name: "architecture-blueprint-v1.pdf", size: "2.4 MB", type: "pdf" },
          { name: "monorepo-scaffold.zip", size: "14.8 MB", type: "zip" },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-9472",
    title: "Enterprise Figma Design System & Scalable Tokens",
    category: "UI/UX Design",
    tier: "STANDARD",
    totalAmount: 380,
    status: "delivered",
    createdAt: "2026-09-14",
    deliveryDate: "Delivered (Awaiting client review)",
    role: "BOTH",
    client: {
      name: "Sarah Lin",
      email: "sarah@saasly.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      company: "SaaSly Inc.",
    },
    freelancer: {
      name: "Elena Rostova",
      title: "Principal UI/UX & Design Systems Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.98,
      level: "TOP_RATED",
    },
    requirements: "Complete component system in Figma with auto-layout v5, light and dark theme variable tokens, responsive grid foundations, and button variants.",
    milestones: [
      {
        id: "m-1",
        title: "Color, Typography & Spacing Tokens",
        amount: 180,
        status: "completed",
        dueDate: "Sep 16, 2026",
        approvedAt: "Sep 17, 2026",
      },
      {
        id: "m-2",
        title: "Component Library & Interactive Variants",
        amount: 200,
        status: "in_review",
        dueDate: "Sep 21, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-2",
        milestoneId: "m-2",
        note: "All 38 core components, form elements, dialogs, and navigation primitives have been completed and verified with Figma tokens studio.",
        submittedAt: "Today, 04:30 AM",
        files: [
          { name: "Tascora-DesignSystem-v2.fig", size: "48.2 MB", type: "figma" },
          { name: "tokens.json", size: "124 KB", type: "code" },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-9465",
    title: "AI Autonomous RAG Pipeline with LangChain & pgvector",
    category: "AI & Automation",
    tier: "PREMIUM",
    totalAmount: 680,
    status: "active",
    createdAt: "2026-09-17",
    deliveryDate: "In 3 days",
    role: "BOTH",
    client: {
      name: "David Sterling",
      email: "david@biotech-analytics.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      company: "BioTech Analytics",
    },
    freelancer: {
      name: "Dr. Priya Patel",
      title: "Staff AI & LLM Systems Architect",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements: "End-to-end vector search pipeline for scientific literature, embedding chunking optimization, hybrid BM25 + dense vector reranking, and low-latency API.",
    milestones: [
      {
        id: "m-1",
        title: "Vector DB Schema & Chunking Pipeline",
        amount: 300,
        status: "in_progress",
        dueDate: "Sep 24, 2026",
      },
      {
        id: "m-2",
        title: "Reranker Model & Evaluation Suite",
        amount: 380,
        status: "pending",
        dueDate: "Sep 28, 2026",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-9440",
    title: "High-Conversion SaaS Landing Page with Framer Motion",
    category: "Web Development",
    tier: "STANDARD",
    totalAmount: 520,
    status: "active",
    createdAt: "2026-09-12",
    deliveryDate: "In 4 days",
    role: "BOTH",
    client: {
      name: "Chloe Vance",
      email: "chloe@growthpulse.io",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      company: "GrowthPulse",
    },
    freelancer: {
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements: "Sleek dark-to-light stripe style marketing homepage with interactive bento grid, scroll-driven storytelling, and mobile drawer.",
    milestones: [
      {
        id: "m-1",
        title: "Hero & Bento Grid Implementation",
        amount: 260,
        status: "completed",
        dueDate: "Sep 16, 2026",
        approvedAt: "Sep 16, 2026",
      },
      {
        id: "m-2",
        title: "Interactive Sections & Responsive QA",
        amount: 260,
        status: "in_progress",
        dueDate: "Sep 25, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-3",
        milestoneId: "m-1",
        note: "Hero section and animated bento grid completed with zero layout shifts.",
        submittedAt: "Sep 16, 2026",
        files: [
          { name: "preview-deployment.mp4", size: "8.1 MB", type: "video" as any },
          { name: "components-hero.zip", size: "4.2 MB", type: "zip" },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-9418",
    title: "PostgreSQL Database Performance Tuning & Sharding",
    category: "Cloud & DevOps",
    tier: "PREMIUM",
    totalAmount: 820,
    status: "completed",
    createdAt: "2026-09-05",
    deliveryDate: "Completed Sep 20",
    role: "BOTH",
    client: {
      name: "Kenji Sato",
      email: "kenji@nexusgaming.jp",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      company: "Nexus Gaming",
    },
    freelancer: {
      name: "Lucas Vance",
      title: "Cloud Infrastructure Specialist",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements: "Query optimization for 50M+ rows table, index profiling, connection pooling with PgBouncer, and failover replication setup.",
    milestones: [
      {
        id: "m-1",
        title: "Slow Query Audit & Index Rebuilding",
        amount: 400,
        status: "completed",
        dueDate: "Sep 10, 2026",
        approvedAt: "Sep 10, 2026",
      },
      {
        id: "m-2",
        title: "Connection Pooling & Sharding Config",
        amount: 420,
        status: "completed",
        dueDate: "Sep 20, 2026",
        approvedAt: "Sep 20, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-4",
        milestoneId: "m-2",
        note: "PgBouncer cluster deployed. Query latency dropped from 840ms to 18ms under load.",
        submittedAt: "Sep 19, 2026",
        files: [
          { name: "benchmarks-report.pdf", size: "3.8 MB", type: "pdf" },
          { name: "pgbouncer-configs.zip", size: "1.2 MB", type: "zip" },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-9390",
    title: "Cross-Platform React Native iOS & Android MVP",
    category: "Mobile App",
    tier: "STANDARD",
    totalAmount: 750,
    status: "cancelled",
    createdAt: "2026-08-28",
    deliveryDate: "Cancelled by mutual agreement",
    role: "BOTH",
    client: {
      name: "Marcus Thorne",
      email: "marcus@fintechcorp.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp",
    },
    freelancer: {
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements: "Client project scope changed towards web-only; full refund processed back to client escrow wallet without disputes.",
    milestones: [
      {
        id: "m-1",
        title: "UI Prototype & Expo Scaffold",
        amount: 350,
        status: "completed",
        dueDate: "Sep 02, 2026",
        approvedAt: "Sep 02, 2026",
      },
      {
        id: "m-2",
        title: "API Integration",
        amount: 400,
        status: "pending",
        dueDate: "Sep 10, 2026",
      },
    ],
    deliveries: [],
    revisions: [],
  },
]

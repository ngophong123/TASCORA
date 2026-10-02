import * as fs from "fs"
import * as path from "path"
import type { UserProfile, Gig, GigPackageTier } from "./generate-seed-data"

// ---------------------------------------------------------------------------
// 1. REPRODUCIBLE ANCHOR DATE
// ---------------------------------------------------------------------------
// Fixed reference point (March 25, 2026) for deterministic relative date strings
const ANCHOR_DATE = new Date("2026-03-25T12:00:00Z")

export function formatRelativeDate(isoDate: string): string {
  const diffMs = ANCHOR_DATE.getTime() - new Date(isoDate).getTime()
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  if (diffDays <= 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  const weeks = Math.floor(diffDays / 7)
  if (diffDays < 30) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  const months = Math.floor(diffDays / 30)
  if (diffDays < 365) return `${months} ${months === 1 ? "month" : "months"} ago`
  const years = Math.floor(diffDays / 365)
  return `${years} ${years === 1 ? "year" : "years"} ago`
}

// ---------------------------------------------------------------------------
// 2. TYPE DEFINITIONS FOR ORDERS & REVIEWS
// ---------------------------------------------------------------------------
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
  type: "zip" | "pdf" | "figma" | "code" | "image" | "video"
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
  gigId: string
  totalAmount: number
  status: "active" | "delivered" | "completed" | "cancelled"
  createdAt: string
  deliveryDate: string
  role: "CLIENT" | "FREELANCER" | "BOTH"
  client: {
    id: string
    name: string
    email: string
    avatar: string
    company: string
  }
  freelancer: {
    id: string
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

export interface ReviewAspects {
  communication: number
  qualityOfDelivery: number
  valueForMoney: number
}

export interface ReviewBuyer {
  id: string
  name: string
  avatar: string
  country: string
  company?: string
}

export interface ReviewSellerResponse {
  comment: string
  respondedAt: string
}

export interface Review {
  id: string
  gigId: string
  orderId?: string
  sellerId: string
  buyer: ReviewBuyer
  rating: number
  comment: string
  createdAt: string
  date: string
  dateFormatted: string
  aspectRatings: ReviewAspects
  sellerResponse?: ReviewSellerResponse
  helpfulCount: number
}

// ---------------------------------------------------------------------------
// 3. CATEGORY SPECIFIC TEMPLATES
// ---------------------------------------------------------------------------
const DELIVERY_NOTES_BY_CAT: Record<
  string,
  {
    note: string
    files: DeliveryFile[]
  }
> = {
  programming: {
    note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
    files: [
      { name: "production-release.zip", size: "14.2 MB", type: "zip" },
      { name: "architecture-blueprint.pdf", size: "3.4 MB", type: "pdf" },
      { name: "e2e-test-results.pdf", size: "1.1 MB", type: "pdf" },
    ],
  },
  design: {
    note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
    files: [
      { name: "design-system-tokens.figma", size: "28.6 MB", type: "figma" },
      { name: "component-specifications.pdf", size: "6.2 MB", type: "pdf" },
      { name: "style-guide-assets.zip", size: "18.5 MB", type: "zip" },
    ],
  },
  ai: {
    note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
    files: [
      { name: "rag-eval-report.pdf", size: "4.8 MB", type: "pdf" },
      { name: "vector-pipeline.zip", size: "8.9 MB", type: "zip" },
      { name: "api-contract.pdf", size: "1.5 MB", type: "pdf" },
    ],
  },
  marketing: {
    note: "Completed Core Web Vitals optimization report, indexing strategy, and technical SEO schema audit.",
    files: [
      { name: "core-web-vitals-audit.pdf", size: "5.1 MB", type: "pdf" },
      { name: "structured-data-schemas.zip", size: "1.8 MB", type: "zip" },
    ],
  },
  writing: {
    note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
    files: [
      { name: "system-whitepaper.pdf", size: "3.9 MB", type: "pdf" },
      { name: "developer-guide.pdf", size: "2.7 MB", type: "pdf" },
      { name: "openapi-spec.zip", size: "850 KB", type: "zip" },
    ],
  },
}

const REVIEW_COMMENTS_5_STAR = [
  "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
  "Outstanding collaboration from day one. Deep domain expertise, prompt communication, and zero friction during milestone sign-offs.",
  "One of the best specialists I have hired on any platform. The architecture handles high concurrency effortlessly and was documented thoroughly.",
  "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
  "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
  "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
  "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
  "True senior specialist. Communication was proactive, thoughtful, and pragmatic. Milestone delivered with zero defects.",
  "Exceeded all expectations. The code review and documentation made onboarding our internal engineers seamless.",
  "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
]

const REVIEW_COMMENTS_4_STAR = [
  "Very solid deliverable and strong technical foundation. Minor delay on the final milestone review, but overall excellent code quality.",
  "High quality work and prompt responses. Would have liked slightly more inline comments, but the architecture is rock solid.",
  "Great specialist who knows their craft. The deliverables matched our Figma designs accurately and performed well in QA.",
  "Good execution and reliable communication throughout. Resolved all feedback promptly during the revision cycle.",
]

// ---------------------------------------------------------------------------
// 4. GENERATE ALL ORDERS (85 TOTAL)
// ---------------------------------------------------------------------------
export function generateAllOrders(
  allGigs: Gig[],
  allUsers: UserProfile[]
): DashboardOrder[] {
  const clients = allUsers.filter((u) => u.role === "client" || u.role === "both")
  const orders: DashboardOrder[] = []

  // 1. Four stable reference orders
  // ORD-9481 (Alexandre Moreau f-1, Marcus Thorne usr-client-1, gig-1)
  orders.push({
    id: "ORD-9481",
    title: "Full-Stack Next.js 15 & Node.js Production Architecture with Clean Code",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-1",
    totalAmount: 450,
    status: "active",
    createdAt: "2026-03-18",
    deliveryDate: "Tomorrow, 18:00",
    role: "BOTH",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Deploy a scalable pnpm monorepo with Next.js 15 App Router, PostgreSQL with Prisma ORM, JWT authentication cookies, and Docker Compose development environment.",
    milestones: [
      {
        id: "m-1",
        title: "Architecture Blueprint & Monorepo Setup",
        amount: 150,
        status: "completed",
        dueDate: "Mar 19, 2026",
        approvedAt: "Mar 19, 2026",
      },
      {
        id: "m-2",
        title: "Prisma Schema & JWT Auth Boilerplate",
        amount: 150,
        status: "in_progress",
        dueDate: "Mar 22, 2026",
      },
      {
        id: "m-3",
        title: "Docker Production Build & CI/CD Pipeline",
        amount: 150,
        status: "pending",
        dueDate: "Mar 25, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-1",
        milestoneId: "m-1",
        note: "Initial architectural monorepo blueprint pushed to git repository. All workspace packages configured.",
        submittedAt: "Mar 19, 2026",
        files: [
          { name: "architecture-monorepo.zip", size: "12.4 MB", type: "zip" },
          { name: "erd-diagram.pdf", size: "2.1 MB", type: "pdf" },
        ],
      },
    ],
    revisions: [],
  })

  // ORD-9420 (Helena Rostova f-2, Marcus Thorne usr-client-1, gig-2)
  orders.push({
    id: "ORD-9420",
    title: "Figma to Production Design System with Tokens and Atomic Components",
    category: "UI/UX & Design",
    tier: "STANDARD",
    gigId: "gig-2",
    totalAmount: 350,
    status: "delivered",
    createdAt: "2026-03-12",
    deliveryDate: "Mar 20, 2026",
    role: "BOTH",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-2",
      name: "Helena Rostova",
      title: "Principal Brand & Product Designer",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      rating: 5.0,
      level: "TOP_RATED",
    },
    requirements:
      "Tokenized multi-brand Figma library with atomic component architecture, dark mode variants, and responsive layout grids.",
    milestones: [
      {
        id: "m-1",
        title: "Global Design Tokens & Typography Scale",
        amount: 175,
        status: "completed",
        dueDate: "Mar 15, 2026",
        approvedAt: "Mar 15, 2026",
      },
      {
        id: "m-2",
        title: "Interactive Components & Documentation",
        amount: 175,
        status: "in_review",
        dueDate: "Mar 20, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-2",
        milestoneId: "m-2",
        note: "Complete Figma design library published with interactive component variants and token definitions.",
        submittedAt: "Mar 20, 2026",
        files: [
          { name: "fintech-design-system.figma", size: "34.2 MB", type: "figma" },
          { name: "token-specifications.pdf", size: "4.8 MB", type: "pdf" },
        ],
      },
    ],
    revisions: [],
  })

  // ORD-9412 (Marcus Vance f-3, David Sterling usr-client-2, gig-3)
  orders.push({
    id: "ORD-9412",
    title: "Production RAG Agent with Hybrid Search and Evals",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-3",
    totalAmount: 600,
    status: "completed",
    createdAt: "2026-03-01",
    deliveryDate: "Mar 10, 2026",
    role: "BOTH",
    client: {
      id: "usr-client-2",
      name: "David Sterling",
      email: "david.sterling@apexcap.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "f-3",
      name: "Marcus Vance",
      title: "AI Engineer & Research Lead",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      rating: 4.96,
      level: "TOP_RATED",
    },
    requirements:
      "Enterprise hybrid retrieval RAG pipeline integrating dense embeddings with BM25 keyword matching and Ragas evaluation benchmarks.",
    milestones: [
      {
        id: "m-1",
        title: "Data Chunking & Embedding Pipeline",
        amount: 300,
        status: "completed",
        dueDate: "Mar 05, 2026",
        approvedAt: "Mar 05, 2026",
      },
      {
        id: "m-2",
        title: "Hybrid Retrieval & Ragas Evals",
        amount: 300,
        status: "completed",
        dueDate: "Mar 10, 2026",
        approvedAt: "Mar 10, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-3",
        milestoneId: "m-2",
        note: "RAG engine deployed with 88% precision score on client financial knowledgebase.",
        submittedAt: "Mar 10, 2026",
        files: [
          { name: "rag-engine.zip", size: "18.1 MB", type: "zip" },
          { name: "ragas-eval-metrics.pdf", size: "3.2 MB", type: "pdf" },
        ],
      },
    ],
    revisions: [],
  })

  // ORD-9390 (Sophia Lindqvist f-4, Marcus Thorne usr-client-1, gig-4)
  orders.push({
    id: "ORD-9390",
    title: "Enterprise Core Web Vitals and Technical SEO Audit with Remediation",
    category: "Technical SEO & Growth",
    tier: "STANDARD",
    gigId: "gig-4",
    totalAmount: 280,
    status: "cancelled",
    createdAt: "2026-02-15",
    deliveryDate: "Cancelled by mutual agreement",
    role: "BOTH",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-4",
      name: "Sophia Lindqvist",
      title: "B2B SaaS Growth & SEO Strategist",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      rating: 4.94,
      level: "TOP_RATED",
    },
    requirements:
      "Client internal restructuring paused external SEO marketing campaigns; mutual cancellation processed with full escrow refund.",
    milestones: [
      {
        id: "m-1",
        title: "Technical Site Crawl & LCP Profiling",
        amount: 140,
        status: "completed",
        dueDate: "Feb 18, 2026",
        approvedAt: "Feb 18, 2026",
      },
      {
        id: "m-2",
        title: "Code Remediation Pull Requests",
        amount: 140,
        status: "pending",
        dueDate: "Feb 25, 2026",
      },
    ],
    deliveries: [],
    revisions: [],
  })

  // 2. Five deliberate Phase 3 Edge Cases
  // ORD-EDGE-1: Disputed / Cancelled order with revision conflict
  orders.push({
    id: "ORD-EDGE-1",
    title: "Microservices Architecture Audit & Penetration Hardening",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-1",
    totalAmount: 850,
    status: "cancelled",
    createdAt: "2026-01-20",
    deliveryDate: "Cancelled via dispute mediation",
    role: "CLIENT",
    client: {
      id: "usr-client-3",
      name: "Emily Zhang",
      email: "emily.zhang@nexusventures.sg",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Deep security hardening and architectural audit for a financial microservices platform.",
    milestones: [
      {
        id: "m-1",
        title: "Threat Modeling & AST Code Scanning",
        amount: 425,
        status: "completed",
        dueDate: "Jan 25, 2026",
        approvedAt: "Jan 25, 2026",
      },
      {
        id: "m-2",
        title: "Zero-Trust Service Mesh Hardening",
        amount: 425,
        status: "pending",
        dueDate: "Feb 05, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-edge-1",
        milestoneId: "m-1",
        note: "Delivered comprehensive threat model and static analysis report.",
        submittedAt: "Jan 24, 2026",
        files: [{ name: "threat-model.pdf", size: "4.2 MB", type: "pdf" }],
      },
    ],
    revisions: [
      {
        id: "rev-req-edge-1",
        requestedAt: "Jan 28, 2026",
        note: "Client requested out-of-scope manual penetration tests without timeline extension. Escalated to dispute resolution.",
      },
    ],
  })

  // ORD-EDGE-2: High-Value Enterprise Order ($5,200 with 5 milestones)
  orders.push({
    id: "ORD-EDGE-2",
    title: "Multi-Cloud Kubernetes & SOC2 Compliance Enterprise Migration",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-1",
    totalAmount: 5200,
    status: "completed",
    createdAt: "2025-11-10",
    deliveryDate: "Jan 15, 2026",
    role: "BOTH",
    client: {
      id: "usr-client-2",
      name: "David Sterling",
      email: "david.sterling@apexcap.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Enterprise infrastructure migration to multi-region AWS EKS clusters with Terraform IaC, Vault secrets management, and SOC2 compliance audit log streaming.",
    milestones: [
      { id: "m-1", title: "Terraform Multi-Region VPC & EKS Blueprint", amount: 1200, status: "completed", dueDate: "Nov 25, 2025", approvedAt: "Nov 25, 2025" },
      { id: "m-2", title: "HashiCorp Vault & RBAC Security Cluster", amount: 1000, status: "completed", dueDate: "Dec 10, 2025", approvedAt: "Dec 10, 2025" },
      { id: "m-3", title: "GitOps ArgoCD Pipelines & Helm Charts", amount: 1000, status: "completed", dueDate: "Dec 24, 2025", approvedAt: "Dec 24, 2025" },
      { id: "m-4", title: "Observability Prometheus & OpenTelemetry Stack", amount: 1000, status: "completed", dueDate: "Jan 05, 2026", approvedAt: "Jan 05, 2026" },
      { id: "m-5", title: "SOC2 Compliance Verification & Cutover", amount: 1000, status: "completed", dueDate: "Jan 15, 2026", approvedAt: "Jan 15, 2026" },
    ],
    deliveries: [
      {
        id: "del-edge-2",
        milestoneId: "m-5",
        note: "All 5 enterprise infrastructure milestones complete. Cutover executed with zero downtime. SOC2 compliance audit passes 100%.",
        submittedAt: "Jan 14, 2026",
        files: [
          { name: "soc2-compliance-report.pdf", size: "12.8 MB", type: "pdf" },
          { name: "terraform-iac-configs.zip", size: "45.1 MB", type: "zip" },
          { name: "disaster-recovery-runbook.pdf", size: "6.4 MB", type: "pdf" },
        ],
      },
    ],
    revisions: [],
  })

  // ORD-EDGE-3: Rapid 24-Hour Turnaround Order ($300: $250 basic + $50 express)
  orders.push({
    id: "ORD-EDGE-3",
    title: "Next.js Production Architecture with 24-Hour Express Delivery",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-1",
    totalAmount: 300,
    status: "completed",
    createdAt: "2026-03-21",
    deliveryDate: "Mar 22, 2026",
    role: "BOTH",
    client: {
      id: "usr-client-4",
      name: "Rachel Adams",
      email: "rachel.adams@horizonhealth.ca",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Emergency production scaffolding needed within 24 hours for investor demo presentation.",
    milestones: [
      { id: "m-1", title: "Express 24-Hour Scaffold Handover", amount: 300, status: "completed", dueDate: "Mar 22, 2026", approvedAt: "Mar 22, 2026" },
    ],
    deliveries: [
      {
        id: "del-edge-3",
        milestoneId: "m-1",
        note: "Delivered within 18 hours. Clean repository setup with working demo endpoints.",
        submittedAt: "Mar 22, 2026",
        files: [{ name: "express-demo-code.zip", size: "8.4 MB", type: "zip" }],
      },
    ],
    revisions: [],
  })

  // ORD-EDGE-4: Multi-Revision Order (3 revision cycles requested and resolved)
  orders.push({
    id: "ORD-EDGE-4",
    title: "B2B SaaS Multi-Tenant Billing System & Stripe Webhook Engine",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-1",
    totalAmount: 485,
    status: "active",
    createdAt: "2026-03-05",
    deliveryDate: "Mar 26, 2026",
    role: "FREELANCER",
    client: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      email: "liam.oconnor@novadynamics.ie",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Nova Dynamics AI",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Stripe Customer Portal integration, prorated subscription upgrades, and idempotency handling for invoice.payment_succeeded webhooks.",
    milestones: [
      { id: "m-1", title: "Stripe Subscription Logic & Data Schema", amount: 240, status: "completed", dueDate: "Mar 12, 2026", approvedAt: "Mar 12, 2026" },
      { id: "m-2", title: "Webhook Idempotency & Customer Portal UI", amount: 245, status: "in_review", dueDate: "Mar 25, 2026" },
    ],
    deliveries: [
      {
        id: "del-edge-4-1",
        milestoneId: "m-2",
        note: "Updated webhook retry logic and added exponential backoff.",
        submittedAt: "Mar 23, 2026",
        files: [{ name: "stripe-integration-patch.zip", size: "11.2 MB", type: "zip" }],
      },
    ],
    revisions: [
      { id: "rev-edge-4-1", requestedAt: "Mar 16, 2026", note: "Please add prorated calculation preview for mid-cycle plan downgrades." },
      { id: "rev-edge-4-2", requestedAt: "Mar 19, 2026", note: "Customer portal return URL should redirect back to team billing settings page." },
      { id: "rev-edge-4-3", requestedAt: "Mar 22, 2026", note: "Need idempotency key check to guard against duplicate webhook delivery." },
    ],
  })

  // ORD-EDGE-5: Freshly Initiated Order (0% progress, pending milestone kickoff)
  orders.push({
    id: "ORD-EDGE-5",
    title: "Brand-New Technical Audit Kickoff",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-edge-single-tier",
    totalAmount: 350,
    status: "active",
    createdAt: "2026-03-24",
    deliveryDate: "Mar 29, 2026",
    role: "CLIENT",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Junior Full-Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      rating: 0.0,
      level: "LEVEL_1",
    },
    requirements:
      "Initial code repository access provided; awaiting developer kick-off message and preliminary vulnerability scanning.",
    milestones: [
      { id: "m-1", title: "Repository Setup & Dependency CVE Scan", amount: 175, status: "pending", dueDate: "Mar 26, 2026" },
      { id: "m-2", title: "Remediation Patch Pull Request", amount: 175, status: "pending", dueDate: "Mar 29, 2026" },
    ],
    deliveries: [],
    revisions: [],
  })

  // 3. Generate remaining 76 orders across the 68 gigs to reach 85 total
  const remainingCount = 76
  for (let i = 0; i < remainingCount; i++) {
    const gig = allGigs[i % allGigs.length]
    const client = clients[(i * 3 + 1) % clients.length]
    const orderNum = 8000 + i
    const orderId = `ORD-${orderNum}`

    // Tier selection: BASIC (35%), STANDARD (45%), PREMIUM (20%)
    let tier: "BASIC" | "STANDARD" | "PREMIUM" = "STANDARD"
    if (i % 5 === 0) tier = "BASIC"
    else if (i % 5 === 4) tier = "PREMIUM"

    const pkg = gig.packages.find((p) => p.type === tier) || gig.packages[0]
    const price = pkg.price

    // Status: completed (65%), active (20%), delivered (10%), cancelled (5%)
    let status: DashboardOrder["status"] = "completed"
    if (i % 20 === 0) status = "cancelled"
    else if (i % 10 === 0) status = "delivered"
    else if (i % 5 === 0) status = "active"

    // Dates
    const month = String(1 + ((i * 2) % 3)).padStart(2, "0")
    const day = String(1 + ((i * 5) % 27)).padStart(2, "0")
    const createdAt = `2026-${month}-${day}`
    const deliveryDate = status === "cancelled" ? "Cancelled" : `2026-${month}-${String(Math.min(28, Number(day) + pkg.deliveryDays)).padStart(2, "0")}`

    // Milestones (2 or 3 milestones summing strictly to price)
    const milestoneCount = price >= 600 ? 3 : 2
    const milestones: OrderMilestone[] = []
    let allocated = 0

    for (let m = 0; m < milestoneCount; m++) {
      const isLast = m === milestoneCount - 1
      const mAmount = isLast
        ? price - allocated
        : Math.round(price / milestoneCount)
      allocated += mAmount

      let mStatus: OrderMilestone["status"] = "completed"
      let approvedAt: string | undefined = `${createdAt}T18:00:00Z`

      if (status === "active") {
        if (m === 0) {
          mStatus = "completed"
        } else if (m === 1) {
          mStatus = "in_progress"
          approvedAt = undefined
        } else {
          mStatus = "pending"
          approvedAt = undefined
        }
      } else if (status === "delivered") {
        if (isLast) {
          mStatus = "in_review"
          approvedAt = undefined
        } else {
          mStatus = "completed"
        }
      } else if (status === "cancelled") {
        if (m > 0) {
          mStatus = "pending"
          approvedAt = undefined
        }
      }

      milestones.push({
        id: `m-${orderId}-${m + 1}`,
        title: `Phase ${m + 1}: ${gig.subCategoryName} Milestone Deliverables`,
        amount: mAmount,
        status: mStatus,
        dueDate: deliveryDate,
        approvedAt,
      })
    }

    // Deliveries
    const deliveryInfo = DELIVERY_NOTES_BY_CAT[gig.categorySlug] || DELIVERY_NOTES_BY_CAT.programming
    const deliveries: OrderDelivery[] = []
    if (status === "completed" || status === "delivered") {
      deliveries.push({
        id: `del-${orderId}-1`,
        milestoneId: milestones[milestones.length - 1].id,
        note: deliveryInfo.note,
        submittedAt: deliveryDate,
        files: deliveryInfo.files,
      })
    }

    orders.push({
      id: orderId,
      title: gig.title,
      category: gig.categoryName,
      tier,
      gigId: gig.id,
      totalAmount: price,
      status,
      createdAt,
      deliveryDate,
      role: (i % 3 === 0 ? "CLIENT" : i % 3 === 1 ? "FREELANCER" : "BOTH") as "CLIENT" | "FREELANCER" | "BOTH",
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        avatar: client.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        company: client.company || "Enterprise Partner",
      },
      freelancer: {
        id: gig.seller.id,
        name: gig.seller.name,
        title: `${gig.subCategoryName} Specialist`,
        avatar: gig.seller.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        rating: gig.seller.level === "TOP_RATED" ? 4.99 : 4.95,
        level: gig.seller.level === "TOP_RATED" ? "TOP_RATED" : "LEVEL_2",
      },
      requirements: `Execute ${pkg.name} requirements with clean production code, modular architecture, and documentation.`,
      milestones,
      deliveries,
      revisions: [],
    })
  }

  return orders
}

// ---------------------------------------------------------------------------
// 5. GENERATE ALL REVIEWS (175 TOTAL)
// ---------------------------------------------------------------------------
export function generateAllReviews(
  allOrders: DashboardOrder[],
  allGigs: Gig[],
  allUsers: UserProfile[]
): Review[] {
  const clients = allUsers.filter((u) => u.role === "client" || u.role === "both")
  const reviews: Review[] = []
  let reviewIdCounter = 1

  // 1. Generate direct review for each completed order
  const completedOrders = allOrders.filter((o) => o.status === "completed")

  completedOrders.forEach((order) => {
    const gig = allGigs.find((g) => g.id === order.gigId) || allGigs[0]
    const commentsPool = REVIEW_COMMENTS_5_STAR
    const comment = commentsPool[(reviewIdCounter * 3) % commentsPool.length]

    const createdAtIso = `${order.deliveryDate}T16:00:00Z`
    const dateFormatted = formatRelativeDate(createdAtIso)

    reviews.push({
      id: `rev-${reviewIdCounter++}`,
      gigId: gig.id,
      orderId: order.id,
      sellerId: order.freelancer.id,
      buyer: {
        id: order.client.id,
        name: order.client.name,
        avatar: order.client.avatar,
        country: "United States",
        company: order.client.company,
      },
      rating: 5,
      comment,
      createdAt: createdAtIso,
      date: dateFormatted,
      dateFormatted,
      aspectRatings: {
        communication: 5,
        qualityOfDelivery: 5,
        valueForMoney: 5,
      },
      sellerResponse:
        reviewIdCounter % 4 === 0
          ? {
              comment: `Thank you ${order.client.name.split(" ")[0]}! It was a pleasure collaborating on this ${order.category} architecture.`,
              respondedAt: `${order.deliveryDate}T19:30:00Z`,
            }
          : undefined,
      helpfulCount: (reviewIdCounter * 4) % 18,
    })
  })

  // 2. Add 3 Deliberate Edge Case Reviews
  // rev-edge-critical: 3-Star Constructive Critical Review with Seller Response
  reviews.push({
    id: "rev-edge-critical",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 3,
    comment:
      "Architectural foundation and database schema were top notch. However, we encountered minor friction during initial deployment on AWS ECS Fargate because of missing environment variable templates. Required two iterations to stabilize.",
    createdAt: "2026-02-14T10:15:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 4,
      qualityOfDelivery: 4,
      valueForMoney: 3,
    },
    sellerResponse: {
      comment:
        "Thank you for the balanced feedback, David. I have since updated the ECS Terraform module to automatically validate task definition environment variables at build time to prevent this scenario completely.",
      respondedAt: "2026-02-15T08:30:00Z",
    },
    helpfulCount: 24,
  })

  // rev-edge-long: 4-Paragraph Deep Engineering Case Study Review (5-Star)
  reviews.push({
    id: "rev-edge-long",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment: `Alexandre delivered what is easily the cleanest, most maintainable Next.js 15 enterprise architecture our engineering team has ever reviewed.

From an architectural perspective, the strict boundary between domain entities, server actions, and client boundary components follows Clean Architecture principles to the letter. Database indexing and foreign key constraints on PostgreSQL via Prisma ORM reduced our cold-start latency from 1.2s to under 45ms.

The automated test coverage provided deserves special recognition. Not only did we receive unit tests with Vitest, but full Playwright end-to-end user journeys were included out of the box, configured seamlessly with GitHub Actions CI/CD workflows.

If you are evaluating whether to hire Alexandre for mission-critical infrastructure, do not hesitate. He is a premier tier specialist who elevates the technical standard of any platform he touches.`,
    createdAt: "2026-03-01T12:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Marcus, thank you for such an in-depth and generous review! Working with the Fintech Corp engineering team was a phenomenal experience.",
      respondedAt: "2026-03-01T15:20:00Z",
    },
    helpfulCount: 47,
  })

  // rev-edge-1star: 1-Star Review for Disputed Order ORD-EDGE-1
  reviews.push({
    id: "rev-edge-1star",
    gigId: "gig-1",
    orderId: "ORD-EDGE-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 1,
    comment:
      "Disagreed on scope of deliverables for penetration testing phase. Contract cancelled and refunded via escrow.",
    createdAt: "2026-01-29T14:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 2,
      qualityOfDelivery: 2,
      valueForMoney: 1,
    },
    sellerResponse: {
      comment:
        "The project brief included static security analysis; live penetration attack simulations required extended scope which client declined to fund. Handled courteously and escrow was refunded promptly.",
      respondedAt: "2026-01-30T09:00:00Z",
    },
    helpfulCount: 5,
  })

  // 3. Fill remaining reviews to reach exactly 175 reviews total
  // Ensure top reference gigs reach their known review counts:
  // gig-1 target: 42 reviews
  // gig-2 target: 38 reviews
  // gig-3 target: 29 reviews
  // gig-4 target: 51 reviews
  const targetCounts: Record<string, number> = {
    "gig-1": 42,
    "gig-2": 38,
    "gig-3": 29,
    "gig-4": 51,
  }

  // Count existing reviews per gig
  const currentCounts: Record<string, number> = {}
  reviews.forEach((r) => {
    currentCounts[r.gigId] = (currentCounts[r.gigId] || 0) + 1
  })

  // Generate historical reviews for target reference gigs
  for (const [targetGigId, targetCount] of Object.entries(targetCounts)) {
    const gig = allGigs.find((g) => g.id === targetGigId)
    if (!gig) continue

    const needed = targetCount - (currentCounts[targetGigId] || 0)
    for (let k = 0; k < needed; k++) {
      const client = clients[(k * 7 + 3) % clients.length]
      const rating = k % 15 === 0 ? 4 : 5
      const pool = rating === 5 ? REVIEW_COMMENTS_5_STAR : REVIEW_COMMENTS_4_STAR
      const comment = pool[(k * 5) % pool.length]
      const monthAgo = 1 + (k % 4)
      const day = 1 + ((k * 3) % 25)
      const createdAtIso = `2026-0${monthAgo}-${String(day).padStart(2, "0")}T10:00:00Z`
      const dateFormatted = formatRelativeDate(createdAtIso)

      reviews.push({
        id: `rev-${reviewIdCounter++}`,
        gigId: gig.id,
        sellerId: gig.seller.id,
        buyer: {
          id: client.id,
          name: client.name,
          avatar: client.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          country: client.country || "United States",
          company: client.company,
        },
        rating,
        comment,
        createdAt: createdAtIso,
        date: dateFormatted,
        dateFormatted,
        aspectRatings: {
          communication: 5,
          qualityOfDelivery: rating,
          valueForMoney: 5,
        },
        helpfulCount: (k * 2) % 15,
      })
    }
  }

  // Recount reviews
  const currentTotal = reviews.length
  const TARGET_TOTAL = 175
  const remainingNeeded = TARGET_TOTAL - currentTotal

  if (remainingNeeded > 0) {
    const validGigs = allGigs.filter((g) => g.id !== "gig-edge-zero-orders")
    for (let j = 0; j < remainingNeeded; j++) {
      const gig = validGigs[(j * 2 + 5) % validGigs.length]
      const client = clients[(j * 4 + 2) % clients.length]
      const rating = j % 12 === 0 ? 4 : 5
      const pool = rating === 5 ? REVIEW_COMMENTS_5_STAR : REVIEW_COMMENTS_4_STAR
      const comment = pool[(j * 3) % pool.length]
      const createdAtIso = `2026-02-${String(1 + (j % 26)).padStart(2, "0")}T11:00:00Z`
      const dateFormatted = formatRelativeDate(createdAtIso)

      reviews.push({
        id: `rev-${reviewIdCounter++}`,
        gigId: gig.id,
        sellerId: gig.seller.id,
        buyer: {
          id: client.id,
          name: client.name,
          avatar: client.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          country: client.country || "United States",
          company: client.company,
        },
        rating,
        comment,
        createdAt: createdAtIso,
        date: dateFormatted,
        dateFormatted,
        aspectRatings: {
          communication: 5,
          qualityOfDelivery: rating,
          valueForMoney: 5,
        },
        helpfulCount: (j * 3) % 12,
      })
    }
  }

  return reviews
}

// ---------------------------------------------------------------------------
// 6. WRITE DATA FILES
// ---------------------------------------------------------------------------
export function writeOrdersDataFile(orders: DashboardOrder[]) {
  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/dashboard/orders.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Milestone Orders & Contracts
 * 
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Orders: ${orders.length}
 * Regenerate with: npm run seed
 */

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
  type: "zip" | "pdf" | "figma" | "code" | "image" | "video"
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
  gigId: string
  totalAmount: number
  status: "active" | "delivered" | "completed" | "cancelled"
  createdAt: string
  deliveryDate: string
  role: "CLIENT" | "FREELANCER" | "BOTH"
  client: {
    id: string
    name: string
    email: string
    avatar: string
    company: string
  }
  freelancer: {
    id: string
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

/**
 * Known Test Orders for Playwright regression and QA validation.
 */
export const KNOWN_TEST_ORDERS = {
  referenceOrder: ${JSON.stringify(orders[0], null, 2)},
  edgeDisputed: ${JSON.stringify(orders.find((o) => o.id === "ORD-EDGE-1"), null, 2)},
  edgeEnterprise: ${JSON.stringify(orders.find((o) => o.id === "ORD-EDGE-2"), null, 2)},
  edgeRapid24h: ${JSON.stringify(orders.find((o) => o.id === "ORD-EDGE-3"), null, 2)},
  edgeMultiRevision: ${JSON.stringify(orders.find((o) => o.id === "ORD-EDGE-4"), null, 2)},
  edgeFresh: ${JSON.stringify(orders.find((o) => o.id === "ORD-EDGE-5"), null, 2)},
}

/**
 * Complete set of all local seed orders (${orders.length} total).
 */
export const INITIAL_ORDERS: DashboardOrder[] = ${JSON.stringify(orders, null, 2)}
export const ALL_ORDERS: DashboardOrder[] = INITIAL_ORDERS

export function getOrderById(id: string): DashboardOrder | undefined {
  return INITIAL_ORDERS.find((o) => o.id === id)
}

export function getOrdersByClientId(clientId: string): DashboardOrder[] {
  return INITIAL_ORDERS.filter((o) => o.client.id === clientId)
}

export function getOrdersByFreelancerId(freelancerId: string): DashboardOrder[] {
  return INITIAL_ORDERS.filter((o) => o.freelancer.id === freelancerId)
}

export function getOrdersByStatus(status: DashboardOrder["status"]): DashboardOrder[] {
  return INITIAL_ORDERS.filter((o) => o.status === status)
}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated ${orders.length} orders into ${outputPath}`)
}

export function writeReviewsDataFile(reviews: Review[]) {
  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/reviews.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Reviews & Ratings
 * 
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Reviews: ${reviews.length}
 * Regenerate with: npm run seed
 */

export interface ReviewAspects {
  communication: number
  qualityOfDelivery: number
  valueForMoney: number
}

export interface ReviewBuyer {
  id: string
  name: string
  avatar: string
  country: string
  company?: string
}

export interface ReviewSellerResponse {
  comment: string
  respondedAt: string
}

export interface Review {
  id: string
  gigId: string
  orderId?: string
  sellerId: string
  buyer: ReviewBuyer
  rating: number
  comment: string
  createdAt: string
  date: string
  dateFormatted: string
  aspectRatings: ReviewAspects
  sellerResponse?: ReviewSellerResponse
  helpfulCount: number
}

/**
 * Known Test Reviews for Playwright assertions and UI edge cases.
 */
export const KNOWN_TEST_REVIEWS = {
  referenceReviews: ${JSON.stringify(reviews.filter((r) => r.gigId === "gig-1").slice(0, 3), null, 2)},
  edgeCritical: ${JSON.stringify(reviews.find((r) => r.id === "rev-edge-critical"), null, 2)},
  edgeLong: ${JSON.stringify(reviews.find((r) => r.id === "rev-edge-long"), null, 2)},
  edgeOneStar: ${JSON.stringify(reviews.find((r) => r.id === "rev-edge-1star"), null, 2)},
}

/**
 * Complete set of all local seed reviews (${reviews.length} total).
 */
export const MOCK_REVIEWS: Review[] = ${JSON.stringify(reviews, null, 2)}

export function getReviewById(id: string): Review | undefined {
  return MOCK_REVIEWS.find((r) => r.id === id)
}

export function getReviewsByGigId(gigId: string): Review[] {
  if (gigId === "srv-1") return MOCK_REVIEWS.filter((r) => r.gigId === "gig-1")
  return MOCK_REVIEWS.filter((r) => r.gigId === gigId)
}

export function getReviewsBySellerId(sellerId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.sellerId === sellerId)
}

export function getReviewsByBuyerId(buyerId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.buyer.id === buyerId)
}

export function getAverageRatingForGig(gigId: string): { rating: number; count: number } {
  const reviews = getReviewsByGigId(gigId)
  if (reviews.length === 0) return { rating: 5.0, count: 0 }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return {
    rating: Math.round((sum / reviews.length) * 100) / 100,
    count: reviews.length,
  }
}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated ${reviews.length} reviews into ${outputPath}`)
}

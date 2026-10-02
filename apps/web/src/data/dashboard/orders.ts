/**
 * TASCORA Generated Seed & Mock Data: Milestone Orders & Contracts
 *
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Orders: 85
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
  referenceOrder: {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
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
          {
            name: "architecture-monorepo.zip",
            size: "12.4 MB",
            type: "zip",
          },
          {
            name: "erd-diagram.pdf",
            size: "2.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  edgeDisputed: {
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
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
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
        files: [
          {
            name: "threat-model.pdf",
            size: "4.2 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [
      {
        id: "rev-req-edge-1",
        requestedAt: "Jan 28, 2026",
        note: "Client requested out-of-scope manual penetration tests without timeline extension. Escalated to dispute resolution.",
      },
    ],
  },
  edgeEnterprise: {
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
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Enterprise infrastructure migration to multi-region AWS EKS clusters with Terraform IaC, Vault secrets management, and SOC2 compliance audit log streaming.",
    milestones: [
      {
        id: "m-1",
        title: "Terraform Multi-Region VPC & EKS Blueprint",
        amount: 1200,
        status: "completed",
        dueDate: "Nov 25, 2025",
        approvedAt: "Nov 25, 2025",
      },
      {
        id: "m-2",
        title: "HashiCorp Vault & RBAC Security Cluster",
        amount: 1000,
        status: "completed",
        dueDate: "Dec 10, 2025",
        approvedAt: "Dec 10, 2025",
      },
      {
        id: "m-3",
        title: "GitOps ArgoCD Pipelines & Helm Charts",
        amount: 1000,
        status: "completed",
        dueDate: "Dec 24, 2025",
        approvedAt: "Dec 24, 2025",
      },
      {
        id: "m-4",
        title: "Observability Prometheus & OpenTelemetry Stack",
        amount: 1000,
        status: "completed",
        dueDate: "Jan 05, 2026",
        approvedAt: "Jan 05, 2026",
      },
      {
        id: "m-5",
        title: "SOC2 Compliance Verification & Cutover",
        amount: 1000,
        status: "completed",
        dueDate: "Jan 15, 2026",
        approvedAt: "Jan 15, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-edge-2",
        milestoneId: "m-5",
        note: "All 5 enterprise infrastructure milestones complete. Cutover executed with zero downtime. SOC2 compliance audit passes 100%.",
        submittedAt: "Jan 14, 2026",
        files: [
          {
            name: "soc2-compliance-report.pdf",
            size: "12.8 MB",
            type: "pdf",
          },
          {
            name: "terraform-iac-configs.zip",
            size: "45.1 MB",
            type: "zip",
          },
          {
            name: "disaster-recovery-runbook.pdf",
            size: "6.4 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  edgeRapid24h: {
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
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Emergency production scaffolding needed within 24 hours for investor demo presentation.",
    milestones: [
      {
        id: "m-1",
        title: "Express 24-Hour Scaffold Handover",
        amount: 300,
        status: "completed",
        dueDate: "Mar 22, 2026",
        approvedAt: "Mar 22, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-edge-3",
        milestoneId: "m-1",
        note: "Delivered within 18 hours. Clean repository setup with working demo endpoints.",
        submittedAt: "Mar 22, 2026",
        files: [
          {
            name: "express-demo-code.zip",
            size: "8.4 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  edgeMultiRevision: {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Nova Dynamics AI",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Stripe Customer Portal integration, prorated subscription upgrades, and idempotency handling for invoice.payment_succeeded webhooks.",
    milestones: [
      {
        id: "m-1",
        title: "Stripe Subscription Logic & Data Schema",
        amount: 240,
        status: "completed",
        dueDate: "Mar 12, 2026",
        approvedAt: "Mar 12, 2026",
      },
      {
        id: "m-2",
        title: "Webhook Idempotency & Customer Portal UI",
        amount: 245,
        status: "in_review",
        dueDate: "Mar 25, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-edge-4-1",
        milestoneId: "m-2",
        note: "Updated webhook retry logic and added exponential backoff.",
        submittedAt: "Mar 23, 2026",
        files: [
          {
            name: "stripe-integration-patch.zip",
            size: "11.2 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [
      {
        id: "rev-edge-4-1",
        requestedAt: "Mar 16, 2026",
        note: "Please add prorated calculation preview for mid-cycle plan downgrades.",
      },
      {
        id: "rev-edge-4-2",
        requestedAt: "Mar 19, 2026",
        note: "Customer portal return URL should redirect back to team billing settings page.",
      },
      {
        id: "rev-edge-4-3",
        requestedAt: "Mar 22, 2026",
        note: "Need idempotency key check to guard against duplicate webhook delivery.",
      },
    ],
  },
  edgeFresh: {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Junior Full-Stack Engineer",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      rating: 0,
      level: "LEVEL_1",
    },
    requirements:
      "Initial code repository access provided; awaiting developer kick-off message and preliminary vulnerability scanning.",
    milestones: [
      {
        id: "m-1",
        title: "Repository Setup & Dependency CVE Scan",
        amount: 175,
        status: "pending",
        dueDate: "Mar 26, 2026",
      },
      {
        id: "m-2",
        title: "Remediation Patch Pull Request",
        amount: 175,
        status: "pending",
        dueDate: "Mar 29, 2026",
      },
    ],
    deliveries: [],
    revisions: [],
  },
}

/**
 * Complete set of all local seed orders (85 total).
 */
export const INITIAL_ORDERS: DashboardOrder[] = [
  {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
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
          {
            name: "architecture-monorepo.zip",
            size: "12.4 MB",
            type: "zip",
          },
          {
            name: "erd-diagram.pdf",
            size: "2.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-2",
      name: "Helena Rostova",
      title: "Principal Brand & Product Designer",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      rating: 5,
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
          {
            name: "fintech-design-system.figma",
            size: "34.2 MB",
            type: "figma",
          },
          {
            name: "token-specifications.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "f-3",
      name: "Marcus Vance",
      title: "AI Engineer & Research Lead",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
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
          {
            name: "rag-engine.zip",
            size: "18.1 MB",
            type: "zip",
          },
          {
            name: "ragas-eval-metrics.pdf",
            size: "3.2 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-4",
      name: "Sophia Lindqvist",
      title: "B2B SaaS Growth & SEO Strategist",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
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
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
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
        files: [
          {
            name: "threat-model.pdf",
            size: "4.2 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [
      {
        id: "rev-req-edge-1",
        requestedAt: "Jan 28, 2026",
        note: "Client requested out-of-scope manual penetration tests without timeline extension. Escalated to dispute resolution.",
      },
    ],
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Enterprise infrastructure migration to multi-region AWS EKS clusters with Terraform IaC, Vault secrets management, and SOC2 compliance audit log streaming.",
    milestones: [
      {
        id: "m-1",
        title: "Terraform Multi-Region VPC & EKS Blueprint",
        amount: 1200,
        status: "completed",
        dueDate: "Nov 25, 2025",
        approvedAt: "Nov 25, 2025",
      },
      {
        id: "m-2",
        title: "HashiCorp Vault & RBAC Security Cluster",
        amount: 1000,
        status: "completed",
        dueDate: "Dec 10, 2025",
        approvedAt: "Dec 10, 2025",
      },
      {
        id: "m-3",
        title: "GitOps ArgoCD Pipelines & Helm Charts",
        amount: 1000,
        status: "completed",
        dueDate: "Dec 24, 2025",
        approvedAt: "Dec 24, 2025",
      },
      {
        id: "m-4",
        title: "Observability Prometheus & OpenTelemetry Stack",
        amount: 1000,
        status: "completed",
        dueDate: "Jan 05, 2026",
        approvedAt: "Jan 05, 2026",
      },
      {
        id: "m-5",
        title: "SOC2 Compliance Verification & Cutover",
        amount: 1000,
        status: "completed",
        dueDate: "Jan 15, 2026",
        approvedAt: "Jan 15, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-edge-2",
        milestoneId: "m-5",
        note: "All 5 enterprise infrastructure milestones complete. Cutover executed with zero downtime. SOC2 compliance audit passes 100%.",
        submittedAt: "Jan 14, 2026",
        files: [
          {
            name: "soc2-compliance-report.pdf",
            size: "12.8 MB",
            type: "pdf",
          },
          {
            name: "terraform-iac-configs.zip",
            size: "45.1 MB",
            type: "zip",
          },
          {
            name: "disaster-recovery-runbook.pdf",
            size: "6.4 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Emergency production scaffolding needed within 24 hours for investor demo presentation.",
    milestones: [
      {
        id: "m-1",
        title: "Express 24-Hour Scaffold Handover",
        amount: 300,
        status: "completed",
        dueDate: "Mar 22, 2026",
        approvedAt: "Mar 22, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-edge-3",
        milestoneId: "m-1",
        note: "Delivered within 18 hours. Clean repository setup with working demo endpoints.",
        submittedAt: "Mar 22, 2026",
        files: [
          {
            name: "express-demo-code.zip",
            size: "8.4 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Nova Dynamics AI",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Stripe Customer Portal integration, prorated subscription upgrades, and idempotency handling for invoice.payment_succeeded webhooks.",
    milestones: [
      {
        id: "m-1",
        title: "Stripe Subscription Logic & Data Schema",
        amount: 240,
        status: "completed",
        dueDate: "Mar 12, 2026",
        approvedAt: "Mar 12, 2026",
      },
      {
        id: "m-2",
        title: "Webhook Idempotency & Customer Portal UI",
        amount: 245,
        status: "in_review",
        dueDate: "Mar 25, 2026",
      },
    ],
    deliveries: [
      {
        id: "del-edge-4-1",
        milestoneId: "m-2",
        note: "Updated webhook retry logic and added exponential backoff.",
        submittedAt: "Mar 23, 2026",
        files: [
          {
            name: "stripe-integration-patch.zip",
            size: "11.2 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [
      {
        id: "rev-edge-4-1",
        requestedAt: "Mar 16, 2026",
        note: "Please add prorated calculation preview for mid-cycle plan downgrades.",
      },
      {
        id: "rev-edge-4-2",
        requestedAt: "Mar 19, 2026",
        note: "Customer portal return URL should redirect back to team billing settings page.",
      },
      {
        id: "rev-edge-4-3",
        requestedAt: "Mar 22, 2026",
        note: "Need idempotency key check to guard against duplicate webhook delivery.",
      },
    ],
  },
  {
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
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Junior Full-Stack Engineer",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      rating: 0,
      level: "LEVEL_1",
    },
    requirements:
      "Initial code repository access provided; awaiting developer kick-off message and preliminary vulnerability scanning.",
    milestones: [
      {
        id: "m-1",
        title: "Repository Setup & Dependency CVE Scan",
        amount: 175,
        status: "pending",
        dueDate: "Mar 26, 2026",
      },
      {
        id: "m-2",
        title: "Remediation Patch Pull Request",
        amount: 175,
        status: "pending",
        dueDate: "Mar 29, 2026",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8000",
    title: "Full-Stack Next.js 15 & Node.js Production Architecture with Clean Code",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-1",
    totalAmount: 250,
    status: "cancelled",
    createdAt: "2026-01-01",
    deliveryDate: "Cancelled",
    role: "CLIENT",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8000-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 125,
        status: "completed",
        dueDate: "Cancelled",
        approvedAt: "2026-01-01T18:00:00Z",
      },
      {
        id: "m-ORD-8000-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 125,
        status: "pending",
        dueDate: "Cancelled",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8001",
    title: "High-Converting SaaS Landing Page in Next.js & Framer Motion",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-2",
    totalAmount: 320,
    status: "completed",
    createdAt: "2026-03-06",
    deliveryDate: "2026-03-10",
    role: "FREELANCER",
    client: {
      id: "usr-client-4",
      name: "Rachel Adams",
      email: "rachel.adams@horizonhealth.ca",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "f-3",
      name: "Marcus Vance",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8001-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 160,
        status: "completed",
        dueDate: "2026-03-10",
        approvedAt: "2026-03-06T18:00:00Z",
      },
      {
        id: "m-ORD-8001-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 160,
        status: "completed",
        dueDate: "2026-03-10",
        approvedAt: "2026-03-06T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8001-1",
        milestoneId: "m-ORD-8001-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-10",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8002",
    title: "Scalable GraphQL & REST Microservices Backend in NestJS and Redis",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-3",
    totalAmount: 620,
    status: "completed",
    createdAt: "2026-02-11",
    deliveryDate: "2026-02-17",
    role: "BOTH",
    client: {
      id: "usr-12",
      name: "Priscilla Mertz",
      email: "priscilla.mertz@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-4",
      name: "Sophia Lindqvist",
      title: "Full-Stack Node.js Specialist",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8002-1",
        title: "Phase 1: Full-Stack Node.js Milestone Deliverables",
        amount: 207,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-11T18:00:00Z",
      },
      {
        id: "m-ORD-8002-2",
        title: "Phase 2: Full-Stack Node.js Milestone Deliverables",
        amount: 207,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-11T18:00:00Z",
      },
      {
        id: "m-ORD-8002-3",
        title: "Phase 3: Full-Stack Node.js Milestone Deliverables",
        amount: 206,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-11T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8002-1",
        milestoneId: "m-ORD-8002-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-17",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8003",
    title: "High-Performance Go (Golang) Microservice Engine with gRPC & RabbitMQ",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-4",
    totalAmount: 720,
    status: "completed",
    createdAt: "2026-01-16",
    deliveryDate: "2026-01-24",
    role: "CLIENT",
    client: {
      id: "usr-15",
      name: "Robin Christiansen",
      email: "robin.christiansen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-overflow",
      name: "Dr. Bartholomew Alexander Montgomery-Fitzgerald III",
      title: "Full-Stack Node.js Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8003-1",
        title: "Phase 1: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-24",
        approvedAt: "2026-01-16T18:00:00Z",
      },
      {
        id: "m-ORD-8003-2",
        title: "Phase 2: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-24",
        approvedAt: "2026-01-16T18:00:00Z",
      },
      {
        id: "m-ORD-8003-3",
        title: "Phase 3: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-24",
        approvedAt: "2026-01-16T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8003-1",
        milestoneId: "m-ORD-8003-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-24",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8004",
    title: "Zero-Downtime AWS ECS & Terraform Infrastructure as Code Setup",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-5",
    totalAmount: 980,
    status: "completed",
    createdAt: "2026-03-21",
    deliveryDate: "2026-03-28",
    role: "FREELANCER",
    client: {
      id: "usr-18",
      name: "Minh Nguyen",
      email: "minh.nguyen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Cloud & DevOps Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8004-1",
        title: "Phase 1: Cloud & DevOps Milestone Deliverables",
        amount: 327,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-21T18:00:00Z",
      },
      {
        id: "m-ORD-8004-2",
        title: "Phase 2: Cloud & DevOps Milestone Deliverables",
        amount: 327,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-21T18:00:00Z",
      },
      {
        id: "m-ORD-8004-3",
        title: "Phase 3: Cloud & DevOps Milestone Deliverables",
        amount: 326,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-21T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8004-1",
        milestoneId: "m-ORD-8004-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-28",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8005",
    title: "Kubernetes Production Cluster Setup with ArgoCD GitOps Pipeline",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-6",
    totalAmount: 450,
    status: "active",
    createdAt: "2026-02-26",
    deliveryDate: "2026-02-28",
    role: "BOTH",
    client: {
      id: "f-1",
      name: "Alexandre Moreau",
      email: "alexandre.moreau@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-fast-response",
      name: "Chloe Nguyen (Minh Chau)",
      title: "Cloud & DevOps Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8005-1",
        title: "Phase 1: Cloud & DevOps Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-26T18:00:00Z",
      },
      {
        id: "m-ORD-8005-2",
        title: "Phase 2: Cloud & DevOps Milestone Deliverables",
        amount: 225,
        status: "in_progress",
        dueDate: "2026-02-28",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8006",
    title: "Audited Solidity Smart Contracts with Formal ERC-20 & ERC-721 Security",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-7",
    totalAmount: 790,
    status: "completed",
    createdAt: "2026-01-04",
    deliveryDate: "2026-01-12",
    role: "CLIENT",
    client: {
      id: "usr-client-3",
      name: "Emily Zhang",
      email: "emily.zhang@nexusventures.sg",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "usr-edge-slow-response",
      name: "Torsten Lindemann",
      title: "Smart Contracts & Web3 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8006-1",
        title: "Phase 1: Smart Contracts & Web3 Milestone Deliverables",
        amount: 263,
        status: "completed",
        dueDate: "2026-01-12",
        approvedAt: "2026-01-04T18:00:00Z",
      },
      {
        id: "m-ORD-8006-2",
        title: "Phase 2: Smart Contracts & Web3 Milestone Deliverables",
        amount: 263,
        status: "completed",
        dueDate: "2026-01-12",
        approvedAt: "2026-01-04T18:00:00Z",
      },
      {
        id: "m-ORD-8006-3",
        title: "Phase 3: Smart Contracts & Web3 Milestone Deliverables",
        amount: 264,
        status: "completed",
        dueDate: "2026-01-12",
        approvedAt: "2026-01-04T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8006-1",
        milestoneId: "m-ORD-8006-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-12",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8007",
    title: "DeFi Staking Protocol & Cross-Chain Bridge Web3 Integration",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-8",
    totalAmount: 950,
    status: "completed",
    createdAt: "2026-03-09",
    deliveryDate: "2026-03-19",
    role: "FREELANCER",
    client: {
      id: "usr-11",
      name: "Gregory Bayer",
      email: "gregory.bayer@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-suspended",
      name: "Sergei Romanov",
      title: "Smart Contracts & Web3 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8007-1",
        title: "Phase 1: Smart Contracts & Web3 Milestone Deliverables",
        amount: 317,
        status: "completed",
        dueDate: "2026-03-19",
        approvedAt: "2026-03-09T18:00:00Z",
      },
      {
        id: "m-ORD-8007-2",
        title: "Phase 2: Smart Contracts & Web3 Milestone Deliverables",
        amount: 317,
        status: "completed",
        dueDate: "2026-03-19",
        approvedAt: "2026-03-09T18:00:00Z",
      },
      {
        id: "m-ORD-8007-3",
        title: "Phase 3: Smart Contracts & Web3 Milestone Deliverables",
        amount: 316,
        status: "completed",
        dueDate: "2026-03-19",
        approvedAt: "2026-03-09T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8007-1",
        milestoneId: "m-ORD-8007-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-19",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8008",
    title: "Cross-Platform React Native & Expo Mobile App with Offline SQLite Sync",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-9",
    totalAmount: 590,
    status: "completed",
    createdAt: "2026-02-14",
    deliveryDate: "2026-02-20",
    role: "BOTH",
    client: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      email: "sandra.zieme-luettgen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-11",
      name: "Gregory Bayer",
      title: "Mobile App Development Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8008-1",
        title: "Phase 1: Mobile App Development Milestone Deliverables",
        amount: 295,
        status: "completed",
        dueDate: "2026-02-20",
        approvedAt: "2026-02-14T18:00:00Z",
      },
      {
        id: "m-ORD-8008-2",
        title: "Phase 2: Mobile App Development Milestone Deliverables",
        amount: 295,
        status: "completed",
        dueDate: "2026-02-20",
        approvedAt: "2026-02-14T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8008-1",
        milestoneId: "m-ORD-8008-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-20",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8009",
    title: "Native iOS Swift 6 & SwiftUI Application with Biometric Authentication",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-10",
    totalAmount: 1190,
    status: "completed",
    createdAt: "2026-01-19",
    deliveryDate: "2026-01-28",
    role: "CLIENT",
    client: {
      id: "usr-17",
      name: "Katrina Stehr",
      email: "katrina.stehr@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      title: "Mobile App Development Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8009-1",
        title: "Phase 1: Mobile App Development Milestone Deliverables",
        amount: 397,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-19T18:00:00Z",
      },
      {
        id: "m-ORD-8009-2",
        title: "Phase 2: Mobile App Development Milestone Deliverables",
        amount: 397,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-19T18:00:00Z",
      },
      {
        id: "m-ORD-8009-3",
        title: "Phase 3: Mobile App Development Milestone Deliverables",
        amount: 396,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-19T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8009-1",
        milestoneId: "m-ORD-8009-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-28",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8010",
    title: "High-Performance Flutter Mobile App with BLoC Pattern Architecture",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-11",
    totalAmount: 280,
    status: "delivered",
    createdAt: "2026-03-24",
    deliveryDate: "2026-03-26",
    role: "FREELANCER",
    client: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      email: "mitchell.ankunding@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-13",
      name: "River Johns",
      title: "Mobile App Development Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8010-1",
        title: "Phase 1: Mobile App Development Milestone Deliverables",
        amount: 140,
        status: "completed",
        dueDate: "2026-03-26",
        approvedAt: "2026-03-24T18:00:00Z",
      },
      {
        id: "m-ORD-8010-2",
        title: "Phase 2: Mobile App Development Milestone Deliverables",
        amount: 140,
        status: "in_review",
        dueDate: "2026-03-26",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8010-1",
        milestoneId: "m-ORD-8010-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-26",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8011",
    title: "Next.js 15 E-Commerce Platform with Stripe Checkout & Webhook Pipeline",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-12",
    totalAmount: 490,
    status: "completed",
    createdAt: "2026-02-02",
    deliveryDate: "2026-02-07",
    role: "BOTH",
    client: {
      id: "usr-client-2",
      name: "David Sterling",
      email: "david.sterling@apexcap.com",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8011-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 245,
        status: "completed",
        dueDate: "2026-02-07",
        approvedAt: "2026-02-02T18:00:00Z",
      },
      {
        id: "m-ORD-8011-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 245,
        status: "completed",
        dueDate: "2026-02-07",
        approvedAt: "2026-02-02T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8011-1",
        milestoneId: "m-ORD-8011-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-07",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8012",
    title: "Serverless Cloudflare Workers & D1 Edge API with Global Sub-50ms Latency",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-13",
    totalAmount: 390,
    status: "completed",
    createdAt: "2026-01-07",
    deliveryDate: "2026-01-11",
    role: "CLIENT",
    client: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      email: "liam.oconnor@novadynamics.ie",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nova Dynamics AI",
    },
    freelancer: {
      id: "usr-15",
      name: "Robin Christiansen",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8012-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 195,
        status: "completed",
        dueDate: "2026-01-11",
        approvedAt: "2026-01-07T18:00:00Z",
      },
      {
        id: "m-ORD-8012-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 195,
        status: "completed",
        dueDate: "2026-01-11",
        approvedAt: "2026-01-07T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8012-1",
        milestoneId: "m-ORD-8012-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-11",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8013",
    title: "Real-Time WebSocket & Socket.io Collaborative Canvas Engine",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-14",
    totalAmount: 480,
    status: "completed",
    createdAt: "2026-03-12",
    deliveryDate: "2026-03-17",
    role: "FREELANCER",
    client: {
      id: "usr-13",
      name: "River Johns",
      email: "river.johns@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-16",
      name: "David Herzog",
      title: "Full-Stack Node.js Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8013-1",
        title: "Phase 1: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-03-17",
        approvedAt: "2026-03-12T18:00:00Z",
      },
      {
        id: "m-ORD-8013-2",
        title: "Phase 2: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-03-17",
        approvedAt: "2026-03-12T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8013-1",
        milestoneId: "m-ORD-8013-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-17",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8014",
    title: "Scalable Figma Design System with Design Tokens, Auto-Layout & Variables",
    category: "UI/UX & Product Design",
    tier: "PREMIUM",
    gigId: "gig-15",
    totalAmount: 920,
    status: "completed",
    createdAt: "2026-02-17",
    deliveryDate: "2026-02-28",
    role: "BOTH",
    client: {
      id: "usr-16",
      name: "David Herzog",
      email: "david.herzog@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-17",
      name: "Katrina Stehr",
      title: "Design Systems & Figma Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8014-1",
        title: "Phase 1: Design Systems & Figma Milestone Deliverables",
        amount: 307,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-17T18:00:00Z",
      },
      {
        id: "m-ORD-8014-2",
        title: "Phase 2: Design Systems & Figma Milestone Deliverables",
        amount: 307,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-17T18:00:00Z",
      },
      {
        id: "m-ORD-8014-3",
        title: "Phase 3: Design Systems & Figma Milestone Deliverables",
        amount: 306,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-17T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8014-1",
        milestoneId: "m-ORD-8014-3",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-02-28",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8015",
    title: "Complex B2B SaaS Dashboard UI/UX Design with Dark Mode & Mobile Flows",
    category: "UI/UX & Product Design",
    tier: "BASIC",
    gigId: "gig-16",
    totalAmount: 320,
    status: "active",
    createdAt: "2026-01-22",
    deliveryDate: "2026-01-25",
    role: "CLIENT",
    client: {
      id: "usr-19",
      name: "Sherwood Barrows",
      email: "sherwood.barrows@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-18",
      name: "Minh Nguyen",
      title: "SaaS Application UX Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8015-1",
        title: "Phase 1: SaaS Application UX Milestone Deliverables",
        amount: 160,
        status: "completed",
        dueDate: "2026-01-25",
        approvedAt: "2026-01-22T18:00:00Z",
      },
      {
        id: "m-ORD-8015-2",
        title: "Phase 2: SaaS Application UX Milestone Deliverables",
        amount: 160,
        status: "in_progress",
        dueDate: "2026-01-25",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8016",
    title: "FinTech Banking & Payment Mobile App UI/UX with High-Fidelity Prototype",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-17",
    totalAmount: 640,
    status: "completed",
    createdAt: "2026-03-27",
    deliveryDate: "2026-03-28",
    role: "FREELANCER",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      title: "SaaS Application UX Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8016-1",
        title: "Phase 1: SaaS Application UX Milestone Deliverables",
        amount: 213,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-27T18:00:00Z",
      },
      {
        id: "m-ORD-8016-2",
        title: "Phase 2: SaaS Application UX Milestone Deliverables",
        amount: 213,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-27T18:00:00Z",
      },
      {
        id: "m-ORD-8016-3",
        title: "Phase 3: SaaS Application UX Milestone Deliverables",
        amount: 214,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-27T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8016-1",
        milestoneId: "m-ORD-8016-3",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-03-28",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8017",
    title: "Accessible WCAG 2.1 AA Compliant Web Application UI Kit in Figma",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-18",
    totalAmount: 460,
    status: "completed",
    createdAt: "2026-02-05",
    deliveryDate: "2026-02-10",
    role: "BOTH",
    client: {
      id: "usr-client-4",
      name: "Rachel Adams",
      email: "rachel.adams@horizonhealth.ca",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      title: "Design Systems & Figma Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8017-1",
        title: "Phase 1: Design Systems & Figma Milestone Deliverables",
        amount: 230,
        status: "completed",
        dueDate: "2026-02-10",
        approvedAt: "2026-02-05T18:00:00Z",
      },
      {
        id: "m-ORD-8017-2",
        title: "Phase 2: Design Systems & Figma Milestone Deliverables",
        amount: 230,
        status: "completed",
        dueDate: "2026-02-10",
        approvedAt: "2026-02-05T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8017-1",
        milestoneId: "m-ORD-8017-2",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-02-10",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8018",
    title: "E-Commerce User Journey Mapping & Checkout Flow Conversion Redesign",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-19",
    totalAmount: 480,
    status: "completed",
    createdAt: "2026-01-10",
    deliveryDate: "2026-01-15",
    role: "CLIENT",
    client: {
      id: "usr-12",
      name: "Priscilla Mertz",
      email: "priscilla.mertz@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-21",
      name: "Hattie Heidenreich",
      title: "SaaS Application UX Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8018-1",
        title: "Phase 1: SaaS Application UX Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-15",
        approvedAt: "2026-01-10T18:00:00Z",
      },
      {
        id: "m-ORD-8018-2",
        title: "Phase 2: SaaS Application UX Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-15",
        approvedAt: "2026-01-10T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8018-1",
        milestoneId: "m-ORD-8018-2",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-01-15",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8019",
    title: "Minimalist Modern Tech Logo & Vector Brand Identity System",
    category: "UI/UX & Product Design",
    tier: "PREMIUM",
    gigId: "gig-20",
    totalAmount: 650,
    status: "completed",
    createdAt: "2026-03-15",
    deliveryDate: "2026-03-23",
    role: "FREELANCER",
    client: {
      id: "usr-15",
      name: "Robin Christiansen",
      email: "robin.christiansen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-22",
      name: "Gerard Wiegand",
      title: "Logo & Brand Identity Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8019-1",
        title: "Phase 1: Logo & Brand Identity Milestone Deliverables",
        amount: 217,
        status: "completed",
        dueDate: "2026-03-23",
        approvedAt: "2026-03-15T18:00:00Z",
      },
      {
        id: "m-ORD-8019-2",
        title: "Phase 2: Logo & Brand Identity Milestone Deliverables",
        amount: 217,
        status: "completed",
        dueDate: "2026-03-23",
        approvedAt: "2026-03-15T18:00:00Z",
      },
      {
        id: "m-ORD-8019-3",
        title: "Phase 3: Logo & Brand Identity Milestone Deliverables",
        amount: 216,
        status: "completed",
        dueDate: "2026-03-23",
        approvedAt: "2026-03-15T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8019-1",
        milestoneId: "m-ORD-8019-3",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-03-23",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8020",
    title: "Complete Startup Brand Book, Custom Typography Guidelines & Pitch Deck",
    category: "UI/UX & Product Design",
    tier: "BASIC",
    gigId: "gig-21",
    totalAmount: 290,
    status: "cancelled",
    createdAt: "2026-02-20",
    deliveryDate: "Cancelled",
    role: "BOTH",
    client: {
      id: "usr-18",
      name: "Minh Nguyen",
      email: "minh.nguyen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-23",
      name: "Jules Wuckert",
      title: "Logo & Brand Identity Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8020-1",
        title: "Phase 1: Logo & Brand Identity Milestone Deliverables",
        amount: 145,
        status: "completed",
        dueDate: "Cancelled",
        approvedAt: "2026-02-20T18:00:00Z",
      },
      {
        id: "m-ORD-8020-2",
        title: "Phase 2: Logo & Brand Identity Milestone Deliverables",
        amount: 145,
        status: "pending",
        dueDate: "Cancelled",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8021",
    title: "Custom 3D Brand Asset Pack & Vector Iconography Set for Web & Mobile",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-22",
    totalAmount: 420,
    status: "completed",
    createdAt: "2026-01-25",
    deliveryDate: "2026-01-28",
    role: "CLIENT",
    client: {
      id: "f-1",
      name: "Alexandre Moreau",
      email: "alexandre.moreau@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-24",
      name: "Luz Champlin",
      title: "Logo & Brand Identity Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8021-1",
        title: "Phase 1: Logo & Brand Identity Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-25T18:00:00Z",
      },
      {
        id: "m-ORD-8021-2",
        title: "Phase 2: Logo & Brand Identity Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-25T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8021-1",
        milestoneId: "m-ORD-8021-2",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-01-28",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8022",
    title: "Photorealistic 3D Product Commercial Render & Animation in Cinema4D",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-23",
    totalAmount: 710,
    status: "completed",
    createdAt: "2026-03-03",
    deliveryDate: "2026-03-10",
    role: "FREELANCER",
    client: {
      id: "usr-client-3",
      name: "Emily Zhang",
      email: "emily.zhang@nexusventures.sg",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "usr-25",
      name: "Brandi Hegmann",
      title: "Video & 3D Animation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8022-1",
        title: "Phase 1: Video & 3D Animation Milestone Deliverables",
        amount: 237,
        status: "completed",
        dueDate: "2026-03-10",
        approvedAt: "2026-03-03T18:00:00Z",
      },
      {
        id: "m-ORD-8022-2",
        title: "Phase 2: Video & 3D Animation Milestone Deliverables",
        amount: 237,
        status: "completed",
        dueDate: "2026-03-10",
        approvedAt: "2026-03-03T18:00:00Z",
      },
      {
        id: "m-ORD-8022-3",
        title: "Phase 3: Video & 3D Animation Milestone Deliverables",
        amount: 236,
        status: "completed",
        dueDate: "2026-03-10",
        approvedAt: "2026-03-03T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8022-1",
        milestoneId: "m-ORD-8022-3",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-03-10",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8023",
    title: "Interactive Three.js & WebGL 3D Experience for Modern Tech Marketing Sites",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-24",
    totalAmount: 820,
    status: "completed",
    createdAt: "2026-02-08",
    deliveryDate: "2026-02-17",
    role: "BOTH",
    client: {
      id: "usr-11",
      name: "Gregory Bayer",
      email: "gregory.bayer@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-26",
      name: "Mai Tran",
      title: "Video & 3D Animation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8023-1",
        title: "Phase 1: Video & 3D Animation Milestone Deliverables",
        amount: 273,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-08T18:00:00Z",
      },
      {
        id: "m-ORD-8023-2",
        title: "Phase 2: Video & 3D Animation Milestone Deliverables",
        amount: 273,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-08T18:00:00Z",
      },
      {
        id: "m-ORD-8023-3",
        title: "Phase 3: Video & 3D Animation Milestone Deliverables",
        amount: 274,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-08T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8023-1",
        milestoneId: "m-ORD-8023-3",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-02-17",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8024",
    title: "Autonomous AI Agent Workflow Architecture with LangChain, Tools & Memory",
    category: "AI & Automation",
    tier: "PREMIUM",
    gigId: "gig-25",
    totalAmount: 1250,
    status: "completed",
    createdAt: "2026-01-13",
    deliveryDate: "2026-01-28",
    role: "CLIENT",
    client: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      email: "sandra.zieme-luettgen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-27",
      name: "Marcelino Bauch",
      title: "Autonomous AI Agents Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8024-1",
        title: "Phase 1: Autonomous AI Agents Milestone Deliverables",
        amount: 417,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-13T18:00:00Z",
      },
      {
        id: "m-ORD-8024-2",
        title: "Phase 2: Autonomous AI Agents Milestone Deliverables",
        amount: 417,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-13T18:00:00Z",
      },
      {
        id: "m-ORD-8024-3",
        title: "Phase 3: Autonomous AI Agents Milestone Deliverables",
        amount: 416,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-13T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8024-1",
        milestoneId: "m-ORD-8024-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-01-28",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8025",
    title: "Enterprise RAG Knowledge System with Vector Database & Citation Metadata",
    category: "AI & Automation",
    tier: "BASIC",
    gigId: "gig-26",
    totalAmount: 420,
    status: "active",
    createdAt: "2026-03-18",
    deliveryDate: "2026-03-22",
    role: "FREELANCER",
    client: {
      id: "usr-17",
      name: "Katrina Stehr",
      email: "katrina.stehr@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-28",
      name: "Catalina Koelpin",
      title: "LLM Fine-Tuning & RAG Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8025-1",
        title: "Phase 1: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-03-22",
        approvedAt: "2026-03-18T18:00:00Z",
      },
      {
        id: "m-ORD-8025-2",
        title: "Phase 2: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 210,
        status: "in_progress",
        dueDate: "2026-03-22",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8026",
    title: "Custom LLM Fine-Tuning Pipeline with LoRA / QLoRA on Llama 3 & Mistral",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-27",
    totalAmount: 890,
    status: "completed",
    createdAt: "2026-02-23",
    deliveryDate: "2026-02-28",
    role: "BOTH",
    client: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      email: "mitchell.ankunding@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-29",
      name: "Karianne Schmidt",
      title: "LLM Fine-Tuning & RAG Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8026-1",
        title: "Phase 1: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 297,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-23T18:00:00Z",
      },
      {
        id: "m-ORD-8026-2",
        title: "Phase 2: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 297,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-23T18:00:00Z",
      },
      {
        id: "m-ORD-8026-3",
        title: "Phase 3: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 296,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-23T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8026-1",
        milestoneId: "m-ORD-8026-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-02-28",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8027",
    title: "Multi-Agent Simulation & Decision Engine using CrewAI & AutoGen",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-28",
    totalAmount: 720,
    status: "completed",
    createdAt: "2026-01-01",
    deliveryDate: "2026-01-09",
    role: "CLIENT",
    client: {
      id: "usr-client-2",
      name: "David Sterling",
      email: "david.sterling@apexcap.com",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "usr-30",
      name: "Shawn Gorczany",
      title: "Autonomous AI Agents Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8027-1",
        title: "Phase 1: Autonomous AI Agents Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-09",
        approvedAt: "2026-01-01T18:00:00Z",
      },
      {
        id: "m-ORD-8027-2",
        title: "Phase 2: Autonomous AI Agents Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-09",
        approvedAt: "2026-01-01T18:00:00Z",
      },
      {
        id: "m-ORD-8027-3",
        title: "Phase 3: Autonomous AI Agents Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-01-09",
        approvedAt: "2026-01-01T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8027-1",
        milestoneId: "m-ORD-8027-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-01-09",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8028",
    title: "Real-Time Computer Vision Pipeline for Object Detection & Defect Tracking",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-29",
    totalAmount: 670,
    status: "completed",
    createdAt: "2026-03-06",
    deliveryDate: "2026-03-13",
    role: "FREELANCER",
    client: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      email: "liam.oconnor@novadynamics.ie",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nova Dynamics AI",
    },
    freelancer: {
      id: "usr-31",
      name: "Columbus Kuhic",
      title: "Computer Vision & ML Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8028-1",
        title: "Phase 1: Computer Vision & ML Milestone Deliverables",
        amount: 223,
        status: "completed",
        dueDate: "2026-03-13",
        approvedAt: "2026-03-06T18:00:00Z",
      },
      {
        id: "m-ORD-8028-2",
        title: "Phase 2: Computer Vision & ML Milestone Deliverables",
        amount: 223,
        status: "completed",
        dueDate: "2026-03-13",
        approvedAt: "2026-03-06T18:00:00Z",
      },
      {
        id: "m-ORD-8028-3",
        title: "Phase 3: Computer Vision & ML Milestone Deliverables",
        amount: 224,
        status: "completed",
        dueDate: "2026-03-13",
        approvedAt: "2026-03-06T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8028-1",
        milestoneId: "m-ORD-8028-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-03-13",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8029",
    title: "Low-Latency Speech-to-Text & Audio Transcription Pipeline with Whisper AI",
    category: "AI & Automation",
    tier: "PREMIUM",
    gigId: "gig-30",
    totalAmount: 890,
    status: "completed",
    createdAt: "2026-02-11",
    deliveryDate: "2026-02-22",
    role: "BOTH",
    client: {
      id: "usr-13",
      name: "River Johns",
      email: "river.johns@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-32",
      name: "Ibrahim Fritsch",
      title: "Computer Vision & ML Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8029-1",
        title: "Phase 1: Computer Vision & ML Milestone Deliverables",
        amount: 297,
        status: "completed",
        dueDate: "2026-02-22",
        approvedAt: "2026-02-11T18:00:00Z",
      },
      {
        id: "m-ORD-8029-2",
        title: "Phase 2: Computer Vision & ML Milestone Deliverables",
        amount: 297,
        status: "completed",
        dueDate: "2026-02-22",
        approvedAt: "2026-02-11T18:00:00Z",
      },
      {
        id: "m-ORD-8029-3",
        title: "Phase 3: Computer Vision & ML Milestone Deliverables",
        amount: 296,
        status: "completed",
        dueDate: "2026-02-22",
        approvedAt: "2026-02-11T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8029-1",
        milestoneId: "m-ORD-8029-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-02-22",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8030",
    title: "AI Customer Support Agent with Zendesk API & Sentiment Intent Routing",
    category: "AI & Automation",
    tier: "BASIC",
    gigId: "gig-31",
    totalAmount: 310,
    status: "delivered",
    createdAt: "2026-01-16",
    deliveryDate: "2026-01-19",
    role: "CLIENT",
    client: {
      id: "usr-16",
      name: "David Herzog",
      email: "david.herzog@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-33",
      name: "Kasey King",
      title: "Autonomous AI Agents Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8030-1",
        title: "Phase 1: Autonomous AI Agents Milestone Deliverables",
        amount: 155,
        status: "completed",
        dueDate: "2026-01-19",
        approvedAt: "2026-01-16T18:00:00Z",
      },
      {
        id: "m-ORD-8030-2",
        title: "Phase 2: Autonomous AI Agents Milestone Deliverables",
        amount: 155,
        status: "in_review",
        dueDate: "2026-01-19",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8030-1",
        milestoneId: "m-ORD-8030-2",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-01-19",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8031",
    title: "Enterprise Semantic Search Engine over Large PDF & Markdown Repositories",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-32",
    totalAmount: 610,
    status: "completed",
    createdAt: "2026-03-21",
    deliveryDate: "2026-03-27",
    role: "FREELANCER",
    client: {
      id: "usr-19",
      name: "Sherwood Barrows",
      email: "sherwood.barrows@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-34",
      name: "Hoang Le",
      title: "LLM Fine-Tuning & RAG Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8031-1",
        title: "Phase 1: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 203,
        status: "completed",
        dueDate: "2026-03-27",
        approvedAt: "2026-03-21T18:00:00Z",
      },
      {
        id: "m-ORD-8031-2",
        title: "Phase 2: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 203,
        status: "completed",
        dueDate: "2026-03-27",
        approvedAt: "2026-03-21T18:00:00Z",
      },
      {
        id: "m-ORD-8031-3",
        title: "Phase 3: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 204,
        status: "completed",
        dueDate: "2026-03-27",
        approvedAt: "2026-03-21T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8031-1",
        milestoneId: "m-ORD-8031-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-03-27",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8032",
    title: "Automated Data Extraction & PDF OCR Pipeline using Multimodal Vision LLMs",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-33",
    totalAmount: 490,
    status: "completed",
    createdAt: "2026-02-26",
    deliveryDate: "2026-02-28",
    role: "BOTH",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "usr-35",
      name: "Domenico Hand",
      title: "Autonomous AI Agents Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8032-1",
        title: "Phase 1: Autonomous AI Agents Milestone Deliverables",
        amount: 245,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-26T18:00:00Z",
      },
      {
        id: "m-ORD-8032-2",
        title: "Phase 2: Autonomous AI Agents Milestone Deliverables",
        amount: 245,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-26T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8032-1",
        milestoneId: "m-ORD-8032-2",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-02-28",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8033",
    title: "Code Review & Security Vulnerability Detection AI Assistant for GitHub",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-34",
    totalAmount: 630,
    status: "completed",
    createdAt: "2026-01-04",
    deliveryDate: "2026-01-11",
    role: "CLIENT",
    client: {
      id: "usr-client-4",
      name: "Rachel Adams",
      email: "rachel.adams@horizonhealth.ca",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "usr-36",
      name: "Belle Parisian",
      title: "LLM Fine-Tuning & RAG Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8033-1",
        title: "Phase 1: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-01-11",
        approvedAt: "2026-01-04T18:00:00Z",
      },
      {
        id: "m-ORD-8033-2",
        title: "Phase 2: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-01-11",
        approvedAt: "2026-01-04T18:00:00Z",
      },
      {
        id: "m-ORD-8033-3",
        title: "Phase 3: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-01-11",
        approvedAt: "2026-01-04T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8033-1",
        milestoneId: "m-ORD-8033-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-01-11",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8034",
    title: "Autonomous Web Scraping & Synthetic Training Dataset Generation Pipeline",
    category: "AI & Automation",
    tier: "PREMIUM",
    gigId: "gig-35",
    totalAmount: 940,
    status: "completed",
    createdAt: "2026-03-09",
    deliveryDate: "2026-03-20",
    role: "FREELANCER",
    client: {
      id: "usr-12",
      name: "Priscilla Mertz",
      email: "priscilla.mertz@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-37",
      name: "Bernie Rodriguez",
      title: "Autonomous AI Agents Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8034-1",
        title: "Phase 1: Autonomous AI Agents Milestone Deliverables",
        amount: 313,
        status: "completed",
        dueDate: "2026-03-20",
        approvedAt: "2026-03-09T18:00:00Z",
      },
      {
        id: "m-ORD-8034-2",
        title: "Phase 2: Autonomous AI Agents Milestone Deliverables",
        amount: 313,
        status: "completed",
        dueDate: "2026-03-20",
        approvedAt: "2026-03-09T18:00:00Z",
      },
      {
        id: "m-ORD-8034-3",
        title: "Phase 3: Autonomous AI Agents Milestone Deliverables",
        amount: 314,
        status: "completed",
        dueDate: "2026-03-20",
        approvedAt: "2026-03-09T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8034-1",
        milestoneId: "m-ORD-8034-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-03-20",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8035",
    title: "Programmatic SEO Architecture with Next.js ISR for 50,000+ Indexed Pages",
    category: "Technical SEO & Growth",
    tier: "BASIC",
    gigId: "gig-36",
    totalAmount: 290,
    status: "active",
    createdAt: "2026-02-14",
    deliveryDate: "2026-02-16",
    role: "BOTH",
    client: {
      id: "usr-15",
      name: "Robin Christiansen",
      email: "robin.christiansen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-38",
      name: "Eleonore Marks",
      title: "Programmatic SEO Architecture Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8035-1",
        title: "Phase 1: Programmatic SEO Architecture Milestone Deliverables",
        amount: 145,
        status: "completed",
        dueDate: "2026-02-16",
        approvedAt: "2026-02-14T18:00:00Z",
      },
      {
        id: "m-ORD-8035-2",
        title: "Phase 2: Programmatic SEO Architecture Milestone Deliverables",
        amount: 145,
        status: "in_progress",
        dueDate: "2026-02-16",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8036",
    title: "SaaS Conversion Rate Optimization (CRO) Audit & Multi-Variant Growth Plan",
    category: "Technical SEO & Growth",
    tier: "STANDARD",
    gigId: "gig-37",
    totalAmount: 410,
    status: "completed",
    createdAt: "2026-01-19",
    deliveryDate: "2026-01-23",
    role: "CLIENT",
    client: {
      id: "usr-18",
      name: "Minh Nguyen",
      email: "minh.nguyen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-39",
      name: "Loy Cremin",
      title: "Conversion Rate Optimization Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8036-1",
        title: "Phase 1: Conversion Rate Optimization Milestone Deliverables",
        amount: 205,
        status: "completed",
        dueDate: "2026-01-23",
        approvedAt: "2026-01-19T18:00:00Z",
      },
      {
        id: "m-ORD-8036-2",
        title: "Phase 2: Conversion Rate Optimization Milestone Deliverables",
        amount: 205,
        status: "completed",
        dueDate: "2026-01-23",
        approvedAt: "2026-01-19T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8036-1",
        milestoneId: "m-ORD-8036-2",
        note: "Completed Core Web Vitals optimization report, indexing strategy, and technical SEO schema audit.",
        submittedAt: "2026-01-23",
        files: [
          {
            name: "core-web-vitals-audit.pdf",
            size: "5.1 MB",
            type: "pdf",
          },
          {
            name: "structured-data-schemas.zip",
            size: "1.8 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8037",
    title: "Full-Funnel Multi-Touch Attribution & Google Analytics 4 Server-Side Setup",
    category: "Technical SEO & Growth",
    tier: "STANDARD",
    gigId: "gig-38",
    totalAmount: 490,
    status: "completed",
    createdAt: "2026-03-24",
    deliveryDate: "2026-03-28",
    role: "FREELANCER",
    client: {
      id: "f-1",
      name: "Alexandre Moreau",
      email: "alexandre.moreau@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-40",
      name: "Chanelle Treutel",
      title: "Attribution & Analytics Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8037-1",
        title: "Phase 1: Attribution & Analytics Milestone Deliverables",
        amount: 245,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-24T18:00:00Z",
      },
      {
        id: "m-ORD-8037-2",
        title: "Phase 2: Attribution & Analytics Milestone Deliverables",
        amount: 245,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-24T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8037-1",
        milestoneId: "m-ORD-8037-2",
        note: "Completed Core Web Vitals optimization report, indexing strategy, and technical SEO schema audit.",
        submittedAt: "2026-03-28",
        files: [
          {
            name: "core-web-vitals-audit.pdf",
            size: "5.1 MB",
            type: "pdf",
          },
          {
            name: "structured-data-schemas.zip",
            size: "1.8 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8038",
    title: "Core Web Vitals & Technical Speed Audit for 100 Mobile Lighthouse Score",
    category: "Technical SEO & Growth",
    tier: "STANDARD",
    gigId: "gig-39",
    totalAmount: 350,
    status: "completed",
    createdAt: "2026-02-02",
    deliveryDate: "2026-02-06",
    role: "BOTH",
    client: {
      id: "usr-client-3",
      name: "Emily Zhang",
      email: "emily.zhang@nexusventures.sg",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "usr-41",
      name: "Hope Jacobi",
      title: "Programmatic SEO Architecture Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8038-1",
        title: "Phase 1: Programmatic SEO Architecture Milestone Deliverables",
        amount: 175,
        status: "completed",
        dueDate: "2026-02-06",
        approvedAt: "2026-02-02T18:00:00Z",
      },
      {
        id: "m-ORD-8038-2",
        title: "Phase 2: Programmatic SEO Architecture Milestone Deliverables",
        amount: 175,
        status: "completed",
        dueDate: "2026-02-06",
        approvedAt: "2026-02-02T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8038-1",
        milestoneId: "m-ORD-8038-2",
        note: "Completed Core Web Vitals optimization report, indexing strategy, and technical SEO schema audit.",
        submittedAt: "2026-02-06",
        files: [
          {
            name: "core-web-vitals-audit.pdf",
            size: "5.1 MB",
            type: "pdf",
          },
          {
            name: "structured-data-schemas.zip",
            size: "1.8 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8039",
    title: "B2B SaaS Cold Outbound Email Infrastructure & Deliverability Warmup Setup",
    category: "Technical SEO & Growth",
    tier: "PREMIUM",
    gigId: "gig-40",
    totalAmount: 770,
    status: "completed",
    createdAt: "2026-01-07",
    deliveryDate: "2026-01-16",
    role: "CLIENT",
    client: {
      id: "usr-11",
      name: "Gregory Bayer",
      email: "gregory.bayer@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Conversion Rate Optimization Specialist",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8039-1",
        title: "Phase 1: Conversion Rate Optimization Milestone Deliverables",
        amount: 257,
        status: "completed",
        dueDate: "2026-01-16",
        approvedAt: "2026-01-07T18:00:00Z",
      },
      {
        id: "m-ORD-8039-2",
        title: "Phase 2: Conversion Rate Optimization Milestone Deliverables",
        amount: 257,
        status: "completed",
        dueDate: "2026-01-16",
        approvedAt: "2026-01-07T18:00:00Z",
      },
      {
        id: "m-ORD-8039-3",
        title: "Phase 3: Conversion Rate Optimization Milestone Deliverables",
        amount: 256,
        status: "completed",
        dueDate: "2026-01-16",
        approvedAt: "2026-01-07T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8039-1",
        milestoneId: "m-ORD-8039-3",
        note: "Completed Core Web Vitals optimization report, indexing strategy, and technical SEO schema audit.",
        submittedAt: "2026-01-16",
        files: [
          {
            name: "core-web-vitals-audit.pdf",
            size: "5.1 MB",
            type: "pdf",
          },
          {
            name: "structured-data-schemas.zip",
            size: "1.8 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8040",
    title: "Mixpanel & PostHog Event Taxonomy Architecture for Product Analytics",
    category: "Technical SEO & Growth",
    tier: "BASIC",
    gigId: "gig-41",
    totalAmount: 270,
    status: "cancelled",
    createdAt: "2026-03-12",
    deliveryDate: "Cancelled",
    role: "FREELANCER",
    client: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      email: "sandra.zieme-luettgen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-2",
      name: "Helena Rostova",
      title: "Attribution & Analytics Specialist",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8040-1",
        title: "Phase 1: Attribution & Analytics Milestone Deliverables",
        amount: 135,
        status: "completed",
        dueDate: "Cancelled",
        approvedAt: "2026-03-12T18:00:00Z",
      },
      {
        id: "m-ORD-8040-2",
        title: "Phase 2: Attribution & Analytics Milestone Deliverables",
        amount: 135,
        status: "pending",
        dueDate: "Cancelled",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8041",
    title: "International Multi-Region Hreflang & Subfolder SEO Localization Engine",
    category: "Technical SEO & Growth",
    tier: "STANDARD",
    gigId: "gig-42",
    totalAmount: 450,
    status: "completed",
    createdAt: "2026-02-17",
    deliveryDate: "2026-02-22",
    role: "BOTH",
    client: {
      id: "usr-17",
      name: "Katrina Stehr",
      email: "katrina.stehr@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-3",
      name: "Marcus Vance",
      title: "Programmatic SEO Architecture Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8041-1",
        title: "Phase 1: Programmatic SEO Architecture Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-02-22",
        approvedAt: "2026-02-17T18:00:00Z",
      },
      {
        id: "m-ORD-8041-2",
        title: "Phase 2: Programmatic SEO Architecture Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-02-22",
        approvedAt: "2026-02-17T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8041-1",
        milestoneId: "m-ORD-8041-2",
        note: "Completed Core Web Vitals optimization report, indexing strategy, and technical SEO schema audit.",
        submittedAt: "2026-02-22",
        files: [
          {
            name: "core-web-vitals-audit.pdf",
            size: "5.1 MB",
            type: "pdf",
          },
          {
            name: "structured-data-schemas.zip",
            size: "1.8 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8042",
    title: "Comprehensive OpenAPI 3.1 & Interactive Mintlify Developer Documentation",
    category: "Technical Writing",
    tier: "STANDARD",
    gigId: "gig-43",
    totalAmount: 340,
    status: "completed",
    createdAt: "2026-01-22",
    deliveryDate: "2026-01-26",
    role: "CLIENT",
    client: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      email: "mitchell.ankunding@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-4",
      name: "Sophia Lindqvist",
      title: "API & Developer Documentation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8042-1",
        title: "Phase 1: API & Developer Documentation Milestone Deliverables",
        amount: 170,
        status: "completed",
        dueDate: "2026-01-26",
        approvedAt: "2026-01-22T18:00:00Z",
      },
      {
        id: "m-ORD-8042-2",
        title: "Phase 2: API & Developer Documentation Milestone Deliverables",
        amount: 170,
        status: "completed",
        dueDate: "2026-01-26",
        approvedAt: "2026-01-22T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8042-1",
        milestoneId: "m-ORD-8042-2",
        note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
        submittedAt: "2026-01-26",
        files: [
          {
            name: "system-whitepaper.pdf",
            size: "3.9 MB",
            type: "pdf",
          },
          {
            name: "developer-guide.pdf",
            size: "2.7 MB",
            type: "pdf",
          },
          {
            name: "openapi-spec.zip",
            size: "850 KB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8043",
    title: "FinTech, AI & Web3 Architecture Whitepaper with Formal Mathematical Proofs",
    category: "Technical Writing",
    tier: "STANDARD",
    gigId: "gig-44",
    totalAmount: 780,
    status: "completed",
    createdAt: "2026-03-27",
    deliveryDate: "2026-03-28",
    role: "FREELANCER",
    client: {
      id: "usr-client-2",
      name: "David Sterling",
      email: "david.sterling@apexcap.com",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "usr-edge-overflow",
      name: "Dr. Bartholomew Alexander Montgomery-Fitzgerald III",
      title: "Fintech & Web3 Whitepapers Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8043-1",
        title: "Phase 1: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 260,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-27T18:00:00Z",
      },
      {
        id: "m-ORD-8043-2",
        title: "Phase 2: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 260,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-27T18:00:00Z",
      },
      {
        id: "m-ORD-8043-3",
        title: "Phase 3: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 260,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-27T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8043-1",
        milestoneId: "m-ORD-8043-3",
        note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
        submittedAt: "2026-03-28",
        files: [
          {
            name: "system-whitepaper.pdf",
            size: "3.9 MB",
            type: "pdf",
          },
          {
            name: "developer-guide.pdf",
            size: "2.7 MB",
            type: "pdf",
          },
          {
            name: "openapi-spec.zip",
            size: "850 KB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8044",
    title: "Developer SDK Quickstart Guides, Code Snippets & Postman Public Workspace",
    category: "Technical Writing",
    tier: "PREMIUM",
    gigId: "gig-45",
    totalAmount: 560,
    status: "completed",
    createdAt: "2026-02-05",
    deliveryDate: "2026-02-12",
    role: "BOTH",
    client: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      email: "liam.oconnor@novadynamics.ie",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nova Dynamics AI",
    },
    freelancer: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "API & Developer Documentation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8044-1",
        title: "Phase 1: API & Developer Documentation Milestone Deliverables",
        amount: 280,
        status: "completed",
        dueDate: "2026-02-12",
        approvedAt: "2026-02-05T18:00:00Z",
      },
      {
        id: "m-ORD-8044-2",
        title: "Phase 2: API & Developer Documentation Milestone Deliverables",
        amount: 280,
        status: "completed",
        dueDate: "2026-02-12",
        approvedAt: "2026-02-05T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8044-1",
        milestoneId: "m-ORD-8044-2",
        note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
        submittedAt: "2026-02-12",
        files: [
          {
            name: "system-whitepaper.pdf",
            size: "3.9 MB",
            type: "pdf",
          },
          {
            name: "developer-guide.pdf",
            size: "2.7 MB",
            type: "pdf",
          },
          {
            name: "openapi-spec.zip",
            size: "850 KB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8045",
    title: "System Architecture RFC & High-Level Engineering Specifications Document",
    category: "Technical Writing",
    tier: "BASIC",
    gigId: "gig-46",
    totalAmount: 280,
    status: "active",
    createdAt: "2026-01-10",
    deliveryDate: "2026-01-12",
    role: "CLIENT",
    client: {
      id: "usr-13",
      name: "River Johns",
      email: "river.johns@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-fast-response",
      name: "Chloe Nguyen (Minh Chau)",
      title: "System Architecture Specs Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8045-1",
        title: "Phase 1: System Architecture Specs Milestone Deliverables",
        amount: 140,
        status: "completed",
        dueDate: "2026-01-12",
        approvedAt: "2026-01-10T18:00:00Z",
      },
      {
        id: "m-ORD-8045-2",
        title: "Phase 2: System Architecture Specs Milestone Deliverables",
        amount: 140,
        status: "in_progress",
        dueDate: "2026-01-12",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8046",
    title: "Self-Hosted Docusaurus Developer Portal with Search & Versioning",
    category: "Technical Writing",
    tier: "STANDARD",
    gigId: "gig-47",
    totalAmount: 390,
    status: "completed",
    createdAt: "2026-03-15",
    deliveryDate: "2026-03-19",
    role: "FREELANCER",
    client: {
      id: "usr-16",
      name: "David Herzog",
      email: "david.herzog@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-slow-response",
      name: "Torsten Lindemann",
      title: "API & Developer Documentation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8046-1",
        title: "Phase 1: API & Developer Documentation Milestone Deliverables",
        amount: 195,
        status: "completed",
        dueDate: "2026-03-19",
        approvedAt: "2026-03-15T18:00:00Z",
      },
      {
        id: "m-ORD-8046-2",
        title: "Phase 2: API & Developer Documentation Milestone Deliverables",
        amount: 195,
        status: "completed",
        dueDate: "2026-03-19",
        approvedAt: "2026-03-15T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8046-1",
        milestoneId: "m-ORD-8046-2",
        note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
        submittedAt: "2026-03-19",
        files: [
          {
            name: "system-whitepaper.pdf",
            size: "3.9 MB",
            type: "pdf",
          },
          {
            name: "developer-guide.pdf",
            size: "2.7 MB",
            type: "pdf",
          },
          {
            name: "openapi-spec.zip",
            size: "850 KB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8047",
    title: "Security & SOC2 Compliance Policy Documentation for Enterprise Audits",
    category: "Technical Writing",
    tier: "STANDARD",
    gigId: "gig-48",
    totalAmount: 630,
    status: "completed",
    createdAt: "2026-02-20",
    deliveryDate: "2026-02-27",
    role: "BOTH",
    client: {
      id: "usr-19",
      name: "Sherwood Barrows",
      email: "sherwood.barrows@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-suspended",
      name: "Sergei Romanov",
      title: "Fintech & Web3 Whitepapers Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8047-1",
        title: "Phase 1: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-02-27",
        approvedAt: "2026-02-20T18:00:00Z",
      },
      {
        id: "m-ORD-8047-2",
        title: "Phase 2: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-02-27",
        approvedAt: "2026-02-20T18:00:00Z",
      },
      {
        id: "m-ORD-8047-3",
        title: "Phase 3: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 210,
        status: "completed",
        dueDate: "2026-02-27",
        approvedAt: "2026-02-20T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8047-1",
        milestoneId: "m-ORD-8047-3",
        note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
        submittedAt: "2026-02-27",
        files: [
          {
            name: "system-whitepaper.pdf",
            size: "3.9 MB",
            type: "pdf",
          },
          {
            name: "developer-guide.pdf",
            size: "2.7 MB",
            type: "pdf",
          },
          {
            name: "openapi-spec.zip",
            size: "850 KB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8048",
    title: "Database Disaster Recovery & Runbook Incident Response Guidelines",
    category: "Technical Writing",
    tier: "STANDARD",
    gigId: "gig-49",
    totalAmount: 470,
    status: "completed",
    createdAt: "2026-01-25",
    deliveryDate: "2026-01-28",
    role: "CLIENT",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "usr-11",
      name: "Gregory Bayer",
      title: "System Architecture Specs Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8048-1",
        title: "Phase 1: System Architecture Specs Milestone Deliverables",
        amount: 235,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-25T18:00:00Z",
      },
      {
        id: "m-ORD-8048-2",
        title: "Phase 2: System Architecture Specs Milestone Deliverables",
        amount: 235,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-25T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8048-1",
        milestoneId: "m-ORD-8048-2",
        note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
        submittedAt: "2026-01-28",
        files: [
          {
            name: "system-whitepaper.pdf",
            size: "3.9 MB",
            type: "pdf",
          },
          {
            name: "developer-guide.pdf",
            size: "2.7 MB",
            type: "pdf",
          },
          {
            name: "openapi-spec.zip",
            size: "850 KB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8049",
    title: "High-End 2D Motion Graphics & Kinetic Typography Explainer Video",
    category: "UI/UX & Product Design",
    tier: "PREMIUM",
    gigId: "gig-50",
    totalAmount: 960,
    status: "completed",
    createdAt: "2026-03-03",
    deliveryDate: "2026-03-15",
    role: "FREELANCER",
    client: {
      id: "usr-client-4",
      name: "Rachel Adams",
      email: "rachel.adams@horizonhealth.ca",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      title: "Video & 3D Animation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8049-1",
        title: "Phase 1: Video & 3D Animation Milestone Deliverables",
        amount: 320,
        status: "completed",
        dueDate: "2026-03-15",
        approvedAt: "2026-03-03T18:00:00Z",
      },
      {
        id: "m-ORD-8049-2",
        title: "Phase 2: Video & 3D Animation Milestone Deliverables",
        amount: 320,
        status: "completed",
        dueDate: "2026-03-15",
        approvedAt: "2026-03-03T18:00:00Z",
      },
      {
        id: "m-ORD-8049-3",
        title: "Phase 3: Video & 3D Animation Milestone Deliverables",
        amount: 320,
        status: "completed",
        dueDate: "2026-03-15",
        approvedAt: "2026-03-03T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8049-1",
        milestoneId: "m-ORD-8049-3",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-03-15",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8050",
    title: "App Store & SaaS Promo Video with UI Screencasts & Sound Design",
    category: "UI/UX & Product Design",
    tier: "BASIC",
    gigId: "gig-51",
    totalAmount: 240,
    status: "delivered",
    createdAt: "2026-02-08",
    deliveryDate: "2026-02-10",
    role: "BOTH",
    client: {
      id: "usr-12",
      name: "Priscilla Mertz",
      email: "priscilla.mertz@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-13",
      name: "River Johns",
      title: "Video & 3D Animation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8050-1",
        title: "Phase 1: Video & 3D Animation Milestone Deliverables",
        amount: 120,
        status: "completed",
        dueDate: "2026-02-10",
        approvedAt: "2026-02-08T18:00:00Z",
      },
      {
        id: "m-ORD-8050-2",
        title: "Phase 2: Video & 3D Animation Milestone Deliverables",
        amount: 120,
        status: "in_review",
        dueDate: "2026-02-10",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8050-1",
        milestoneId: "m-ORD-8050-2",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-02-10",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8051",
    title: "Custom Lottie Animations for Web & Mobile App Micro-Interactions",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-52",
    totalAmount: 280,
    status: "completed",
    createdAt: "2026-01-13",
    deliveryDate: "2026-01-17",
    role: "CLIENT",
    client: {
      id: "usr-15",
      name: "Robin Christiansen",
      email: "robin.christiansen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      title: "Video & 3D Animation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8051-1",
        title: "Phase 1: Video & 3D Animation Milestone Deliverables",
        amount: 140,
        status: "completed",
        dueDate: "2026-01-17",
        approvedAt: "2026-01-13T18:00:00Z",
      },
      {
        id: "m-ORD-8051-2",
        title: "Phase 2: Video & 3D Animation Milestone Deliverables",
        amount: 140,
        status: "completed",
        dueDate: "2026-01-17",
        approvedAt: "2026-01-13T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8051-1",
        milestoneId: "m-ORD-8051-2",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-01-17",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8052",
    title: "Blender 3D Isometric SaaS Scene & Architectural Tech Isometric Render",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-53",
    totalAmount: 550,
    status: "completed",
    createdAt: "2026-03-18",
    deliveryDate: "2026-03-24",
    role: "FREELANCER",
    client: {
      id: "usr-18",
      name: "Minh Nguyen",
      email: "minh.nguyen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-15",
      name: "Robin Christiansen",
      title: "Video & 3D Animation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8052-1",
        title: "Phase 1: Video & 3D Animation Milestone Deliverables",
        amount: 275,
        status: "completed",
        dueDate: "2026-03-24",
        approvedAt: "2026-03-18T18:00:00Z",
      },
      {
        id: "m-ORD-8052-2",
        title: "Phase 2: Video & 3D Animation Milestone Deliverables",
        amount: 275,
        status: "completed",
        dueDate: "2026-03-24",
        approvedAt: "2026-03-18T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8052-1",
        milestoneId: "m-ORD-8052-2",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-03-24",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8053",
    title: "Cinematic Product Reveal Trailer with Dynamic Particle Physics & CGI",
    category: "UI/UX & Product Design",
    tier: "STANDARD",
    gigId: "gig-54",
    totalAmount: 790,
    status: "completed",
    createdAt: "2026-02-23",
    deliveryDate: "2026-02-28",
    role: "BOTH",
    client: {
      id: "f-1",
      name: "Alexandre Moreau",
      email: "alexandre.moreau@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-16",
      name: "David Herzog",
      title: "Video & 3D Animation Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8053-1",
        title: "Phase 1: Video & 3D Animation Milestone Deliverables",
        amount: 263,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-23T18:00:00Z",
      },
      {
        id: "m-ORD-8053-2",
        title: "Phase 2: Video & 3D Animation Milestone Deliverables",
        amount: 263,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-23T18:00:00Z",
      },
      {
        id: "m-ORD-8053-3",
        title: "Phase 3: Video & 3D Animation Milestone Deliverables",
        amount: 264,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-23T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8053-1",
        milestoneId: "m-ORD-8053-3",
        note: "Completed full design token library, atomic component library, and interactive Figma prototypes with mobile viewports.",
        submittedAt: "2026-02-28",
        files: [
          {
            name: "design-system-tokens.figma",
            size: "28.6 MB",
            type: "figma",
          },
          {
            name: "component-specifications.pdf",
            size: "6.2 MB",
            type: "pdf",
          },
          {
            name: "style-guide-assets.zip",
            size: "18.5 MB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8054",
    title: "Mobile App Store Optimization (ASO) & Fastlane Automated Release Pipeline",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-55",
    totalAmount: 650,
    status: "completed",
    createdAt: "2026-01-01",
    deliveryDate: "2026-01-09",
    role: "CLIENT",
    client: {
      id: "usr-client-3",
      name: "Emily Zhang",
      email: "emily.zhang@nexusventures.sg",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "usr-17",
      name: "Katrina Stehr",
      title: "Mobile App Development Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8054-1",
        title: "Phase 1: Mobile App Development Milestone Deliverables",
        amount: 217,
        status: "completed",
        dueDate: "2026-01-09",
        approvedAt: "2026-01-01T18:00:00Z",
      },
      {
        id: "m-ORD-8054-2",
        title: "Phase 2: Mobile App Development Milestone Deliverables",
        amount: 217,
        status: "completed",
        dueDate: "2026-01-09",
        approvedAt: "2026-01-01T18:00:00Z",
      },
      {
        id: "m-ORD-8054-3",
        title: "Phase 3: Mobile App Development Milestone Deliverables",
        amount: 216,
        status: "completed",
        dueDate: "2026-01-09",
        approvedAt: "2026-01-01T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8054-1",
        milestoneId: "m-ORD-8054-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-09",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8055",
    title: "Real-Time Chat & Geolocation Tracking Mobile App in React Native",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-56",
    totalAmount: 340,
    status: "active",
    createdAt: "2026-03-06",
    deliveryDate: "2026-03-09",
    role: "FREELANCER",
    client: {
      id: "usr-11",
      name: "Gregory Bayer",
      email: "gregory.bayer@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-18",
      name: "Minh Nguyen",
      title: "Mobile App Development Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8055-1",
        title: "Phase 1: Mobile App Development Milestone Deliverables",
        amount: 170,
        status: "completed",
        dueDate: "2026-03-09",
        approvedAt: "2026-03-06T18:00:00Z",
      },
      {
        id: "m-ORD-8055-2",
        title: "Phase 2: Mobile App Development Milestone Deliverables",
        amount: 170,
        status: "in_progress",
        dueDate: "2026-03-09",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8056",
    title: "Audio Streaming & Podcast Mobile Application with Background Playback",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-57",
    totalAmount: 600,
    status: "completed",
    createdAt: "2026-02-11",
    deliveryDate: "2026-02-17",
    role: "BOTH",
    client: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      email: "sandra.zieme-luettgen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      title: "Mobile App Development Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8056-1",
        title: "Phase 1: Mobile App Development Milestone Deliverables",
        amount: 200,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-11T18:00:00Z",
      },
      {
        id: "m-ORD-8056-2",
        title: "Phase 2: Mobile App Development Milestone Deliverables",
        amount: 200,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-11T18:00:00Z",
      },
      {
        id: "m-ORD-8056-3",
        title: "Phase 3: Mobile App Development Milestone Deliverables",
        amount: 200,
        status: "completed",
        dueDate: "2026-02-17",
        approvedAt: "2026-02-11T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8056-1",
        milestoneId: "m-ORD-8056-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-17",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8057",
    title: "Secure FinTech Mobile Wallet UI with Biometric Vault & Push Notification Rails",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-58",
    totalAmount: 710,
    status: "completed",
    createdAt: "2026-01-16",
    deliveryDate: "2026-01-23",
    role: "CLIENT",
    client: {
      id: "usr-17",
      name: "Katrina Stehr",
      email: "katrina.stehr@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      title: "Mobile App Development Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8057-1",
        title: "Phase 1: Mobile App Development Milestone Deliverables",
        amount: 237,
        status: "completed",
        dueDate: "2026-01-23",
        approvedAt: "2026-01-16T18:00:00Z",
      },
      {
        id: "m-ORD-8057-2",
        title: "Phase 2: Mobile App Development Milestone Deliverables",
        amount: 237,
        status: "completed",
        dueDate: "2026-01-23",
        approvedAt: "2026-01-16T18:00:00Z",
      },
      {
        id: "m-ORD-8057-3",
        title: "Phase 3: Mobile App Development Milestone Deliverables",
        amount: 236,
        status: "completed",
        dueDate: "2026-01-23",
        approvedAt: "2026-01-16T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8057-1",
        milestoneId: "m-ORD-8057-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-23",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8058",
    title: "Headless Shopify Next.js Storefront with Algolia InstantSearch",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-59",
    totalAmount: 580,
    status: "completed",
    createdAt: "2026-03-21",
    deliveryDate: "2026-03-27",
    role: "FREELANCER",
    client: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      email: "mitchell.ankunding@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-21",
      name: "Hattie Heidenreich",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8058-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 290,
        status: "completed",
        dueDate: "2026-03-27",
        approvedAt: "2026-03-21T18:00:00Z",
      },
      {
        id: "m-ORD-8058-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 290,
        status: "completed",
        dueDate: "2026-03-27",
        approvedAt: "2026-03-21T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8058-1",
        milestoneId: "m-ORD-8058-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-27",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8059",
    title: "Multi-Tenant B2B SaaS Auth Engine with RBAC & Organization Invitations",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-60",
    totalAmount: 950,
    status: "completed",
    createdAt: "2026-02-26",
    deliveryDate: "2026-02-28",
    role: "BOTH",
    client: {
      id: "usr-client-2",
      name: "David Sterling",
      email: "david.sterling@apexcap.com",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "usr-22",
      name: "Gerard Wiegand",
      title: "Full-Stack Node.js Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8059-1",
        title: "Phase 1: Full-Stack Node.js Milestone Deliverables",
        amount: 317,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-26T18:00:00Z",
      },
      {
        id: "m-ORD-8059-2",
        title: "Phase 2: Full-Stack Node.js Milestone Deliverables",
        amount: 317,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-26T18:00:00Z",
      },
      {
        id: "m-ORD-8059-3",
        title: "Phase 3: Full-Stack Node.js Milestone Deliverables",
        amount: 316,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-26T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8059-1",
        milestoneId: "m-ORD-8059-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-28",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8060",
    title: "Interactive Storybook UI Component Documentation with Automated Visual Regression",
    category: "UI/UX & Product Design",
    tier: "BASIC",
    gigId: "gig-61",
    totalAmount: 230,
    status: "cancelled",
    createdAt: "2026-01-04",
    deliveryDate: "Cancelled",
    role: "CLIENT",
    client: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      email: "liam.oconnor@novadynamics.ie",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nova Dynamics AI",
    },
    freelancer: {
      id: "usr-23",
      name: "Jules Wuckert",
      title: "Design Systems & Figma Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8060-1",
        title: "Phase 1: Design Systems & Figma Milestone Deliverables",
        amount: 115,
        status: "completed",
        dueDate: "Cancelled",
        approvedAt: "2026-01-04T18:00:00Z",
      },
      {
        id: "m-ORD-8060-2",
        title: "Phase 2: Design Systems & Figma Milestone Deliverables",
        amount: 115,
        status: "pending",
        dueDate: "Cancelled",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8061",
    title: "Local Offline LLM In-Browser Inference Engine using WebGPU & Transformers.js",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-62",
    totalAmount: 690,
    status: "completed",
    createdAt: "2026-03-09",
    deliveryDate: "2026-03-16",
    role: "FREELANCER",
    client: {
      id: "usr-13",
      name: "River Johns",
      email: "river.johns@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-24",
      name: "Luz Champlin",
      title: "LLM Fine-Tuning & RAG Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8061-1",
        title: "Phase 1: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 230,
        status: "completed",
        dueDate: "2026-03-16",
        approvedAt: "2026-03-09T18:00:00Z",
      },
      {
        id: "m-ORD-8061-2",
        title: "Phase 2: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 230,
        status: "completed",
        dueDate: "2026-03-16",
        approvedAt: "2026-03-09T18:00:00Z",
      },
      {
        id: "m-ORD-8061-3",
        title: "Phase 3: LLM Fine-Tuning & RAG Milestone Deliverables",
        amount: 230,
        status: "completed",
        dueDate: "2026-03-16",
        approvedAt: "2026-03-09T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8061-1",
        milestoneId: "m-ORD-8061-3",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-03-16",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8062",
    title: "Developer Onboarding Runbooks & Architecture ADR Documentation Template",
    category: "Technical Writing",
    tier: "STANDARD",
    gigId: "gig-63",
    totalAmount: 320,
    status: "completed",
    createdAt: "2026-02-14",
    deliveryDate: "2026-02-18",
    role: "BOTH",
    client: {
      id: "usr-16",
      name: "David Herzog",
      email: "david.herzog@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-25",
      name: "Brandi Hegmann",
      title: "Fintech & Web3 Whitepapers Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8062-1",
        title: "Phase 1: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 160,
        status: "completed",
        dueDate: "2026-02-18",
        approvedAt: "2026-02-14T18:00:00Z",
      },
      {
        id: "m-ORD-8062-2",
        title: "Phase 2: Fintech & Web3 Whitepapers Milestone Deliverables",
        amount: 160,
        status: "completed",
        dueDate: "2026-02-18",
        approvedAt: "2026-02-14T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8062-1",
        milestoneId: "m-ORD-8062-2",
        note: "Delivered comprehensive developer documentation, OpenAPI specification, and architectural whitepaper.",
        submittedAt: "2026-02-18",
        files: [
          {
            name: "system-whitepaper.pdf",
            size: "3.9 MB",
            type: "pdf",
          },
          {
            name: "developer-guide.pdf",
            size: "2.7 MB",
            type: "pdf",
          },
          {
            name: "openapi-spec.zip",
            size: "850 KB",
            type: "zip",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8063",
    title: "Targeted Rapid Security Code Audit & Dependency CVE Scan",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-edge-single-tier",
    totalAmount: 350,
    status: "completed",
    createdAt: "2026-01-19",
    deliveryDate: "2026-01-21",
    role: "CLIENT",
    client: {
      id: "usr-19",
      name: "Sherwood Barrows",
      email: "sherwood.barrows@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Cloud & DevOps Specialist",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Single Rapid CVE Audit Package requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8063-1",
        title: "Phase 1: Cloud & DevOps Milestone Deliverables",
        amount: 175,
        status: "completed",
        dueDate: "2026-01-21",
        approvedAt: "2026-01-19T18:00:00Z",
      },
      {
        id: "m-ORD-8063-2",
        title: "Phase 2: Cloud & DevOps Milestone Deliverables",
        amount: 175,
        status: "completed",
        dueDate: "2026-01-21",
        approvedAt: "2026-01-19T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8063-1",
        milestoneId: "m-ORD-8063-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-21",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8064",
    title:
      "Enterprise Heterogeneous Multi-Cloud High-Throughput Zero-Downtime Microservices Architecture with Formal Cryptographic Verification, Kubernetes Orchestration, and Distributed Transaction Observability",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-edge-overflow-title",
    totalAmount: 850,
    status: "completed",
    createdAt: "2026-03-24",
    deliveryDate: "2026-03-28",
    role: "FREELANCER",
    client: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      email: "marcus.thorne@fintechcorp.io",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      company: "Fintech Corp Ltd",
    },
    freelancer: {
      id: "usr-edge-overflow",
      name: "Dr. Bartholomew Alexander Montgomery-Fitzgerald III",
      title: "Full-Stack Node.js Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Premium Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8064-1",
        title: "Phase 1: Full-Stack Node.js Milestone Deliverables",
        amount: 283,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-24T18:00:00Z",
      },
      {
        id: "m-ORD-8064-2",
        title: "Phase 2: Full-Stack Node.js Milestone Deliverables",
        amount: 283,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-24T18:00:00Z",
      },
      {
        id: "m-ORD-8064-3",
        title: "Phase 3: Full-Stack Node.js Milestone Deliverables",
        amount: 284,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-24T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8064-1",
        milestoneId: "m-ORD-8064-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-28",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8065",
    title: "Accessible Tailwind CSS & React 19 UI Component Library",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-edge-zero-orders",
    totalAmount: 220,
    status: "active",
    createdAt: "2026-02-02",
    deliveryDate: "2026-02-05",
    role: "BOTH",
    client: {
      id: "usr-client-4",
      name: "Rachel Adams",
      email: "rachel.adams@horizonhealth.ca",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Horizon Health Technologies",
    },
    freelancer: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Package requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8065-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 110,
        status: "completed",
        dueDate: "2026-02-05",
        approvedAt: "2026-02-02T18:00:00Z",
      },
      {
        id: "m-ORD-8065-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 110,
        status: "in_progress",
        dueDate: "2026-02-05",
      },
    ],
    deliveries: [],
    revisions: [],
  },
  {
    id: "ORD-8066",
    title: "Draft Experimental Quantum Computing Simulator with Qiskit & Python",
    category: "AI & Automation",
    tier: "STANDARD",
    gigId: "gig-edge-draft",
    totalAmount: 450,
    status: "completed",
    createdAt: "2026-01-07",
    deliveryDate: "2026-01-12",
    role: "CLIENT",
    client: {
      id: "usr-12",
      name: "Priscilla Mertz",
      email: "priscilla.mertz@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-3",
      name: "Marcus Vance",
      title: "Autonomous AI Agents Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Standard Package requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8066-1",
        title: "Phase 1: Autonomous AI Agents Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-01-12",
        approvedAt: "2026-01-07T18:00:00Z",
      },
      {
        id: "m-ORD-8066-2",
        title: "Phase 2: Autonomous AI Agents Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-01-12",
        approvedAt: "2026-01-07T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8066-1",
        milestoneId: "m-ORD-8066-2",
        note: "RAG pipeline implemented with hybrid retrieval (BM25 + Cohere Re-ranker), evaluation dataset, and low latency benchmarks.",
        submittedAt: "2026-01-12",
        files: [
          {
            name: "rag-eval-report.pdf",
            size: "4.8 MB",
            type: "pdf",
          },
          {
            name: "vector-pipeline.zip",
            size: "8.9 MB",
            type: "zip",
          },
          {
            name: "api-contract.pdf",
            size: "1.5 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8067",
    title: "Full-Stack Enterprise Cloud SaaS Suite with Maximum Add-on Options",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-edge-max-addons",
    totalAmount: 450,
    status: "completed",
    createdAt: "2026-03-12",
    deliveryDate: "2026-03-17",
    role: "FREELANCER",
    client: {
      id: "usr-15",
      name: "Robin Christiansen",
      email: "robin.christiansen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Standard Package requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8067-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-03-17",
        approvedAt: "2026-03-12T18:00:00Z",
      },
      {
        id: "m-ORD-8067-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-03-17",
        approvedAt: "2026-03-12T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8067-1",
        milestoneId: "m-ORD-8067-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-17",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8068",
    title: "Full-Stack Next.js 15 & Node.js Production Architecture with Clean Code",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-1",
    totalAmount: 450,
    status: "completed",
    createdAt: "2026-02-17",
    deliveryDate: "2026-02-22",
    role: "BOTH",
    client: {
      id: "usr-18",
      name: "Minh Nguyen",
      email: "minh.nguyen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8068-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-02-22",
        approvedAt: "2026-02-17T18:00:00Z",
      },
      {
        id: "m-ORD-8068-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 225,
        status: "completed",
        dueDate: "2026-02-22",
        approvedAt: "2026-02-17T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8068-1",
        milestoneId: "m-ORD-8068-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-22",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8069",
    title: "High-Converting SaaS Landing Page in Next.js & Framer Motion",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-2",
    totalAmount: 590,
    status: "completed",
    createdAt: "2026-01-22",
    deliveryDate: "2026-01-28",
    role: "CLIENT",
    client: {
      id: "f-1",
      name: "Alexandre Moreau",
      email: "alexandre.moreau@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "f-3",
      name: "Marcus Vance",
      title: "Next.js & React 19 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8069-1",
        title: "Phase 1: Next.js & React 19 Milestone Deliverables",
        amount: 295,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-22T18:00:00Z",
      },
      {
        id: "m-ORD-8069-2",
        title: "Phase 2: Next.js & React 19 Milestone Deliverables",
        amount: 295,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-22T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8069-1",
        milestoneId: "m-ORD-8069-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-28",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8070",
    title: "Scalable GraphQL & REST Microservices Backend in NestJS and Redis",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-3",
    totalAmount: 320,
    status: "delivered",
    createdAt: "2026-03-27",
    deliveryDate: "2026-03-28",
    role: "FREELANCER",
    client: {
      id: "usr-client-3",
      name: "Emily Zhang",
      email: "emily.zhang@nexusventures.sg",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Nexus AI Ventures",
    },
    freelancer: {
      id: "f-4",
      name: "Sophia Lindqvist",
      title: "Full-Stack Node.js Specialist",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8070-1",
        title: "Phase 1: Full-Stack Node.js Milestone Deliverables",
        amount: 160,
        status: "completed",
        dueDate: "2026-03-28",
        approvedAt: "2026-03-27T18:00:00Z",
      },
      {
        id: "m-ORD-8070-2",
        title: "Phase 2: Full-Stack Node.js Milestone Deliverables",
        amount: 160,
        status: "in_review",
        dueDate: "2026-03-28",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8070-1",
        milestoneId: "m-ORD-8070-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-28",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8071",
    title: "High-Performance Go (Golang) Microservice Engine with gRPC & RabbitMQ",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-4",
    totalAmount: 720,
    status: "completed",
    createdAt: "2026-02-05",
    deliveryDate: "2026-02-13",
    role: "BOTH",
    client: {
      id: "usr-11",
      name: "Gregory Bayer",
      email: "gregory.bayer@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-overflow",
      name: "Dr. Bartholomew Alexander Montgomery-Fitzgerald III",
      title: "Full-Stack Node.js Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8071-1",
        title: "Phase 1: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-02-13",
        approvedAt: "2026-02-05T18:00:00Z",
      },
      {
        id: "m-ORD-8071-2",
        title: "Phase 2: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-02-13",
        approvedAt: "2026-02-05T18:00:00Z",
      },
      {
        id: "m-ORD-8071-3",
        title: "Phase 3: Full-Stack Node.js Milestone Deliverables",
        amount: 240,
        status: "completed",
        dueDate: "2026-02-13",
        approvedAt: "2026-02-05T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8071-1",
        milestoneId: "m-ORD-8071-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-13",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8072",
    title: "Zero-Downtime AWS ECS & Terraform Infrastructure as Code Setup",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-5",
    totalAmount: 580,
    status: "completed",
    createdAt: "2026-01-10",
    deliveryDate: "2026-01-16",
    role: "CLIENT",
    client: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      email: "sandra.zieme-luettgen@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Cloud & DevOps Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8072-1",
        title: "Phase 1: Cloud & DevOps Milestone Deliverables",
        amount: 290,
        status: "completed",
        dueDate: "2026-01-16",
        approvedAt: "2026-01-10T18:00:00Z",
      },
      {
        id: "m-ORD-8072-2",
        title: "Phase 2: Cloud & DevOps Milestone Deliverables",
        amount: 290,
        status: "completed",
        dueDate: "2026-01-16",
        approvedAt: "2026-01-10T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8072-1",
        milestoneId: "m-ORD-8072-2",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-01-16",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8073",
    title: "Kubernetes Production Cluster Setup with ArgoCD GitOps Pipeline",
    category: "Web Development",
    tier: "STANDARD",
    gigId: "gig-6",
    totalAmount: 850,
    status: "completed",
    createdAt: "2026-03-15",
    deliveryDate: "2026-03-24",
    role: "FREELANCER",
    client: {
      id: "usr-17",
      name: "Katrina Stehr",
      email: "katrina.stehr@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-fast-response",
      name: "Chloe Nguyen (Minh Chau)",
      title: "Cloud & DevOps Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.99,
      level: "TOP_RATED",
    },
    requirements:
      "Execute Production Monorepo requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8073-1",
        title: "Phase 1: Cloud & DevOps Milestone Deliverables",
        amount: 283,
        status: "completed",
        dueDate: "2026-03-24",
        approvedAt: "2026-03-15T18:00:00Z",
      },
      {
        id: "m-ORD-8073-2",
        title: "Phase 2: Cloud & DevOps Milestone Deliverables",
        amount: 283,
        status: "completed",
        dueDate: "2026-03-24",
        approvedAt: "2026-03-15T18:00:00Z",
      },
      {
        id: "m-ORD-8073-3",
        title: "Phase 3: Cloud & DevOps Milestone Deliverables",
        amount: 284,
        status: "completed",
        dueDate: "2026-03-24",
        approvedAt: "2026-03-15T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8073-1",
        milestoneId: "m-ORD-8073-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-03-24",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8074",
    title: "Audited Solidity Smart Contracts with Formal ERC-20 & ERC-721 Security",
    category: "Web Development",
    tier: "PREMIUM",
    gigId: "gig-7",
    totalAmount: 1400,
    status: "completed",
    createdAt: "2026-02-20",
    deliveryDate: "2026-02-28",
    role: "BOTH",
    client: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      email: "mitchell.ankunding@tascora.test",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Enterprise Partner",
    },
    freelancer: {
      id: "usr-edge-slow-response",
      name: "Torsten Lindemann",
      title: "Smart Contracts & Web3 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Enterprise Architecture requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8074-1",
        title: "Phase 1: Smart Contracts & Web3 Milestone Deliverables",
        amount: 467,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-20T18:00:00Z",
      },
      {
        id: "m-ORD-8074-2",
        title: "Phase 2: Smart Contracts & Web3 Milestone Deliverables",
        amount: 467,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-20T18:00:00Z",
      },
      {
        id: "m-ORD-8074-3",
        title: "Phase 3: Smart Contracts & Web3 Milestone Deliverables",
        amount: 466,
        status: "completed",
        dueDate: "2026-02-28",
        approvedAt: "2026-02-20T18:00:00Z",
      },
    ],
    deliveries: [
      {
        id: "del-ORD-8074-1",
        milestoneId: "m-ORD-8074-3",
        note: "All source code, Docker configs, and automated test suites pushed and verified. Zero CVE vulnerabilities detected.",
        submittedAt: "2026-02-28",
        files: [
          {
            name: "production-release.zip",
            size: "14.2 MB",
            type: "zip",
          },
          {
            name: "architecture-blueprint.pdf",
            size: "3.4 MB",
            type: "pdf",
          },
          {
            name: "e2e-test-results.pdf",
            size: "1.1 MB",
            type: "pdf",
          },
        ],
      },
    ],
    revisions: [],
  },
  {
    id: "ORD-8075",
    title: "DeFi Staking Protocol & Cross-Chain Bridge Web3 Integration",
    category: "Web Development",
    tier: "BASIC",
    gigId: "gig-8",
    totalAmount: 520,
    status: "active",
    createdAt: "2026-01-25",
    deliveryDate: "2026-01-28",
    role: "CLIENT",
    client: {
      id: "usr-client-2",
      name: "David Sterling",
      email: "david.sterling@apexcap.com",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "Apex Capital Ventures",
    },
    freelancer: {
      id: "usr-edge-suspended",
      name: "Sergei Romanov",
      title: "Smart Contracts & Web3 Specialist",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 4.95,
      level: "LEVEL_2",
    },
    requirements:
      "Execute Starter Deliverable requirements with clean production code, modular architecture, and documentation.",
    milestones: [
      {
        id: "m-ORD-8075-1",
        title: "Phase 1: Smart Contracts & Web3 Milestone Deliverables",
        amount: 260,
        status: "completed",
        dueDate: "2026-01-28",
        approvedAt: "2026-01-25T18:00:00Z",
      },
      {
        id: "m-ORD-8075-2",
        title: "Phase 2: Smart Contracts & Web3 Milestone Deliverables",
        amount: 260,
        status: "in_progress",
        dueDate: "2026-01-28",
      },
    ],
    deliveries: [],
    revisions: [],
  },
]
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

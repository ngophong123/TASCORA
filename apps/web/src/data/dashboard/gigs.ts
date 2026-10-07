/**
 * TASCORA Generated Seed & Mock Data: Seller Dashboard Gigs
 *
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
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

export const INITIAL_GIGS: DashboardGig[] = [
  {
    id: "gig-1",
    title: "Full-Stack Next.js 15 & Node.js Production Architecture with Clean Code",
    slug: "full-stack-next-js-15-node-js-production-architecture-with-clean-code",
    category: "Programming & Tech",
    subcategory: "Web Development",
    coverImage: "/images/services/programming/full-stack-nextjs-node.jpg",
    status: "active",
    createdAt: "2026-01-10",
    updatedAt: "2026-03-15",
    startingPrice: 250,
    rating: 4.99,
    reviewsCount: 42,
    stats: {
      impressions: 450,
      clicks: 61,
      orders: 13,
      revenue: 5850,
      conversionRate: 21.3,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Starter Deliverable",
        description:
          "Essential Web Development setup tailored for early-stage validation, clean structure, and core deliverables.",
        price: 250,
        deliveryDays: 2,
        revisions: 2,
        features: [
          "Core Web Development Foundation",
          "Detailed Code / Asset Documentation",
          "2 Iteration & Revision Rounds",
          "Linted & Strict TypeScript / Vector Deliverables",
          "Production Readiness Handover",
        ],
      },
      standard: {
        name: "STANDARD",
        title: "Production Monorepo",
        description:
          "Comprehensive production-ready release with full test suites, automated CI/CD integration, and high-load performance optimization.",
        price: 450,
        deliveryDays: 5,
        revisions: 4,
        features: [
          "Everything in Starter Tier",
          "Automated Unit & Integration Test Suites",
          "High-Throughput Optimization & Indexing",
          "CI/CD Deployment Configuration",
          "4 Revisions Included",
          "Priority 48-Hour Turnaround Support",
        ],
      },
      premium: {
        name: "PREMIUM",
        title: "Enterprise Architecture",
        description:
          "Full-scale enterprise execution with architecture blueprinting, multi-stage Docker / vector builds, and 30-day dedicated post-launch support.",
        price: 850,
        deliveryDays: 10,
        revisions: "unlimited",
        features: [
          "Everything in Production Monorepo",
          "Custom Multi-Cloud / Enterprise Provisioning",
          "Formal Security & Vulnerability Auditing",
          "Unlimited Revisions & Iteration Rounds",
          "30 Days Dedicated VIP SLA Support",
          "1-on-1 Architectural Walkthrough Call",
        ],
      },
    },
    description:
      "I will architect and develop a high-performance Next.js 15 application using React 19, strict TypeScript, and Tailwind CSS. Whether you're building a new SaaS platform or refactoring an existing codebase, I focus on clean component hierarchy, fast initial page loads, and seamless API integrations.\n\n### Deliverables & Scope:\n- **Production Next.js 15 Setup**: App Router architecture with optimized Server & Client Components.\n- **Strict TypeScript & Clean Code**: Zero implicit any, strict ESLint configuration, and modular folder structure.\n- **Responsive & Accessible UI**: Pixel-perfect implementation using Tailwind CSS and Radix UI primitives.\n- **State Management & Data Fetching**: TanStack Query, Server Actions, and optimistic UI updates.\n- **Database & Auth Integration**: Prisma / Drizzle ORM schema with PostgreSQL, NextAuth.js or Supabase.\n- **Testing & Deployment**: Vitest unit test suite, automated GitHub Actions CI/CD, and Vercel/Docker deployment guide.",
    requirements:
      "Please provide your project brief, repository access or Figma designs, and target cloud deployment environment.",
    tags: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    faqs: [
      {
        id: "faq-1",
        question: "What technology stack and standards are utilized?",
        answer:
          "All deliverables adhere strictly to production standards: Next.js 15+ App Router, React 19, strict TypeScript compiler settings, and Clean Architecture principles.",
      },
      {
        id: "faq-2",
        question: "Is milestone escrow protection supported?",
        answer:
          "Yes, 100% of orders on TASCORA are funded into secure milestone escrow prior to commencement, ensuring total safety for both parties.",
      },
      {
        id: "faq-3",
        question: "Can this deliverable be adapted to our specific custom infrastructure?",
        answer:
          "Absolutely. Standard and Premium tiers can be configured for AWS, Vercel, Fly.io, Cloudflare, or self-hosted Docker Kubernetes clusters.",
      },
      {
        id: "faq-4",
        question: "How are revisions and feedback rounds coordinated?",
        answer:
          "Revisions can be requested directly inside the TASCORA dashboard with annotated attachments, diff notes, and automated version tracking.",
      },
    ],
  },
  {
    id: "gig-14",
    title: "Real-Time WebSocket & Socket.io Collaborative Canvas Engine",
    slug: "real-time-websocket-socket-io-collaborative-canvas-engine",
    category: "Programming & Tech",
    subcategory: "Backend Development",
    coverImage: "/images/services/programming/realtime-websocket-engine.jpg",
    status: "active",
    createdAt: "2026-02-23",
    updatedAt: "2026-03-15",
    startingPrice: 260,
    rating: 4.99,
    reviewsCount: 42,
    stats: {
      impressions: 1529,
      clicks: 147,
      orders: 29,
      revenue: 13920,
      conversionRate: 19.7,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Starter Deliverable",
        description:
          "Essential Backend Development setup tailored for early-stage validation, clean structure, and core deliverables.",
        price: 260,
        deliveryDays: 2,
        revisions: 2,
        features: [
          "Core Backend Development Foundation",
          "Detailed Code / Asset Documentation",
          "2 Iteration & Revision Rounds",
          "Linted & Strict TypeScript / Vector Deliverables",
          "Production Readiness Handover",
        ],
      },
      standard: {
        name: "STANDARD",
        title: "Production Monorepo",
        description:
          "Comprehensive production-ready release with full test suites, automated CI/CD integration, and high-load performance optimization.",
        price: 480,
        deliveryDays: 5,
        revisions: 4,
        features: [
          "Everything in Starter Tier",
          "Automated Unit & Integration Test Suites",
          "High-Throughput Optimization & Indexing",
          "CI/CD Deployment Configuration",
          "4 Revisions Included",
          "Priority 48-Hour Turnaround Support",
        ],
      },
      premium: {
        name: "PREMIUM",
        title: "Enterprise Architecture",
        description:
          "Full-scale enterprise execution with architecture blueprinting, multi-stage Docker / vector builds, and 30-day dedicated post-launch support.",
        price: 860,
        deliveryDays: 10,
        revisions: "unlimited",
        features: [
          "Everything in Production Monorepo",
          "Custom Multi-Cloud / Enterprise Provisioning",
          "Formal Security & Vulnerability Auditing",
          "Unlimited Revisions & Iteration Rounds",
          "30 Days Dedicated VIP SLA Support",
          "1-on-1 Architectural Walkthrough Call",
        ],
      },
    },
    description:
      "I will build a scalable, production-ready backend service and API engine tailored to your application's transaction volume. Focusing on robust domain modeling, low latency database queries, and clear API documentation.\n\n### Deliverables & Scope:\n- **Clean Architecture API**: Node.js (NestJS / Express) or Go microservice with clear controller-service-repository layers.\n- **Database Schema & Indexing**: PostgreSQL / Redis schema with optimized indexes, migration scripts, and connection pooling.\n- **Security & Rate Limiting**: JWT / OAuth2 authentication, Helmet security headers, CORS policies, and Redis rate limiters.\n- **Interactive Documentation**: OpenAPI 3.1 (Swagger) contract and Postman collection with example request payloads.\n- **Dockerized Environment**: Docker Compose setup for instant local onboarding and production parity.",
    requirements:
      "Please provide your project brief, repository access or Figma designs, and target cloud deployment environment.",
    tags: ["WebSockets", "Socket.io", "Real-Time", "React"],
    faqs: [
      {
        id: "faq-1",
        question: "What technology stack and standards are utilized?",
        answer:
          "All deliverables adhere strictly to production standards: Next.js 15+ App Router, React 19, strict TypeScript compiler settings, and Clean Architecture principles.",
      },
      {
        id: "faq-2",
        question: "Is milestone escrow protection supported?",
        answer:
          "Yes, 100% of orders on TASCORA are funded into secure milestone escrow prior to commencement, ensuring total safety for both parties.",
      },
      {
        id: "faq-3",
        question: "Can this deliverable be adapted to our specific custom infrastructure?",
        answer:
          "Absolutely. Standard and Premium tiers can be configured for AWS, Vercel, Fly.io, Cloudflare, or self-hosted Docker Kubernetes clusters.",
      },
      {
        id: "faq-4",
        question: "How are revisions and feedback rounds coordinated?",
        answer:
          "Revisions can be requested directly inside the TASCORA dashboard with annotated attachments, diff notes, and automated version tracking.",
      },
    ],
  },
  {
    id: "gig-edge-single-tier",
    title: "Targeted Rapid Security Code Audit & Dependency CVE Scan",
    slug: "rapid-security-vulnerability-cve-audit",
    category: "Programming & Tech",
    subcategory: "Cybersecurity",
    coverImage: "/images/services/programming/cybersecurity-cve-audit.jpg",
    status: "active",
    createdAt: "2026-02-01",
    updatedAt: "2026-03-15",
    startingPrice: 350,
    rating: 4.99,
    reviewsCount: 42,
    stats: {
      impressions: 1250,
      clicks: 88,
      orders: 14,
      revenue: 6300,
      conversionRate: 15.9,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Single Rapid CVE Audit Package",
        description:
          "Targeted single-package rapid code audit. Tests UI behavior when STANDARD and PREMIUM tiers are deliberately absent.",
        price: 350,
        deliveryDays: 2,
        revisions: 1,
        features: [
          "Complete Dependency Vulnerability Tree Scan",
          "Static Analysis AST Security Report",
          "Remediation Patch Pull Request",
          "Single Revision Included",
        ],
      },
      standard: {
        name: "STANDARD",
        title: "Single Rapid CVE Audit Package",
        description:
          "Targeted single-package rapid code audit. Tests UI behavior when STANDARD and PREMIUM tiers are deliberately absent.",
        price: 350,
        deliveryDays: 2,
        revisions: 1,
        features: [
          "Complete Dependency Vulnerability Tree Scan",
          "Static Analysis AST Security Report",
          "Remediation Patch Pull Request",
          "Single Revision Included",
        ],
      },
      premium: {
        name: "PREMIUM",
        title: "Single Rapid CVE Audit Package",
        description:
          "Targeted single-package rapid code audit. Tests UI behavior when STANDARD and PREMIUM tiers are deliberately absent.",
        price: 350,
        deliveryDays: 2,
        revisions: 1,
        features: [
          "Complete Dependency Vulnerability Tree Scan",
          "Static Analysis AST Security Report",
          "Remediation Patch Pull Request",
          "Single Revision Included",
        ],
      },
    },
    description:
      "I will build a scalable, production-ready backend service and API engine tailored to your application's transaction volume. Focusing on robust domain modeling, low latency database queries, and clear API documentation.\n\n### Deliverables & Scope:\n- **Clean Architecture API**: Node.js (NestJS / Express) or Go microservice with clear controller-service-repository layers.\n- **Database Schema & Indexing**: PostgreSQL / Redis schema with optimized indexes, migration scripts, and connection pooling.\n- **Security & Rate Limiting**: JWT / OAuth2 authentication, Helmet security headers, CORS policies, and Redis rate limiters.\n- **Interactive Documentation**: OpenAPI 3.1 (Swagger) contract and Postman collection with example request payloads.\n- **Dockerized Environment**: Docker Compose setup for instant local onboarding and production parity.",
    requirements:
      "Please provide your project brief, repository access or Figma designs, and target cloud deployment environment.",
    tags: ["TypeScript", "Next.js", "Architecture", "Testing"],
    faqs: [
      {
        id: "faq-1",
        question: "Can this service be customized?",
        answer: "Yes, fully tailored to your specifications.",
      },
      {
        id: "faq-2",
        question: "Is escrow supported?",
        answer: "100% milestone protected.",
      },
      {
        id: "faq-3",
        question: "What is the turnaround time?",
        answer: "Strict adherence to agreed milestones.",
      },
    ],
  },
  {
    id: "gig-edge-draft",
    title: "Draft Experimental Quantum Computing Simulator with Qiskit & Python",
    slug: "internal-draft-quantum-computing-simulator",
    category: "AI & Automation",
    subcategory: "AI & Machine Learning",
    coverImage: "/images/services/ai/quantum-computing-simulator.jpg",
    status: "draft",
    createdAt: "2026-02-01",
    updatedAt: "2026-03-15",
    startingPrice: 220,
    rating: 4.96,
    reviewsCount: 29,
    stats: {
      impressions: 1250,
      clicks: 88,
      orders: 14,
      revenue: 6300,
      conversionRate: 15.9,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Starter Package",
        description: "Essential starter deliverables.",
        price: 220,
        deliveryDays: 3,
        revisions: 2,
        features: ["Foundation Code", "Documentation", "2 Revisions"],
      },
      standard: {
        name: "STANDARD",
        title: "Standard Package",
        description: "Standard production release.",
        price: 450,
        deliveryDays: 5,
        revisions: 4,
        features: ["Everything in Basic", "Unit Tests", "CI/CD Config", "4 Revisions"],
      },
      premium: {
        name: "PREMIUM",
        title: "Premium Architecture",
        description: "Comprehensive enterprise delivery with VIP SLA.",
        price: 850,
        deliveryDays: 8,
        revisions: "unlimited",
        features: [
          "Everything in Standard",
          "Docker Multi-Stage",
          "SLA Support",
          "Unlimited Revisions",
        ],
      },
    },
    description:
      "I will design and deploy a production Retrieval-Augmented Generation (RAG) system or custom model fine-tuning pipeline. I resolve common hallucination issues, optimize chunking strategies, and establish measurable retrieval evaluation metrics.\n\n### Deliverables & Scope:\n- **Ingestion & Chunking Pipeline**: Semantic document parsing (PDFs, Markdown, Notion, Confluence) with hybrid search chunking.\n- **Vector Database Setup**: Production vector indexing in pgvector, Pinecone, or Qdrant with HNSW distance metrics.\n- **Reranking & Context Compression**: Cohere reranker or cross-encoder integration to maximize context relevance.\n- **Evaluation Benchmark Suite**: Ragas or TruLens evaluation scripts tracking faithfulness, answer relevancy, and latency.\n- **API Wrapper**: Fast, streaming FastAPI endpoint with token usage telemetry and Redis semantic caching.",
    requirements:
      "Please provide your project brief, repository access or Figma designs, and target cloud deployment environment.",
    tags: ["TypeScript", "Next.js", "Architecture", "Testing"],
    faqs: [
      {
        id: "faq-1",
        question: "Can this service be customized?",
        answer: "Yes, fully tailored to your specifications.",
      },
      {
        id: "faq-2",
        question: "Is escrow supported?",
        answer: "100% milestone protected.",
      },
      {
        id: "faq-3",
        question: "What is the turnaround time?",
        answer: "Strict adherence to agreed milestones.",
      },
    ],
  },
  {
    id: "gig-edge-max-addons",
    title: "Full-Stack Enterprise Cloud SaaS Suite with Maximum Add-on Options",
    slug: "fullstack-enterprise-cloud-suite-maximum-addons",
    category: "Programming & Tech",
    subcategory: "Web Development",
    coverImage: "/images/services/programming/cloud-saas-enterprise-suite.jpg",
    status: "active",
    createdAt: "2026-02-01",
    updatedAt: "2026-03-15",
    startingPrice: 220,
    rating: 4.99,
    reviewsCount: 42,
    stats: {
      impressions: 1250,
      clicks: 88,
      orders: 14,
      revenue: 6300,
      conversionRate: 15.9,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Starter Package",
        description: "Essential starter deliverables.",
        price: 220,
        deliveryDays: 3,
        revisions: 2,
        features: ["Foundation Code", "Documentation", "2 Revisions"],
      },
      standard: {
        name: "STANDARD",
        title: "Standard Package",
        description: "Standard production release.",
        price: 450,
        deliveryDays: 5,
        revisions: 4,
        features: ["Everything in Basic", "Unit Tests", "CI/CD Config", "4 Revisions"],
      },
      premium: {
        name: "PREMIUM",
        title: "Premium Architecture",
        description: "Comprehensive enterprise delivery with VIP SLA.",
        price: 850,
        deliveryDays: 8,
        revisions: "unlimited",
        features: [
          "Everything in Standard",
          "Docker Multi-Stage",
          "SLA Support",
          "Unlimited Revisions",
        ],
      },
    },
    description:
      "I will architect and develop a high-performance Next.js 15 application using React 19, strict TypeScript, and Tailwind CSS. Whether you're building a new SaaS platform or refactoring an existing codebase, I focus on clean component hierarchy, fast initial page loads, and seamless API integrations.\n\n### Deliverables & Scope:\n- **Production Next.js 15 Setup**: App Router architecture with optimized Server & Client Components.\n- **Strict TypeScript & Clean Code**: Zero implicit any, strict ESLint configuration, and modular folder structure.\n- **Responsive & Accessible UI**: Pixel-perfect implementation using Tailwind CSS and Radix UI primitives.\n- **State Management & Data Fetching**: TanStack Query, Server Actions, and optimistic UI updates.\n- **Database & Auth Integration**: Prisma / Drizzle ORM schema with PostgreSQL, NextAuth.js or Supabase.\n- **Testing & Deployment**: Vitest unit test suite, automated GitHub Actions CI/CD, and Vercel/Docker deployment guide.",
    requirements:
      "Please provide your project brief, repository access or Figma designs, and target cloud deployment environment.",
    tags: ["TypeScript", "Next.js", "Architecture", "Testing"],
    faqs: [
      {
        id: "faq-1",
        question: "Can this service be customized?",
        answer: "Yes, fully tailored to your specifications.",
      },
      {
        id: "faq-2",
        question: "Is escrow supported?",
        answer: "100% milestone protected.",
      },
      {
        id: "faq-3",
        question: "What is the turnaround time?",
        answer: "Strict adherence to agreed milestones.",
      },
    ],
  },
]

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
    category: "Web Development",
    subcategory: "Next.js & React 19",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
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
          "Essential Next.js & React 19 setup tailored for early-stage validation, clean code structure, and fundamental deliverables.",
        price: 250,
        deliveryDays: 2,
        revisions: 2,
        features: [
          "Core Next.js & React 19 Foundation",
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
      "Are you seeking a high-throughput, enterprise-grade Next.js & React 19 deliverable engineered for production scale?\n\nI specialize in building bulletproof platforms adhering to Clean Architecture principles, automated test coverage, and optimized performance.\n\n### What is included in this service:\n- **Full Architecture Blueprint**: Scalable modular design and clear boundaries.\n- **Modern Tooling**: Strict typing, automated formatting, and comprehensive documentation.\n- **Zero-Friction Delivery**: Milestone tracking, escrow security, and post-launch verification.",
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
    id: "gig-40",
    title: "B2B SaaS Cold Outbound Email Infrastructure & Deliverability Warmup Setup",
    slug: "b2b-saas-cold-outbound-email-infrastructure-deliverability-warmup-setup",
    category: "Technical SEO & Growth",
    subcategory: "Conversion Rate Optimization",
    coverImage:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80",
    status: "active",
    createdAt: "2026-01-13",
    updatedAt: "2026-03-15",
    startingPrice: 230,
    rating: 4.99,
    reviewsCount: 42,
    stats: {
      impressions: 787,
      clicks: 87,
      orders: 18,
      revenue: 7740,
      conversionRate: 20.7,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Starter Deliverable",
        description:
          "Essential Conversion Rate Optimization setup tailored for early-stage validation, clean code structure, and fundamental deliverables.",
        price: 230,
        deliveryDays: 2,
        revisions: 2,
        features: [
          "Core Conversion Rate Optimization Foundation",
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
        price: 430,
        deliveryDays: 4,
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
        price: 770,
        deliveryDays: 9,
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
      "Are you seeking a high-throughput, enterprise-grade Conversion Rate Optimization deliverable engineered for production scale?\n\nI specialize in building bulletproof platforms adhering to Clean Architecture principles, automated test coverage, and optimized performance.\n\n### What is included in this service:\n- **Full Architecture Blueprint**: Scalable modular design and clear boundaries.\n- **Modern Tooling**: Strict typing, automated formatting, and comprehensive documentation.\n- **Zero-Friction Delivery**: Milestone tracking, escrow security, and post-launch verification.",
    requirements:
      "Please provide your project brief, repository access or Figma designs, and target cloud deployment environment.",
    tags: ["Cold Email", "Deliverability", "DNS", "SPF/DKIM"],
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
    category: "Web Development",
    subcategory: "Cloud & DevOps",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
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
      "Comprehensive service offering for Targeted Rapid Security Code Audit & Dependency CVE Scan. Formatted to test edge conditions and interface reliability.",
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
    subcategory: "Autonomous AI Agents",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
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
      "Comprehensive service offering for Draft Experimental Quantum Computing Simulator with Qiskit & Python. Formatted to test edge conditions and interface reliability.",
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
    category: "Web Development",
    subcategory: "Next.js & React 19",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
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
      "Comprehensive service offering for Full-Stack Enterprise Cloud SaaS Suite with Maximum Add-on Options. Formatted to test edge conditions and interface reliability.",
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

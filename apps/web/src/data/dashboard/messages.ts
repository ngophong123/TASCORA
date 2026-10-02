/**
 * TASCORA Generated Seed & Mock Data: Direct Messages & Chat Threads
 *
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Conversations: 10
 * Regenerate with: npm run seed
 */

export interface MessageAttachment {
  id: string
  name: string
  size: string
  type: "code" | "pdf" | "zip" | "figma" | "image"
  url?: string
}

export interface ChatMessage {
  id: string
  senderId: "me" | string
  senderName: string
  content: string
  time: string
  date: string
  read: boolean
  attachments?: MessageAttachment[]
}

export interface ConversationPartner {
  id: string
  name: string
  title: string
  avatar: string
  online: boolean
  lastSeen?: string
  rating: number
  reviewsCount: number
  responseTime: string
  level?: "TOP_RATED" | "LEVEL_2" | "LEVEL_1"
}

export interface ConversationOrderContext {
  id: string
  title: string
  category: string
  tier: "BASIC" | "STANDARD" | "PREMIUM"
  amount: string
  escrowAmount: string
  status: "active" | "delivered" | "completed" | "cancelled"
  dueDate: string
  milestoneSummary: {
    total: number
    completed: number
    currentTitle: string
    currentAmount: string
  }
  sharedFiles: MessageAttachment[]
}

export interface Conversation {
  id: string
  partner: ConversationPartner
  order: ConversationOrderContext
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  archived?: boolean
  messages: ChatMessage[]
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    partner: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 4.99,
      reviewsCount: 42,
      responseTime: "< 30 mins",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-9481",
      title: "Next.js 15 & Node.js Production Architecture with Clean Code",
      category: "Web Development",
      tier: "STANDARD",
      amount: "$450.00",
      escrowAmount: "$450.00",
      status: "active",
      dueDate: "Tomorrow, 18:00",
      milestoneSummary: {
        total: 3,
        completed: 1,
        currentTitle: "Prisma Schema & JWT Auth Boilerplate",
        currentAmount: "$150.00",
      },
      sharedFiles: [
        {
          id: "f-1",
          name: "schema-v2.prisma",
          size: "18.4 KB",
          type: "code",
        },
        {
          id: "f-2",
          name: "docker-compose.production.yml",
          size: "4.2 KB",
          type: "code",
        },
        {
          id: "f-3",
          name: "architecture-spec-v1.pdf",
          size: "2.4 MB",
          type: "pdf",
        },
      ],
    },
    lastMessage:
      "I've pushed the architecture documentation and unit test suite. We are right on schedule for tomorrow's deploy.",
    lastMessageTime: "10m ago",
    unreadCount: 1,
    messages: [
      {
        id: "m-101",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content:
          "Hi Marcus! Thanks for selecting the Standard Production Monorepo package. I've initialized the pnpm workspace with Next.js 15 App Router.",
        time: "14:15",
        date: "Mar 18",
        read: true,
      },
      {
        id: "m-102",
        senderId: "me",
        senderName: "Marcus Thorne",
        content:
          "Awesome Alexandre. Please ensure the PostgreSQL schema handles multi-tenant tenantId scoping across all database queries.",
        time: "14:32",
        date: "Mar 18",
        read: true,
      },
      {
        id: "m-103",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content:
          "Understood. Milestone 1 blueprint is ready for sign-off. I attached the Prisma schema below.",
        time: "17:05",
        date: "Mar 19",
        read: true,
        attachments: [
          {
            id: "f-1",
            name: "schema-v2.prisma",
            size: "18.4 KB",
            type: "code",
          },
        ],
      },
      {
        id: "m-104",
        senderId: "me",
        senderName: "Marcus Thorne",
        content:
          "Reviewed and approved Milestone 1. Escrow released for $150. Please proceed with Milestone 2.",
        time: "09:40",
        date: "Mar 20",
        read: true,
      },
      {
        id: "m-105",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content:
          "I've pushed the architecture documentation and unit test suite. We are right on schedule for tomorrow's deploy.",
        time: "11:20",
        date: "Today",
        read: false,
      },
    ],
  },
  {
    id: "conv-2",
    partner: {
      id: "f-2",
      name: "Helena Rostova",
      title: "Principal Brand & Product Designer",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 5,
      reviewsCount: 38,
      responseTime: "< 15 mins",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-9420",
      title: "Figma to Production Design System with Tokens and Atomic Components",
      category: "UI/UX & Design",
      tier: "STANDARD",
      amount: "$350.00",
      escrowAmount: "$350.00",
      status: "delivered",
      dueDate: "Mar 20, 2026",
      milestoneSummary: {
        total: 2,
        completed: 1,
        currentTitle: "Interactive Components & Documentation",
        currentAmount: "$175.00",
      },
      sharedFiles: [
        {
          id: "f-4",
          name: "fintech-design-system.figma",
          size: "34.2 MB",
          type: "figma",
        },
        {
          id: "f-5",
          name: "token-specifications.pdf",
          size: "4.8 MB",
          type: "pdf",
        },
      ],
    },
    lastMessage:
      "Complete Figma design library published with interactive component variants. Ready for final review!",
    lastMessageTime: "2h ago",
    unreadCount: 1,
    messages: [
      {
        id: "m-201",
        senderId: "f-2",
        senderName: "Helena Rostova",
        content:
          "Hello Marcus! The global color palette, semantic token aliases, and typography scale are finalized.",
        time: "10:15",
        date: "Mar 13",
        read: true,
      },
      {
        id: "m-202",
        senderId: "me",
        senderName: "Marcus Thorne",
        content:
          "Looks stunning Helena! Does the button component variant include loading states and focus-visible rings?",
        time: "11:00",
        date: "Mar 14",
        read: true,
      },
      {
        id: "m-203",
        senderId: "f-2",
        senderName: "Helena Rostova",
        content:
          "Yes, fully interactive with auto-layout v5, keyboard navigation focus rings, and dark mode variants.",
        time: "15:30",
        date: "Mar 15",
        read: true,
      },
      {
        id: "m-204",
        senderId: "f-2",
        senderName: "Helena Rostova",
        content:
          "Complete Figma design library published with interactive component variants. Ready for final review!",
        time: "14:10",
        date: "Today",
        read: false,
        attachments: [
          {
            id: "f-4",
            name: "fintech-design-system.figma",
            size: "34.2 MB",
            type: "figma",
          },
        ],
      },
    ],
  },
  {
    id: "conv-3",
    partner: {
      id: "f-3",
      name: "Marcus Vance",
      title: "AI Engineer & Research Lead",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastSeen: "2 hours ago",
      rating: 4.96,
      reviewsCount: 29,
      responseTime: "< 45 mins",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-9412",
      title: "Production RAG Agent with Hybrid Search and Evals",
      category: "AI & Automation",
      tier: "STANDARD",
      amount: "$600.00",
      escrowAmount: "$600.00",
      status: "completed",
      dueDate: "Mar 10, 2026",
      milestoneSummary: {
        total: 2,
        completed: 2,
        currentTitle: "Hybrid Retrieval & Ragas Evals",
        currentAmount: "$300.00",
      },
      sharedFiles: [
        {
          id: "f-6",
          name: "rag-engine.zip",
          size: "18.1 MB",
          type: "zip",
        },
        {
          id: "f-7",
          name: "ragas-eval-metrics.pdf",
          size: "3.2 MB",
          type: "pdf",
        },
      ],
    },
    lastMessage:
      "Client sign-off confirmed and payment released. Thank you for the great collaboration!",
    lastMessageTime: "3d ago",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-301",
        senderId: "f-3",
        senderName: "Marcus Vance",
        content:
          "David, chunking pipeline is live. Tested with 150 financial disclosures with dense OpenAI embeddings.",
        time: "09:30",
        date: "Mar 03",
        read: true,
      },
      {
        id: "m-302",
        senderId: "me",
        senderName: "David Sterling",
        content: "What was the retrieval latency on 10k token queries?",
        time: "10:15",
        date: "Mar 04",
        read: true,
      },
      {
        id: "m-303",
        senderId: "f-3",
        senderName: "Marcus Vance",
        content:
          "Averaging 142ms using Qdrant vector index with BM25 hybrid reranking. Evaluation report attached.",
        time: "16:20",
        date: "Mar 09",
        read: true,
        attachments: [
          {
            id: "f-7",
            name: "ragas-eval-metrics.pdf",
            size: "3.2 MB",
            type: "pdf",
          },
        ],
      },
      {
        id: "m-304",
        senderId: "me",
        senderName: "David Sterling",
        content:
          "Client sign-off confirmed and payment released. Thank you for the great collaboration!",
        time: "11:00",
        date: "Mar 10",
        read: true,
      },
    ],
  },
  {
    id: "conv-4",
    partner: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 4.99,
      reviewsCount: 42,
      responseTime: "< 30 mins",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-EDGE-1",
      title: "Microservices Architecture Audit & Penetration Hardening",
      category: "Web Development",
      tier: "BASIC",
      amount: "$350.00",
      escrowAmount: "$350.00",
      status: "cancelled",
      dueDate: "Cancelled",
      milestoneSummary: {
        total: 1,
        completed: 0,
        currentTitle: "Penetration Hardening Scope",
        currentAmount: "$350.00",
      },
      sharedFiles: [],
    },
    lastMessage:
      "Mutual contract cancellation processed. Escrow refund of $350 has been returned to your wallet.",
    lastMessageTime: "Jan 30",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-401",
        senderId: "me",
        senderName: "Emily Zhang",
        content:
          "Alexandre, we need live DDoS simulation tests included in this audit deliverable.",
        time: "11:20",
        date: "Jan 25",
        read: true,
      },
      {
        id: "m-402",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content:
          "Emily, live offensive penetration attacks are outside the agreed scope for the Basic Architecture Audit. I can perform static vulnerability analysis and AST security scans.",
        time: "13:00",
        date: "Jan 26",
        read: true,
      },
      {
        id: "m-403",
        senderId: "me",
        senderName: "Emily Zhang",
        content:
          "If active attacks cannot be performed, we would prefer to cancel and request an escrow refund.",
        time: "15:45",
        date: "Jan 28",
        read: true,
      },
      {
        id: "m-404",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content:
          "Understood. I have accepted the cancellation request. Mutual contract cancellation processed. Escrow refund of $350 has been returned to your wallet.",
        time: "09:30",
        date: "Jan 30",
        read: true,
      },
    ],
  },
  {
    id: "conv-5",
    partner: {
      id: "usr-client-2",
      name: "David Sterling",
      title: "Managing Director • Apex Capital Ventures",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastSeen: "Yesterday",
      rating: 5,
      reviewsCount: 14,
      responseTime: "< 1 hour",
    },
    order: {
      id: "ORD-EDGE-2",
      title: "Enterprise Multi-Region AWS Infrastructure & SOC2 Cutover",
      category: "Web Development",
      tier: "PREMIUM",
      amount: "$5,200.00",
      escrowAmount: "$5,200.00",
      status: "completed",
      dueDate: "Jan 15, 2026",
      milestoneSummary: {
        total: 5,
        completed: 5,
        currentTitle: "SOC2 Compliance & Production Traffic Cutover",
        currentAmount: "$1,200.00",
      },
      sharedFiles: [
        {
          id: "f-8",
          name: "soc2-compliance-report.pdf",
          size: "12.8 MB",
          type: "pdf",
        },
        {
          id: "f-9",
          name: "terraform-iac-configs.zip",
          size: "45.1 MB",
          type: "zip",
        },
      ],
    },
    lastMessage:
      "All 5 enterprise infrastructure milestones complete. Cutover executed with zero downtime. SOC2 compliance audit passes 100%.",
    lastMessageTime: "Jan 15",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-501",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content:
          "David, Terraform modular templates for AWS EKS, RDS Multi-AZ, and WAF rules are prepared.",
        time: "10:00",
        date: "Jan 03",
        read: true,
      },
      {
        id: "m-502",
        senderId: "usr-client-2",
        senderName: "David Sterling",
        content:
          "Excellent Alexandre. Security auditors from Vanta will be reviewing the infrastructure this Thursday.",
        time: "14:20",
        date: "Jan 08",
        read: true,
      },
      {
        id: "m-503",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content:
          "All 5 enterprise infrastructure milestones complete. Cutover executed with zero downtime. SOC2 compliance audit passes 100%.",
        time: "17:15",
        date: "Jan 14",
        read: true,
        attachments: [
          {
            id: "f-8",
            name: "soc2-compliance-report.pdf",
            size: "12.8 MB",
            type: "pdf",
          },
        ],
      },
    ],
  },
  {
    id: "conv-6",
    partner: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      title: "CTO • Nova Dynamics AI",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 4.9,
      reviewsCount: 9,
      responseTime: "< 20 mins",
    },
    order: {
      id: "ORD-EDGE-4",
      title: "B2B SaaS Multi-Tenant Billing System & Stripe Webhook Engine",
      category: "Web Development",
      tier: "STANDARD",
      amount: "$485.00",
      escrowAmount: "$485.00",
      status: "active",
      dueDate: "Mar 26, 2026",
      milestoneSummary: {
        total: 2,
        completed: 1,
        currentTitle: "Webhook Idempotency & Customer Portal UI",
        currentAmount: "$245.00",
      },
      sharedFiles: [
        {
          id: "f-10",
          name: "stripe-integration-patch.zip",
          size: "11.2 MB",
          type: "zip",
        },
      ],
    },
    lastMessage: "Updated webhook retry logic and added exponential backoff idempotency handling.",
    lastMessageTime: "Mar 23",
    unreadCount: 0,
    messages: [
      {
        id: "m-601",
        senderId: "usr-client-5",
        senderName: "Liam O'Connor",
        content: "Please add prorated calculation preview for mid-cycle plan downgrades.",
        time: "10:15",
        date: "Mar 16",
        read: true,
      },
      {
        id: "m-602",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "Implemented prorated preview and verified Stripe webhook event handling.",
        time: "16:40",
        date: "Mar 18",
        read: true,
      },
      {
        id: "m-603",
        senderId: "usr-client-5",
        senderName: "Liam O'Connor",
        content: "Need idempotency key check to guard against duplicate webhook delivery.",
        time: "11:30",
        date: "Mar 22",
        read: true,
      },
      {
        id: "m-604",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "Updated webhook retry logic and added exponential backoff idempotency handling.",
        time: "14:15",
        date: "Mar 23",
        read: true,
        attachments: [
          {
            id: "f-10",
            name: "stripe-integration-patch.zip",
            size: "11.2 MB",
            type: "zip",
          },
        ],
      },
    ],
  },
  {
    id: "conv-7",
    partner: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Junior Full-Stack Engineer",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 0,
      reviewsCount: 0,
      responseTime: "< 15 mins",
      level: "LEVEL_1",
    },
    order: {
      id: "ORD-EDGE-5",
      title: "Brand-New Technical Audit Kickoff",
      category: "Web Development",
      tier: "BASIC",
      amount: "$350.00",
      escrowAmount: "$350.00",
      status: "active",
      dueDate: "Mar 29, 2026",
      milestoneSummary: {
        total: 2,
        completed: 0,
        currentTitle: "Repository Setup & Dependency CVE Scan",
        currentAmount: "$175.00",
      },
      sharedFiles: [],
    },
    lastMessage:
      "Thank you for the opportunity Marcus! Repository cloned successfully. Running preliminary npm audit now.",
    lastMessageTime: "Mar 24",
    unreadCount: 1,
    messages: [
      {
        id: "m-701",
        senderId: "me",
        senderName: "Marcus Thorne",
        content:
          "Welcome to TASCORA Oliver. I invited you to the GitHub repository as a collaborator.",
        time: "14:00",
        date: "Mar 24",
        read: true,
      },
      {
        id: "m-702",
        senderId: "usr-edge-brandnew",
        senderName: "Oliver Bennett",
        content:
          "Thank you for the opportunity Marcus! Repository cloned successfully. Running preliminary npm audit now.",
        time: "14:25",
        date: "Mar 24",
        read: false,
      },
    ],
  },
  {
    id: "conv-8",
    partner: {
      id: "f-4",
      name: "Sophia Lindqvist",
      title: "B2B SaaS Growth & SEO Strategist",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastSeen: "3 hours ago",
      rating: 4.94,
      reviewsCount: 51,
      responseTime: "< 1 hour",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-9390",
      title: "Enterprise Core Web Vitals and Technical SEO Audit with Remediation",
      category: "Technical SEO & Growth",
      tier: "STANDARD",
      amount: "$280.00",
      escrowAmount: "$280.00",
      status: "cancelled",
      dueDate: "Cancelled",
      milestoneSummary: {
        total: 2,
        completed: 1,
        currentTitle: "Technical Site Crawl & LCP Profiling",
        currentAmount: "$140.00",
      },
      sharedFiles: [],
    },
    lastMessage:
      "Client internal restructuring paused external SEO marketing campaigns; mutual cancellation confirmed.",
    lastMessageTime: "Feb 18",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-801",
        senderId: "f-4",
        senderName: "Sophia Lindqvist",
        content: "LCP profiling finished. Found image decode delays on the homepage hero banner.",
        time: "11:00",
        date: "Feb 16",
        read: true,
      },
      {
        id: "m-802",
        senderId: "me",
        senderName: "Marcus Thorne",
        content:
          "Client internal restructuring paused external SEO marketing campaigns; mutual cancellation confirmed.",
        time: "15:20",
        date: "Feb 18",
        read: true,
      },
    ],
  },
  {
    id: "conv-9",
    partner: {
      id: "usr-edge-fast-response",
      name: "Chloe Nguyen (Minh Chau)",
      title: "Senior Cloud & DevOps Engineer",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 5,
      reviewsCount: 74,
      responseTime: "0-day (< 15 mins)",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-8015",
      title: "Docker Compose & Cloud Infrastructure Optimization",
      category: "Web Development",
      tier: "STANDARD",
      amount: "$420.00",
      escrowAmount: "$420.00",
      status: "completed",
      dueDate: "Completed",
      milestoneSummary: {
        total: 2,
        completed: 2,
        currentTitle: "Container Size Reduction & Multi-Stage Builds",
        currentAmount: "$210.00",
      },
      sharedFiles: [
        {
          id: "f-11",
          name: "optimized-dockerfile.zip",
          size: "3.5 MB",
          type: "zip",
        },
      ],
    },
    lastMessage:
      "Reduced Docker image size from 1.8GB to 142MB with Alpine Linux and multi-stage builds. Production ready!",
    lastMessageTime: "1d ago",
    unreadCount: 0,
    messages: [
      {
        id: "m-901",
        senderId: "usr-edge-fast-response",
        senderName: "Chloe Nguyen",
        content:
          "Reduced Docker image size from 1.8GB to 142MB with Alpine Linux and multi-stage builds. Production ready!",
        time: "10:30",
        date: "Yesterday",
        read: true,
      },
    ],
  },
  {
    id: "conv-10",
    partner: {
      id: "usr-client-4",
      name: "Rachel Adams",
      title: "Head of Product • Horizon Health Technologies",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastSeen: "4 hours ago",
      rating: 4.95,
      reviewsCount: 11,
      responseTime: "< 30 mins",
    },
    order: {
      id: "ORD-EDGE-3",
      title: "Next.js Production Architecture with 24-Hour Express Delivery",
      category: "Web Development",
      tier: "BASIC",
      amount: "$300.00",
      escrowAmount: "$300.00",
      status: "completed",
      dueDate: "Mar 22, 2026",
      milestoneSummary: {
        total: 1,
        completed: 1,
        currentTitle: "Express 24-Hour Scaffold Handover",
        currentAmount: "$300.00",
      },
      sharedFiles: [
        {
          id: "f-12",
          name: "express-demo-code.zip",
          size: "8.4 MB",
          type: "zip",
        },
      ],
    },
    lastMessage:
      "Investor demo was a massive success! Thank you for delivering in under 18 hours Alexandre.",
    lastMessageTime: "Mar 22",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-1001",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "Rachel, your express demo scaffold is ready and deployed to preview URL.",
        time: "08:15",
        date: "Mar 22",
        read: true,
        attachments: [
          {
            id: "f-12",
            name: "express-demo-code.zip",
            size: "8.4 MB",
            type: "zip",
          },
        ],
      },
      {
        id: "m-1002",
        senderId: "usr-client-4",
        senderName: "Rachel Adams",
        content:
          "Investor demo was a massive success! Thank you for delivering in under 18 hours Alexandre.",
        time: "18:30",
        date: "Mar 22",
        read: true,
      },
    ],
  },
]

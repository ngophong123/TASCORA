import * as fs from "fs"
import * as path from "path"
import type { UserProfile } from "./generate-seed-data"
import type { DashboardOrder } from "./phase3-generators"

// ---------------------------------------------------------------------------
// 1. TYPE DEFINITIONS FOR MESSAGES & CHAT
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 2. TYPE DEFINITIONS FOR NOTIFICATIONS
// ---------------------------------------------------------------------------
export type NotificationType = "order" | "message" | "payment" | "system"

export interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: NotificationType
  href?: string
  role: "CLIENT" | "FREELANCER" | "BOTH"
}

// ---------------------------------------------------------------------------
// 3. TYPE DEFINITIONS FOR PAYMENTS & TRANSACTIONS
// ---------------------------------------------------------------------------
export type TransactionType =
  | "ORDER_PAYMENT"
  | "WITHDRAWAL"
  | "ESCROW_HELD"
  | "ESCROW_DEPOSIT"
  | "PLATFORM_FEE"
  | "REFUND"

export type TransactionStatus = "COMPLETED" | "PENDING" | "PROCESSING" | "FAILED"

export interface TransactionRecord {
  id: string
  date: string
  timestamp: string
  type: TransactionType
  description: string
  orderId?: string
  orderTitle?: string
  counterpartName?: string
  method: string
  status: TransactionStatus
  amount: number
  fee?: number
  netAmount: number
  invoiceUrl?: string
}

export interface RevenueMonthPoint {
  month: string
  gross: number
  net: number
  ordersCount: number
}

export interface ClientSpendingMonthPoint {
  month: string
  spent: number
  escrow: number
  projectsCount: number
}

export interface PaymentMethodItem {
  id: string
  type: "card" | "paypal" | "bank"
  brand?: string
  last4?: string
  expDate?: string
  email?: string
  bankName?: string
  isDefault: boolean
}

export interface FreelancerEarningsSummary {
  availableBalance: number
  pendingClearance: number
  withdrawnTotal: number
  inEscrowActive: number
  avgMonthlyEarnings: number
  bestMonthAmount: number
  bestMonthLabel: string
  growthMomPercent: number
}

export interface ClientPaymentsSummary {
  totalSpent: number
  fundsInEscrow: number
  availableCredits: number
  activeContractsCount: number
  invoicesCount: number
}

export interface PaymentsDataBundle {
  freelancerSummary: FreelancerEarningsSummary
  freelancerRevenueChart: RevenueMonthPoint[]
  freelancerTransactions: TransactionRecord[]
  clientSummary: ClientPaymentsSummary
  clientSpendingChart: ClientSpendingMonthPoint[]
  clientPaymentMethods: PaymentMethodItem[]
  clientInvoices: TransactionRecord[]
}

// ---------------------------------------------------------------------------
// 4. GENERATE CONVERSATIONS (10 TOTAL)
// ---------------------------------------------------------------------------
export function generateAllConversations(
  allOrders: DashboardOrder[],
  allUsers: UserProfile[]
): Conversation[] {
  const conversations: Conversation[] = []

  // conv-1: Reference Order ORD-9481 (Alexandre Moreau & Marcus Thorne)
  conversations.push({
    id: "conv-1",
    partner: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "/images/avatars/alexandre-moreau.jpg",
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
        { id: "f-1", name: "schema-v2.prisma", size: "18.4 KB", type: "code" },
        { id: "f-2", name: "docker-compose.production.yml", size: "4.2 KB", type: "code" },
        { id: "f-3", name: "architecture-spec-v1.pdf", size: "2.4 MB", type: "pdf" },
      ],
    },
    lastMessage: "I've pushed the architecture documentation and unit test suite. We are right on schedule for tomorrow's deploy.",
    lastMessageTime: "10m ago",
    unreadCount: 1,
    messages: [
      {
        id: "m-101",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "Hi Marcus! Thanks for selecting the Standard Production Monorepo package. I've initialized the pnpm workspace with Next.js 15 App Router.",
        time: "14:15",
        date: "Mar 18",
        read: true,
      },
      {
        id: "m-102",
        senderId: "me",
        senderName: "Marcus Thorne",
        content: "Awesome Alexandre. Please ensure the PostgreSQL schema handles multi-tenant tenantId scoping across all database queries.",
        time: "14:32",
        date: "Mar 18",
        read: true,
      },
      {
        id: "m-103",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "Understood. Milestone 1 blueprint is ready for sign-off. I attached the Prisma schema below.",
        time: "17:05",
        date: "Mar 19",
        read: true,
        attachments: [
          { id: "f-1", name: "schema-v2.prisma", size: "18.4 KB", type: "code" },
        ],
      },
      {
        id: "m-104",
        senderId: "me",
        senderName: "Marcus Thorne",
        content: "Reviewed and approved Milestone 1. Escrow released for $150. Please proceed with Milestone 2.",
        time: "09:40",
        date: "Mar 20",
        read: true,
      },
      {
        id: "m-105",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "I've pushed the architecture documentation and unit test suite. We are right on schedule for tomorrow's deploy.",
        time: "11:20",
        date: "Today",
        read: false,
      },
    ],
  })

  // conv-2: Reference Order ORD-9420 (Helena Rostova & Marcus Thorne)
  conversations.push({
    id: "conv-2",
    partner: {
      id: "f-2",
      name: "Helena Rostova",
      title: "Principal Brand & Product Designer",
      avatar: "/images/avatars/helena-rostova.jpg",
      online: true,
      lastSeen: "Active now",
      rating: 5.0,
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
        { id: "f-4", name: "fintech-design-system.figma", size: "34.2 MB", type: "figma" },
        { id: "f-5", name: "token-specifications.pdf", size: "4.8 MB", type: "pdf" },
      ],
    },
    lastMessage: "Complete Figma design library published with interactive component variants. Ready for final review!",
    lastMessageTime: "2h ago",
    unreadCount: 1,
    messages: [
      {
        id: "m-201",
        senderId: "f-2",
        senderName: "Helena Rostova",
        content: "Hello Marcus! The global color palette, semantic token aliases, and typography scale are finalized.",
        time: "10:15",
        date: "Mar 13",
        read: true,
      },
      {
        id: "m-202",
        senderId: "me",
        senderName: "Marcus Thorne",
        content: "Looks stunning Helena! Does the button component variant include loading states and focus-visible rings?",
        time: "11:00",
        date: "Mar 14",
        read: true,
      },
      {
        id: "m-203",
        senderId: "f-2",
        senderName: "Helena Rostova",
        content: "Yes, fully interactive with auto-layout v5, keyboard navigation focus rings, and dark mode variants.",
        time: "15:30",
        date: "Mar 15",
        read: true,
      },
      {
        id: "m-204",
        senderId: "f-2",
        senderName: "Helena Rostova",
        content: "Complete Figma design library published with interactive component variants. Ready for final review!",
        time: "14:10",
        date: "Today",
        read: false,
        attachments: [
          { id: "f-4", name: "fintech-design-system.figma", size: "34.2 MB", type: "figma" },
        ],
      },
    ],
  })

  // conv-3: Reference Order ORD-9412 (Marcus Vance & David Sterling)
  conversations.push({
    id: "conv-3",
    partner: {
      id: "f-3",
      name: "Marcus Vance",
      title: "AI Engineer & Research Lead",
      avatar: "/images/avatars/dmitri-volkov.jpg",
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
        { id: "f-6", name: "rag-engine.zip", size: "18.1 MB", type: "zip" },
        { id: "f-7", name: "ragas-eval-metrics.pdf", size: "3.2 MB", type: "pdf" },
      ],
    },
    lastMessage: "Client sign-off confirmed and payment released. Thank you for the great collaboration!",
    lastMessageTime: "3d ago",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-301",
        senderId: "f-3",
        senderName: "Marcus Vance",
        content: "David, chunking pipeline is live. Tested with 150 financial disclosures with dense OpenAI embeddings.",
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
        content: "Averaging 142ms using Qdrant vector index with BM25 hybrid reranking. Evaluation report attached.",
        time: "16:20",
        date: "Mar 09",
        read: true,
        attachments: [
          { id: "f-7", name: "ragas-eval-metrics.pdf", size: "3.2 MB", type: "pdf" },
        ],
      },
      {
        id: "m-304",
        senderId: "me",
        senderName: "David Sterling",
        content: "Client sign-off confirmed and payment released. Thank you for the great collaboration!",
        time: "11:00",
        date: "Mar 10",
        read: true,
      },
    ],
  })

  // conv-4: Disputed Order ORD-EDGE-1 (Alexandre Moreau & Emily Zhang)
  conversations.push({
    id: "conv-4",
    partner: {
      id: "f-1",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "/images/avatars/alexandre-moreau.jpg",
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
    lastMessage: "Mutual contract cancellation processed. Escrow refund of $350 has been returned to your wallet.",
    lastMessageTime: "Jan 30",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-401",
        senderId: "me",
        senderName: "Emily Zhang",
        content: "Alexandre, we need live DDoS simulation tests included in this audit deliverable.",
        time: "11:20",
        date: "Jan 25",
        read: true,
      },
      {
        id: "m-402",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "Emily, live offensive penetration attacks are outside the agreed scope for the Basic Architecture Audit. I can perform static vulnerability analysis and AST security scans.",
        time: "13:00",
        date: "Jan 26",
        read: true,
      },
      {
        id: "m-403",
        senderId: "me",
        senderName: "Emily Zhang",
        content: "If active attacks cannot be performed, we would prefer to cancel and request an escrow refund.",
        time: "15:45",
        date: "Jan 28",
        read: true,
      },
      {
        id: "m-404",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "Understood. I have accepted the cancellation request. Mutual contract cancellation processed. Escrow refund of $350 has been returned to your wallet.",
        time: "09:30",
        date: "Jan 30",
        read: true,
      },
    ],
  })

  // conv-5: Enterprise Order ORD-EDGE-2 (Alexandre Moreau & David Sterling)
  conversations.push({
    id: "conv-5",
    partner: {
      id: "usr-client-2",
      name: "David Sterling",
      title: "Managing Director • Apex Capital Ventures",
      avatar: "/images/avatars/david-sterling.jpg",
      online: false,
      lastSeen: "Yesterday",
      rating: 5.0,
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
        { id: "f-8", name: "soc2-compliance-report.pdf", size: "12.8 MB", type: "pdf" },
        { id: "f-9", name: "terraform-iac-configs.zip", size: "45.1 MB", type: "zip" },
      ],
    },
    lastMessage: "All 5 enterprise infrastructure milestones complete. Cutover executed with zero downtime. SOC2 compliance audit passes 100%.",
    lastMessageTime: "Jan 15",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-501",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "David, Terraform modular templates for AWS EKS, RDS Multi-AZ, and WAF rules are prepared.",
        time: "10:00",
        date: "Jan 03",
        read: true,
      },
      {
        id: "m-502",
        senderId: "usr-client-2",
        senderName: "David Sterling",
        content: "Excellent Alexandre. Security auditors from Vanta will be reviewing the infrastructure this Thursday.",
        time: "14:20",
        date: "Jan 08",
        read: true,
      },
      {
        id: "m-503",
        senderId: "f-1",
        senderName: "Alexandre Moreau",
        content: "All 5 enterprise infrastructure milestones complete. Cutover executed with zero downtime. SOC2 compliance audit passes 100%.",
        time: "17:15",
        date: "Jan 14",
        read: true,
        attachments: [
          { id: "f-8", name: "soc2-compliance-report.pdf", size: "12.8 MB", type: "pdf" },
        ],
      },
    ],
  })

  // conv-6: Multi-Revision Order ORD-EDGE-4 (Alexandre Moreau & Liam O'Connor)
  conversations.push({
    id: "conv-6",
    partner: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      title: "CTO • Nova Dynamics AI",
      avatar: "/images/avatars/client-marcus.jpg",
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
        { id: "f-10", name: "stripe-integration-patch.zip", size: "11.2 MB", type: "zip" },
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
          { id: "f-10", name: "stripe-integration-patch.zip", size: "11.2 MB", type: "zip" },
        ],
      },
    ],
  })

  // conv-7: Fresh Order ORD-EDGE-5 (Oliver Bennett & Marcus Thorne)
  conversations.push({
    id: "conv-7",
    partner: {
      id: "usr-edge-brandnew",
      name: "Oliver Bennett",
      title: "Junior Full-Stack Engineer",
      avatar: "/images/avatars/chloe-laurent.jpg",
      online: true,
      lastSeen: "Active now",
      rating: 0.0,
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
    lastMessage: "Thank you for the opportunity Marcus! Repository cloned successfully. Running preliminary npm audit now.",
    lastMessageTime: "Mar 24",
    unreadCount: 1,
    messages: [
      {
        id: "m-701",
        senderId: "me",
        senderName: "Marcus Thorne",
        content: "Welcome to TASCORA Oliver. I invited you to the GitHub repository as a collaborator.",
        time: "14:00",
        date: "Mar 24",
        read: true,
      },
      {
        id: "m-702",
        senderId: "usr-edge-brandnew",
        senderName: "Oliver Bennett",
        content: "Thank you for the opportunity Marcus! Repository cloned successfully. Running preliminary npm audit now.",
        time: "14:25",
        date: "Mar 24",
        read: false,
      },
    ],
  })

  // conv-8: SEO Audit (Sophia Lindqvist f-4 & Marcus Thorne)
  conversations.push({
    id: "conv-8",
    partner: {
      id: "f-4",
      name: "Sophia Lindqvist",
      title: "B2B SaaS Growth & SEO Strategist",
      avatar: "/images/avatars/rachel-adams.jpg",
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
    lastMessage: "Client internal restructuring paused external SEO marketing campaigns; mutual cancellation confirmed.",
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
        content: "Client internal restructuring paused external SEO marketing campaigns; mutual cancellation confirmed.",
        time: "15:20",
        date: "Feb 18",
        read: true,
      },
    ],
  })

  // conv-9: Fast Response Specialist Chloe Nguyen (usr-edge-fast-response & Marcus Thorne)
  conversations.push({
    id: "conv-9",
    partner: {
      id: "usr-edge-fast-response",
      name: "Chloe Nguyen (Minh Chau)",
      title: "Senior Cloud & DevOps Engineer",
      avatar: "/images/avatars/alexandre-moreau.jpg",
      online: true,
      lastSeen: "Active now",
      rating: 5.0,
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
        { id: "f-11", name: "optimized-dockerfile.zip", size: "3.5 MB", type: "zip" },
      ],
    },
    lastMessage: "Reduced Docker image size from 1.8GB to 142MB with Alpine Linux and multi-stage builds. Production ready!",
    lastMessageTime: "1d ago",
    unreadCount: 0,
    messages: [
      {
        id: "m-901",
        senderId: "usr-edge-fast-response",
        senderName: "Chloe Nguyen",
        content: "Reduced Docker image size from 1.8GB to 142MB with Alpine Linux and multi-stage builds. Production ready!",
        time: "10:30",
        date: "Yesterday",
        read: true,
      },
    ],
  })

  // conv-10: Rapid 24-Hour Order ORD-EDGE-3 (Alexandre Moreau & Rachel Adams)
  conversations.push({
    id: "conv-10",
    partner: {
      id: "usr-client-4",
      name: "Rachel Adams",
      title: "Head of Product • Horizon Health Technologies",
      avatar: "/images/avatars/helena-rostova.jpg",
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
        { id: "f-12", name: "express-demo-code.zip", size: "8.4 MB", type: "zip" },
      ],
    },
    lastMessage: "Investor demo was a massive success! Thank you for delivering in under 18 hours Alexandre.",
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
          { id: "f-12", name: "express-demo-code.zip", size: "8.4 MB", type: "zip" },
        ],
      },
      {
        id: "m-1002",
        senderId: "usr-client-4",
        senderName: "Rachel Adams",
        content: "Investor demo was a massive success! Thank you for delivering in under 18 hours Alexandre.",
        time: "18:30",
        date: "Mar 22",
        read: true,
      },
    ],
  })

  return conversations
}

// ---------------------------------------------------------------------------
// 5. GENERATE NOTIFICATIONS (16 TOTAL)
// ---------------------------------------------------------------------------
export function generateAllNotifications(
  allOrders: DashboardOrder[],
  allUsers: UserProfile[]
): NotificationItem[] {
  return [
    {
      id: "notif-1",
      title: "Milestone payment approved",
      description: "Marcus Thorne approved Milestone 1 ($150.00) for ORD-9481. Funds released to your wallet.",
      timestamp: "10 minutes ago",
      read: false,
      type: "payment",
      href: "/dashboard/orders",
      role: "FREELANCER",
    },
    {
      id: "notif-2",
      title: "New order received!",
      description: "David Sterling placed an enterprise order ORD-EDGE-2 ($5,200.00) with 5 escrow milestones.",
      timestamp: "1 hour ago",
      read: false,
      type: "order",
      href: "/dashboard/orders",
      role: "FREELANCER",
    },
    {
      id: "notif-3",
      title: "New message from Helena Rostova",
      description: "'Complete Figma design library published with interactive component variants.'",
      timestamp: "2 hours ago",
      read: false,
      type: "message",
      href: "/dashboard/messages",
      role: "BOTH",
    },
    {
      id: "notif-4",
      title: "Order delivered for review",
      description: "Helena Rostova submitted deliverable files for 'Figma to Production Design System' (ORD-9420).",
      timestamp: "4 hours ago",
      read: false,
      type: "order",
      href: "/dashboard/orders",
      role: "CLIENT",
    },
    {
      id: "notif-5",
      title: "Milestone Escrow funded",
      description: "Your escrow deposit of $350.00 for Milestone 1 of ORD-EDGE-5 is securely locked.",
      timestamp: "Yesterday",
      read: true,
      type: "payment",
      href: "/dashboard/payments",
      role: "CLIENT",
    },
    {
      id: "notif-6",
      title: "Profile strength updated",
      description: "You unlocked the TOP RATED Specialist badge! Your search visibility increased by 45%.",
      timestamp: "2 days ago",
      read: true,
      type: "system",
      href: "/dashboard",
      role: "FREELANCER",
    },
    {
      id: "notif-7",
      title: "Revision requested",
      description: "Liam O'Connor requested Revision #3 for ORD-EDGE-4: 'Need idempotency key check'.",
      timestamp: "3 days ago",
      read: true,
      type: "order",
      href: "/dashboard/orders",
      role: "FREELANCER",
    },
    {
      id: "notif-8",
      title: "Escrow refund confirmed",
      description: "Mutual cancellation processed for ORD-EDGE-1. $350.00 returned to your payment balance.",
      timestamp: "Jan 30",
      read: true,
      type: "payment",
      href: "/dashboard/payments",
      role: "CLIENT",
    },
    {
      id: "notif-9",
      title: "5-Star Review Received",
      description: "Marcus Thorne left a glowing 5-star review: 'Cleanest, most maintainable Next.js 15 enterprise architecture...'",
      timestamp: "3 weeks ago",
      read: true,
      type: "system",
      href: "/dashboard",
      role: "FREELANCER",
    },
    {
      id: "notif-10",
      title: "Payout transfer initiated",
      description: "Instant payout of $1,500.00 sent to Stripe Express Account ending in •••• 4242.",
      timestamp: "Mar 18",
      read: true,
      type: "payment",
      href: "/dashboard/earnings",
      role: "FREELANCER",
    },
    {
      id: "notif-11",
      title: "New contract signed",
      description: "Rachel Adams signed 24-Hour Express Order ORD-EDGE-3 ($300.00).",
      timestamp: "Mar 21",
      read: true,
      type: "order",
      href: "/dashboard/orders",
      role: "FREELANCER",
    },
    {
      id: "notif-12",
      title: "SOC2 Compliance Report Verified",
      description: "Auditor from Vanta approved infrastructure artifact for ORD-EDGE-2 ($5,200.00).",
      timestamp: "Jan 14",
      read: true,
      type: "system",
      href: "/dashboard/orders",
      role: "BOTH",
    },
    {
      id: "notif-13",
      title: "New message from Alexandre Moreau",
      description: "'I have pushed the architecture documentation and unit test suite.'",
      timestamp: "10m ago",
      read: false,
      type: "message",
      href: "/dashboard/messages",
      role: "CLIENT",
    },
    {
      id: "notif-14",
      title: "Invoice #INV-2026-091 ready",
      description: "Tax invoice for Order ORD-9481 ($450.00) is ready for download in PDF format.",
      timestamp: "Mar 18",
      read: true,
      type: "payment",
      href: "/dashboard/payments",
      role: "CLIENT",
    },
    {
      id: "notif-15",
      title: "New message from Oliver Bennett",
      description: "'Repository cloned successfully. Running preliminary npm audit now.'",
      timestamp: "Mar 24",
      read: false,
      type: "message",
      href: "/dashboard/messages",
      role: "CLIENT",
    },
    {
      id: "notif-16",
      title: "Security scan passed",
      description: "Zero CVE vulnerabilities detected in production release build for ORD-8015.",
      timestamp: "Yesterday",
      read: true,
      type: "system",
      href: "/dashboard/orders",
      role: "FREELANCER",
    },
  ]
}

// ---------------------------------------------------------------------------
// 6. GENERATE FINANCIAL TRANSACTIONS & PAYMENTS DATA
// ---------------------------------------------------------------------------
export function generatePaymentsData(
  allOrders: DashboardOrder[],
  allUsers: UserProfile[]
): PaymentsDataBundle {
  const freelancerTransactions: TransactionRecord[] = [
    {
      id: "TXN-ORD-9481-1",
      date: "Mar 19, 2026",
      timestamp: "17:10",
      type: "ORDER_PAYMENT",
      description: "Milestone 1 Approval • Next.js 15 & Node.js Production Architecture",
      orderId: "ORD-9481",
      orderTitle: "Next.js 15 & Node.js Production Architecture with Clean Code",
      counterpartName: "Marcus Thorne",
      method: "Tascora Escrow Release",
      status: "COMPLETED",
      amount: 150.0,
      fee: 0,
      netAmount: 150.0,
    },
    {
      id: "TXN-ORD-9481-2",
      date: "Mar 18, 2026",
      timestamp: "14:15",
      type: "ESCROW_HELD",
      description: "Milestone 2 & 3 Escrow Deposit Locked • ORD-9481",
      orderId: "ORD-9481",
      orderTitle: "Next.js 15 & Node.js Production Architecture with Clean Code",
      counterpartName: "Marcus Thorne",
      method: "Escrow Pending Clearance",
      status: "PENDING",
      amount: 300.0,
      fee: 0,
      netAmount: 300.0,
    },
    {
      id: "TXN-ORD-9412-1",
      date: "Mar 05, 2026",
      timestamp: "18:00",
      type: "ORDER_PAYMENT",
      description: "Milestone 1 Approval • Data Chunking & Embedding Pipeline",
      orderId: "ORD-9412",
      orderTitle: "Production RAG Agent with Hybrid Search and Evals",
      counterpartName: "David Sterling",
      method: "Tascora Escrow Release",
      status: "COMPLETED",
      amount: 300.0,
      fee: 0,
      netAmount: 300.0,
    },
    {
      id: "TXN-ORD-9412-2",
      date: "Mar 10, 2026",
      timestamp: "11:20",
      type: "ORDER_PAYMENT",
      description: "Milestone 2 Final Approval • Hybrid Retrieval & Ragas Evals",
      orderId: "ORD-9412",
      orderTitle: "Production RAG Agent with Hybrid Search and Evals",
      counterpartName: "David Sterling",
      method: "Tascora Escrow Release",
      status: "COMPLETED",
      amount: 300.0,
      fee: 0,
      netAmount: 300.0,
    },
    {
      id: "TXN-ORD-9420-1",
      date: "Mar 15, 2026",
      timestamp: "16:30",
      type: "ORDER_PAYMENT",
      description: "Milestone 1 Approval • Global Design Tokens & Typography Scale",
      orderId: "ORD-9420",
      orderTitle: "Figma to Production Design System with Tokens and Atomic Components",
      counterpartName: "Marcus Thorne",
      method: "Tascora Escrow Release",
      status: "COMPLETED",
      amount: 175.0,
      fee: 0,
      netAmount: 175.0,
    },
    {
      id: "TXN-ORD-EDGE-3",
      date: "Mar 22, 2026",
      timestamp: "19:00",
      type: "ORDER_PAYMENT",
      description: "Express 24h Delivery Approval • ORD-EDGE-3",
      orderId: "ORD-EDGE-3",
      orderTitle: "Next.js Production Architecture with 24-Hour Express Delivery",
      counterpartName: "Rachel Adams",
      method: "Tascora Escrow Release",
      status: "COMPLETED",
      amount: 300.0,
      fee: 0,
      netAmount: 300.0,
    },
    {
      id: "TXN-ORD-EDGE-2-1",
      date: "Jan 05, 2026",
      timestamp: "10:00",
      type: "ORDER_PAYMENT",
      description: "Milestone 1 Enterprise Signoff • AWS Multi-Region VPC & EKS Cluster",
      orderId: "ORD-EDGE-2",
      orderTitle: "Enterprise Multi-Region AWS Infrastructure & SOC2 Cutover",
      counterpartName: "David Sterling",
      method: "Tascora Escrow Release",
      status: "COMPLETED",
      amount: 1000.0,
      fee: 0,
      netAmount: 1000.0,
    },
    {
      id: "TXN-ORD-EDGE-2-2",
      date: "Jan 14, 2026",
      timestamp: "18:00",
      type: "ORDER_PAYMENT",
      description: "Milestone 5 Enterprise Final Cutover & SOC2 Compliance",
      orderId: "ORD-EDGE-2",
      orderTitle: "Enterprise Multi-Region AWS Infrastructure & SOC2 Cutover",
      counterpartName: "David Sterling",
      method: "Tascora Escrow Release",
      status: "COMPLETED",
      amount: 1200.0,
      fee: 0,
      netAmount: 1200.0,
    },
    {
      id: "TXN-ORD-EDGE-1",
      date: "Jan 30, 2026",
      timestamp: "10:30",
      type: "REFUND",
      description: "Mutual Contract Cancellation & Escrow Refund • ORD-EDGE-1",
      orderId: "ORD-EDGE-1",
      orderTitle: "Microservices Architecture Audit & Penetration Hardening",
      counterpartName: "Emily Zhang",
      method: "Escrow Refund",
      status: "COMPLETED",
      amount: -350.0,
      fee: 0,
      netAmount: -350.0,
    },
    {
      id: "TXN-WTH-1",
      date: "Mar 18, 2026",
      timestamp: "10:14",
      type: "WITHDRAWAL",
      description: "Instant Payout to Stripe Express Account",
      method: "Stripe Express •••• 4242",
      status: "COMPLETED",
      amount: -1500.0,
      fee: 0,
      netAmount: -1500.0,
    },
    {
      id: "TXN-WTH-2",
      date: "Feb 20, 2026",
      timestamp: "11:20",
      type: "WITHDRAWAL",
      description: "Direct Bank ACH Payout Transfer",
      method: "Bank of America •••• 9104",
      status: "COMPLETED",
      amount: -2200.0,
      fee: 0,
      netAmount: -2200.0,
    },
    {
      id: "TXN-WTH-3",
      date: "Jan 18, 2026",
      timestamp: "15:45",
      type: "WITHDRAWAL",
      description: "Enterprise Milestone Earnings Payout",
      method: "Stripe Express •••• 4242",
      status: "COMPLETED",
      amount: -3000.0,
      fee: 0,
      netAmount: -3000.0,
    },
  ]

  const clientInvoices: TransactionRecord[] = [
    {
      id: "INV-2026-091",
      date: "Mar 18, 2026",
      timestamp: "14:20",
      type: "ESCROW_DEPOSIT",
      description: "Next.js 15 & Node.js Production Architecture with Clean Code",
      orderId: "ORD-9481",
      orderTitle: "Next.js 15 & Node.js Production Architecture with Clean Code",
      counterpartName: "Alexandre Moreau",
      method: "Visa •••• 4242",
      status: "COMPLETED",
      amount: 450.0,
      netAmount: 450.0,
      invoiceUrl: "#",
    },
    {
      id: "INV-2026-088",
      date: "Mar 12, 2026",
      timestamp: "10:15",
      type: "ESCROW_DEPOSIT",
      description: "Figma to Production Design System with Tokens and Atomic Components",
      orderId: "ORD-9420",
      orderTitle: "Figma to Production Design System with Tokens and Atomic Components",
      counterpartName: "Helena Rostova",
      method: "Visa •••• 4242",
      status: "COMPLETED",
      amount: 350.0,
      netAmount: 350.0,
      invoiceUrl: "#",
    },
    {
      id: "INV-2026-079",
      date: "Mar 01, 2026",
      timestamp: "16:30",
      type: "ORDER_PAYMENT",
      description: "Production RAG Agent with Hybrid Search and Evals",
      orderId: "ORD-9412",
      orderTitle: "Production RAG Agent with Hybrid Search and Evals",
      counterpartName: "Marcus Vance",
      method: "Mastercard •••• 8812",
      status: "COMPLETED",
      amount: 600.0,
      netAmount: 600.0,
      invoiceUrl: "#",
    },
    {
      id: "INV-2026-052",
      date: "Jan 03, 2026",
      timestamp: "09:30",
      type: "ESCROW_DEPOSIT",
      description: "Enterprise Multi-Region AWS Infrastructure & SOC2 Cutover",
      orderId: "ORD-EDGE-2",
      orderTitle: "Enterprise Multi-Region AWS Infrastructure & SOC2 Cutover",
      counterpartName: "Alexandre Moreau",
      method: "Wire Transfer ACH",
      status: "COMPLETED",
      amount: 5200.0,
      netAmount: 5200.0,
      invoiceUrl: "#",
    },
    {
      id: "INV-2026-041",
      date: "Mar 21, 2026",
      timestamp: "11:40",
      type: "ORDER_PAYMENT",
      description: "Next.js Production Architecture with 24-Hour Express Delivery",
      orderId: "ORD-EDGE-3",
      orderTitle: "Next.js Production Architecture with 24-Hour Express Delivery",
      counterpartName: "Alexandre Moreau",
      method: "Visa •••• 4242",
      status: "COMPLETED",
      amount: 300.0,
      netAmount: 300.0,
      invoiceUrl: "#",
    },
    {
      id: "INV-2026-033",
      date: "Jan 25, 2026",
      timestamp: "13:10",
      type: "REFUND",
      description: "Microservices Architecture Audit & Penetration Hardening (Refunded)",
      orderId: "ORD-EDGE-1",
      orderTitle: "Microservices Architecture Audit & Penetration Hardening",
      counterpartName: "Alexandre Moreau",
      method: "Escrow Refund to Card",
      status: "COMPLETED",
      amount: -350.0,
      netAmount: -350.0,
      invoiceUrl: "#",
    },
  ]

  return {
    freelancerSummary: {
      availableBalance: 4425.0,
      pendingClearance: 1250.0,
      withdrawnTotal: 24650.0,
      inEscrowActive: 2850.0,
      avgMonthlyEarnings: 3850.0,
      bestMonthAmount: 5200.0,
      bestMonthLabel: "January 2026",
      growthMomPercent: 28.5,
    },
    freelancerRevenueChart: [
      { month: "Oct", gross: 2800, net: 2520, ordersCount: 6 },
      { month: "Nov", gross: 3200, net: 2880, ordersCount: 7 },
      { month: "Dec", gross: 3650, net: 3285, ordersCount: 8 },
      { month: "Jan", gross: 5200, net: 4680, ordersCount: 11 },
      { month: "Feb", gross: 4100, net: 3690, ordersCount: 9 },
      { month: "Mar", gross: 4425, net: 3982, ordersCount: 10 },
    ],
    freelancerTransactions,
    clientSummary: {
      totalSpent: 7250.0,
      fundsInEscrow: 1450.0,
      availableCredits: 350.0,
      activeContractsCount: 4,
      invoicesCount: 6,
    },
    clientSpendingChart: [
      { month: "Oct", spent: 750, escrow: 250, projectsCount: 2 },
      { month: "Nov", spent: 950, escrow: 300, projectsCount: 2 },
      { month: "Dec", spent: 1200, escrow: 450, projectsCount: 3 },
      { month: "Jan", spent: 5200, escrow: 1200, projectsCount: 4 },
      { month: "Feb", spent: 800, escrow: 350, projectsCount: 2 },
      { month: "Mar", spent: 1150, escrow: 1450, projectsCount: 4 },
    ],
    clientPaymentMethods: [
      {
        id: "pm-1",
        type: "card",
        brand: "Visa",
        last4: "4242",
        expDate: "08/28",
        isDefault: true,
      },
      {
        id: "pm-2",
        type: "card",
        brand: "Mastercard",
        last4: "8812",
        expDate: "11/27",
        isDefault: false,
      },
      {
        id: "pm-3",
        type: "paypal",
        email: "marcus@fintechcorp.io",
        isDefault: false,
      },
    ],
    clientInvoices,
  }
}

// ---------------------------------------------------------------------------
// 7. FILE WRITERS
// ---------------------------------------------------------------------------
export function writeMessagesDataFile(conversations: Conversation[]) {
  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/dashboard/messages.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Direct Messages & Chat Threads
 * 
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Conversations: ${conversations.length}
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

export const MOCK_CONVERSATIONS: Conversation[] = ${JSON.stringify(conversations, null, 2)}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated ${conversations.length} conversations into ${outputPath}`)
}

export function writeNotificationsDataFile(notifications: NotificationItem[]) {
  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/dashboard/notifications.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Notifications & Activity Alerts
 * 
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Notifications: ${notifications.length}
 * Regenerate with: npm run seed
 */

import { type NotificationItem } from "./types"

export const MOCK_NOTIFICATIONS: NotificationItem[] = ${JSON.stringify(notifications, null, 2)}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated ${notifications.length} notifications into ${outputPath}`)
}

export function writePaymentsDataFile(data: PaymentsDataBundle) {
  const outputPath = path.resolve(process.cwd(), "apps/web/src/data/dashboard/payments.ts")

  const content = `/**
 * TASCORA Generated Seed & Mock Data: Financial Transactions & Escrow Ledger
 * 
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Transactions: ${data.freelancerTransactions.length + data.clientInvoices.length}
 * Regenerate with: npm run seed
 */

export type TransactionType =
  | "ORDER_PAYMENT"
  | "WITHDRAWAL"
  | "ESCROW_HELD"
  | "ESCROW_DEPOSIT"
  | "PLATFORM_FEE"
  | "REFUND"

export type TransactionStatus = "COMPLETED" | "PENDING" | "PROCESSING" | "FAILED"

export interface TransactionRecord {
  id: string
  date: string
  timestamp: string
  type: TransactionType
  description: string
  orderId?: string
  orderTitle?: string
  counterpartName?: string
  method: string
  status: TransactionStatus
  amount: number
  fee?: number
  netAmount: number
  invoiceUrl?: string
}

export interface RevenueMonthPoint {
  month: string
  gross: number
  net: number
  ordersCount: number
}

export interface ClientSpendingMonthPoint {
  month: string
  spent: number
  escrow: number
  projectsCount: number
}

export interface PaymentMethodItem {
  id: string
  type: "card" | "paypal" | "bank"
  brand?: string
  last4?: string
  expDate?: string
  email?: string
  bankName?: string
  isDefault: boolean
}

export interface FreelancerEarningsSummary {
  availableBalance: number
  pendingClearance: number
  withdrawnTotal: number
  inEscrowActive: number
  avgMonthlyEarnings: number
  bestMonthAmount: number
  bestMonthLabel: string
  growthMomPercent: number
}

export interface ClientPaymentsSummary {
  totalSpent: number
  fundsInEscrow: number
  availableCredits: number
  activeContractsCount: number
  invoicesCount: number
}

export const FREELANCER_EARNINGS_SUMMARY: FreelancerEarningsSummary = ${JSON.stringify(data.freelancerSummary, null, 2)}

export const FREELANCER_REVENUE_CHART_DATA: RevenueMonthPoint[] = ${JSON.stringify(data.freelancerRevenueChart, null, 2)}

export const FREELANCER_TRANSACTIONS: TransactionRecord[] = ${JSON.stringify(data.freelancerTransactions, null, 2)}

export const CLIENT_PAYMENTS_SUMMARY: ClientPaymentsSummary = ${JSON.stringify(data.clientSummary, null, 2)}

export const CLIENT_SPENDING_CHART_DATA: ClientSpendingMonthPoint[] = ${JSON.stringify(data.clientSpendingChart, null, 2)}

export const CLIENT_SAVED_PAYMENT_METHODS: PaymentMethodItem[] = ${JSON.stringify(data.clientPaymentMethods, null, 2)}

export const CLIENT_INVOICES: TransactionRecord[] = ${JSON.stringify(data.clientInvoices, null, 2)}
`

  fs.writeFileSync(outputPath, content, "utf-8")
  console.log(`[Seed Generator] Successfully generated payment ledger data into ${outputPath}`)
}

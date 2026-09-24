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

export const FREELANCER_EARNINGS_SUMMARY: FreelancerEarningsSummary = {
  availableBalance: 3420.5,
  pendingClearance: 850.0,
  withdrawnTotal: 18650.0,
  inEscrowActive: 2100.0,
  avgMonthlyEarnings: 3120.0,
  bestMonthAmount: 4250.0,
  bestMonthLabel: "August 2026",
  growthMomPercent: 24.5,
}

export const FREELANCER_REVENUE_CHART_DATA: RevenueMonthPoint[] = [
  { month: "Apr", gross: 2400, net: 2160, ordersCount: 5 },
  { month: "May", gross: 2850, net: 2565, ordersCount: 6 },
  { month: "Jun", gross: 3200, net: 2880, ordersCount: 7 },
  { month: "Jul", gross: 3650, net: 3285, ordersCount: 8 },
  { month: "Aug", gross: 4250, net: 3825, ordersCount: 9 },
  { month: "Sep", gross: 3420, net: 3078, ordersCount: 7 },
]

export const FREELANCER_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "TXN-89421",
    date: "Sep 21, 2026",
    timestamp: "15:20",
    type: "ORDER_PAYMENT",
    description: "Milestone 2 Approval • Next.js 15 & Node.js Production Architecture",
    orderId: "ORD-9481",
    orderTitle: "Next.js 15 & Node.js Production Architecture",
    counterpartName: "Marcus Thorne",
    method: "Tascora Escrow Release",
    status: "COMPLETED",
    amount: 150.0,
    fee: 0,
    netAmount: 150.0,
  },
  {
    id: "TXN-89304",
    date: "Sep 18, 2026",
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
    id: "TXN-89112",
    date: "Sep 15, 2026",
    timestamp: "16:45",
    type: "ORDER_PAYMENT",
    description: "Milestone 1 Deliverable Signoff • Autonomous AI Agents RAG Pipeline",
    orderId: "ORD-8923",
    orderTitle: "Autonomous AI Agents RAG Pipeline",
    counterpartName: "Fintech Ventures",
    method: "Tascora Escrow Release",
    status: "COMPLETED",
    amount: 425.0,
    fee: 0,
    netAmount: 425.0,
  },
  {
    id: "TXN-88902",
    date: "Sep 12, 2026",
    timestamp: "09:30",
    type: "ESCROW_HELD",
    description: "Escrow Deposit Locked • Milestone 2 Testing & CI Pipeline",
    orderId: "ORD-7712",
    orderTitle: "Fintech Brand Identity & 3D Assets",
    counterpartName: "Marcus Thorne",
    method: "Escrow Pending Clearance",
    status: "PENDING",
    amount: 450.0,
    fee: 0,
    netAmount: 450.0,
  },
  {
    id: "TXN-88741",
    date: "Sep 05, 2026",
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
    id: "TXN-88409",
    date: "Aug 28, 2026",
    timestamp: "14:10",
    type: "ORDER_PAYMENT",
    description: "Final Project Settlement • High-converting SaaS 3D Landing Page",
    orderId: "ORD-6540",
    orderTitle: "High-converting SaaS 3D Landing Page",
    counterpartName: "Cloudscale Inc",
    method: "Tascora Escrow Release",
    status: "COMPLETED",
    amount: 600.0,
    fee: 0,
    netAmount: 600.0,
  },
  {
    id: "TXN-88120",
    date: "Aug 20, 2026",
    timestamp: "17:05",
    type: "REFUND",
    description: "Mutual Milestone Adjustment • Kubernetes Architecture Audit",
    orderId: "ORD-5120",
    orderTitle: "Kubernetes Cluster Setup",
    counterpartName: "DesignLab",
    method: "Escrow Refund",
    status: "COMPLETED",
    amount: -150.0,
    fee: 0,
    netAmount: -150.0,
  },
  {
    id: "TXN-87940",
    date: "Aug 14, 2026",
    timestamp: "08:50",
    type: "WITHDRAWAL",
    description: "Instant Payout to Stripe Express Account",
    method: "Stripe Express •••• 4242",
    status: "COMPLETED",
    amount: -3000.0,
    fee: 0,
    netAmount: -3000.0,
  },
]

export const CLIENT_PAYMENTS_SUMMARY: ClientPaymentsSummary = {
  totalSpent: 5450.0,
  fundsInEscrow: 1300.0,
  availableCredits: 250.0,
  activeContractsCount: 3,
  invoicesCount: 6,
}

export const CLIENT_SPENDING_CHART_DATA: ClientSpendingMonthPoint[] = [
  { month: "Apr", spent: 600, escrow: 200, projectsCount: 1 },
  { month: "May", spent: 850, escrow: 300, projectsCount: 2 },
  { month: "Jun", spent: 1100, escrow: 400, projectsCount: 2 },
  { month: "Jul", spent: 900, escrow: 350, projectsCount: 2 },
  { month: "Aug", spent: 1500, escrow: 600, projectsCount: 3 },
  { month: "Sep", spent: 500, escrow: 1300, projectsCount: 3 },
]

export const CLIENT_SAVED_PAYMENT_METHODS: PaymentMethodItem[] = [
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
]

export const CLIENT_INVOICES: TransactionRecord[] = [
  {
    id: "INV-2026-091",
    date: "Sep 18, 2026",
    timestamp: "14:20",
    type: "ESCROW_DEPOSIT",
    description: "Next.js 15 & Node.js Production Architecture with Clean Code",
    orderId: "ORD-9481",
    orderTitle: "Next.js 15 Architecture",
    counterpartName: "Alexandre Moreau",
    method: "Visa •••• 4242",
    status: "COMPLETED",
    amount: 450.0,
    netAmount: 450.0,
    invoiceUrl: "#",
  },
  {
    id: "INV-2026-088",
    date: "Sep 15, 2026",
    timestamp: "11:15",
    type: "ESCROW_DEPOSIT",
    description: "Autonomous AI Agents & LLM RAG Pipeline Development",
    orderId: "ORD-8923",
    orderTitle: "AI RAG Pipeline",
    counterpartName: "Sophia Rodriguez",
    method: "Visa •••• 4242",
    status: "COMPLETED",
    amount: 850.0,
    netAmount: 850.0,
    invoiceUrl: "#",
  },
  {
    id: "INV-2026-079",
    date: "Sep 10, 2026",
    timestamp: "16:30",
    type: "ESCROW_DEPOSIT",
    description: "Fintech Brand Identity, 3D Assets & Design System",
    orderId: "ORD-7712",
    orderTitle: "Fintech Brand Identity",
    counterpartName: "David Kael",
    method: "Mastercard •••• 8812",
    status: "COMPLETED",
    amount: 1200.0,
    netAmount: 1200.0,
    invoiceUrl: "#",
  },
  {
    id: "INV-2026-064",
    date: "Aug 22, 2026",
    timestamp: "09:40",
    type: "ORDER_PAYMENT",
    description: "High-converting SaaS Landing Page with Smooth 3D Canvas",
    orderId: "ORD-6540",
    orderTitle: "3D SaaS Landing Page",
    counterpartName: "Elena Rostova",
    method: "Visa •••• 4242",
    status: "COMPLETED",
    amount: 600.0,
    netAmount: 600.0,
    invoiceUrl: "#",
  },
  {
    id: "INV-2026-051",
    date: "Aug 10, 2026",
    timestamp: "13:10",
    type: "ORDER_PAYMENT",
    description: "Kubernetes Cluster Setup & Multi-region Cloud Architecture",
    orderId: "ORD-5120",
    orderTitle: "Kubernetes Cluster Setup",
    counterpartName: "Lucas Chen",
    method: "Visa •••• 4242",
    status: "COMPLETED",
    amount: 1500.0,
    netAmount: 1500.0,
    invoiceUrl: "#",
  },
  {
    id: "INV-2026-039",
    date: "Jul 28, 2026",
    timestamp: "15:55",
    type: "ORDER_PAYMENT",
    description: "PostgreSQL High Availability & Sharding Configuration",
    orderId: "ORD-4200",
    orderTitle: "PostgreSQL HA Cluster",
    counterpartName: "Alexandre Moreau",
    method: "Visa •••• 4242",
    status: "COMPLETED",
    amount: 850.0,
    netAmount: 850.0,
    invoiceUrl: "#",
  },
]

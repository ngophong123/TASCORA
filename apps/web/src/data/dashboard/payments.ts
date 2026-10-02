/**
 * TASCORA Generated Seed & Mock Data: Financial Transactions & Escrow Ledger
 *
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Transactions: 18
 * Regenerate with: npm run seed
 */

export type TransactionType =
  "ORDER_PAYMENT" | "WITHDRAWAL" | "ESCROW_HELD" | "ESCROW_DEPOSIT" | "PLATFORM_FEE" | "REFUND"

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
  availableBalance: 4425,
  pendingClearance: 1250,
  withdrawnTotal: 24650,
  inEscrowActive: 2850,
  avgMonthlyEarnings: 3850,
  bestMonthAmount: 5200,
  bestMonthLabel: "January 2026",
  growthMomPercent: 28.5,
}

export const FREELANCER_REVENUE_CHART_DATA: RevenueMonthPoint[] = [
  {
    month: "Oct",
    gross: 2800,
    net: 2520,
    ordersCount: 6,
  },
  {
    month: "Nov",
    gross: 3200,
    net: 2880,
    ordersCount: 7,
  },
  {
    month: "Dec",
    gross: 3650,
    net: 3285,
    ordersCount: 8,
  },
  {
    month: "Jan",
    gross: 5200,
    net: 4680,
    ordersCount: 11,
  },
  {
    month: "Feb",
    gross: 4100,
    net: 3690,
    ordersCount: 9,
  },
  {
    month: "Mar",
    gross: 4425,
    net: 3982,
    ordersCount: 10,
  },
]

export const FREELANCER_TRANSACTIONS: TransactionRecord[] = [
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
    amount: 150,
    fee: 0,
    netAmount: 150,
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
    amount: 300,
    fee: 0,
    netAmount: 300,
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
    amount: 300,
    fee: 0,
    netAmount: 300,
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
    amount: 300,
    fee: 0,
    netAmount: 300,
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
    amount: 175,
    fee: 0,
    netAmount: 175,
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
    amount: 300,
    fee: 0,
    netAmount: 300,
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
    amount: 1000,
    fee: 0,
    netAmount: 1000,
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
    amount: 1200,
    fee: 0,
    netAmount: 1200,
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
    amount: -350,
    fee: 0,
    netAmount: -350,
  },
  {
    id: "TXN-WTH-1",
    date: "Mar 18, 2026",
    timestamp: "10:14",
    type: "WITHDRAWAL",
    description: "Instant Payout to Stripe Express Account",
    method: "Stripe Express •••• 4242",
    status: "COMPLETED",
    amount: -1500,
    fee: 0,
    netAmount: -1500,
  },
  {
    id: "TXN-WTH-2",
    date: "Feb 20, 2026",
    timestamp: "11:20",
    type: "WITHDRAWAL",
    description: "Direct Bank ACH Payout Transfer",
    method: "Bank of America •••• 9104",
    status: "COMPLETED",
    amount: -2200,
    fee: 0,
    netAmount: -2200,
  },
  {
    id: "TXN-WTH-3",
    date: "Jan 18, 2026",
    timestamp: "15:45",
    type: "WITHDRAWAL",
    description: "Enterprise Milestone Earnings Payout",
    method: "Stripe Express •••• 4242",
    status: "COMPLETED",
    amount: -3000,
    fee: 0,
    netAmount: -3000,
  },
]

export const CLIENT_PAYMENTS_SUMMARY: ClientPaymentsSummary = {
  totalSpent: 7250,
  fundsInEscrow: 1450,
  availableCredits: 350,
  activeContractsCount: 4,
  invoicesCount: 6,
}

export const CLIENT_SPENDING_CHART_DATA: ClientSpendingMonthPoint[] = [
  {
    month: "Oct",
    spent: 750,
    escrow: 250,
    projectsCount: 2,
  },
  {
    month: "Nov",
    spent: 950,
    escrow: 300,
    projectsCount: 2,
  },
  {
    month: "Dec",
    spent: 1200,
    escrow: 450,
    projectsCount: 3,
  },
  {
    month: "Jan",
    spent: 5200,
    escrow: 1200,
    projectsCount: 4,
  },
  {
    month: "Feb",
    spent: 800,
    escrow: 350,
    projectsCount: 2,
  },
  {
    month: "Mar",
    spent: 1150,
    escrow: 1450,
    projectsCount: 4,
  },
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
    date: "Mar 18, 2026",
    timestamp: "14:20",
    type: "ESCROW_DEPOSIT",
    description: "Next.js 15 & Node.js Production Architecture with Clean Code",
    orderId: "ORD-9481",
    orderTitle: "Next.js 15 & Node.js Production Architecture with Clean Code",
    counterpartName: "Alexandre Moreau",
    method: "Visa •••• 4242",
    status: "COMPLETED",
    amount: 450,
    netAmount: 450,
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
    amount: 350,
    netAmount: 350,
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
    amount: 600,
    netAmount: 600,
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
    amount: 5200,
    netAmount: 5200,
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
    amount: 300,
    netAmount: 300,
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
    amount: -350,
    netAmount: -350,
    invoiceUrl: "#",
  },
]

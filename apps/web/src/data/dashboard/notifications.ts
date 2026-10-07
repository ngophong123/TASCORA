/**
 * TASCORA Generated Seed & Mock Data: Notifications & Activity Alerts
 *
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Notifications: 16
 * Regenerate with: npm run seed
 */

import { type NotificationItem } from "./types"

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Milestone payment approved",
    description:
      "Marcus Thorne approved Milestone 1 ($150.00) for ORD-9481. Funds released to your wallet.",
    timestamp: "10 minutes ago",
    read: false,
    type: "payment",
    href: "/dashboard/orders",
    role: "FREELANCER",
  },
  {
    id: "notif-2",
    title: "New order received!",
    description:
      "David Sterling placed an enterprise order ORD-EDGE-2 ($5,200.00) with 5 escrow milestones.",
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
    description:
      "Helena Rostova submitted deliverable files for 'Figma to Production Design System' (ORD-9420).",
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
    description:
      "You unlocked the TOP RATED Specialist badge! Your search visibility increased by 45%.",
    timestamp: "2 days ago",
    read: true,
    type: "system",
    href: "/dashboard",
    role: "FREELANCER",
  },
  {
    id: "notif-7",
    title: "Revision requested",
    description:
      "Liam O'Connor requested Revision #3 for ORD-EDGE-4: 'Need idempotency key check'.",
    timestamp: "3 days ago",
    read: true,
    type: "order",
    href: "/dashboard/orders",
    role: "FREELANCER",
  },
  {
    id: "notif-8",
    title: "Escrow refund confirmed",
    description:
      "Mutual cancellation processed for ORD-EDGE-1. $350.00 returned to your payment balance.",
    timestamp: "Jan 30",
    read: true,
    type: "payment",
    href: "/dashboard/payments",
    role: "CLIENT",
  },
  {
    id: "notif-9",
    title: "5-Star Review Received",
    description:
      "Marcus Thorne left a glowing 5-star review: 'Cleanest, most maintainable Next.js 15 enterprise architecture...'",
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

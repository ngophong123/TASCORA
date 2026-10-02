import { describe, it, expect } from "vitest"

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "IN_PROGRESS"
  | "IN_REVISION"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["DELIVERED", "CANCELLED", "DISPUTED"],
  DELIVERED: ["COMPLETED", "IN_REVISION", "DISPUTED"],
  IN_REVISION: ["DELIVERED", "CANCELLED", "DISPUTED"],
  DISPUTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
}

export interface TransitionCheckParams {
  currentStatus: OrderStatus
  nextStatus: OrderStatus
  userId: string
  buyerId: string
  sellerUserId: string
  isAdmin?: boolean
}

export function validateOrderTransition({
  currentStatus,
  nextStatus,
  userId,
  buyerId,
  sellerUserId,
  isAdmin = false,
}: TransitionCheckParams): { allowed: boolean; reason?: string } {
  const isBuyer = userId === buyerId
  const isSeller = userId === sellerUserId

  // 1. Authentication & Participation check
  if (!isBuyer && !isSeller && !isAdmin) {
    return { allowed: false, reason: "Unauthorized: User is neither buyer, seller, nor admin" }
  }

  // 2. State machine allowed transition check
  const allowedNext = VALID_ORDER_TRANSITIONS[currentStatus] || []
  if (!allowedNext.includes(nextStatus)) {
    return {
      allowed: false,
      reason: `Invalid state transition from ${currentStatus} to ${nextStatus}`,
    }
  }

  // 3. Role-specific authority check
  if (nextStatus === "COMPLETED" && !isBuyer && !isAdmin) {
    return { allowed: false, reason: "Only the buyer or admin can mark an order as COMPLETED" }
  }

  if (nextStatus === "IN_REVISION" && !isBuyer && !isAdmin) {
    return { allowed: false, reason: "Only the buyer can request revisions" }
  }

  if (nextStatus === "DELIVERED" && !isSeller && !isAdmin) {
    return { allowed: false, reason: "Only the seller can deliver order work" }
  }

  if (nextStatus === "IN_PROGRESS" && !isSeller && !isAdmin) {
    return { allowed: false, reason: "Only the seller can mark work as in progress" }
  }

  return { allowed: true }
}

describe("Order Lifecycle & State Machine (Unit Tests)", () => {
  const buyerId = "usr-buyer-1"
  const sellerUserId = "usr-seller-1"
  const strangerId = "usr-stranger-9"

  describe("Happy Path Flow (PENDING -> PAID -> IN_PROGRESS -> DELIVERED -> COMPLETED)", () => {
    it("allows PENDING -> PAID upon payment", () => {
      const res = validateOrderTransition({
        currentStatus: "PENDING",
        nextStatus: "PAID",
        userId: buyerId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(true)
    })

    it("allows seller to transition PAID -> IN_PROGRESS", () => {
      const res = validateOrderTransition({
        currentStatus: "PAID",
        nextStatus: "IN_PROGRESS",
        userId: sellerUserId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(true)
    })

    it("allows seller to transition IN_PROGRESS -> DELIVERED", () => {
      const res = validateOrderTransition({
        currentStatus: "IN_PROGRESS",
        nextStatus: "DELIVERED",
        userId: sellerUserId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(true)
    })

    it("allows buyer to accept work: DELIVERED -> COMPLETED", () => {
      const res = validateOrderTransition({
        currentStatus: "DELIVERED",
        nextStatus: "COMPLETED",
        userId: buyerId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(true)
    })
  })

  describe("Revision and Dispute Flows", () => {
    it("allows buyer to request changes: DELIVERED -> IN_REVISION", () => {
      const res = validateOrderTransition({
        currentStatus: "DELIVERED",
        nextStatus: "IN_REVISION",
        userId: buyerId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(true)
    })

    it("allows seller to redeliver after revision: IN_REVISION -> DELIVERED", () => {
      const res = validateOrderTransition({
        currentStatus: "IN_REVISION",
        nextStatus: "DELIVERED",
        userId: sellerUserId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(true)
    })

    it("allows buyer or seller to escalate to DISPUTED during execution", () => {
      const res = validateOrderTransition({
        currentStatus: "IN_PROGRESS",
        nextStatus: "DISPUTED",
        userId: buyerId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(true)
    })
  })

  describe("Security & Illegal Transition Prevention", () => {
    it("blocks stranger from altering order status", () => {
      const res = validateOrderTransition({
        currentStatus: "DELIVERED",
        nextStatus: "COMPLETED",
        userId: strangerId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(false)
      expect(res.reason).toContain("Unauthorized")
    })

    it("blocks seller from completing their own order", () => {
      const res = validateOrderTransition({
        currentStatus: "DELIVERED",
        nextStatus: "COMPLETED",
        userId: sellerUserId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(false)
      expect(res.reason).toContain("Only the buyer or admin")
    })

    it("blocks illegal transitions (e.g. PENDING straight to COMPLETED)", () => {
      const res = validateOrderTransition({
        currentStatus: "PENDING",
        nextStatus: "COMPLETED",
        userId: buyerId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(false)
      expect(res.reason).toContain("Invalid state transition")
    })

    it("blocks reopening a COMPLETED terminal order", () => {
      const res = validateOrderTransition({
        currentStatus: "COMPLETED",
        nextStatus: "IN_PROGRESS",
        userId: sellerUserId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(false)
      expect(res.reason).toContain("Invalid state transition")
    })

    it("blocks reopening a CANCELLED terminal order", () => {
      const res = validateOrderTransition({
        currentStatus: "CANCELLED",
        nextStatus: "PAID",
        userId: buyerId,
        buyerId,
        sellerUserId,
      })
      expect(res.allowed).toBe(false)
      expect(res.reason).toContain("Invalid state transition")
    })
  })
})

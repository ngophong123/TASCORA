import { describe, it, expect } from "vitest"

/**
 * Pure business logic for calculating checkout breakdown in TASCORA.
 */
export interface CheckoutBreakdownInput {
  basePrice: number
  discountPercent?: number
  serviceFeePercent?: number
}

export interface CheckoutBreakdownResult {
  basePrice: number
  discountAmount: number
  subtotal: number
  serviceFee: number
  total: number
}

export function calculateCheckoutBreakdown({
  basePrice,
  discountPercent = 0,
  serviceFeePercent = 5,
}: CheckoutBreakdownInput): CheckoutBreakdownResult {
  if (basePrice < 0) {
    throw new Error("Base price cannot be negative")
  }
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("Discount percent must be between 0 and 100")
  }

  const rawDiscount = (basePrice * discountPercent) / 100
  const discountAmount = Math.round(rawDiscount * 100) / 100

  const rawSubtotal = Math.max(0, basePrice - discountAmount)
  const subtotal = Math.round(rawSubtotal * 100) / 100

  const rawFee = (subtotal * serviceFeePercent) / 100
  const serviceFee = Math.round(rawFee * 100) / 100

  const total = Math.round((subtotal + serviceFee) * 100) / 100

  return {
    basePrice,
    discountAmount,
    subtotal,
    serviceFee,
    total,
  }
}

/**
 * Checks if a coupon is eligible for redemption.
 */
export interface CouponEligibilityInput {
  code: string
  expiresAt: Date | null
  usedCount: number
  maxUses: number
  currentDate?: Date
}

export function isCouponEligible({
  expiresAt,
  usedCount,
  maxUses,
  currentDate = new Date(),
}: CouponEligibilityInput): { eligible: boolean; reason?: string } {
  if (expiresAt && currentDate > expiresAt) {
    return { eligible: false, reason: "Coupon has expired" }
  }
  if (usedCount >= maxUses) {
    return { eligible: false, reason: "Coupon usage limit reached" }
  }
  return { eligible: true }
}

describe("Pricing & Checkout Business Logic (Unit Tests)", () => {
  it("calculates correct totals without coupon", () => {
    const result = calculateCheckoutBreakdown({ basePrice: 100 })
    expect(result.discountAmount).toBe(0)
    expect(result.subtotal).toBe(100)
    expect(result.serviceFee).toBe(5) // 5% fee
    expect(result.total).toBe(105)
  })

  it("calculates 20% coupon discount and service fee accurately with proper rounding", () => {
    const result = calculateCheckoutBreakdown({
      basePrice: 150,
      discountPercent: 20,
      serviceFeePercent: 5,
    })
    expect(result.discountAmount).toBe(30)
    expect(result.subtotal).toBe(120)
    expect(result.serviceFee).toBe(6)
    expect(result.total).toBe(126)
  })

  it("handles floating point precision properly (e.g. $49.99 with 15% discount)", () => {
    const result = calculateCheckoutBreakdown({
      basePrice: 49.99,
      discountPercent: 15,
      serviceFeePercent: 5,
    })
    // 49.99 * 0.15 = 7.4985 -> rounded to 7.50
    expect(result.discountAmount).toBe(7.5)
    expect(result.subtotal).toBe(42.49)
    // 42.49 * 0.05 = 2.1245 -> rounded to 2.12
    expect(result.serviceFee).toBe(2.12)
    expect(result.total).toBe(44.61)
  })

  it("handles 100% discount correctly", () => {
    const result = calculateCheckoutBreakdown({
      basePrice: 80,
      discountPercent: 100,
    })
    expect(result.discountAmount).toBe(80)
    expect(result.subtotal).toBe(0)
    expect(result.serviceFee).toBe(0)
    expect(result.total).toBe(0)
  })

  it("throws error for negative base price", () => {
    expect(() => calculateCheckoutBreakdown({ basePrice: -10 })).toThrow(
      "Base price cannot be negative"
    )
  })

  it("throws error for invalid discount percent (>100 or <0)", () => {
    expect(() => calculateCheckoutBreakdown({ basePrice: 50, discountPercent: 120 })).toThrow(
      "Discount percent must be between 0 and 100"
    )
    expect(() => calculateCheckoutBreakdown({ basePrice: 50, discountPercent: -5 })).toThrow(
      "Discount percent must be between 0 and 100"
    )
  })
})

describe("Coupon Eligibility Validation (Unit Tests)", () => {
  it("allows active coupon within valid date and limit", () => {
    const status = isCouponEligible({
      code: "SUMMER20",
      expiresAt: new Date(Date.now() + 86400000), // tomorrow
      usedCount: 5,
      maxUses: 100,
    })
    expect(status.eligible).toBe(true)
  })

  it("rejects coupon if current date is past expiresAt", () => {
    const status = isCouponEligible({
      code: "EXPIRED50",
      expiresAt: new Date(Date.now() - 1000), // 1 second ago
      usedCount: 1,
      maxUses: 10,
    })
    expect(status.eligible).toBe(false)
    expect(status.reason).toBe("Coupon has expired")
  })

  it("rejects coupon if usedCount reaches maxUses", () => {
    const status = isCouponEligible({
      code: "MAXED10",
      expiresAt: null,
      usedCount: 10,
      maxUses: 10,
    })
    expect(status.eligible).toBe(false)
    expect(status.reason).toBe("Coupon usage limit reached")
  })
})

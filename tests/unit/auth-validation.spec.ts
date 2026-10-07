import { describe, it, expect } from "vitest"
import jwt from "jsonwebtoken"
import { registerSchema, loginSchema } from "../../apps/api/src/modules/auth/auth.schema"

describe("Authentication Schema & Token Verification (Unit Tests)", () => {
  const JWT_SECRET = "super-secret-test-key-tascora-2026"

  describe("Zod Auth Validation Schemas", () => {
    it("validates compliant registration payload", () => {
      const validPayload = {
        body: {
          email: "alexandre.founder@tascora.dev",
          password: "SecurePassword123!",
        },
      }
      const parsed = registerSchema.safeParse(validPayload)
      expect(parsed.success).toBe(true)
    })

    it("rejects invalid email formats", () => {
      const invalidEmail = {
        body: {
          email: "not-an-email",
          password: "SecurePassword123!",
        },
      }
      const parsed = registerSchema.safeParse(invalidEmail)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toContain("Invalid email")
      }
    })

    it("rejects passwords shorter than 8 characters", () => {
      const shortPassword = {
        body: {
          email: "user@tascora.dev",
          password: "123", // too short
        },
      }
      const parsed = registerSchema.safeParse(shortPassword)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.message).toContain("at least 8 character")
      }
    })

    it("validates login payload", () => {
      const loginPayload = {
        body: {
          email: "seller@tascora.dev",
          password: "anyPasswordStoredInHash",
        },
      }
      const parsed = loginSchema.safeParse(loginPayload)
      expect(parsed.success).toBe(true)
    })
  })

  describe("JWT Security & Claims Verification", () => {
    it("signs and verifies valid JWT payload with expected claims", () => {
      const claims = {
        userId: "usr-alexandre-1",
        role: "SELLER",
      }

      const token = jwt.sign(claims, JWT_SECRET, { expiresIn: "1h" })
      expect(typeof token).toBe("string")

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
      expect(decoded.userId).toBe(claims.userId)
      expect(decoded.role).toBe(claims.role)
    })

    it("rejects token signed with an invalid secret", () => {
      const token = jwt.sign({ userId: "usr-attacker" }, "attacker-secret", { expiresIn: "1h" })

      expect(() => {
        jwt.verify(token, JWT_SECRET)
      }).toThrow()
    })

    it("rejects expired tokens", () => {
      const expiredToken = jwt.sign({ userId: "usr-expired" }, JWT_SECRET, {
        expiresIn: -10, // expired 10 seconds ago
      })

      expect(() => {
        jwt.verify(expiredToken, JWT_SECRET)
      }).toThrow(/jwt expired/)
    })
  })
})

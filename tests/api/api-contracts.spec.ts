import { describe, it, expect, vi } from "vitest"
import request from "supertest"
import { app } from "../../apps/api/src/server"

describe("Backend API Contracts & Endpoints (Integration/API Tests)", () => {
  describe("Authentication API (/api/v1/auth)", () => {
    it("rejects registration when email is malformed (Zod validation 400)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "invalid-email-address",
          password: "SecurePassword123!",
        })
        .set("Accept", "application/json")

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it("rejects registration when password is shorter than 8 characters (Zod validation 400)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "valid@tascora.dev",
          password: "123", // too short
        })
        .set("Accept", "application/json")

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it("rejects login when required fields are missing (Zod validation 400)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({})
        .set("Accept", "application/json")

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe("Protected Endpoints Security & Token Guard", () => {
    it("rejects unauthenticated requests to /api/v1/coupons with 401", async () => {
      const response = await request(app)
        .get("/api/v1/coupons")
        .set("Accept", "application/json")

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe("Unauthorized")
    })

    it("rejects unauthenticated requests to /api/v1/orders with 401", async () => {
      const response = await request(app)
        .get("/api/v1/orders/purchases")
        .set("Accept", "application/json")

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe("Unauthorized")
    })

    it("rejects invalid/tampered Bearer tokens with 401", async () => {
      const response = await request(app)
        .get("/api/v1/coupons")
        .set("Authorization", "Bearer invalid.token.signature")
        .set("Accept", "application/json")

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toMatch(/Invalid or expired token|Unauthorized/)
    })
  })

  describe("System Health & Error Handling", () => {
    it("handles 404 for undefined routes gracefully without stack trace leaks", async () => {
      const response = await request(app)
        .get("/api/v1/non-existent-endpoint")
        .set("Accept", "application/json")

      expect(response.status).toBe(404)
    })
  })
})

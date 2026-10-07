import { describe, it, expect } from "vitest"
import request from "supertest"
import { app } from "../../apps/api/src/server"

describe("Application Security & Hardening Tests (Security Audit)", () => {
  describe("HTTP Security Headers (Helmet Protection)", () => {
    it("enforces strict X-Content-Type-Options: nosniff to prevent MIME sniffing", async () => {
      const response = await request(app).get("/api/v1/auth/login")
      expect(response.headers["x-content-type-options"]).toBe("nosniff")
    })

    it("enforces X-Frame-Options: SAMEORIGIN to prevent Clickjacking attacks", async () => {
      const response = await request(app).get("/api/v1/auth/login")
      expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN")
    })

    it("disables DNS prefetching to protect user privacy (X-DNS-Prefetch-Control)", async () => {
      const response = await request(app).get("/api/v1/auth/login")
      expect(response.headers["x-dns-prefetch-control"]).toBe("off")
    })

    it("sets X-Download-Options: noopen for Internet Explorer security", async () => {
      const response = await request(app).get("/api/v1/auth/login")
      expect(response.headers["x-download-options"]).toBe("noopen")
    })
  })

  describe("CORS (Cross-Origin Resource Sharing) Policies", () => {
    it("permits requests from authorized frontend origin (localhost:3000)", async () => {
      const response = await request(app)
        .options("/api/v1/auth/login")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST")

      expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000")
      expect(response.headers["access-control-allow-credentials"]).toBe("true")
    })

    it("permits requests from alternative dev port (localhost:3200)", async () => {
      const response = await request(app)
        .options("/api/v1/auth/login")
        .set("Origin", "http://localhost:3200")
        .set("Access-Control-Request-Method", "POST")

      expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3200")
    })
  })

  describe("Rate Limiting Protection (Anti-DDoS / Brute Force)", () => {
    it("emits standard RateLimit headers (draft-7) on incoming API requests", async () => {
      const response = await request(app).get("/api/v1/auth/login")

      // draft-7 standard headers from express-rate-limit
      const rateLimitHeader = response.headers["ratelimit"] || response.headers["ratelimit-policy"]
      expect(rateLimitHeader).toBeDefined()
    })
  })

  describe("Malformed Input & Crash Prevention", () => {
    it("handles malformed JSON body safely with 400 Bad Request without stack leak", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("Content-Type", "application/json")
        .send('{"email": "broken-json-no-closing-brace')

      expect(response.status).toBe(400)
      // Verify no sensitive server paths leaked in body
      expect(JSON.stringify(response.body)).not.toContain("node_modules")
      expect(JSON.stringify(response.body)).not.toContain("D:\\duannuoiem")
    })
  })
})

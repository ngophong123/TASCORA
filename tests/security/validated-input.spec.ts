import { expect, it, vi } from "vitest"
import type { Request, Response } from "express"
import { validate } from "../../apps/api/src/middlewares/validate"
import { updateSellerProfileSchema } from "../../apps/api/src/modules/profile/profile.schema"

it("removes unrecognized privileged profile fields before controllers receive the body", async () => {
  const req = { body: { bio: "Profile", status: "APPROVED", userId: "another-user" }, query: {}, params: {} } as Request
  const next = vi.fn()
  await validate(updateSellerProfileSchema)(req, {} as Response, next)
  expect(next).toHaveBeenCalledOnce()
  expect(req.body).toEqual({ bio: "Profile" })
})

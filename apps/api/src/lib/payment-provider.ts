import { HttpError } from "./errors"

const LIVE_STRIPE_SECRET_KEY_PREFIX = /^(sk|rk)_live_/
const TEST_STRIPE_SECRET_KEY_PREFIX = /^(sk|rk)_test_/
const STRICT_TEST_STRIPE_SECRET_KEY = /^(sk|rk)_test_[A-Za-z0-9]+$/

export function isLiveStripeSecretKey(key = process.env.STRIPE_SECRET_KEY || ""): boolean {
  return LIVE_STRIPE_SECRET_KEY_PREFIX.test(key)
}

export function isTestStripeSecretKey(key = process.env.STRIPE_SECRET_KEY || ""): boolean {
  return TEST_STRIPE_SECRET_KEY_PREFIX.test(key)
}

export function isStrictTestStripeSecretKey(key = process.env.STRIPE_SECRET_KEY || ""): boolean {
  return STRICT_TEST_STRIPE_SECRET_KEY.test(key)
}

export function paymentProvider(): "stripe" | "disabled" {
  const provider = process.env.PAYMENTS_PROVIDER ?? "stripe"
  if (provider !== "stripe" && provider !== "disabled")
    throw new Error("PAYMENTS_PROVIDER must be stripe or disabled")
  return provider
}

export function assertPaymentsEnabled() {
  if (paymentProvider() === "disabled") {
    throw new HttpError(
      503,
      "Payments are temporarily unavailable in this environment.",
      "PAYMENT_PROVIDER_UNAVAILABLE"
    )
  }
}

// Configuration capability only: never claim a provider connection is healthy.
export function paymentCapability() {
  const provider = paymentProvider()
  const key = process.env.STRIPE_SECRET_KEY || ""
  const configured =
    provider === "stripe" &&
    isTestStripeSecretKey(key) &&
    !isLiveStripeSecretKey(key) &&
    !!process.env.STRIPE_WEBHOOK_SECRET
  return {
    provider,
    status: provider === "disabled" ? "disabled" : configured ? "configured" : "unavailable",
    available: configured,
    providerValidated: false,
    externalPayoutsAvailable: false,
  }
}

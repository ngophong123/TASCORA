import { Response, NextFunction, Request } from "express"
import { AuthRequest } from "../../middlewares/requireAuth"
import { PaymentService } from "./payment.service"
import { StripeConnectService } from "../financial/stripe-connect.service"
import Stripe from "stripe"
import { isProduction } from "../../lib/config"
import { HttpError } from "../../lib/errors"
import { assertPaymentsEnabled, isLiveStripeSecretKey } from "../../lib/payment-provider"

const CONNECT_WEBHOOK_TYPES = new Set(["account.updated", "payout.paid", "payout.failed"])

export const createIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await PaymentService.createPaymentIntent(req.user!.userId, req.body.orderId)
    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}
export const handleWebhook = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    assertPaymentsEnabled()
  } catch (error) {
    if (error instanceof HttpError) {
      res
        .status(error.status)
        .json({ success: false, error: { code: error.code, message: error.message } })
      return
    }
    res.status(503).json({
      success: false,
      error: {
        code: "PAYMENT_PROVIDER_UNAVAILABLE",
        message: "Payments are temporarily unavailable in this environment.",
      },
    })
    return
  }
  let event: Stripe.Event
  try {
    const signature = req.headers["stripe-signature"]
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret || typeof signature !== "string" || !Buffer.isBuffer(req.body))
      throw new Error("Invalid webhook")
    event = Stripe.webhooks.constructEvent(req.body, signature, secret)
    if (isLiveStripeSecretKey(process.env.STRIPE_SECRET_KEY)) {
      throw new Error("Live Stripe credentials are forbidden")
    }
    if (event.livemode !== false) {
      throw new Error("Only Stripe test-mode webhook events are accepted")
    }
  } catch {
    res.status(400).json({ success: false, error: "Invalid webhook signature or payload" })
    return
  }
  try {
    if (CONNECT_WEBHOOK_TYPES.has(event.type)) {
      await StripeConnectService.handleConnectWebhookEvent(event)
    } else {
      await PaymentService.handleWebhookEvent(event)
    }
    res.json({ received: true })
  } catch (error) {
    const status = error instanceof HttpError && error.status === 400 ? 400 : 500
    res.status(status).json({
      success: false,
      error:
        isProduction || !(error instanceof HttpError) ? "Webhook processing failed" : error.message,
    })
  }
}

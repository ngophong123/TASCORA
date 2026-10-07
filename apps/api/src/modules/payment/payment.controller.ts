import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';
import { isProduction } from '../../lib/config';
import { HttpError } from '../../lib/errors';

export const createIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { const result = await PaymentService.createPaymentIntent(req.user!.userId, req.body.orderId); res.json({ success: true, data: result }); }
  catch (error) { next(error); }
};
export const handleWebhook = async (req: Request, res: Response, _next: NextFunction) => {
  let event: Stripe.Event;
  try {
    const signature = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || typeof signature !== 'string' || !Buffer.isBuffer(req.body)) throw new Error('Invalid webhook');
    event = Stripe.webhooks.constructEvent(req.body, signature, secret);
    if (process.env.APP_ENV === 'staging' && event.livemode) throw new Error('Staging rejects live events');
    const expectsLive = /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY || '');
    if (event.livemode !== expectsLive) throw new Error('Stripe mode mismatch');
  } catch { res.status(400).json({ success: false, error: 'Invalid webhook signature or payload' }); return; }
  try { await PaymentService.handleWebhookEvent(event); res.json({ received: true }); }
  catch (error) {
    const status = error instanceof HttpError && error.status === 400 ? 400 : 500;
    res.status(status).json({ success: false, error: isProduction || !(error instanceof HttpError) ? 'Webhook processing failed' : error.message });
  }
};

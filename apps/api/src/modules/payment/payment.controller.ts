import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';

export const createIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const buyerId = req.user!.userId;
    const { orderId } = req.body;
    const result = await PaymentService.createPaymentIntent(buyerId, orderId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123';
    
    // We expect req.body to be the raw Buffer
    const event = Stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret
    );

    await PaymentService.handleWebhookEvent(event);

    res.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

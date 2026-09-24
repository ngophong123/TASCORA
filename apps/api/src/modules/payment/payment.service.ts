import Stripe from 'stripe';
import { prisma } from '../../lib/prisma';
import { OrderStatus, TransactionStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
  apiVersion: '2024-04-10' as any, // Using latest stable version
});

export class PaymentService {
  static async createPaymentIntent(buyerId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });

    if (!order || order.buyerId !== buyerId) {
      throw new Error('Order not found or unauthorized');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Order is not in PENDING state');
    }

    // Stripe expects amount in cents
    const amountInCents = Math.round(Number(order.amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        buyerId,
      },
    });

    await prisma.transaction.upsert({
      where: { stripePaymentId: paymentIntent.id },
      update: { amount: order.amount },
      create: {
        orderId: order.id,
        stripePaymentId: paymentIntent.id,
        amount: order.amount,
        status: TransactionStatus.PENDING,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  static async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (!orderId) break;

        await prisma.$transaction(async (tx) => {
          // Update transaction
          const transaction = await tx.transaction.update({
            where: { stripePaymentId: paymentIntent.id },
            data: { status: TransactionStatus.SUCCEEDED },
          });

          // Create Escrow
          await tx.escrow.create({
            data: {
              transactionId: transaction.id,
              orderId,
              amount: transaction.amount,
              released: false,
            },
          });

          // Update Order Status
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: OrderStatus.PAID,
              activities: {
                create: {
                  type: 'PAYMENT_RECEIVED',
                  description: 'Payment successfully received and held in escrow',
                },
              },
            },
          });
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.transaction.update({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: TransactionStatus.FAILED },
        });
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}

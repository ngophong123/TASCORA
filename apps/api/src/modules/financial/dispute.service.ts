import crypto from 'node:crypto';
import type Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { OrderService } from '../order/order.service';
import { balances, basis, entry, financialTx, reasonSchema } from './domain';
import { cents, money, split } from './money';
import { RefundService, requireFinancialAdmin } from './refund.service';
import { assertPaymentsEnabled } from '../../lib/payment-provider';

const providerDisputeSchema = z.object({
  id: z.string().min(1).max(255),
  object: z.literal('dispute').optional(),
  amount: z.number().int().positive().safe().optional(),
  currency: z.string().min(1).max(10).optional(),
  reason: z.string().max(200).optional(),
  status: z.string().min(1).max(100),
  payment_intent: z.union([z.string().min(1), z.object({ id: z.string().min(1) })]).nullable().optional(),
  charge: z.union([z.string().min(1), z.object({ id: z.string().min(1) })]).nullable().optional(),
});

const ACTIVE_PROVIDER_DISPUTE_STATUSES = new Set([
  'warning_needs_response',
  'warning_under_review',
  'needs_response',
  'under_review',
]);

const TERMINAL_PROVIDER_DISPUTE_STATUSES = new Set([
  'won',
  'lost',
  'warning_closed',
]);

const TERMINAL_DISPUTE_STATES = new Set([
  'RESOLVED_SELLER',
  'RESOLVED_BUYER',
  'CLOSED',
]);

function providerDisputeStageRank(eventType: string, status: string): number {
  if (eventType === 'charge.dispute.closed' || TERMINAL_PROVIDER_DISPUTE_STATUSES.has(status)) return 3;
  if (status === 'under_review' || status === 'warning_under_review') return 2;
  if (eventType === 'charge.dispute.updated') return 1;
  if (eventType === 'charge.dispute.created') return 0;
  return 1;
}

type PersistedDisputeOrdering = {
  status: string;
  providerDisputeId: string | null;
  providerStatus: string | null;
  lastProviderEventType: string | null;
  lastProviderEventCreated: number | null;
  recoveryRequired: boolean;
};

function isStaleProviderDisputeEvent(
  existing: PersistedDisputeOrdering | null,
  incoming: {
    disputeId: string;
    eventType: string;
    status: string;
    created: number | null;
  }
): { stale: boolean; reason?: string } {
  if (!existing) return { stale: false };

  const incomingRank = providerDisputeStageRank(incoming.eventType, incoming.status);
  const existingProviderTerminal =
    Boolean(existing.providerStatus && TERMINAL_PROVIDER_DISPUTE_STATUSES.has(existing.providerStatus)) ||
    existing.lastProviderEventType === 'charge.dispute.closed';
  const existingMarketplaceTerminal = TERMINAL_DISPUTE_STATES.has(existing.status);
  const sameProviderDispute = !existing.providerDisputeId || existing.providerDisputeId === incoming.disputeId;

  // Never allow a stale created/updated webhook to reopen an already terminal dispute.
  if (sameProviderDispute && (existingProviderTerminal || existingMarketplaceTerminal)) {
    if (incomingRank < 3) {
      return {
        stale: true,
        reason: `Dispute ${incoming.disputeId} is already in terminal state (${existing.providerStatus ?? existing.status}); ignoring ${incoming.eventType} (${incoming.status})`,
      };
    }
    if (existingProviderTerminal) {
      return {
        stale: true,
        reason: `Dispute ${incoming.disputeId} already processed terminal closure (${existing.providerStatus ?? existing.lastProviderEventType}); ignoring duplicate/conflicting ${incoming.eventType} (${incoming.status})`,
      };
    }
  }

  // Enforce monotonic Stripe event.created ordering for the same provider dispute.
  if (sameProviderDispute && existing.lastProviderEventType) {
    const existingRank = providerDisputeStageRank(
      existing.lastProviderEventType,
      existing.providerStatus ?? ''
    );
    if (incoming.created !== null && existing.lastProviderEventCreated !== null) {
      if (incoming.created < existing.lastProviderEventCreated) {
        return {
          stale: true,
          reason: `Event timestamp ${incoming.created} precedes last accepted provider event ${existing.lastProviderEventCreated}`,
        };
      }
      if (incoming.created === existing.lastProviderEventCreated && incomingRank < existingRank) {
        return {
          stale: true,
          reason: `Event stage ${incoming.eventType}/${incoming.status} regresses same-timestamp stage ${existing.lastProviderEventType}/${existing.providerStatus ?? 'unknown'}`,
        };
      }
    } else if (incomingRank < existingRank) {
      return {
        stale: true,
        reason: `Event stage ${incoming.eventType}/${incoming.status} regresses accepted stage ${existing.lastProviderEventType}/${existing.providerStatus ?? 'unknown'}`,
      };
    }
  }

  return { stale: false };
}

export class DisputeService {
  static async open(buyerId: string, orderId: string, category: string, description: string) {
    reasonSchema.parse(description);
    return financialTx(async tx => {
      const order = await OrderService.load(tx, orderId);
      if (order.buyerId !== buyerId) throw new HttpError(404, 'Order not found');
      if (order.dispute) { if (order.dispute.category === category && order.dispute.description === description) return order.dispute; throw new HttpError(409, 'Order already has a dispute'); }
      basis(order);
      if (!order.escrow || order.escrow.released || !['PAID', 'IN_PROGRESS', 'IN_REVISION', 'DELIVERED'].includes(order.status)) throw new HttpError(409, 'Order is not eligible for a dispute');
      const dispute = await tx.marketplaceDispute.create({ data: { orderId, openedBy: buyerId, category, description } });
      await tx.order.update({ where: { id: orderId }, data: { status: 'DISPUTED', activities: { create: { type: 'DISPUTE_OPENED', description: 'Buyer opened an internal marketplace dispute' } } } });
      await entry(tx, orderId, 'DISPUTE_OPENED', `dispute:${dispute.id}:opened`, buyerId, { reason: description, notifyUserId: order.seller.userId });
      return dispute;
    }, orderId);
  }
  static async resolve(adminId: string, orderId: string, outcome: 'BUYER' | 'SELLER', reason: string) {
    await requireFinancialAdmin(adminId); reasonSchema.parse(reason);
    if (outcome === 'BUYER') assertPaymentsEnabled();
    return financialTx(async tx => {
      const order = await OrderService.load(tx, orderId);
      const dispute = order.dispute;
      if (!dispute) throw new HttpError(404, 'Dispute not found');
      const terminal = ['RESOLVED_SELLER', 'RESOLVED_BUYER', 'CLOSED'].includes(dispute.status);
      if (terminal) {
        const expectedStatus = outcome === 'SELLER' ? 'RESOLVED_SELLER' : 'RESOLVED_BUYER';
        if (dispute.resolutionReason !== reason || dispute.status !== expectedStatus) {
          throw new HttpError(409, 'Dispute already has another resolution');
        }
        return dispute;
      }
      if (!['OPEN', 'UNDER_REVIEW'].includes(dispute.status) || order.status !== 'DISPUTED') throw new HttpError(409, 'Dispute is not open');
      const activeRefunds = order.refunds.filter(refund => ['PENDING', 'PROCESSING'].includes(refund.status));
      if (dispute.status === 'UNDER_REVIEW' && dispute.resolvedBy && activeRefunds.length > 0) {
        if (outcome === 'BUYER' && dispute.resolutionReason === reason) return dispute;
        throw new HttpError(409, 'Dispute already has an active refund resolution in progress');
      }
      const failedRefundsCount = order.refunds.filter(refund => ['FAILED', 'CANCELLED'].includes(refund.status)).length;
      const isRetry = Boolean(dispute.resolvedBy);
      if (outcome === 'SELLER') {
        if (dispute.recoveryRequired) {
          throw new HttpError(409, 'Financial recovery required before releasing seller funds');
        }
        await OrderService.complete(tx, order, adminId, false, true);
        const eventKey = isRetry
          ? `dispute:${dispute.id}:resolution:seller:${failedRefundsCount}`
          : `dispute:${dispute.id}:resolution`;
        await entry(tx, orderId, 'DISPUTE_RESOLVED_SELLER', eventKey, adminId, { reason, notifyUserId: order.buyerId });
        return tx.marketplaceDispute.update({
          where: { id: dispute.id },
          data: { status: 'RESOLVED_SELLER', resolvedBy: adminId, resolutionReason: reason, resolvedAt: new Date() },
        });
      }
      const transaction = order.escrow && await tx.transaction.findUnique({ where: { id: order.escrow.transactionId } });
      if (!transaction) throw new HttpError(409, 'Verified payment required');
      const pending = activeRefunds.reduce((sum, refund) => sum + cents(refund.amount), 0);
      const amount = cents(transaction.amount) - cents(transaction.refundedAmount, true) - pending;
      if (amount > 0) {
        const refundRequestKey = failedRefundsCount === 0
          ? `dispute_${dispute.id}`
          : `dispute_${dispute.id}_retry_${failedRefundsCount}`;
        await RefundService.reserve(tx, adminId, orderId, amount, reason, refundRequestKey, true);
      }
      const eventKey = isRetry
        ? `dispute:${dispute.id}:resolution:retry:${failedRefundsCount}`
        : `dispute:${dispute.id}:resolution`;
      await entry(tx, orderId, 'DISPUTE_RESOLVED_BUYER', eventKey, adminId, { reason, notifyUserId: order.buyerId });
      return tx.marketplaceDispute.update({
        where: { id: dispute.id },
        data: { status: 'UNDER_REVIEW', resolvedBy: adminId, resolutionReason: reason, resolvedAt: null },
      });
    }, orderId);
  }
  static async handleProviderDisputeEvent(event: Stripe.Event) {
    assertPaymentsEnabled();
    if (!event.id || !event.data?.object || !['charge.dispute.created', 'charge.dispute.updated', 'charge.dispute.closed'].includes(event.type)) {
      throw new HttpError(400, 'Malformed provider dispute event');
    }
    const parsed = providerDisputeSchema.safeParse(event.data.object);
    if (!parsed.success) throw new HttpError(400, 'Malformed provider dispute payload');
    const dispute = parsed.data;
    if (dispute.currency && dispute.currency.toLowerCase() !== 'usd') {
      throw new HttpError(400, 'Unsupported dispute currency');
    }
    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;
    if (!paymentIntentId) {
      throw new HttpError(400, 'Dispute event missing payment_intent reference');
    }
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(event.data.object)).digest('hex');
    const lookupTx = await prisma.transaction.findUnique({
      where: { stripePaymentId: paymentIntentId },
      select: { id: true, orderId: true },
    });
    if (!lookupTx) throw new HttpError(409, 'Disputed payment record not available');

    return financialTx(async tx => {
      const order = await OrderService.load(tx, lookupTx.orderId);
      const seen = await tx.providerEvent.findUnique({ where: { id: event.id } });
      if (seen) {
        if (seen.type !== event.type || seen.payloadHash !== payloadHash) {
          throw new HttpError(409, 'Conflicting Stripe webhook event replay detected');
        }
        return { handled: true, deduplicated: true, staleIgnored: false, type: event.type, objectId: dispute.id, orderId: order.id };
      }

      const transaction = await tx.transaction.findUniqueOrThrow({ where: { id: lookupTx.id } });
      const incomingCreated =
        typeof event.created === 'number' && Number.isInteger(event.created) && event.created > 0
          ? event.created
          : null;

      const staleness = isStaleProviderDisputeEvent(order.dispute, {
        disputeId: dispute.id,
        eventType: event.type,
        status: dispute.status,
        created: incomingCreated,
      });

      if (staleness.stale) {
        await entry(tx, order.id, 'PROVIDER_DISPUTE_STALE_IGNORED', `stripe-dispute:${event.id}`, null, {
          transactionId: transaction.id,
          providerId: dispute.id,
          reason: staleness.reason,
        });
        await tx.providerEvent.create({
          data: { id: event.id, type: event.type, objectId: dispute.id, payloadHash },
        });
        return { handled: true, deduplicated: false, staleIgnored: true, type: event.type, objectId: dispute.id, orderId: order.id };
      }

      const orderingMeta = {
        providerDisputeId: dispute.id,
        providerStatus: dispute.status,
        lastProviderEventId: event.id,
        lastProviderEventType: event.type,
        lastProviderEventCreated: incomingCreated,
      };

      const suffix = event.type.split('.').pop()?.toUpperCase() || 'EVENT';
      const detailReason = `${dispute.reason || 'provider_dispute'} (${dispute.status})`;
      await entry(tx, order.id, `PROVIDER_DISPUTE_${suffix}`, `stripe-dispute:${event.id}`, null, {
        transactionId: transaction.id,
        providerId: dispute.id,
        reason: detailReason,
        notifyUserId: order.seller.userId,
      });

      const isActive = event.type !== 'charge.dispute.closed' && ACTIVE_PROVIDER_DISPUTE_STATUSES.has(dispute.status);
      if (isActive || event.type === 'charge.dispute.created') {
        const nextDisputeStatus = dispute.status.includes('under_review') ? 'UNDER_REVIEW' : 'OPEN';
        const description = `Stripe chargeback ${dispute.id}: ${detailReason}`;
        if (!order.dispute) {
          await tx.marketplaceDispute.create({
            data: {
              orderId: order.id,
              openedBy: order.buyerId,
              category: 'PAYMENT_CHARGEBACK',
              description,
              status: nextDisputeStatus,
              ...orderingMeta,
            },
          });
        } else {
          await tx.marketplaceDispute.update({
            where: { id: order.dispute.id },
            data: {
              status: nextDisputeStatus,
              description,
              resolvedAt: null,
              ...orderingMeta,
            },
          });
        }
        if (order.status !== 'DISPUTED' && order.status !== 'REFUNDED') {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'DISPUTED',
              activities: {
                create: {
                  type: 'DISPUTE_OPENED',
                  description: `Stripe payment dispute ${dispute.id} opened (${dispute.status}); seller funds frozen`,
                },
              },
            },
          });
        }
      } else if (event.type === 'charge.dispute.closed') {
        if (dispute.status === 'won' || dispute.status === 'warning_closed') {
          const resolutionReason = `Stripe dispute ${dispute.id} closed (${dispute.status})`;
          if (order.dispute) {
            await tx.marketplaceDispute.update({
              where: { id: order.dispute.id },
              data: {
                status: 'RESOLVED_SELLER',
                resolutionReason,
                resolvedAt: new Date(),
                ...orderingMeta,
              },
            });
          } else {
            await tx.marketplaceDispute.create({
              data: {
                orderId: order.id,
                openedBy: order.buyerId,
                category: 'PAYMENT_CHARGEBACK',
                description: resolutionReason,
                status: 'RESOLVED_SELLER',
                resolutionReason,
                resolvedAt: new Date(),
                ...orderingMeta,
              },
            });
          }
          if (order.status === 'DISPUTED' && !order.dispute?.recoveryRequired) {
            const restoredStatus = order.escrow?.released
              ? 'COMPLETED'
              : order.deliveries.length > 0
                ? 'DELIVERED'
                : 'PAID';
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: restoredStatus,
                activities: {
                  create: {
                    type: 'DISPUTE_CLOSED',
                    description: `Stripe dispute ${dispute.id} won; order restored to ${restoredStatus}`,
                  },
                },
              },
            });
          }
        } else if (dispute.status === 'lost') {
          const gross = cents(transaction.amount);
          const alreadyRefunded = cents(transaction.refundedAmount, true);
          const remaining = Math.max(0, gross - alreadyRefunded);
          const lossAmount = dispute.amount !== undefined ? Math.min(dispute.amount, remaining) : remaining;
          const totalAfterLoss = alreadyRefunded + lossAmount;
          const isFullLoss = totalAfterLoss === gross && gross > 0;

          const lossEventKey = `chargeback-loss:${dispute.id}`;
          const existingLossEntry = await tx.financialEntry.findUnique({ where: { eventKey: lossEventKey } });

          let recoveryRequired = false;
          let appliedFullRefund = false;

          if (!existingLossEntry) {
            if (lossAmount === 0) {
              appliedFullRefund = alreadyRefunded === gross && gross > 0;
            } else if (order.platformFeeBps === null || order.platformFeeBps === undefined) {
              recoveryRequired = true;
              await entry(tx, order.id, 'CHARGEBACK_RECOVERY_REQUIRED', lossEventKey, null, {
                amount: lossAmount,
                transactionId: transaction.id,
                providerId: dispute.id,
                reason: `Stripe dispute ${dispute.id} closed (lost); missing platform fee basis requires financial recovery`,
                notifyUserId: order.seller.userId,
              });
            } else {
              const oldSplit = split(gross - alreadyRefunded, order.platformFeeBps);
              const newSplit = split(gross - totalAfterLoss, order.platformFeeBps);
              const reversal = oldSplit.earning - newSplit.earning;
              const balance = await balances(tx, order.id);
              const targetBucket = order.escrow?.released ? balance.available : balance.pending;
              if (balance.reserved === 0 && balance.paid === 0 && targetBucket >= reversal) {
                await entry(tx, order.id, 'CHARGEBACK_LOST', lossEventKey, null, {
                  amount: lossAmount,
                  pending: order.escrow?.released ? 0 : -reversal,
                  available: order.escrow?.released ? -reversal : 0,
                  fee: newSplit.fee - oldSplit.fee,
                  transactionId: transaction.id,
                  providerId: dispute.id,
                  reason: isFullLoss
                    ? `Stripe dispute ${dispute.id} closed (lost; full refund)`
                    : `Stripe partial chargeback ${dispute.id} closed (lost ${money(lossAmount).toFixed(2)} of ${money(gross).toFixed(2)} USD)`,
                  notifyUserId: order.seller.userId,
                });
                await tx.transaction.update({
                  where: { id: transaction.id },
                  data: {
                    refundedAmount: money(totalAfterLoss),
                    status: isFullLoss ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
                  },
                });
                appliedFullRefund = isFullLoss;
              } else {
                recoveryRequired = true;
                await entry(tx, order.id, 'CHARGEBACK_RECOVERY_REQUIRED', lossEventKey, null, {
                  amount: lossAmount,
                  transactionId: transaction.id,
                  providerId: dispute.id,
                  reason: `Stripe dispute ${dispute.id} closed (lost ${money(lossAmount).toFixed(2)} USD); financial recovery required (reserved=${balance.reserved}c, paid=${balance.paid}c)`,
                  notifyUserId: order.seller.userId,
                });
              }
            }
          } else {
            recoveryRequired = existingLossEntry.type === 'CHARGEBACK_RECOVERY_REQUIRED';
            appliedFullRefund = !recoveryRequired && cents(transaction.refundedAmount, true) === gross && gross > 0;
          }

          const disputeStatus = recoveryRequired ? 'UNDER_REVIEW' : 'RESOLVED_BUYER';
          const resolutionReason = recoveryRequired
            ? `Stripe dispute ${dispute.id} closed (lost); financial recovery required`
            : appliedFullRefund
              ? `Stripe dispute ${dispute.id} closed (lost; full refund)`
              : `Stripe partial chargeback ${dispute.id} closed (lost ${money(lossAmount).toFixed(2)} of ${money(gross).toFixed(2)} USD)`;
          const resolvedAt = recoveryRequired ? null : new Date();

          if (order.dispute) {
            await tx.marketplaceDispute.update({
              where: { id: order.dispute.id },
              data: {
                status: disputeStatus,
                resolutionReason,
                resolvedAt,
                recoveryRequired,
                ...orderingMeta,
              },
            });
          } else {
            await tx.marketplaceDispute.create({
              data: {
                orderId: order.id,
                openedBy: order.buyerId,
                category: 'PAYMENT_CHARGEBACK',
                description: resolutionReason,
                status: disputeStatus,
                resolutionReason,
                resolvedAt,
                recoveryRequired,
                ...orderingMeta,
              },
            });
          }

          if (appliedFullRefund && !recoveryRequired) {
            if (order.status !== 'REFUNDED') {
              await tx.order.update({
                where: { id: order.id },
                data: {
                  status: 'REFUNDED',
                  activities: {
                    create: {
                      type: 'CHARGEBACK_LOST',
                      description: `Stripe full chargeback ${dispute.id} lost; order refunded`,
                    },
                  },
                },
              });
            }
          } else {
            const activityType = recoveryRequired ? 'CHARGEBACK_RECOVERY_REQUIRED' : 'CHARGEBACK_PARTIAL_LOST';
            const activityDescription = recoveryRequired
              ? `Stripe chargeback ${dispute.id} lost while funds were reserved or paid; financial recovery required`
              : `Stripe partial chargeback ${dispute.id} lost (${money(lossAmount).toFixed(2)} of ${money(gross).toFixed(2)} USD); transaction partially refunded, order remains DISPUTED`;
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'DISPUTED',
                activities: {
                  create: {
                    type: activityType,
                    description: activityDescription,
                  },
                },
              },
            });
          }
        } else if (order.dispute && ['OPEN', 'UNDER_REVIEW'].includes(order.dispute.status)) {
          await tx.marketplaceDispute.update({
            where: { id: order.dispute.id },
            data: {
              status: 'CLOSED',
              resolutionReason: `Stripe dispute ${dispute.id} closed (${dispute.status})`,
              resolvedAt: new Date(),
              ...orderingMeta,
            },
          });
        }
      }

      await tx.providerEvent.create({
        data: { id: event.id, type: event.type, objectId: dispute.id, payloadHash },
      });
      return { handled: true, deduplicated: false, staleIgnored: false, type: event.type, objectId: dispute.id, orderId: order.id };
    }, lookupTx.orderId);
  }
  static async evidence(adminId: string, orderId: string) {
    await requireFinancialAdmin(adminId);
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { deliveries: true, revisions: true, dispute: true, activities: true, refunds: true, financialEntries: { orderBy: { createdAt: 'asc' } }, transactions: { select: { id: true, stripePaymentId: true, amount: true, refundedAmount: true, currency: true, status: true } }, conversation: { select: { id: true, messages: { orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, senderId: true, content: true, attachmentUrl: true, createdAt: true } } } } } });
    if (!order) throw new HttpError(404, 'Order not found');
    return order;
  }
}

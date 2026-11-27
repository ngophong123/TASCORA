import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth';
import { requireAdminRole } from '../admin/admin.controller';
import { validate } from '../../middlewares/validate';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { PayoutService } from './payout.service';
import { RefundService, requireFinancialAdmin } from './refund.service';
import { DisputeService } from './dispute.service';
import { StripeConnectService } from './stripe-connect.service';
import { runAdminReconciliationReport } from './reconciliation.service';
import { PaymentService, stripe, assertProviderConfigured } from '../payment/payment.service';
import { entry, financialTx, lockOrder, requestKey, reasonSchema, financialRecordView, orderMutationView } from './domain';
import { cents } from './money';
import crypto from 'node:crypto';

const router = Router(); router.use(requireAuth);
const idParams = z.object({ id: z.string().cuid() });
const refundBody = z.object({ amount: z.string().regex(/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/).optional(), reason: reasonSchema, idempotencyKey: requestKey }).strict();
const onboardingLinkBody = z.object({ returnUrl: z.string().url(), refreshUrl: z.string().url() }).strict();
router.get('/earnings', async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await PayoutService.summary(req.user!.userId) }); } catch (error) { next(error); } });
router.get('/connect/eligibility', async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await StripeConnectService.getEligibility(req.user!.userId) }); } catch (error) { next(error); } });
router.post('/connect/account', async (req: AuthRequest, res, next) => { try { res.status(201).json({ success: true, data: await StripeConnectService.createOrGetTestAccount(req.user!.userId) }); } catch (error) { next(error); } });
router.post('/connect/onboarding-link', validate(z.object({ body: onboardingLinkBody })), async (req: AuthRequest, res, next) => { try { const body = req.body as z.infer<typeof onboardingLinkBody>; res.status(201).json({ success: true, data: await StripeConnectService.createOnboardingLink(req.user!.userId, body.returnUrl, body.refreshUrl) }); } catch (error) { next(error); } });
router.post('/orders/:id/refunds', validate(z.object({ params: idParams, body: refundBody })), async (req: AuthRequest, res, next) => { try { const body = req.body as z.infer<typeof refundBody>; res.status(201).json({ success: true, data: financialRecordView(await RefundService.request(req.user!.userId, req.params.id!, body.amount, body.reason, body.idempotencyKey)) }); } catch (error) { next(error); } });
router.post('/orders/:id/disputes', validate(z.object({ params: idParams, body: z.object({ category: z.enum(['DELIVERY', 'QUALITY', 'COMMUNICATION', 'OTHER']), description: reasonSchema }).strict() })), async (req: AuthRequest, res, next) => { try { res.status(201).json({ success: true, data: await DisputeService.open(req.user!.userId, req.params.id!, req.body.category as string, req.body.description as string) }); } catch (error) { next(error); } });
router.post('/orders/:id/payouts', validate(z.object({ params: idParams, body: z.object({ idempotencyKey: requestKey }).strict() })), async (req: AuthRequest, res, next) => { try { res.status(201).json({ success: true, data: financialRecordView(await PayoutService.request(req.user!.userId, req.params.id!, req.body.idempotencyKey as string)) }); } catch (error) { next(error); } });
router.post('/orders/:id/cancel-payment', validate(z.object({ params: idParams, body: z.object({}).strict() })), async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: orderMutationView(await PaymentService.cancelPayment(req.user!.userId, req.params.id!)) }); } catch (error) { next(error); } });
router.use('/admin', requireAdminRole);
router.get('/admin/queue', async (_req, res, next) => {
  try { const [disputes, refunds, payouts] = await Promise.all([
    prisma.marketplaceDispute.findMany({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } }, orderBy: { createdAt: 'asc' }, take: 100 }),
    prisma.refund.findMany({ where: { status: { in: ['PENDING', 'PROCESSING'] } }, orderBy: { createdAt: 'asc' }, take: 100 }),
    prisma.payout.findMany({ where: { status: { in: ['PENDING', 'PROCESSING', 'FAILED'] } }, select: { id: true, sellerProfileId: true, amount: true, status: true, failureReason: true, escrow: { select: { orderId: true } } }, take: 100 }),
  ]); res.json({ success: true, data: { disputes, refunds, payouts, payoutProviderAvailable: false } }); } catch (error) { next(error); }
});
router.get('/admin/orders/:id', validate(z.object({ params: idParams })), async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await DisputeService.evidence(req.user!.userId, req.params.id!) }); } catch (error) { next(error); } });
router.post('/admin/orders/:id/resolve', validate(z.object({ params: idParams, body: z.object({ outcome: z.enum(['BUYER', 'SELLER']), reason: reasonSchema }).strict() })), async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await DisputeService.resolve(req.user!.userId, req.params.id!, req.body.outcome as 'BUYER' | 'SELLER', req.body.reason as string) }); } catch (error) { next(error); } });
router.post('/admin/refunds/:id/process', validate(z.object({ params: idParams })), async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await RefundService.process(req.user!.userId, req.params.id!) }); } catch (error) { next(error); } });
router.post('/admin/refunds/:id/retry', validate(z.object({ params: idParams, body: z.object({ idempotencyKey: requestKey }).strict() })), async (req: AuthRequest, res, next) => { try { res.status(201).json({ success: true, data: financialRecordView(await RefundService.retry(req.user!.userId, req.params.id!, req.body.idempotencyKey as string)) }); } catch (error) { next(error); } });
router.post('/admin/payouts/:id/process', validate(z.object({ params: idParams })), async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await PayoutService.process(req.user!.userId, req.params.id!) }); } catch (error) { next(error); } });
router.get('/admin/orders/:id/reconciliation', validate(z.object({ params: idParams })), async (req: AuthRequest, res, next) => {
  try {
    await requireFinancialAdmin(req.user!.userId); assertProviderConfigured();
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { transactions: true } });
    if (!order) throw new HttpError(404, 'Order not found');
    const diagnostics = [];
    for (const transaction of order.transactions) {
      if (!transaction.stripePaymentId) { diagnostics.push({ transactionId: transaction.id, local: transaction.status, warning: 'Unbound provider attempt; search Stripe by transactionId metadata, do not create another old attempt' }); continue; }
      const remote = await stripe.paymentIntents.retrieve(transaction.stripePaymentId);
      const refunds = await stripe.refunds.list({ payment_intent: transaction.stripePaymentId, limit: 100 });
      const refundedMinor = refunds.data.filter(refund => refund.status === 'succeeded').reduce((sum, refund) => sum + refund.amount, 0);
      diagnostics.push({ transactionId: transaction.id, local: transaction.status, providerStatus: remote.status, matches: remote.amount === cents(order.amount) && remote.currency === order.currency && remote.metadata.orderId === order.id && remote.metadata.buyerId === order.buyerId, requiresFundingReconciliation: remote.status === 'succeeded' && !['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(transaction.status), localRefundedMinor: cents(transaction.refundedAmount, true), providerRefundedMinor: refundedMinor, refundMismatch: refunds.has_more || refundedMinor !== cents(transaction.refundedAmount, true), refundScanIncomplete: refunds.has_more });
    }
    await financialTx(async tx => { await lockOrder(tx, order.id); await entry(tx, order.id, 'RECONCILIATION_CHECK', `diagnostic:${crypto.randomUUID()}`, req.user!.userId); });
    const payouts = await prisma.payout.findMany({ where: { escrow: { orderId: order.id } }, select: { id: true, status: true, amount: true, updatedAt: true } });
    res.json({ success: true, data: { payments: diagnostics, payouts: payouts.map(payout => ({ ...payout, providerUnvalidated: true, requiresManualReconciliation: payout.status === 'PROCESSING' })) } });
  } catch (error) { next(error); }
});
const reconciliationReportBody = z.object({
  limit: z.number().int().min(1).max(200).optional(),
  cursor: z.string().cuid().optional(),
  stripeStartingAfter: z.string().min(1).max(255).optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  maxStripePages: z.number().int().min(1).max(20).optional(),
  maxRefundPagesPerPayment: z.number().int().min(1).max(20).optional(),
}).strict();
router.post('/admin/reconciliation/report', validate(z.object({ body: reconciliationReportBody.optional() })), async (req: AuthRequest, res, next) => {
  try {
    await requireFinancialAdmin(req.user!.userId);
    assertProviderConfigured();
    const body = (req.body || {}) as z.infer<typeof reconciliationReportBody>;
    const report = await runAdminReconciliationReport({
      limit: body.limit,
      cursor: body.cursor,
      stripeStartingAfter: body.stripeStartingAfter,
      createdFrom: body.createdFrom ? new Date(body.createdFrom) : undefined,
      createdTo: body.createdTo ? new Date(body.createdTo) : undefined,
      maxStripePages: body.maxStripePages,
      maxRefundPagesPerPayment: body.maxRefundPagesPerPayment,
    });
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});
export default router;

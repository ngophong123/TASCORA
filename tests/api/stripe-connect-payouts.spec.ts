import https from 'node:https';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import type Stripe from 'stripe';

const mocks = vi.hoisted(() => {
  const model = () => ({
    count: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  });
  return {
    sellerProfile: model(),
    marketplaceDispute: model(),
    providerEvent: model(),
    notification: model(),
    transaction: model(),
    financialEntry: model(),
    user: model(),
    events: new Map<string, { id: string; type: string; payloadHash: string }>(),
  };
});

vi.mock('../../apps/api/src/lib/prisma', () => ({
  prisma: {
    ...mocks,
    $transaction: async (fn: (tx: typeof mocks) => Promise<unknown>) => fn(mocks),
  },
}));

vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (
    req: express.Request & { user?: { userId: string; role: string } },
    res: express.Response,
    next: express.NextFunction
  ) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor) return res.status(401).json({ success: false });
    req.user = { userId: actor, role: actor === 'admin' ? 'ADMIN' : actor === 'seller' ? 'SELLER' : 'BUYER' };
    next();
  },
}));

import financialRouter from '../../apps/api/src/modules/financial/financial.route';
import { StripeConnectService } from '../../apps/api/src/modules/financial/stripe-connect.service';
import { stripe } from '../../apps/api/src/modules/payment/payment.service';

const app = express();
app.use(express.json());
app.use('/api/v1/financial', financialRouter);
app.use(
  (
    err: Error & { status?: number; code?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    res.status(err.status || 500).json({ success: false, error: { code: err.code || 'ERROR', message: err.message } });
  }
);

describe('Phase 4C Stripe Connect Test-Mode Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.events.clear();
    vi.stubEnv('APP_ENV', 'test');
    vi.stubEnv('PAYMENTS_PROVIDER', 'stripe');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_connect_mock');
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_connect_mock');
    vi.spyOn(https, 'request').mockImplementation(() => {
      throw new Error('Outbound HTTPS forbidden in Connect tests');
    });
    mocks.providerEvent.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
      mocks.events.get(where.id) ?? null
    );
    mocks.providerEvent.create.mockImplementation(
      async ({ data }: { data: { id: string; type: string; payloadHash: string } }) => {
        mocks.events.set(data.id, data);
        return data;
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('evaluates seller payout eligibility strictly (blocks unverified KYC, active dispute, or missing Connect account)', async () => {
    mocks.sellerProfile.findUnique.mockResolvedValueOnce({
      id: 'sp_1',
      userId: 'seller',
      status: 'APPROVED',
      verificationStatus: 'PENDING',
      stripeAccountId: null,
      user: { status: 'ACTIVE' },
    });
    mocks.marketplaceDispute.count.mockResolvedValueOnce(1);

    const blocked = await request(app)
      .get('/api/v1/financial/connect/eligibility')
      .set('Authorization', 'Bearer seller');
    expect(blocked.status).toBe(200);
    expect(blocked.body.data.eligibleForLivePayouts).toBe(false);
    expect(blocked.body.data.eligibleForTestModePayouts).toBe(false);
    expect(blocked.body.data.blockingReasons).toContain('KYC_NOT_APPROVED');
    expect(blocked.body.data.blockingReasons).toContain('STRIPE_CONNECT_ACCOUNT_MISSING');

    mocks.sellerProfile.findUnique.mockResolvedValueOnce({
      id: 'sp_1',
      userId: 'seller',
      status: 'APPROVED',
      verificationStatus: 'APPROVED',
      stripeAccountId: 'acct_test_12345',
      user: { status: 'ACTIVE' },
    });
    mocks.marketplaceDispute.count.mockResolvedValueOnce(0);

    const eligible = await request(app)
      .get('/api/v1/financial/connect/eligibility')
      .set('Authorization', 'Bearer seller');
    expect(eligible.status).toBe(200);
    expect(eligible.body.data.eligibleForLivePayouts).toBe(false);
    expect(eligible.body.data.eligibleForTestModePayouts).toBe(true);
    expect(eligible.body.data.testModeOnly).toBe(true);
  });

  it('creates an idempotent Stripe Connect test account and onboarding link with safe origins', async () => {
    mocks.sellerProfile.findUnique.mockResolvedValue({
      id: 'sp_1',
      userId: 'seller',
      status: 'APPROVED',
      verificationStatus: 'APPROVED',
      stripeAccountId: null,
      user: { email: 'seller@test.invalid', status: 'ACTIVE' },
    });
    mocks.sellerProfile.update.mockResolvedValue({ id: 'sp_1', stripeAccountId: 'acct_test_999' });

    const createAcctSpy = vi
      .spyOn(stripe.accounts, 'create')
      .mockResolvedValue({ id: 'acct_test_999' } as unknown as Stripe.Response<Stripe.Account>);
    const createLinkSpy = vi
      .spyOn(stripe.accountLinks, 'create')
      .mockResolvedValue({
        url: 'https://connect.stripe.com/setup/e/acct_test_999/test',
        expires_at: 1800000000,
      } as unknown as Stripe.Response<Stripe.AccountLink>);

    const acctRes = await request(app)
      .post('/api/v1/financial/connect/account')
      .set('Authorization', 'Bearer seller');
    expect(acctRes.status).toBe(201);
    expect(acctRes.body.data.stripeAccountId).toBe('acct_test_999');
    expect(createAcctSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'express' }),
      { idempotencyKey: 'connect-account:sp_1' }
    );

    const linkRes = await request(app)
      .post('/api/v1/financial/connect/onboarding-link')
      .set('Authorization', 'Bearer seller')
      .send({
        returnUrl: 'http://localhost:3200/en/dashboard/earnings',
        refreshUrl: 'http://localhost:3200/en/dashboard/earnings?refresh=1',
      });
    expect(linkRes.status).toBe(201);
    expect(linkRes.body.data.url).toContain('connect.stripe.com');
    expect(createLinkSpy).toHaveBeenCalledOnce();

    // Disallowed untrusted redirect origin must be rejected
    const badLink = await request(app)
      .post('/api/v1/financial/connect/onboarding-link')
      .set('Authorization', 'Bearer seller')
      .send({
        returnUrl: 'https://evil.example/phish',
        refreshUrl: 'http://localhost:3200/en/dashboard/earnings',
      });
    expect(badLink.status).toBe(400);
  });

  it('enforces KYC + seller eligibility inside test-mode payout adapter and submits idempotent test transfers', async () => {
    const provider = StripeConnectService.createTestModePayoutProvider();

    // Unverified KYC seller is blocked before calling Stripe
    mocks.sellerProfile.findUnique.mockResolvedValueOnce({
      id: 'sp_unverified',
      status: 'APPROVED',
      verificationStatus: 'PENDING',
      stripeAccountId: 'acct_test_1',
      user: { status: 'ACTIVE' },
    });
    const transferSpy = vi.spyOn(stripe.transfers, 'create');
    await expect(
      provider.submit({ reference: 'payout:p1:attempt:1', sellerId: 'sp_unverified', amount: 9000, currency: 'usd' })
    ).rejects.toThrow('KYC_NOT_APPROVED');
    expect(transferSpy).not.toHaveBeenCalled();

    // Verified seller succeeds in test mode with idempotency key
    mocks.sellerProfile.findUnique.mockResolvedValueOnce({
      id: 'sp_verified',
      status: 'APPROVED',
      verificationStatus: 'APPROVED',
      stripeAccountId: 'acct_test_verified',
      user: { status: 'ACTIVE' },
    });
    transferSpy.mockResolvedValueOnce({
      id: 'tr_test_001',
      amount: 9000,
      currency: 'usd',
      reversed: false,
    } as unknown as Stripe.Response<Stripe.Transfer>);

    const result = await provider.submit({
      reference: 'payout:p2:attempt:1',
      sellerId: 'sp_verified',
      amount: 9000,
      currency: 'usd',
    });
    expect(result).toEqual({
      reference: 'payout:p2:attempt:1',
      providerId: 'tr_test_001',
      amount: 9000,
      currency: 'usd',
      status: 'PAID',
    });
    expect(transferSpy).toHaveBeenCalledWith(
      expect.objectContaining({ destination: 'acct_test_verified', amount: 9000, currency: 'usd' }),
      { idempotencyKey: 'payout:p2:attempt:1' }
    );
  });

  it('handles account.updated and charge.dispute.created webhooks idempotently and deduplicates replays', async () => {
    mocks.sellerProfile.findFirst.mockResolvedValueOnce({ id: 'sp_1', userId: 'seller' });
    mocks.notification.create.mockResolvedValueOnce({ id: 'notif_1' });

    const acctEvent = {
      id: 'evt_acct_1',
      type: 'account.updated',
      livemode: false,
      data: { object: { id: 'acct_test_1', payouts_enabled: true, charges_enabled: true, details_submitted: true } },
    } as unknown as Stripe.Event;

    const first = await StripeConnectService.handleConnectWebhookEvent(acctEvent);
    expect(first).toMatchObject({ handled: true, deduplicated: false });
    expect(mocks.notification.create).toHaveBeenCalledTimes(1);

    const replay = await StripeConnectService.handleConnectWebhookEvent(acctEvent);
    expect(replay).toMatchObject({ handled: true, deduplicated: true });
    expect(mocks.notification.create).toHaveBeenCalledTimes(1);

    mocks.transaction.findUnique.mockResolvedValueOnce({
      orderId: 'ord_dispute_1',
      order: { buyerId: 'buyer', seller: { userId: 'seller' } },
    });
    mocks.financialEntry.create.mockResolvedValueOnce({ id: 'fe_dispute_1' });
    const disputeEvent = {
      id: 'evt_disp_1',
      type: 'charge.dispute.created',
      livemode: false,
      data: { object: { id: 'dp_test_1', payment_intent: 'pi_test_1', reason: 'fraudulent', status: 'needs_response' } },
    } as unknown as Stripe.Event;

    const disputeRes = await StripeConnectService.handleConnectWebhookEvent(disputeEvent);
    expect(disputeRes).toMatchObject({ handled: true, deduplicated: false });
    expect(mocks.financialEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'ord_dispute_1',
          type: 'PROVIDER_DISPUTE_CREATED',
          eventKey: 'stripe-dispute:evt_disp_1',
        }),
      })
    );
  });
});

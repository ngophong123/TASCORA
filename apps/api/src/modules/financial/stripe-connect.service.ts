import crypto from 'node:crypto';
import type Stripe from 'stripe';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { isAllowedOrigin } from '../../lib/config';
import { assertPaymentsEnabled, paymentProvider } from '../../lib/payment-provider';
import { evaluateSellerPayoutEligibility, type SellerPayoutEligibility } from '../kyc/payout-eligibility';
import { stripe } from '../payment/payment.service';
import type { PayoutProvider } from './payout.service';

export interface SellerTestConnectEligibility extends SellerPayoutEligibility {
  eligibleForTestModePayouts: boolean;
  hasStripeAccountId: boolean;
  hasActiveDisputeHold: boolean;
  stripeAccountId: string | null;
  testModeOnly: true;
}

export function assertStripeConnectTestMode(): void {
  assertPaymentsEnabled();
  if (process.env.APP_ENV === 'production') {
    throw new HttpError(
      503,
      'External Stripe Connect payouts are disabled in production environments.',
      'PAYOUT_LIVE_DISABLED'
    );
  }
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (/^(sk|rk)_live_/.test(key)) {
    throw new HttpError(
      403,
      'Live Stripe credentials are forbidden for portfolio Connect test-mode workflows.',
      'STRIPE_LIVE_KEY_FORBIDDEN'
    );
  }
  if (paymentProvider() !== 'stripe' || !/^(sk|rk)_test_/.test(key)) {
    throw new HttpError(
      503,
      'Stripe Connect test mode requires PAYMENTS_PROVIDER=stripe and sk_test_* credentials.',
      'STRIPE_TEST_MODE_UNCONFIGURED'
    );
  }
}

function assertSafeRedirectUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new HttpError(400, 'Invalid redirect URL');
  }
  const configuredOrigins = [
    process.env.WEB_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
  ]
    .map((entry) => entry?.trim())
    .filter((entry): entry is string => Boolean(entry))
    .map((entry) => {
      try {
        return new URL(entry).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean);
  const isLocal =
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === '::1';
  const explicitlyAllowed =
    configuredOrigins.length > 0
      ? configuredOrigins.includes(parsed.origin) && isAllowedOrigin(parsed.origin)
      : isLocal;
  if (!['http:', 'https:'].includes(parsed.protocol) || !explicitlyAllowed) {
    throw new HttpError(400, 'Redirect URL origin is not allowed');
  }
  return parsed.toString();
}

export class StripeConnectService {
  static async getEligibility(sellerUserId: string): Promise<SellerTestConnectEligibility> {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: sellerUserId },
      include: { user: { select: { status: true } } },
    });
    if (!seller) {
      throw new HttpError(404, 'Seller profile not found');
    }

    const activeDisputeCount = await prisma.marketplaceDispute.count({
      where: {
        order: { sellerId: seller.id },
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    });
    const hasActiveDisputeHold = activeDisputeCount > 0;
    const hasStripeAccountId = Boolean(seller.stripeAccountId);

    const base = evaluateSellerPayoutEligibility({
      sellerStatus: seller.status,
      verificationStatus: seller.verificationStatus,
      accountStatus: seller.user.status,
      hasStripeAccountId,
    });

    const isTestKeyConfigured =
      paymentProvider() === 'stripe' &&
      process.env.APP_ENV !== 'production' &&
      /^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY || '');

    const eligibleForTestModePayouts =
      isTestKeyConfigured &&
      base.kycSatisfied &&
      base.sellerProfileApproved &&
      base.accountActive &&
      hasStripeAccountId &&
      !hasActiveDisputeHold;

    return {
      ...base,
      // Live real-money payouts remain unconditionally disabled.
      eligibleForLivePayouts: false,
      eligibleForTestModePayouts,
      hasStripeAccountId,
      hasActiveDisputeHold,
      stripeAccountId: seller.stripeAccountId,
      testModeOnly: true,
    };
  }

  static async createOrGetTestAccount(sellerUserId: string) {
    assertStripeConnectTestMode();
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: sellerUserId },
      include: { user: { select: { email: true, status: true } } },
    });
    if (!seller) {
      throw new HttpError(404, 'Seller profile not found');
    }
    if (seller.user.status !== 'ACTIVE') {
      throw new HttpError(403, 'Active user account required for Stripe Connect onboarding');
    }

    if (seller.stripeAccountId) {
      return {
        sellerProfileId: seller.id,
        stripeAccountId: seller.stripeAccountId,
        created: false,
        testModeOnly: true as const,
      };
    }

    const account = await stripe.accounts.create(
      {
        type: 'express',
        email: seller.user.email,
        metadata: {
          sellerProfileId: seller.id,
          userId: sellerUserId,
          mode: 'test_only',
        },
        capabilities: {
          transfers: { requested: true },
        },
      },
      { idempotencyKey: `connect-account:${seller.id}` }
    );

    if (!account.id || !account.id.startsWith('acct_')) {
      throw new HttpError(502, 'Stripe did not return a valid connected account identifier');
    }

    await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: { stripeAccountId: account.id },
    });

    return {
      sellerProfileId: seller.id,
      stripeAccountId: account.id,
      created: true,
      testModeOnly: true as const,
    };
  }

  static async createOnboardingLink(
    sellerUserId: string,
    returnUrl: string,
    refreshUrl: string
  ) {
    assertStripeConnectTestMode();
    const safeReturn = assertSafeRedirectUrl(returnUrl);
    const safeRefresh = assertSafeRedirectUrl(refreshUrl);

    const { stripeAccountId } = await this.createOrGetTestAccount(sellerUserId);
    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: 'account_onboarding',
      return_url: safeReturn,
      refresh_url: safeRefresh,
    });

    return {
      stripeAccountId,
      url: link.url,
      expiresAt: link.expires_at,
      testModeOnly: true as const,
    };
  }

  /**
   * Returns a strictly test-mode PayoutProvider adapter that validates KYC,
   * seller approval, account status, dispute holds, and Stripe Connect account
   * binding before issuing an idempotent Stripe test transfer.
   * Never enabled by default on production routes.
   */
  static createTestModePayoutProvider(): PayoutProvider {
    return {
      available: true,
      submit: async (input) => {
        assertStripeConnectTestMode();

        const seller = await prisma.sellerProfile.findUnique({
          where: { id: input.sellerId },
          include: { user: { select: { status: true } } },
        });
        if (!seller) {
          throw new HttpError(404, 'Seller profile not found');
        }

        const eligibility = evaluateSellerPayoutEligibility({
          sellerStatus: seller.status,
          verificationStatus: seller.verificationStatus,
          accountStatus: seller.user.status,
          hasStripeAccountId: Boolean(seller.stripeAccountId),
        });

        const connectBlockingReasons = eligibility.blockingReasons.filter(
          (reason) => reason !== 'PAYOUT_PROVIDER_DISABLED'
        );
        if (connectBlockingReasons.length > 0 || !seller.stripeAccountId) {
          throw new HttpError(
            403,
            `Seller is not eligible for test-mode Connect payout: ${connectBlockingReasons.join(', ')}`,
            'SELLER_PAYOUT_INELIGIBLE'
          );
        }

        const transfer = await stripe.transfers.create(
          {
            amount: input.amount,
            currency: input.currency,
            destination: seller.stripeAccountId,
            metadata: {
              reference: input.reference,
              sellerProfileId: seller.id,
              mode: 'test_only',
            },
          },
          { idempotencyKey: input.reference }
        );

        return {
          reference: input.reference,
          providerId: transfer.id,
          amount: transfer.amount,
          currency: transfer.currency,
          status: transfer.reversed ? 'FAILED' : 'PAID',
        };
      },
    };
  }

  static async handleConnectWebhookEvent(event: Stripe.Event) {
    assertStripeConnectTestMode();
    if (event.livemode) {
      throw new HttpError(400, 'Live Stripe events are strictly rejected in test-mode Connect workflows');
    }

    if (event.type.startsWith('charge.dispute.')) {
      const { DisputeService } = await import('./dispute.service');
      return DisputeService.handleProviderDisputeEvent(event);
    }

    const supportedTypes = new Set([
      'account.updated',
      'payout.paid',
      'payout.failed',
    ]);
    if (!supportedTypes.has(event.type)) {
      return { handled: false, deduplicated: false, type: event.type };
    }

    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(event.data.object))
      .digest('hex');

    const object = event.data.object as { id?: string; metadata?: Record<string, string> };
    const objectId = typeof object.id === 'string' && object.id.length > 0 ? object.id : event.id;

    return prisma.$transaction(async (tx) => {
      const existing = await tx.providerEvent.findUnique({ where: { id: event.id } });
      if (existing) {
        if (existing.type !== event.type || existing.payloadHash !== payloadHash) {
          throw new HttpError(409, 'Conflicting Stripe webhook event replay detected');
        }
        return { handled: true, deduplicated: true, type: event.type, objectId };
      }

      await tx.providerEvent.create({
        data: {
          id: event.id,
          type: event.type,
          objectId,
          payloadHash,
        },
      });

      if (event.type === 'account.updated') {
        const acct = event.data.object as Stripe.Account;
        const seller = await tx.sellerProfile.findFirst({
          where: { stripeAccountId: acct.id },
          select: { id: true, userId: true },
        });
        if (seller) {
          await tx.notification.create({
            data: {
              userId: seller.userId,
              type: 'SYSTEM_ALERT',
              title: 'Stripe Connect Test Account Updated',
              message: `Test account ${acct.id} payouts_enabled=${Boolean(acct.payouts_enabled)}, charges_enabled=${Boolean(acct.charges_enabled)}.`,
              data: {
                eventId: event.id,
                stripeAccountId: acct.id,
                payoutsEnabled: Boolean(acct.payouts_enabled),
                chargesEnabled: Boolean(acct.charges_enabled),
                detailsSubmitted: Boolean(acct.details_submitted),
              },
            },
          });
        }
      }

      return { handled: true, deduplicated: false, type: event.type, objectId };
    });
  }
}

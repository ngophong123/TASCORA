import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';
import {
  assertStripeConnectTestMode,
  StripeConnectService,
} from '../../apps/api/src/modules/financial/stripe-connect.service';

describe('Phase 4C Stripe Connect Test-Mode Safety Boundaries', () => {
  beforeEach(() => {
    vi.stubEnv('PAYMENTS_PROVIDER', 'stripe');
    vi.stubEnv('APP_ENV', 'test');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_safe_fixture');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('strictly rejects sk_live_* and rk_live_* keys', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_forbidden_key');
    expect(() => assertStripeConnectTestMode()).toThrow('Live Stripe credentials are forbidden');

    vi.stubEnv('STRIPE_SECRET_KEY', 'rk_live_forbidden_key');
    expect(() => assertStripeConnectTestMode()).toThrow('Live Stripe credentials are forbidden');
  });

  it('strictly refuses Connect payouts when APP_ENV=production', () => {
    vi.stubEnv('APP_ENV', 'production');
    expect(() => assertStripeConnectTestMode()).toThrow('disabled in production');
  });

  it('strictly rejects when PAYMENTS_PROVIDER=disabled', () => {
    vi.stubEnv('PAYMENTS_PROVIDER', 'disabled');
    expect(() => assertStripeConnectTestMode()).toThrow('temporarily unavailable');
  });

  it('strictly rejects any Stripe webhook event with livemode=true', async () => {
    const liveEvent = {
      id: 'evt_live_999',
      type: 'account.updated',
      livemode: true,
      data: { object: { id: 'acct_live_999' } },
    } as unknown as Stripe.Event;

    await expect(StripeConnectService.handleConnectWebhookEvent(liveEvent)).rejects.toThrow(
      'Live Stripe events are strictly rejected'
    );
  });
});

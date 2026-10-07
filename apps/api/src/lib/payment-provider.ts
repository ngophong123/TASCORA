import { HttpError } from './errors';

export function paymentProvider(): 'stripe' | 'disabled' {
  const provider = process.env.PAYMENTS_PROVIDER ?? 'stripe';
  if (provider !== 'stripe' && provider !== 'disabled') throw new Error('PAYMENTS_PROVIDER must be stripe or disabled');
  return provider;
}

export function assertPaymentsEnabled() {
  if (paymentProvider() === 'disabled') {
    throw new HttpError(503, 'Payments are temporarily unavailable in this environment.', 'PAYMENT_PROVIDER_UNAVAILABLE');
  }
}

// Configuration capability only: never claim a provider connection is healthy.
export function paymentCapability() {
  const provider = paymentProvider();
  const configured = provider === 'stripe' && /^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY || '') && !!process.env.STRIPE_WEBHOOK_SECRET;
  return { provider, status: provider === 'disabled' ? 'disabled' : configured ? 'configured' : 'unavailable', available: configured, providerValidated: false, externalPayoutsAvailable: false };
}

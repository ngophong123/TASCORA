import dotenv from 'dotenv';
import path from 'path';
import { paymentProvider } from './payment-provider';
import { parseTrustProxy } from './trust-proxy';

// Staging uses production runtime security and never loads the developer's .env.
if (process.env.APP_ENV && !['development', 'test', 'staging', 'production'].includes(process.env.APP_ENV)) throw new Error('Invalid APP_ENV');
if (process.env.APP_ENV === 'staging' && process.env.NODE_ENV !== 'production') throw new Error('Staging requires NODE_ENV=production');
if (process.env.APP_ENV === 'production' && process.env.NODE_ENV !== 'production') throw new Error('Production requires NODE_ENV=production');
// Hosting-provided values take precedence; local development uses the root .env.
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && process.env.APP_ENV !== 'staging') {
  dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
}

export const isProduction = process.env.NODE_ENV === 'production';
export const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
const provider = paymentProvider();
if (provider === 'disabled' && process.env.APP_ENV !== 'staging') throw new Error('Disabled payments are allowed only in explicit staging');
export const webUrl = process.env.WEB_URL || process.env.NEXT_PUBLIC_WEB_URL || (isProduction ? '' : 'http://localhost:3200');
export const allowedOrigins = Array.from(new Set([
  ...(isProduction ? [] : ['http://localhost:3000', 'http://localhost:3200']),
  webUrl,
  ...(process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()),
].filter(Boolean)));

export const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || (isProduction ? '' : 'secret');
export const redisUrl = process.env.REDIS_URL || (isProduction ? '' : 'redis://localhost:6300');
export const cookieSameSite = process.env.COOKIE_SAME_SITE || 'lax';
if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE must be lax, strict, or none');
}
if (cookieSameSite === 'none' && !isProduction) {
  throw new Error('COOKIE_SAME_SITE=none requires HTTPS production cookies');
}

if (isProduction) {
  if (provider === 'stripe' && process.env.APP_ENV === 'staging' && !/^(sk|rk)_test_[A-Za-z0-9]+$/.test(process.env.STRIPE_SECRET_KEY || '')) throw new Error('Staging requires Stripe TEST credentials');
  if (process.env.STORAGE_PROVIDER !== 's3') throw new Error('Production STORAGE_PROVIDER must be s3');
  const required = ['STORAGE_BUCKET', 'STORAGE_REGION', 'STORAGE_ACCESS_KEY', 'STORAGE_SECRET_KEY', 'DATABASE_URL', 'JWT_ACCESS_SECRET', 'REDIS_URL', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', ...(provider === 'stripe' ? ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] : [])];
  const missing = required.filter(name => !process.env[name]);
  if (!webUrl) missing.push('WEB_URL');
  if (missing.length) throw new Error(`Missing production configuration: ${missing.join(', ')}`);
  if (provider === 'stripe' && (!/^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(process.env.STRIPE_SECRET_KEY || '') || !/^whsec_[A-Za-z0-9]+$/.test(process.env.STRIPE_WEBHOOK_SECRET || ''))) throw new Error('Invalid Stripe configuration');
  if (jwtAccessSecret.length < 32 || ['secret', 'access_secret'].includes(jwtAccessSecret)) {
    throw new Error('JWT_ACCESS_SECRET must be a strong secret of at least 32 characters');
  }
  if (process.env.STORAGE_ENDPOINT && new URL(process.env.STORAGE_ENDPOINT).protocol !== 'https:') throw new Error('Production STORAGE_ENDPOINT must use HTTPS');
  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.origin !== origin || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      throw new Error('Production WEB_URL and CORS_ORIGINS must contain exact HTTPS origins');
    }
  }
}

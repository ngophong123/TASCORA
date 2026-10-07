import { Prisma } from '@prisma/client';
import { HttpError } from '../../lib/errors';

// Decimal at rest, safe integer cents for all authoritative calculations.
export function cents(value: Prisma.Decimal | string | number, allowZero = false): number {
  const amount = new Prisma.Decimal(value).mul(100);
  if (!amount.isFinite() || !amount.isInteger() || amount.isNegative() || (!allowZero && amount.isZero()) || amount.gt(9999999999)) throw new HttpError(400, 'Invalid monetary amount or precision');
  return amount.toNumber();
}
export const money = (minor: number) => {
  if (!Number.isSafeInteger(minor)) throw new HttpError(400, 'Unsafe monetary amount');
  return new Prisma.Decimal(minor).div(100);
};
export function split(amount: number, feeBps: number) {
  if (!Number.isSafeInteger(amount) || amount < 0 || !Number.isInteger(feeBps) || feeBps < 0 || feeBps > 10000) throw new HttpError(400, 'Invalid fee basis');
  const fee = Number((BigInt(amount) * BigInt(feeBps) + 5000n) / 10000n);
  return { fee, earning: amount - fee };
}
const percent = new Prisma.Decimal(process.env.PLATFORM_FEE_PERCENT || '10');
if (!percent.isFinite() || percent.lt(0) || percent.gt(100) || !percent.mul(100).isInteger()) throw new Error('Invalid PLATFORM_FEE_PERCENT');
export const platformFeeBps = percent.mul(100).toNumber();
export const autoCompleteHours = Number(process.env.ORDER_AUTO_COMPLETE_HOURS || '72');
if (!Number.isInteger(autoCompleteHours) || autoCompleteHours < 1 || autoCompleteHours > 8760) throw new Error('Invalid ORDER_AUTO_COMPLETE_HOURS');
export const currency = 'usd';
export function assertPaymentAmount(minor: number) {
  if (!Number.isSafeInteger(minor) || minor < 50 || minor > 99999999) throw new HttpError(400, 'Order amount outside supported payment limits');
}

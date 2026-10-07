import { expect, it } from 'vitest';
import { cents, money, split } from '../../apps/api/src/modules/financial/money';
import { transition } from '../../apps/api/src/modules/financial/domain';
it.each(['0', '-1', '0.001', '10.255', 'Infinity', 'NaN', '100000000.00'])('rejects invalid money %s', value => { expect(() => cents(value)).toThrow(); });
it('preserves exact cents and rounds fee deterministically without float multiplication', () => {
  expect(cents('0.29')).toBe(29); expect(money(29).toFixed(2)).toBe('0.29');
  expect(split(10000, 1000)).toEqual({ fee: 1000, earning: 9000 });
  expect(split(1025, 1000)).toEqual({ fee: 103, earning: 922 });
  for (let amount = 1; amount < 10000; amount += 7) for (const feeBps of [0, 1, 1000, 3333, 10000]) {
    const result = split(amount, feeBps); expect(result.fee + result.earning).toBe(amount); expect(result.fee).toBeLessThanOrEqual(amount); expect(Number.isInteger(result.earning)).toBe(true);
  }
});
it('bounds cumulative partial refund reversals to the original fee/earning split', () => {
  const original = split(1025, 1000); let gross = 1025, feeReversed = 0, earningReversed = 0;
  for (const refund of [1, 1, 100, 200, 723]) { const before = split(gross, 1000); gross -= refund; const after = split(gross, 1000); feeReversed += before.fee - after.fee; earningReversed += before.earning - after.earning; }
  expect(gross).toBe(0); expect(feeReversed).toBe(original.fee); expect(earningReversed).toBe(original.earning);
});
it('only permits controlled state machine edges', () => {
  expect(() => transition('PENDING', 'PAID')).not.toThrow(); expect(() => transition('IN_REVISION', 'IN_PROGRESS')).not.toThrow();
  for (const pair of [['PENDING', 'COMPLETED'], ['COMPLETED', 'PAID'], ['DISPUTED', 'DELIVERED'], ['REFUNDED', 'COMPLETED']] as const) expect(() => transition(...pair)).toThrow('Invalid order');
});

it('public financial projections omit provider keys, actor identities and loaded private relations', async () => {
  const { orderMutationView, financialRecordView } = await import('../../apps/api/src/modules/financial/domain');
  const { Prisma } = await import('@prisma/client');
  const now = new Date();
  const loaded = { id: 'order', status: 'PAID' as const, amount: new Prisma.Decimal('100'), currency: 'usd', completedAt: null, buyer: { password: 'private' }, checkoutKey: 'private-key', transactions: [{ stripePaymentId: 'pi_private' }] };
  expect(orderMutationView(loaded)).toEqual({ id: 'order', status: 'PAID', amount: loaded.amount, currency: 'usd', completedAt: null });
  const refund = { id: 'refund', status: 'PENDING', amount: loaded.amount, createdAt: now, reason: 'Cancellation', stripeRefundId: 're_private', requestKey: 'private-key', actorId: 'private-actor' };
  expect(financialRecordView(refund)).toEqual({ id: 'refund', status: 'PENDING', amount: loaded.amount, createdAt: now, reason: 'Cancellation' });
});

it('uses the same USD provider eligibility bounds at checkout and payment', async () => {
  const { assertPaymentAmount } = await import('../../apps/api/src/modules/financial/money');
  for (const minor of [50, 99999999]) expect(() => assertPaymentAmount(minor)).not.toThrow();
  for (const minor of [0, 49, 100000000, 50.5, NaN]) expect(() => assertPaymentAmount(minor)).toThrow('supported payment limits');
});

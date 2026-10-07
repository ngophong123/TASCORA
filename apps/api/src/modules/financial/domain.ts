import { Prisma, Order, OrderStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { money, cents, split } from './money';
import { z } from 'zod';

export type Tx = Prisma.TransactionClient;
export const orderMutationView = (order: Pick<Order, 'id' | 'status' | 'amount' | 'currency' | 'completedAt'>) => ({ id: order.id, status: order.status, amount: order.amount, currency: order.currency, completedAt: order.completedAt });
export const financialRecordView = (record: { id: string; status: string; amount: Prisma.Decimal; reason?: string; createdAt: Date }) => ({ id: record.id, status: record.status, amount: record.amount, reason: record.reason, createdAt: record.createdAt });
export const requestKey = z.string().regex(/^[A-Za-z0-9_-]{16,128}$/, 'A 16-128 character idempotency key is required');
export const reasonSchema = z.string().trim().min(3).max(2000);
export async function lockOrder(tx: Tx, id: string) { await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${id}))`; }
export const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['PAID', 'CANCELLED'], PAID: ['IN_PROGRESS', 'REFUNDED', 'DISPUTED'],
  IN_PROGRESS: ['DELIVERED', 'DISPUTED'], IN_REVISION: ['IN_PROGRESS', 'DELIVERED', 'DISPUTED'],
  DELIVERED: ['IN_REVISION', 'COMPLETED', 'DISPUTED'], DISPUTED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'], CANCELLED: ['REFUNDED'],
};
export function transition(from: OrderStatus, to: OrderStatus) {
  if (!transitions[from]?.includes(to)) throw new HttpError(409, `Invalid order status transition from ${from} to ${to}`);
}
export function basis(order: Order) {
  if (order.platformFeeBps === null || order.platformFeeBps === undefined || !order.purchaseSnapshot || order.currency !== 'usd') throw new HttpError(409, 'Legacy financial basis requires reconciliation');
  return split(cents(order.amount), order.platformFeeBps);
}
type Movement = { amount?: number; pending?: number; available?: number; reserved?: number; paid?: number; fee?: number; transactionId?: string; refundId?: string; payoutId?: string; providerId?: string; reason?: string; notifyUserId?: string };
export function entry(tx: Tx, orderId: string, type: string, eventKey: string, actorId: string | null, movement: Movement = {}) {
  return tx.financialEntry.create({ data: { orderId, type, eventKey, actorId, amount: money(movement.amount || 0), pendingDelta: money(movement.pending || 0), availableDelta: money(movement.available || 0), reservedDelta: money(movement.reserved || 0), paidDelta: money(movement.paid || 0), feeDelta: money(movement.fee || 0), transactionId: movement.transactionId, refundId: movement.refundId, payoutId: movement.payoutId, providerId: movement.providerId, reason: movement.reason, notifyUserId: movement.notifyUserId } });
}
export async function balances(tx: Tx, orderId: string) {
  const summed = await tx.financialEntry.aggregate({ where: { orderId }, _sum: { pendingDelta: true, availableDelta: true, reservedDelta: true, paidDelta: true } });
  const minor = (value: Prisma.Decimal | null) => value ? cents(value, true) : 0;
  return { pending: minor(summed._sum.pendingDelta), available: minor(summed._sum.availableDelta), reserved: minor(summed._sum.reservedDelta), paid: minor(summed._sum.paidDelta) };
}
// Durable ledger entries double as an outbox; notification writes are outside
// money transactions. A failed notification never rolls back settled money.
export async function flushFinancialNotices(orderId?: string) {
  try {
    const pending = await prisma.financialEntry.findMany({ where: { ...(orderId ? { orderId } : {}), notifyUserId: { not: null }, notifications: { none: {} } }, orderBy: { createdAt: 'asc' }, take: 100 });
    for (const notice of pending) await prisma.notification.upsert({ where: { sourceKey: `financial:${notice.id}` }, update: {}, create: { sourceKey: `financial:${notice.id}`, financialEntryId: notice.id, userId: notice.notifyUserId!, type: 'ORDER_UPDATE', title: notice.type.replaceAll('_', ' '), message: `Order ${notice.orderId}: ${notice.type.replaceAll('_', ' ').toLowerCase()}`, data: { orderId: notice.orderId } } });
  } catch { /* Persisted outbox is retried by the next request/job. No secrets logged. */ }
}
export async function financialTx<T>(fn: (tx: Tx) => Promise<T>, orderId?: string): Promise<T> {
  // Bursts of duplicate requests queue behind the database order lock. Allow
  // bounded pool acquisition time without relaxing the transaction deadline.
  const result = await prisma.$transaction(fn, { maxWait: 15000, timeout: 15000 });
  await flushFinancialNotices(orderId);
  return result;
}

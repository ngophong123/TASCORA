import { readFileSync, readdirSync } from 'node:fs';
import https from 'node:https';
import { beforeAll, afterAll, beforeEach, expect, it, vi } from 'vitest';
import { Prisma, OrderStatus, WalletTransactionType } from '@prisma/client';
import type Stripe from 'stripe';

// Real Prisma persistence. Only external notification/provider calls are mocked.
vi.mock('../../apps/api/src/lib/socket', () => ({ getIO: () => ({ to: () => ({ emit: vi.fn() }) }) }));
vi.mock('../../apps/api/src/modules/email/email.service', () => ({ EmailService: { sendVerificationEmail: vi.fn() } }));
import { prisma } from '../../apps/api/src/lib/prisma';
import { OrderService } from '../../apps/api/src/modules/order/order.service';
import { PaymentService, stripe } from '../../apps/api/src/modules/payment/payment.service';
import { MessageService } from '../../apps/api/src/modules/message/message.service';
import { WalletService } from '../../apps/api/src/modules/wallet/wallet.service';
import { AuthService } from '../../apps/api/src/modules/auth/auth.service';
import { authenticateAccess } from '../../apps/api/src/modules/auth/token';

let buyerId: string, sellerUserId: string, sellerId: string, serviceId: string, packageId: string;
const makeOrder = () => OrderService.createOrder(buyerId, serviceId, packageId);
const rejectsCode = async (promise: Promise<unknown>, code: string) => expect(promise).rejects.toMatchObject({ code });

beforeAll(async () => {
  const url = new URL(process.env.DATABASE_URL || '');
  if (process.env.DATABASE_URL !== process.env.TASCORA_DISPOSABLE_DATABASE_URL || url.hostname !== '127.0.0.1' || url.port === '5432' || url.username !== 'tascora_test' || !/^\/tascora_migration_test(?:_second|_repeat)?$/.test(url.pathname)) throw new Error('Refusing non-disposable target');
  vi.spyOn(https, 'request').mockImplementation(() => { throw new Error('External HTTPS forbidden'); });
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('External fetch forbidden'));
  expect(await prisma.user.count({ where: { email: 'buyer@validation.invalid' } })).toBe(0);
  const buyer = await prisma.user.create({ data: { email: 'buyer@validation.invalid', password: 'unused', status: 'ACTIVE' } }); buyerId = buyer.id;
  const seller = await prisma.user.create({ data: { email: 'seller@validation.invalid', password: 'unused', status: 'ACTIVE', role: 'SELLER', sellerProfile: { create: { status: 'APPROVED', skills: [], languages: [] } } }, include: { sellerProfile: true } }); sellerUserId = seller.id; sellerId = seller.sellerProfile!.id;
  const category = await prisma.category.create({ data: { name: 'Validation', slug: 'validation' } });
  const service = await prisma.service.create({ data: { sellerProfileId: sellerId, categoryId: category.id, title: 'Validation service', description: 'Disposable fixture', status: 'PUBLISHED', packages: { create: { type: 'BASIC', title: 'Basic', description: 'Fixture', price: '10.25', deliveryDays: 1, revisions: 1, features: [] } } }, include: { packages: true } }); serviceId = service.id; packageId = service.packages[0]!.id;
});
afterAll(async () => { vi.restoreAllMocks(); await prisma.$disconnect(); });
beforeEach(() => { vi.spyOn(stripe.paymentIntents, 'create').mockRejectedValue(new Error('Provider call must be explicitly mocked')); vi.spyOn(stripe.paymentIntents, 'retrieve').mockRejectedValue(new Error('Provider call must be explicitly mocked')); });

it('matches every migrated table, enum, explicit index and foreign-key definition', async () => {
  const sql = readdirSync('prisma/migrations', { withFileTypes: true }).filter(file => file.isDirectory()).sort((a,b) => a.name.localeCompare(b.name)).map(file => readFileSync(`prisma/migrations/${file.name}/migration.sql`, 'utf8')).join('\n');
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'`;
  expect(tables.map(t => t.tablename).sort()).toEqual([...sql.matchAll(/CREATE TABLE "([^"]+)"/g)].map(m => m[1]).sort());
  const indexes = await prisma.$queryRaw<{ indexname: string; indexdef: string }[]>`SELECT indexname,indexdef FROM pg_indexes WHERE schemaname='public'`;
  for (const match of sql.matchAll(/CREATE (UNIQUE )?INDEX "([^"]+)" ON "([^"]+)"\(([^;]+)\);/g)) {
    const actual = indexes.find(i => i.indexname === match[2]); expect(actual).toBeDefined();
    expect(actual!.indexdef.includes('UNIQUE')).toBe(Boolean(match[1]));
    expect(actual!.indexdef).toContain(`ON public.${match[3]} USING btree`);
    expect(actual!.indexdef.split('(')[1]!.replaceAll(' ', '').replaceAll('"', '')).toBe(`${match[4]})`.replaceAll(' ', '').replaceAll('"', ''));
  }
  const enums = await prisma.$queryRaw<{ name: string; values: string[] }[]>`SELECT t.typname AS name, array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS values FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' GROUP BY t.typname`;
  expect(enums).toHaveLength(12);
  for (const match of sql.matchAll(/CREATE TYPE "([^"]+)" AS ENUM \(([^;]+)\);/g)) {
    const added = [...sql.matchAll(new RegExp(`ALTER TYPE "${match[1]}" ADD VALUE '([^']+)';`, 'g'))].map(m => m[1]);
    expect(enums.find(e => e.name === match[1])!.values).toEqual([...match[2]!.matchAll(/'([^']+)'/g)].map(m => m[1]).concat(added));
  }
  const fks = await prisma.$queryRaw<{ name: string; source: string; target: string; del: string; upd: string; valid: boolean; column: string; referenced: string }[]>`SELECT c.conname AS name, src.relname AS source, dst.relname AS target, c.confdeltype::text AS del, c.confupdtype::text AS upd,c.convalidated AS valid,a.attname AS column,b.attname AS referenced FROM pg_constraint c JOIN pg_class src ON src.oid=c.conrelid JOIN pg_class dst ON dst.oid=c.confrelid JOIN pg_namespace n ON n.oid=src.relnamespace JOIN pg_attribute a ON a.attrelid=src.oid AND a.attnum=c.conkey[1] JOIN pg_attribute b ON b.attrelid=dst.oid AND b.attnum=c.confkey[1] WHERE c.contype='f' AND n.nspname='public'`;
  expect(fks).toHaveLength([...sql.matchAll(/ADD CONSTRAINT "[^"]+" FOREIGN KEY/g)].length);
  const actions: Record<string,string> = { CASCADE: 'c', RESTRICT: 'r', 'SET NULL': 'n' };
  for (const m of sql.matchAll(/ALTER TABLE "([^"]+)" ADD CONSTRAINT "([^"]+)" FOREIGN KEY \("([^"]+)"\) REFERENCES "([^"]+)"\("([^"]+)"\) ON DELETE (CASCADE|RESTRICT|SET NULL) ON UPDATE CASCADE;/g)) expect(fks.find(f => f.name === m[2])).toMatchObject({ source: m[1], column: m[3], target: m[4], referenced: m[5], del: actions[m[6]!], upd: 'c', valid: true });
});

it('enforces unique email/package/favorite/provider IDs and rejects orphan relationships', async () => {
  await rejectsCode(prisma.user.create({ data: { email: 'buyer@validation.invalid', password: 'unused' } }), 'P2002');
  await rejectsCode(prisma.servicePackage.create({ data: { serviceId, type: 'BASIC', title: 'Duplicate', description: '', price: 1, deliveryDays: 1, revisions: 0, features: [] } }), 'P2002');
  await rejectsCode(prisma.sellerProfile.create({ data: { userId: 'missing', skills: [], languages: [] } }), 'P2003');
  await rejectsCode(prisma.service.create({ data: { sellerProfileId: 'missing', categoryId: 'missing', title: 'Orphan', description: '' } }), 'P2003');
  await rejectsCode(prisma.message.create({ data: { conversationId: 'missing', senderId: buyerId, content: 'Orphan' } }), 'P2003');
  await rejectsCode(prisma.transaction.create({ data: { orderId: 'missing', amount: 1 } }), 'P2003');
  const order = await makeOrder();
  await prisma.transaction.create({ data: { orderId: order.id, amount: order.amount, stripePaymentId: 'pi_unique' } });
  await rejectsCode(prisma.transaction.create({ data: { orderId: order.id, amount: order.amount, stripePaymentId: 'pi_unique' } }), 'P2002');
  const favorites = await Promise.allSettled(Array.from({ length: 4 }, () => prisma.favorite.create({ data: { userId: buyerId, serviceId } })));
  expect(favorites.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect(await prisma.favorite.count({ where: { userId: buyerId, serviceId } })).toBe(1);
});

it('proves cascade/restrict/set-null behavior without affecting financial records', async () => {
  const user = await prisma.user.create({ data: { email: 'cascade@validation.invalid', password: 'unused', buyerProfile: { create: {} }, wallet: { create: { transactions: { create: { type: 'DEPOSIT', amount: 1 } } } } }, include: { wallet: true } });
  await prisma.user.delete({ where: { id: user.id } });
  expect(await prisma.buyerProfile.count({ where: { userId: user.id } })).toBe(0);
  expect(await prisma.wallet.count({ where: { userId: user.id } })).toBe(0);
  expect(await prisma.walletTransaction.count({ where: { walletId: user.wallet!.id } })).toBe(0);
  const order = await makeOrder();
  await rejectsCode(prisma.service.delete({ where: { id: serviceId } }), 'P2003');
  await rejectsCode(prisma.user.delete({ where: { id: buyerId } }), 'P2003');
  await rejectsCode(prisma.sellerProfile.delete({ where: { id: sellerId } }), 'P2003');
  const conv = await prisma.conversation.create({ data: { participant1Id: buyerId, participant2Id: sellerUserId, orderId: order.id, messages: { create: { senderId: buyerId, content: 'cascade' } } } });
  await rejectsCode(prisma.order.delete({ where: { id: order.id } }), 'P2003'); // append-only audit retains new orders
  const legacy = await prisma.order.create({ data: { buyerId, sellerId, serviceId, packageId, amount: '10.25' } });
  await prisma.conversation.update({ where: { id: conv.id }, data: { orderId: legacy.id } });
  await prisma.order.delete({ where: { id: legacy.id } });
  expect((await prisma.conversation.findUniqueOrThrow({ where: { id: conv.id } })).orderId).toBeNull();
  await prisma.conversation.delete({ where: { id: conv.id } });
  expect(await prisma.message.count({ where: { conversationId: conv.id } })).toBe(0);
});

it('stores exact cents, observes PostgreSQL rounding and rejects numeric overflow', async () => {
  const wallet = await prisma.wallet.create({ data: { userId: buyerId, balance: '10.00' } });
  await WalletService.addTransaction(wallet.id, 0.1, WalletTransactionType.DEPOSIT);
  await WalletService.addTransaction(wallet.id, 0.2, WalletTransactionType.DEPOSIT);
  expect((await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } })).balance.toFixed(2)).toBe('10.30');
  await expect(prisma.wallet.update({ where: { id: wallet.id }, data: { balance: '100000000.00' } })).rejects.toThrow('numeric field overflow');
  await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: '10.255' } });
  expect((await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } })).balance.toFixed(2)).toBe('10.26'); // DB rounds; API validation must reject excess precision.
});

it('documents duplicate purchases as independent orders; rejects self purchase', async () => {
  const orders = await Promise.all([makeOrder(), makeOrder()]);
  expect(new Set(orders.map(o => o.id)).size).toBe(2);
  expect(orders.every(o => o.amount.toFixed(2) === '10.25' && o.status === 'PENDING')).toBe(true);
  await expect(OrderService.createOrder(sellerUserId, serviceId, packageId)).rejects.toThrow('own services');
});

it('serializes duplicate payment requests and concurrent success/failure webhooks', async () => {
  const order = await makeOrder(); const paymentId = `pi_${order.id}`;
  const payment = { id: paymentId, object: 'payment_intent', amount: 1025, amount_received: 1025, currency: 'usd', status: 'succeeded', metadata: { orderId: order.id, buyerId }, client_secret: 'mock-only' };
  const create = vi.spyOn(stripe.paymentIntents, 'create').mockResolvedValue({ ...payment, status: 'requires_payment_method' } as Stripe.Response<Stripe.PaymentIntent>);
  vi.spyOn(stripe.paymentIntents, 'retrieve').mockResolvedValue({ ...payment, status: 'requires_payment_method' } as Stripe.Response<Stripe.PaymentIntent>);
  await Promise.all(Array.from({ length: 6 }, () => PaymentService.createPaymentIntent(buyerId, order.id)));
  expect(create).toHaveBeenCalled();
  expect(new Set(create.mock.calls.map(call => call[1]!.idempotencyKey)).size).toBe(1); // split-phase concurrent calls share one provider operation
  expect(await prisma.transaction.count({ where: { orderId: order.id } })).toBe(1);
  const event = (type: string, object = payment) => ({ id: `evt_${order.id}_${type}`, type, data: { object } }) as Stripe.Event;
  await Promise.all([
    ...Array.from({ length: 6 }, () => PaymentService.handleWebhookEvent(event('payment_intent.succeeded'))),
    ...Array.from({ length: 2 }, () => PaymentService.handleWebhookEvent(event('payment_intent.payment_failed', { ...payment, status: 'requires_payment_method', amount_received: 0 }))),
  ]);
  await PaymentService.handleWebhookEvent(event('payment_intent.payment_failed', { ...payment, status: 'requires_payment_method', amount_received: 0 }));
  expect(await prisma.escrow.count({ where: { orderId: order.id } })).toBe(1);
  expect(await prisma.orderActivity.count({ where: { orderId: order.id, type: 'PAYMENT_RECEIVED' } })).toBe(1);
  expect((await prisma.transaction.findUniqueOrThrow({ where: { stripePaymentId: paymentId } })).status).toBe('SUCCEEDED');
  expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PAID');
  await rejectsCode(prisma.order.delete({ where: { id: order.id } }), 'P2003');
  await rejectsCode(prisma.escrow.create({ data: { orderId: order.id, transactionId: (await prisma.transaction.findUniqueOrThrow({ where: { stripePaymentId: paymentId } })).id, amount: order.amount } }), 'P2002');
});

it('serializes competing order transitions and keeps loser activities rolled back', async () => {
  const order = await makeOrder();
  const paymentId = `pi_${order.id}`;
  await prisma.transaction.create({ data: { orderId: order.id, amount: order.amount, stripePaymentId: paymentId } });
  await PaymentService.handleWebhookEvent({ id: `evt_${order.id}_succeeded`, type: 'payment_intent.succeeded', data: { object: { id: paymentId, object: 'payment_intent', amount: 1025, amount_received: 1025, currency: 'usd', status: 'succeeded', metadata: { orderId: order.id, buyerId } } } } as Stripe.Event);
  await OrderService.operate(sellerUserId, order.id, 'start');
  await OrderService.deliver(sellerUserId, order.id, 'Complete test delivery', [], 'delivery_concurrency_1');
  const before = await prisma.orderActivity.count({ where: { orderId: order.id, type: 'STATUS_UPDATE' } });
  const results = await Promise.allSettled([OrderService.updateOrderStatus(buyerId, order.id, OrderStatus.COMPLETED), OrderService.updateOrderStatus(buyerId, order.id, OrderStatus.IN_REVISION, 'One valid revision')]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect(await prisma.orderActivity.count({ where: { orderId: order.id, type: 'STATUS_UPDATE' } })).toBe(before + 1);
});

it('maintains chat counters under simultaneous sends from both participants', async () => {
  const conv = await prisma.conversation.create({ data: { participant1Id: buyerId, participant2Id: sellerUserId } });
  await Promise.all(Array.from({ length: 12 }, (_, n) => MessageService.sendMessage(conv.id, n % 2 ? buyerId : sellerUserId, `Message ${n}`)));
  const saved = await prisma.conversation.findUniqueOrThrow({ where: { id: conv.id } });
  expect([saved.unreadCount1, saved.unreadCount2]).toEqual([6, 6]);
  expect(await prisma.message.count({ where: { conversationId: conv.id } })).toBe(12);
  await expect(MessageService.sendMessage(conv.id, 'outsider', 'Denied')).rejects.toThrow('Unauthorized');
});

it('rolls back writes on transaction failure and prevents concurrent overdrafts', async () => {
  const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: buyerId } });
  await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: 10 } });
  const before = await prisma.walletTransaction.count({ where: { walletId: wallet.id } });
  const results = await Promise.allSettled([WalletService.addTransaction(wallet.id, -7, WalletTransactionType.WITHDRAWAL), WalletService.addTransaction(wallet.id, -7, WalletTransactionType.WITHDRAWAL)]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect((await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } })).balance.toFixed(2)).toBe('3.00');
  expect(await prisma.walletTransaction.count({ where: { walletId: wallet.id } })).toBe(before + 1);
  await expect(prisma.$transaction(async tx => { await tx.wallet.update({ where: { id: wallet.id }, data: { balance: 99 } }); throw new Error('Rollback fixture'); })).rejects.toThrow('Rollback fixture');
  expect((await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } })).balance.toFixed(2)).toBe('3.00');
});

it('rotates refresh tokens atomically and revokes a concurrently replayed family', async () => {
  const bcrypt = await import('bcryptjs');
  await prisma.user.update({ where: { id: buyerId }, data: { password: await bcrypt.hash('Disposable-password-1!', 4) } });
  const session = await AuthService.login({ email: 'buyer@validation.invalid', password: 'Disposable-password-1!' }, '127.0.0.1', 'validation');
  const results = await Promise.allSettled([AuthService.refresh(session.refreshToken), AuthService.refresh(session.refreshToken)]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  await expect(authenticateAccess(session.accessToken)).rejects.toThrow('session');
  const won = results.find(r => r.status === 'fulfilled')!;
  if (won.status === 'fulfilled') await expect(AuthService.refresh(won.value.refreshToken)).rejects.toThrow('refresh token');
});

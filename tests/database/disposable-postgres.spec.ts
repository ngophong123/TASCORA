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
  const create = vi.spyOn(stripe.paymentIntents, 'create').mockResolvedValue({ ...payment, status: 'requires_payment_method' } as unknown as Stripe.Response<Stripe.PaymentIntent>);
  vi.spyOn(stripe.paymentIntents, 'retrieve').mockResolvedValue({ ...payment, status: 'requires_payment_method' } as unknown as Stripe.Response<Stripe.PaymentIntent>);
  await Promise.all(Array.from({ length: 6 }, () => PaymentService.createPaymentIntent(buyerId, order.id)));
  expect(create).toHaveBeenCalled();
  expect(new Set(create.mock.calls.map(call => call[1]!.idempotencyKey)).size).toBe(1); // split-phase concurrent calls share one provider operation
  expect(await prisma.transaction.count({ where: { orderId: order.id } })).toBe(1);
  const event = (type: string, object = payment) => ({ id: `evt_${order.id}_${type}`, type, data: { object } }) as unknown as Stripe.Event;
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
  await PaymentService.handleWebhookEvent({ id: `evt_${order.id}_succeeded`, type: 'payment_intent.succeeded', data: { object: { id: paymentId, object: 'payment_intent', amount: 1025, amount_received: 1025, currency: 'usd', status: 'succeeded', metadata: { orderId: order.id, buyerId } } } } as unknown as Stripe.Event);
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

it('enforces append-only audit immutability including BEFORE TRUNCATE and ON DELETE RESTRICT on PostgreSQL', async () => {
  const admin = await prisma.user.create({ data: { email: 'kyc-admin@validation.invalid', password: 'unused', role: 'ADMIN', status: 'ACTIVE' } });
  const applicant = await prisma.user.create({
    data: {
      email: 'kyc-applicant@validation.invalid',
      password: 'unused',
      role: 'SELLER',
      status: 'ACTIVE',
      sellerProfile: { create: { status: 'DRAFT', skills: [], languages: [] } },
    },
    include: { sellerProfile: true },
  });

  const verification = await prisma.identityVerification.create({
    data: {
      sellerProfileId: applicant.sellerProfile!.id,
      status: 'PENDING',
      documentType: 'PASSPORT',
      country: 'US',
      documentUrl: `upload:${applicant.id}/11111111-1111-4111-8111-111111111111.png`,
      documentNumberHash: 'hash_imm_1',
    },
  });

  const history = await prisma.kycReviewHistory.create({
    data: {
      identityVerificationId: verification.id,
      sellerProfileId: applicant.sellerProfile!.id,
      actorId: applicant.id,
      actorRole: 'SELLER',
      decision: 'SUBMITTED',
      previousState: 'NOT_SUBMITTED',
      newState: 'PENDING',
      correlationId: 'corr-db-imm-1',
    },
  });

  const audit = await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'KYC_RECORD_VIEWED',
      targetEntity: 'IdentityVerification',
      targetId: verification.id,
      correlationId: 'corr-db-imm-1',
    },
  });

  await expect(prisma.$executeRawUnsafe(`UPDATE "admin_audit_logs" SET "reason" = 'tamper' WHERE "id" = $1`, audit.id)).rejects.toThrow(/append-only/i);
  await expect(prisma.$executeRawUnsafe(`DELETE FROM "admin_audit_logs" WHERE "id" = $1`, audit.id)).rejects.toThrow(/append-only/i);
  await expect(prisma.$executeRawUnsafe(`TRUNCATE TABLE "admin_audit_logs"`)).rejects.toThrow(/append-only/i);

  await expect(prisma.$executeRawUnsafe(`UPDATE "kyc_review_histories" SET "reason" = 'tamper' WHERE "id" = $1`, history.id)).rejects.toThrow(/append-only/i);
  await expect(prisma.$executeRawUnsafe(`DELETE FROM "kyc_review_histories" WHERE "id" = $1`, history.id)).rejects.toThrow(/append-only/i);
  await expect(prisma.$executeRawUnsafe(`TRUNCATE TABLE "kyc_review_histories"`)).rejects.toThrow(/append-only/i);

  const triggers = await prisma.$queryRaw<{ tgname: string; relname: string }[]>`
    SELECT t.tgname, c.relname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE NOT t.tgisinternal AND c.relname IN ('admin_audit_logs', 'kyc_review_histories')
  `;
  expect(triggers).toEqual(
    expect.arrayContaining([
      { tgname: 'admin_audit_logs_immutable', relname: 'admin_audit_logs' },
      { tgname: 'admin_audit_logs_no_truncate', relname: 'admin_audit_logs' },
      { tgname: 'kyc_review_histories_immutable', relname: 'kyc_review_histories' },
      { tgname: 'kyc_review_histories_no_truncate', relname: 'kyc_review_histories' },
    ])
  );

  await rejectsCode(prisma.user.delete({ where: { id: admin.id } }), 'P2003');
  await rejectsCode(prisma.user.delete({ where: { id: applicant.id } }), 'P2003');
  await rejectsCode(prisma.identityVerification.delete({ where: { id: verification.id } }), 'P2003');
});

it('validates KYC check constraints, active-document uniqueness concurrency, and optimistic version locking', async () => {
  const docCheck = await prisma.$queryRaw<{ convalidated: boolean }[]>`
    SELECT convalidated FROM pg_constraint WHERE conname = 'identity_verifications_doc_type_check'
  `;
  expect(docCheck[0]?.convalidated).toBe(true);

  const [sellerA, sellerB, sellerRejected] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'kyc-dup-a@validation.invalid',
        password: 'unused',
        role: 'SELLER',
        status: 'ACTIVE',
        sellerProfile: { create: { status: 'DRAFT', skills: [], languages: [] } },
      },
      include: { sellerProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'kyc-dup-b@validation.invalid',
        password: 'unused',
        role: 'SELLER',
        status: 'ACTIVE',
        sellerProfile: { create: { status: 'DRAFT', skills: [], languages: [] } },
      },
      include: { sellerProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'kyc-dup-rejected@validation.invalid',
        password: 'unused',
        role: 'SELLER',
        status: 'ACTIVE',
        sellerProfile: { create: { status: 'DRAFT', skills: [], languages: [] } },
      },
      include: { sellerProfile: true },
    }),
  ]);

  await expect(
    prisma.identityVerification.create({
      data: {
        sellerProfileId: sellerA.sellerProfile!.id,
        documentType: 'INVALID_TYPE',
        country: 'US',
        documentUrl: `upload:${sellerA.id}/22222222-2222-4222-8222-222222222222.png`,
      },
    })
  ).rejects.toThrow(/identity_verifications_doc_type_check/i);

  await expect(
    prisma.identityVerification.create({
      data: {
        sellerProfileId: sellerA.sellerProfile!.id,
        documentType: 'PASSPORT',
        scanStatus: 'BYPASSED',
        country: 'US',
        documentUrl: `upload:${sellerA.id}/22222222-2222-4222-8222-222222222222.png`,
      },
    })
  ).rejects.toThrow(/identity_verifications_scan_status_check/i);

  // Prior rejected claims do not block another seller from registering the same document.
  await prisma.identityVerification.create({
    data: {
      sellerProfileId: sellerRejected.sellerProfile!.id,
      status: 'REJECTED',
      documentType: 'PASSPORT',
      country: 'US',
      documentNumberHash: 'shared_active_hash_1',
      documentUrl: `upload:${sellerRejected.id}/33333333-3333-4333-8333-333333333333.png`,
    },
  });

  // Two concurrent active claims for the same (country, documentType, documentNumberHash): exactly one succeeds.
  const race = await Promise.allSettled([
    prisma.identityVerification.create({
      data: {
        sellerProfileId: sellerA.sellerProfile!.id,
        status: 'PENDING',
        documentType: 'PASSPORT',
        country: 'US',
        documentNumberHash: 'shared_active_hash_1',
        documentUrl: `upload:${sellerA.id}/44444444-4444-4444-8444-444444444444.png`,
      },
    }),
    prisma.identityVerification.create({
      data: {
        sellerProfileId: sellerB.sellerProfile!.id,
        status: 'PENDING',
        documentType: 'PASSPORT',
        country: 'US',
        documentNumberHash: 'shared_active_hash_1',
        documentUrl: `upload:${sellerB.id}/55555555-5555-4555-8555-555555555555.png`,
      },
    }),
  ]);
  expect(race.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect(race.filter(r => r.status === 'rejected')).toHaveLength(1);

  const winner = (race.find(r => r.status === 'fulfilled') as PromiseFulfilledResult<{ id: string; version: number }>).value;
  const optimisticA = await prisma.identityVerification.updateMany({
    where: { id: winner.id, version: winner.version },
    data: { scanStatus: 'INFECTED', version: winner.version + 1 },
  });
  const optimisticStale = await prisma.identityVerification.updateMany({
    where: { id: winner.id, version: winner.version },
    data: { scanStatus: 'VERIFIED_SAFE', version: winner.version + 1 },
  });
  expect(optimisticA.count).toBe(1);
  expect(optimisticStale.count).toBe(0);
});

it('validates upload_objects table, check constraints, extended scan statuses, and KYC HMAC columns', async () => {
  const constraints = await prisma.$queryRaw<{ conname: string; convalidated: boolean }[]>`
    SELECT conname, convalidated
    FROM pg_constraint
    WHERE conname IN (
      'identity_verifications_scan_status_check',
      'upload_objects_purpose_check',
      'upload_objects_lifecycle_check',
      'upload_objects_scan_status_check'
    )
    ORDER BY conname ASC
  `;
  expect(constraints).toHaveLength(4);
  expect(constraints.every(c => c.convalidated)).toBe(true);

  const owner = await prisma.user.create({
    data: {
      email: 'upload-pg@validation.invalid',
      password: 'unused',
      role: 'SELLER',
      status: 'ACTIVE',
      sellerProfile: { create: { status: 'DRAFT', skills: [], languages: [] } },
    },
    include: { sellerProfile: true },
  });

  const verification = await prisma.identityVerification.create({
    data: {
      sellerProfileId: owner.sellerProfile!.id,
      status: 'PENDING',
      scanStatus: 'SCANNING',
      documentType: 'PASSPORT',
      country: 'VN',
      documentNumberHash: 'hmac_v2_hash_pg',
      documentNumberHmacVersion: 'v2:h1',
      documentUrl: `upload:${owner.id}/66666666-6666-4666-8666-666666666666.png`,
      scanAttempts: 1,
      scanClaimId: 'claim-pg-1',
    },
  });
  expect(verification.documentNumberHmacVersion).toBe('v2:h1');

  const scanFailedUpdated = await prisma.identityVerification.update({
    where: { id: verification.id },
    data: { scanStatus: 'SCAN_FAILED', scanClaimId: null, nextScanRetryAt: new Date(Date.now() + 60_000) },
  });
  expect(scanFailedUpdated.scanStatus).toBe('SCAN_FAILED');

  const ref = `upload:${owner.id}/66666666-6666-4666-8666-666666666666.png`;
  const uploadRow = await prisma.uploadObject.create({
    data: {
      reference: ref,
      objectKey: `${owner.id}/66666666-6666-4666-8666-666666666666.png`,
      ownerId: owner.id,
      purpose: 'KYC',
      lifecycleStatus: 'ACTIVE',
      scanStatus: 'QUARANTINED',
      kycVerificationId: verification.id,
      kycSlot: 'documentFront',
      mimeType: 'image/png',
      byteSize: 128,
    },
  });
  expect(uploadRow.purpose).toBe('KYC');
  expect(uploadRow.byteSize).toBe(128);

  // Unique reference enforcement.
  await rejectsCode(
    prisma.uploadObject.create({
      data: {
        reference: ref,
        objectKey: `${owner.id}/66666666-6666-4666-8666-666666666666.png`,
        ownerId: owner.id,
        purpose: 'KYC',
        mimeType: 'image/png',
        byteSize: 128,
      },
    }),
    'P2002'
  );

  // Check constraint enforcement on purpose and lifecycleStatus.
  await expect(
    prisma.uploadObject.create({
      data: {
        reference: `upload:${owner.id}/77777777-7777-4777-8777-777777777777.png`,
        objectKey: `${owner.id}/77777777-7777-4777-8777-777777777777.png`,
        ownerId: owner.id,
        purpose: 'BYPASS',
        mimeType: 'image/png',
        byteSize: 128,
      },
    })
  ).rejects.toThrow(/upload_objects_purpose_check/i);

  await expect(
    prisma.uploadObject.create({
      data: {
        reference: `upload:${owner.id}/88888888-8888-4888-8888-888888888888.png`,
        objectKey: `${owner.id}/88888888-8888-4888-8888-888888888888.png`,
        ownerId: owner.id,
        purpose: 'GENERAL',
        lifecycleStatus: 'EXPOSED',
        mimeType: 'image/png',
        byteSize: 128,
      },
    })
  ).rejects.toThrow(/upload_objects_lifecycle_check/i);
});

it('enforces cross-key HMAC active-document uniqueness via identity_document_fingerprints triggers and releases on REJECTED', async () => {
  const [seller1, seller2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'kyc-crosskey-1@validation.invalid',
        password: 'unused',
        role: 'SELLER',
        status: 'ACTIVE',
        sellerProfile: { create: { status: 'DRAFT', skills: [], languages: [] } },
      },
      include: { sellerProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'kyc-crosskey-2@validation.invalid',
        password: 'unused',
        role: 'SELLER',
        status: 'ACTIVE',
        sellerProfile: { create: { status: 'DRAFT', skills: [], languages: [] } },
      },
      include: { sellerProfile: true },
    }),
  ]);

  // 1. Trigger creates normalized v1 fingerprint on parent insert.
  const kyc1 = await prisma.identityVerification.create({
    data: {
      sellerProfileId: seller1.sellerProfile!.id,
      status: 'PENDING',
      documentType: 'NATIONAL_ID',
      country: ' us ',
      documentNumberHash: 'crosskey_v1_hash',
      documentNumberHmacVersion: 'v1',
      documentUrl: `upload:${seller1.id}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1.png`,
    },
  });

  const fpAfterV1 = await prisma.identityDocumentFingerprint.findMany({
    where: { identityVerificationId: kyc1.id },
  });
  expect(fpAfterV1).toHaveLength(1);
  expect(fpAfterV1[0]).toMatchObject({
    hmacVersion: 'v1',
    country: 'US',
    documentType: 'NATIONAL_ID',
    documentNumberHash: 'crosskey_v1_hash',
  });

  // 2. Rotate seller1 parent row to v2:h1 while keeping v1 fingerprint row registered.
  await prisma.identityVerification.update({
    where: { id: kyc1.id },
    data: {
      documentNumberHash: 'crosskey_v2_hash',
      documentNumberHmacVersion: 'v2:h1',
    },
  });
  expect(await prisma.identityDocumentFingerprint.count({ where: { identityVerificationId: kyc1.id } })).toBe(2);

  // 3. Another seller attempting EITHER legacy v1 OR rotated v2:h1 hash under US/NATIONAL_ID fails at DB level.
  await rejectsCode(
    prisma.identityVerification.create({
      data: {
        sellerProfileId: seller2.sellerProfile!.id,
        status: 'PENDING',
        documentType: 'NATIONAL_ID',
        country: 'US',
        documentNumberHash: 'crosskey_v1_hash',
        documentNumberHmacVersion: 'v1',
        documentUrl: `upload:${seller2.id}/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2.png`,
      },
    }),
    'P2002'
  );

  await rejectsCode(
    prisma.identityVerification.create({
      data: {
        sellerProfileId: seller2.sellerProfile!.id,
        status: 'PENDING',
        documentType: 'NATIONAL_ID',
        country: 'US',
        documentNumberHash: 'crosskey_v2_hash',
        documentNumberHmacVersion: 'v2:h1',
        documentUrl: `upload:${seller2.id}/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3.png`,
      },
    }),
    'P2002'
  );

  // Guard trigger blocks attaching a fingerprint row onto a REJECTED verification.
  await prisma.identityVerification.update({
    where: { id: kyc1.id },
    data: { status: 'REJECTED' },
  });
  expect(await prisma.identityDocumentFingerprint.count({ where: { identityVerificationId: kyc1.id } })).toBe(0);

  await expect(
    prisma.identityDocumentFingerprint.create({
      data: {
        identityVerificationId: kyc1.id,
        sellerProfileId: seller1.sellerProfile!.id,
        country: 'US',
        documentType: 'NATIONAL_ID',
        hmacVersion: 'v2:h1',
        documentNumberHash: 'crosskey_v2_hash',
      },
    })
  ).rejects.toThrow(/Rejected identity verifications cannot hold active document fingerprints/i);

  // 4. Once seller1 is REJECTED and fingerprints are cleared, seller2 can register the document cleanly.
  const kyc2 = await prisma.identityVerification.create({
    data: {
      sellerProfileId: seller2.sellerProfile!.id,
      status: 'PENDING',
      documentType: 'NATIONAL_ID',
      country: 'US',
      documentNumberHash: 'crosskey_v1_hash',
      documentNumberHmacVersion: 'v1',
      documentUrl: `upload:${seller2.id}/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4.png`,
    },
  });
  expect(kyc2.status).toBe('PENDING');
  expect(await prisma.identityDocumentFingerprint.count({ where: { identityVerificationId: kyc2.id } })).toBe(1);
});

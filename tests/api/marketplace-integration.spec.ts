import { beforeEach, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { Prisma } from '@prisma/client';
const mocks = vi.hoisted(() => {
  const model = () => ({ count: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), createMany: vi.fn(), update: vi.fn(), updateMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn(), aggregate: vi.fn() });
  return { financialEntry: model(), service: model(), sellerProfile: model(), servicePackage: model(), serviceImage: model(), serviceFAQ: model(), serviceRequirement: model(), serviceTag: model(), searchTag: model(), category: model(), order: model(), user: model(), notification: model(), conversation: model(), message: model(), review: model(), lock: vi.fn() };
});
vi.mock('../../apps/api/src/lib/prisma', () => ({ prisma: { ...mocks, $queryRaw: mocks.lock, $transaction: async (fn: (tx: typeof mocks & { $queryRaw: typeof mocks.lock }) => Promise<unknown>) => fn({ ...mocks, $queryRaw: mocks.lock }) } }));
vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({ requireAuth: (req: express.Request & { user?: { userId: string; role: string } }, res: express.Response, next: express.NextFunction) => {
  const actor = req.headers.authorization?.replace('Bearer ', '');
  if (!actor || !['buyer', 'seller', 'admin', 'outsider'].includes(actor)) return res.status(401).json({ success: false });
  req.user = { userId: actor, role: actor === 'admin' ? 'ADMIN' : actor === 'seller' ? 'SELLER' : 'BUYER' }; next();
} }));
vi.mock('../../apps/api/src/lib/socket', () => ({ getIO: () => ({ to: () => ({ emit: vi.fn() }) }) }));
import marketplace from '../../apps/api/src/modules/marketplace/marketplace.route';
import admin from '../../apps/api/src/modules/admin/admin.route';
import orders from '../../apps/api/src/modules/order/order.route';
import services from '../../apps/api/src/modules/service/service.route';
import reviews from '../../apps/api/src/modules/review/review.route';
import messages from '../../apps/api/src/modules/message/message.route';
const app = express(); app.use(express.json());
app.use('/marketplace', marketplace); app.use('/admin', admin); app.use('/orders', orders); app.use('/services', services); app.use('/reviews', reviews); app.use('/messages', messages);
app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status || 500).json({ success: false, error: error.message }));
const id = 'c000000000000000000000001', categoryId = 'c000000000000000000000002', packageId = 'c000000000000000000000003';
const pkg = { id: packageId, type: 'BASIC', title: 'Basic package', description: 'Package description', price: 10.25, deliveryDays: 2, revisions: 1, features: [] };
const content = { title: 'Real seller service', description: 'A persistent seller service description.', categoryId, packages: [pkg], images: [], faqs: [], tags: [], requirements: '' };
const seller = { id: 'profile', userId: 'seller', status: 'APPROVED', user: { status: 'ACTIVE' } };
const service = { ...content, id, sellerProfileId: 'profile', status: 'DRAFT', seller, packages: [{ ...pkg, price: new Prisma.Decimal(pkg.price) }] };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.financialEntry.create.mockResolvedValue({ id: 'ledger-event' });
  mocks.financialEntry.findMany.mockResolvedValue([]);
  mocks.sellerProfile.findUnique.mockResolvedValue(seller); mocks.service.findUnique.mockResolvedValue(service);
  mocks.service.create.mockResolvedValue(service); mocks.service.update.mockResolvedValue({ ...service, status: 'PUBLISHED' });
  mocks.servicePackage.findUnique.mockResolvedValue({ ...pkg, price: new Prisma.Decimal(pkg.price), serviceId: id, service: { ...service, status: 'PUBLISHED' } });
  mocks.order.create.mockResolvedValue({ id, status: 'PENDING', amount: new Prisma.Decimal(pkg.price) });
  mocks.order.findUnique.mockResolvedValue({ id, buyerId: 'buyer', sellerId: 'profile', serviceId: id, seller, status: 'COMPLETED', review: null });
  mocks.conversation.findUnique.mockResolvedValue({ id, participant1Id: 'buyer', participant2Id: 'seller' }); mocks.conversation.findFirst.mockResolvedValue(null); mocks.conversation.create.mockResolvedValue({ id });
  mocks.user.findUnique.mockResolvedValue({ status: 'ACTIVE' }); mocks.review.create.mockResolvedValue({ id });
  mocks.review.aggregate.mockResolvedValue({ _count: { id: 2 }, _avg: { rating: 4.5 } }); mocks.message.create.mockResolvedValue({ id, content: 'Hello seller' });
});
it('creates a draft, saves packages, deliberately publishes, and creates a server-priced buyer order', async () => {
  expect((await request(app).post('/services').set('Authorization', 'Bearer seller').send(content)).status).toBe(201);
  expect(mocks.service.create.mock.calls[0]![0].data.status).toBe('DRAFT');
  expect((await request(app).put(`/marketplace/services/${id}/content`).set('Authorization', 'Bearer seller').send(content)).status).toBe(200);
  expect(mocks.servicePackage.upsert).toHaveBeenCalledOnce();
  expect((await request(app).put(`/admin/services/${id}/approve`).set('Authorization', 'Bearer admin')).status).toBe(200);
  mocks.order.findUnique.mockResolvedValueOnce(null);
  const result = await request(app).post('/orders').set('Authorization', 'Bearer buyer').send({ serviceId: id, packageId, idempotencyKey: 'checkout_regression_1', amount: 0, status: 'PAID' });
  expect(result.status).toBe(201); expect(result.body.data.status).toBe('PENDING');
  expect(mocks.order.create.mock.calls[0]![0].data.amount.toFixed(2)).toBe('10.25');
  expect(mocks.financialEntry.create.mock.calls[0]![0].data.notifyUserId).toBe('seller');
});
it('rejects unauthorized service edits and out-of-range package precision', async () => {
  expect((await request(app).put(`/marketplace/services/${id}/content`).set('Authorization', 'Bearer outsider').send(content)).status).toBe(404);
  expect(mocks.servicePackage.upsert).not.toHaveBeenCalled();
  expect((await request(app).put(`/marketplace/services/${id}/content`).set('Authorization', 'Bearer seller').send({ ...content, packages: [{ ...pkg, price: 10.255 }] })).status).toBe(400);
});
it('requires an administrator for review and does not conflate profile approval with KYC', async () => {
  expect((await request(app).get('/admin/review-queue').set('Authorization', 'Bearer buyer')).status).toBe(403);
  mocks.sellerProfile.updateMany.mockResolvedValue({ count: 1 });
  expect((await request(app).put(`/admin/sellers/${id}/review`).set('Authorization', 'Bearer admin').send({ status: 'APPROVED', verificationStatus: 'VERIFIED' })).status).toBe(200);
  expect(mocks.sellerProfile.updateMany.mock.calls[0]![0].data).toEqual({ status: 'APPROVED' });
  mocks.sellerProfile.updateMany.mockResolvedValue({ count: 0 });
  expect((await request(app).put(`/admin/sellers/${id}/review`).set('Authorization', 'Bearer admin').send({ status: 'APPROVED' })).status).toBe(409);
});
it('creates authorized order conversations, reuses existing conversations, and rejects outsiders', async () => {
  expect((await request(app).post('/marketplace/conversations').set('Authorization', 'Bearer buyer').send({ orderId: id })).status).toBe(201);
  expect(mocks.conversation.create).toHaveBeenCalledOnce();
  mocks.conversation.findFirst.mockResolvedValue({ id });
  expect((await request(app).post('/marketplace/conversations').set('Authorization', 'Bearer seller').send({ orderId: id })).status).toBe(201);
  expect(mocks.conversation.create).toHaveBeenCalledOnce();
  expect((await request(app).post('/marketplace/conversations').set('Authorization', 'Bearer outsider').send({ orderId: id })).status).toBe(404);
});
it('persists messages and recipient notifications; rejects nonparticipants and cross-owner uploads', async () => {
  expect((await request(app).post('/messages').set('Authorization', 'Bearer buyer').send({ conversationId: id, content: 'Hello seller' })).status).toBe(201);
  expect(mocks.message.create.mock.calls[0]![0].data.senderId).toBe('buyer');
  expect(mocks.notification.create.mock.calls[0]![0].data.userId).toBe('seller');
  expect((await request(app).post('/messages').set('Authorization', 'Bearer outsider').send({ conversationId: id, content: 'Denied' })).status).toBe(403);
  expect((await request(app).post('/messages').set('Authorization', 'Bearer buyer').send({ conversationId: id, content: 'Denied', attachmentUrl: 'upload:seller/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.pdf' })).status).toBe(403);
});
it('stores only completed-order buyer reviews and recomputes service/seller ratings', async () => {
  const body = { orderId: id, communication: 5, serviceQuality: 4, recommend: 5, comment: 'Useful and professional work.', serviceId: 'attacker-supplied' };
  expect((await request(app).post('/reviews').set('Authorization', 'Bearer outsider').send(body)).status).toBe(404);
  const result = await request(app).post('/reviews').set('Authorization', 'Bearer buyer').send(body);
  expect(result.status).toBe(201);
  expect(mocks.review.create.mock.calls[0]![0].data.serviceId).toBe(id);
  expect(mocks.service.update.mock.calls.at(-1)![0].data).toEqual({ ratingCount: 2, ratingAverage: 4.5 });
  expect(mocks.sellerProfile.update.mock.calls.at(-1)![0].data).toEqual({ ratingCount: 2, ratingAverage: 4.5 });
  mocks.order.findUnique.mockResolvedValue({ id, buyerId: 'buyer', seller, status: 'COMPLETED', review: { id } });
  expect((await request(app).post('/reviews').set('Authorization', 'Bearer buyer').send(body)).status).toBe(409);
  expect((await request(app).post('/reviews').set('Authorization', 'Bearer buyer').send({ ...body, communication: 6 })).status).toBe(400);
});
it('blocks self reviews and uncompleted order reviews', async () => {
  const body = { orderId: id, communication: 5, serviceQuality: 5, recommend: 5, comment: 'A review comment.' };
  mocks.order.findUnique.mockResolvedValue({ id, buyerId: 'seller', seller, status: 'COMPLETED', review: null });
  expect((await request(app).post('/reviews').set('Authorization', 'Bearer seller').send(body)).status).toBe(403);
  mocks.order.findUnique.mockResolvedValue({ id, buyerId: 'buyer', seller, status: 'PENDING', review: null });
  expect((await request(app).post('/reviews').set('Authorization', 'Bearer buyer').send(body)).status).toBe(409);
  expect(mocks.review.create).not.toHaveBeenCalled();
});

it('acknowledges only fetched incoming messages and preserves unread messages arriving later', async () => {
  mocks.message.count.mockResolvedValue(2);
  expect((await request(app).post(`/marketplace/conversations/${id}/read`).set('Authorization', 'Bearer buyer').send({ messageIds: ['visible-message'] })).status).toBe(200);
  expect(mocks.message.updateMany.mock.calls[0]![0].where).toEqual({ id: { in: ['visible-message'] }, conversationId: id, senderId: { not: 'buyer' }, isRead: false });
  expect(mocks.conversation.update.mock.calls[0]![0].data).toEqual({ unreadCount1: 2 });
  expect((await request(app).post(`/marketplace/conversations/${id}/read`).set('Authorization', 'Bearer outsider').send({ messageIds: ['visible-message'] })).status).toBe(404);
  expect((await request(app).post(`/marketplace/conversations/${id}/read`).set('Authorization', 'Bearer buyer').send({ messageIds: Array(101).fill('message') })).status).toBe(400);
});

it('applies active seller and purchasable-package filters consistently to public details', async () => {
  mocks.service.findFirst.mockResolvedValue(null);
  expect((await request(app).get(`/services/${id}`)).status).toBe(404);
  expect(mocks.service.findFirst.mock.calls[0]![0].where).toEqual({ id, status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } }, packages: { some: { price: { gt: 0 } } } });
  mocks.sellerProfile.findFirst.mockResolvedValue(null);
  expect((await request(app).get(`/marketplace/sellers/${id}`)).status).toBe(404);
  expect(mocks.sellerProfile.findFirst.mock.calls[0]![0].where).toEqual({ id, status: 'APPROVED', user: { status: 'ACTIVE' } });
});

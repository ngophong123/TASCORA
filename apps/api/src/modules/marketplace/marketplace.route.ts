import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { publicSellerSelect } from '../../lib/public-profile';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth';
import { validate } from '../../middlewares/validate';
import { createPackageSchema } from '../service/service.schema';
import { assertOwnedUpload } from '../upload/references';

const router = Router();
router.get('/categories', async (_req, res, next) => {
  try { res.json({ success: true, data: await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { services: { where: { status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } }, packages: { some: { price: { gt: 0 } } } } } } } } }) }); } catch (error) { next(error); }
});
router.get('/sellers', async (_req, res, next) => {
  try { const sellers = await prisma.sellerProfile.findMany({ where: { status: 'APPROVED', user: { status: 'ACTIVE' } }, select: { ...publicSellerSelect, hourlyRate: true, availability: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 12 }); res.json({ success: true, data: sellers }); } catch (error) { next(error); }
});
router.get('/sellers/:id', async (req, res, next) => {
  try {
    const seller = await prisma.sellerProfile.findFirst({ where: { id: req.params.id, status: 'APPROVED', user: { status: 'ACTIVE' } }, select: { ...publicSellerSelect, hourlyRate: true, availability: true, createdAt: true, _count: { select: { orders: { where: { status: 'COMPLETED' } } } }, reviews: { include: { buyer: { select: { buyerProfile: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }, services: { where: { status: 'PUBLISHED', packages: { some: { price: { gt: 0 } } } }, include: { category: true, packages: true, images: true } } } });
    if (!seller || seller.status !== 'APPROVED') throw new HttpError(404, 'Seller not found');
    res.json({ success: true, data: seller });
  } catch (error) { next(error); }
});
router.use(requireAuth);
router.put('/services/:id/status', validate(z.object({ params: z.object({ id: z.string().cuid() }), body: z.object({ status: z.enum(['PAUSED', 'DRAFT']) }) })), async (req: AuthRequest, res, next) => {
  try {
    const status = req.body.status as 'PAUSED' | 'DRAFT';
    const updated = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`service:${req.params.id}`}))`;
      return tx.service.updateMany({ where: { id: req.params.id, seller: { userId: req.user!.userId } }, data: { status } });
    });
    if (!updated.count) throw new HttpError(404, 'Service not found'); res.json({ success: true });
  } catch (error) { next(error); }
});
router.put('/services/:id/content', validate(z.object({ params: z.object({ id: z.string().cuid() }), body: z.object({
  title: z.string().min(5).max(100), description: z.string().min(20).max(5000), categoryId: z.string().cuid(),
  packages: z.array(createPackageSchema.shape.body).min(1).max(3).refine(p => new Set(p.map(x => x.type)).size === p.length, 'Duplicate package tier'),
  images: z.array(z.string().url()).max(10).default([]),
  faqs: z.array(z.object({ question: z.string().min(1).max(500), answer: z.string().min(1).max(2000) })).max(20).default([]),
  requirements: z.string().max(2000).default(''), tags: z.array(z.string().min(1).max(50)).max(20).default([]),
}) })), async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as { title: string; description: string; categoryId: string; packages: z.infer<typeof createPackageSchema>['body'][]; images: string[]; faqs: { question: string; answer: string }[]; requirements: string; tags: string[] };
    for (const image of body.images) assertOwnedUpload(image, req.user!.userId, true);
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`service:${req.params.id}`}))`;
      const service = await tx.service.findUnique({ where: { id: req.params.id }, include: { seller: true, packages: true } });
      if (!service || service.seller.userId !== req.user!.userId) throw new HttpError(404, 'Service not found');
      if (service.packages.some(pkg => !body.packages.some(next => next.type === pkg.type))) throw new HttpError(409, 'Removing existing packages is unsupported; edit or pause them instead');
      // Edits return to draft; only deliberate admin review can publish changed content.
      await tx.service.update({ where: { id: service.id }, data: { title: body.title, description: body.description, categoryId: body.categoryId, status: 'DRAFT' } });
      for (const pkg of body.packages) await tx.servicePackage.upsert({ where: { serviceId_type: { serviceId: service.id, type: pkg.type } }, update: pkg, create: { ...pkg, serviceId: service.id } });
      await tx.serviceImage.deleteMany({ where: { serviceId: service.id } });
      if (body.images.length) await tx.serviceImage.createMany({ data: body.images.map((url, order) => ({ serviceId: service.id, url, order, isPrimary: order === 0 })) });
      await tx.serviceFAQ.deleteMany({ where: { serviceId: service.id } });
      if (body.faqs.length) await tx.serviceFAQ.createMany({ data: body.faqs.map((faq, order) => ({ ...faq, serviceId: service.id, order })) });
      await tx.serviceRequirement.deleteMany({ where: { serviceId: service.id } });
      if (body.requirements) await tx.serviceRequirement.create({ data: { serviceId: service.id, description: body.requirements } });
      await tx.serviceTag.deleteMany({ where: { serviceId: service.id } });
      for (const name of new Set(body.tags)) { const tag = await tx.searchTag.upsert({ where: { name }, update: {}, create: { name } }); await tx.serviceTag.create({ data: { serviceId: service.id, tagId: tag.id } }); }
      return tx.service.findUnique({ where: { id: service.id }, include: { packages: true, images: true, faqs: true, requirements: true, tags: { include: { tag: true } }, category: true } });
    });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});
router.post('/conversations', validate(z.object({ body: z.object({ sellerId: z.string().cuid().optional(), orderId: z.string().cuid().optional() }).refine(b => Boolean(b.sellerId || b.orderId), 'Seller or order is required') })), async (req: AuthRequest, res, next) => {
  try {
    const { sellerId, orderId } = req.body as { sellerId?: string; orderId?: string };
    const conversation = await prisma.$transaction(async tx => {
      let other: string;
      if (orderId) {
        const order = await tx.order.findUnique({ where: { id: orderId }, include: { seller: true } });
        if (!order || ![order.buyerId, order.seller.userId].includes(req.user!.userId)) throw new HttpError(404, 'Order not found');
        other = order.buyerId === req.user!.userId ? order.seller.userId : order.buyerId;
      } else {
        const seller = await tx.sellerProfile.findUnique({ where: { id: sellerId } });
        if (!seller || seller.status !== 'APPROVED') throw new HttpError(404, 'Seller not found');
        other = seller.userId;
      }
      if (other === req.user!.userId) throw new HttpError(400, 'Cannot message yourself');
      const recipient = await tx.user.findUnique({ where: { id: other }, select: { status: true } });
      if (recipient?.status !== 'ACTIVE') throw new HttpError(409, 'Recipient unavailable');
      const participants = [other, req.user!.userId].sort();
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`conversation:${participants.join(':')}:${orderId || ''}`}))`;
      const existing = await tx.conversation.findFirst({ where: { orderId: orderId || null, OR: [{ participant1Id: participants[0], participant2Id: participants[1] }, { participant1Id: participants[1], participant2Id: participants[0] }] } });
      return existing || tx.conversation.create({ data: { participant1Id: participants[0]!, participant2Id: participants[1]!, orderId } });
    });
    res.status(201).json({ success: true, data: conversation });
  } catch (error) { next(error); }
});
router.post('/conversations/:id/read', validate(z.object({ body: z.object({ messageIds: z.array(z.string().min(1).max(128)).max(100) }) })), async (req: AuthRequest, res, next) => {
  try {
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`chat:${req.params.id}`}))`;
      const conversation = await tx.conversation.findUnique({ where: { id: req.params.id } });
      if (!conversation || ![conversation.participant1Id, conversation.participant2Id].includes(req.user!.userId)) throw new HttpError(404, 'Conversation not found');
      await tx.message.updateMany({ where: { id: { in: req.body.messageIds as string[] }, conversationId: conversation.id, senderId: { not: req.user!.userId }, isRead: false }, data: { isRead: true } });
      const unread = await tx.message.count({ where: { conversationId: conversation.id, senderId: { not: req.user!.userId }, isRead: false } });
      await tx.conversation.update({ where: { id: conversation.id }, data: conversation.participant1Id === req.user!.userId ? { unreadCount1: unread } : { unreadCount2: unread } });
    }); res.json({ success: true });
  } catch (error) { next(error); }
});
export default router;

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface UploadRow {
  id: string;
  reference: string;
  objectKey: string;
  ownerId: string;
  purpose: 'GENERAL' | 'KYC';
  lifecycleStatus: 'ACTIVE' | 'REPLACED' | 'ORPHANED' | 'DELETED';
  scanStatus: string;
  mimeType: string;
  byteSize: number;
  kycVerificationId: string | null;
  kycSlot: string | null;
  retentionUntil: Date | null;
}

const store = vi.hoisted(() => ({
  users: new Map<string, { id: string; email: string; role: string; status: string }>(),
  uploads: new Map<string, UploadRow>(),
  kycs: new Map<string, { id: string; documentUrl: string; documentBackUrl: string | null; selfieUrl: string | null; scanStatus: string }>(),
  conversations: new Map<string, { id: string; participant1Id: string; participant2Id: string; unreadCount1: number; unreadCount2: number }>(),
  persistedMessages: [] as Array<Record<string, unknown>>,
  persistedBuyerProfiles: new Map<string, Record<string, unknown>>(),
  persistedSellerProfiles: new Map<string, Record<string, unknown>>(),
  persistedServiceImages: [] as Array<Record<string, unknown>>,
  persistedDeliveries: [] as Array<Record<string, unknown>>,
  socketEmit: vi.fn(),
}));

vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (req: express.Request & { user?: { userId: string; role: string } }, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !store.users.has(token)) {
      res.status(401).json({ success: false });
      return;
    }
    const u = store.users.get(token)!;
    req.user = { userId: u.id, role: u.role };
    next();
  },
}));

vi.mock('../../apps/api/src/lib/socket', () => ({
  getIO: () => ({ to: () => ({ emit: store.socketEmit }) }),
}));

vi.mock('../../apps/api/src/lib/prisma', () => {
  const client = {
    $queryRaw: async () => [{ '?column?': 1 }],
    user: { findFirst: async () => null },
    service: {
      findUnique: async ({ where }: { where: { id: string } }) => ({
        id: where.id,
        seller: { userId: 'seller-1' },
        packages: [{ type: 'BASIC' }],
      }),
      update: async ({ where }: { where: { id: string } }) => ({ id: where.id }),
    },
    servicePackage: { upsert: async () => ({}) },
    serviceImage: {
      findFirst: async () => null,
      deleteMany: async () => ({ count: 0 }),
      createMany: async ({ data }: { data: Array<Record<string, unknown>> }) => {
        store.persistedServiceImages.push(...data);
        return { count: data.length };
      },
    },
    serviceFAQ: { deleteMany: async () => ({ count: 0 }), createMany: async () => ({ count: 0 }) },
    serviceRequirement: { deleteMany: async () => ({ count: 0 }), create: async () => ({}) },
    serviceTag: { deleteMany: async () => ({ count: 0 }), create: async () => ({}) },
    searchTag: { upsert: async ({ where }: { where: { name: string } }) => ({ id: `tag_${where.name}`, name: where.name }) },
    uploadObject: {
      create: async ({ data }: { data: Omit<UploadRow, 'id'> }) => {
        const row: UploadRow = { id: `up_${store.uploads.size + 1}`, ...data };
        store.uploads.set(row.reference, row);
        return row;
      },
      findUnique: async ({ where }: { where: { reference?: string } }) =>
        where.reference ? store.uploads.get(where.reference) ?? null : null,
    },
    identityVerification: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        const or = where.OR as Array<Record<string, string>> | undefined;
        if (!or) return null;
        for (const kyc of store.kycs.values()) {
          if (or.some(cond => Object.entries(cond).some(([k, v]) => (kyc as Record<string, unknown>)[k] === v))) {
            return { id: kyc.id, scanStatus: kyc.scanStatus };
          }
        }
        return null;
      },
    },
    conversation: {
      findUnique: async ({ where }: { where: { id: string } }) => store.conversations.get(where.id) ?? null,
      update: async () => ({}),
    },
    message: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `msg_${store.persistedMessages.length + 1}`, ...data };
        store.persistedMessages.push(created);
        return created;
      },
    },
    order: {
      findUnique: async ({ where }: { where: { id: string } }) => ({
        id: where.id,
        buyerId: 'buyer-1',
        status: 'IN_PROGRESS',
        amount: new Prisma.Decimal('100.00'),
        currency: 'usd',
        platformFeeBps: 1000,
        purchaseSnapshot: { revisions: 1 },
        seller: { userId: 'seller-1' },
        escrow: { id: 'escrow-1', released: false },
        dispute: null,
        deliveries: [],
        revisions: [],
        refunds: [],
      }),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => ({
        id: where.id,
        status: data.status ?? 'DELIVERED',
        amount: new Prisma.Decimal('100.00'),
        currency: 'usd',
        completedAt: null,
      }),
    },
    orderDelivery: {
      findUnique: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const created = { id: `del_${store.persistedDeliveries.length + 1}`, createdAt: new Date(), ...data };
        store.persistedDeliveries.push(created);
        return created;
      },
    },
    financialEntry: { create: async () => ({ id: 'fe-1' }) },
    notification: { create: async () => ({}) },
    buyerProfile: {
      upsert: async ({ create }: { create: Record<string, unknown> }) => {
        store.persistedBuyerProfiles.set(String(create.userId), create);
        return create;
      },
    },
    sellerProfile: {
      findUnique: async () => null,
      upsert: async ({ create }: { create: Record<string, unknown> }) => {
        store.persistedSellerProfiles.set(String(create.userId), create);
        return create;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        store.persistedSellerProfiles.set(String(data.userId), data);
        return data;
      },
    },
  };
  return { prisma: { ...client, $transaction: async <T>(fn: (tx: typeof client) => Promise<T>) => fn(client) } };
});

import { uploadRouter } from '../../apps/api/src/modules/upload/upload.route';
import messageRouter from '../../apps/api/src/modules/message/message.route';
import marketplaceRouter from '../../apps/api/src/modules/marketplace/marketplace.route';
import { MessageService } from '../../apps/api/src/modules/message/message.service';
import { OrderService } from '../../apps/api/src/modules/order/order.service';
import { ProfileService } from '../../apps/api/src/modules/profile/profile.service';
import { OnboardingService } from '../../apps/api/src/modules/onboarding/onboarding.service';
import { LocalStorage } from '../../apps/api/src/modules/upload/storage';
import {
  assertUsableNonKycUpload,
  resolveCanonicalUploadRef,
} from '../../apps/api/src/modules/upload/references';

const pngBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1]);

async function buildTestApp() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-upl-iso-'));
  const app = express();
  app.use(express.json());
  app.use('/api/v1/uploads', uploadRouter(new LocalStorage(dir)));
  app.use('/api/v1/messages', messageRouter);
  app.use('/api/v1/marketplace', marketplaceRouter);
  app.use((err: { status?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.status || 500).json({ success: false, error: { message: err.message || 'Error' } });
  });
  return { app, cleanup: () => fs.rm(dir, { recursive: true, force: true }) };
}

describe('Workstream B: KYC vs General Upload Isolation Across Messages, Orders, Profiles & Services', () => {
  beforeEach(() => {
    store.users.clear();
    store.uploads.clear();
    store.kycs.clear();
    store.conversations.clear();
    store.persistedMessages.length = 0;
    store.persistedBuyerProfiles.clear();
    store.persistedSellerProfiles.clear();
    store.persistedServiceImages.length = 0;
    store.persistedDeliveries.length = 0;
    store.socketEmit.mockReset();

    store.users.set('seller-1', { id: 'seller-1', email: 'seller@tascora.dev', role: 'SELLER', status: 'ACTIVE' });
    store.users.set('buyer-1', { id: 'buyer-1', email: 'buyer@tascora.dev', role: 'BUYER', status: 'ACTIVE' });
    store.conversations.set('conv-1', {
      id: 'conv-1',
      participant1Id: 'buyer-1',
      participant2Id: 'seller-1',
      unreadCount1: 0,
      unreadCount2: 0,
    });
  });

  it('blocks KYC-purpose, replaced, orphaned, infected, and unregistered uploads from chat, deliveries, profiles, onboarding, and services', async () => {
    const ctx = await buildTestApp();
    try {
      // Upload with purpose=kyc via query parameter and header.
      const kycUp = await request(ctx.app)
        .post('/api/v1/uploads?purpose=kyc')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBytes);
      expect(kycUp.status).toBe(201);
      const kycRef = kycUp.body.data.reference as string;
      const kycKey = kycRef.slice('upload:'.length);
      expect(store.uploads.get(kycRef)?.purpose).toBe('KYC');

      // Direct HTTP public / shared / raw download routes fail closed for KYC uploads.
      const pubRes = await request(ctx.app).get(`/api/v1/uploads/public/${kycKey}`).set('Authorization', 'Bearer seller-1');
      expect([403, 404]).toContain(pubRes.status);
      const sharedRes = await request(ctx.app).get(`/api/v1/uploads/shared/${kycKey}`).set('Authorization', 'Bearer seller-1');
      expect([403, 404]).toContain(sharedRes.status);

      // Chat REST API rejects KYC upload as attachmentUrl.
      const msgHttp = await request(ctx.app)
        .post('/api/v1/messages')
        .set('Authorization', 'Bearer seller-1')
        .send({ conversationId: 'conv-1', content: 'Trying to leak KYC image', attachmentUrl: kycRef });
      expect(msgHttp.status).toBe(403);
      expect(store.socketEmit).not.toHaveBeenCalled();

      // WebSocket service path rejects KYC upload as attachmentUrl.
      await expect(
        MessageService.sendMessage('conv-1', 'seller-1', 'WS leak attempt', kycRef)
      ).rejects.toMatchObject({ status: 403 });

      // Order delivery, profile avatars, onboarding avatar, and marketplace service content reject KYC upload.
      await expect(
        OrderService.deliver(
          'seller-1',
          'ord-1',
          'Delivering private ID by mistake',
          [kycRef],
          '00000000-0000-4000-8000-000000000001'
        )
      ).rejects.toMatchObject({ status: 403 });

      await expect(ProfileService.updateBuyerProfile('seller-1', { avatar: kycRef })).rejects.toMatchObject({ status: 403 });
      await expect(ProfileService.updateSellerProfile('seller-1', { avatar: kycRef })).rejects.toMatchObject({ status: 403 });
      await expect(OnboardingService.updateStep('seller-1', 1, { avatar: kycRef })).rejects.toMatchObject({ status: 403 });

      const svcRes = await request(ctx.app)
        .put('/api/v1/marketplace/services/c000000000000000000000001/content')
        .set('Authorization', 'Bearer seller-1')
        .send({
          title: 'Valid Service Title Here',
          description: 'A sufficiently detailed marketplace service description here.',
          categoryId: 'c000000000000000000000002',
          packages: [{ type: 'BASIC', title: 'Basic', description: 'Basic pkg', price: 25, deliveryDays: 2, revisions: 1, features: [] }],
          images: [`http://127.0.0.1:4000/api/v1/uploads/public/${kycKey}`],
        });
      expect(svcRes.status).toBe(403);

      // General upload marked REPLACED, ORPHANED, INFECTED, or QUARANTINED also fails closed.
      const genUp = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBytes);
      expect(genUp.status).toBe(201);
      const genRef = genUp.body.data.reference as string;
      const genRow = store.uploads.get(genRef)!;

      await expect(assertUsableNonKycUpload(genRef, 'seller-1', true)).resolves.toBe(genRef);

      genRow.lifecycleStatus = 'REPLACED';
      await expect(assertUsableNonKycUpload(genRef, 'seller-1', false)).rejects.toMatchObject({
        status: 409,
        code: 'UPLOAD_INACTIVE',
      });
      await expect(
        OrderService.deliver(
          'seller-1',
          'ord-1',
          'Inactive delivery attachment',
          [genRef],
          '00000000-0000-4000-8000-000000000003'
        )
      ).rejects.toMatchObject({ status: 409, code: 'UPLOAD_INACTIVE' });

      genRow.lifecycleStatus = 'ACTIVE';
      genRow.scanStatus = 'INFECTED';
      await expect(assertUsableNonKycUpload(genRef, 'seller-1', false)).rejects.toMatchObject({
        status: 423,
        code: 'KYC_DOCUMENT_INFECTED',
      });
      await expect(
        OrderService.deliver(
          'seller-1',
          'ord-1',
          'Infected delivery attachment',
          [genRef],
          '00000000-0000-4000-8000-000000000004'
        )
      ).rejects.toMatchObject({ status: 423, code: 'KYC_DOCUMENT_INFECTED' });

      genRow.scanStatus = 'QUARANTINED';
      await expect(
        OrderService.deliver(
          'seller-1',
          'ord-1',
          'Quarantined delivery attachment',
          [genRef],
          '00000000-0000-4000-8000-000000000005'
        )
      ).rejects.toMatchObject({ status: 423, code: 'KYC_DOCUMENT_QUARANTINED' });

      // Unregistered forged UUID owned reference fails closed.
      const unregisteredRef = 'upload:seller-1/99999999-9999-4999-8999-999999999999.png';
      await expect(assertUsableNonKycUpload(unregisteredRef, 'seller-1', false)).rejects.toMatchObject({
        status: 404,
        code: 'UPLOAD_OBJECT_NOT_FOUND',
      });
      await expect(
        OrderService.deliver(
          'seller-1',
          'ord-1',
          'Unregistered delivery attachment',
          [unregisteredRef],
          '00000000-0000-4000-8000-000000000006'
        )
      ).rejects.toMatchObject({ status: 404, code: 'UPLOAD_OBJECT_NOT_FOUND' });

      await expect(
        OrderService.deliver(
          'seller-1',
          'ord-1',
          'Arbitrary external URL delivery',
          ['https://evil.example/deliverable.png'],
          '00000000-0000-4000-8000-000000000007'
        )
      ).rejects.toMatchObject({ status: 403 });

      // UPL-03 adversarial matrix: canonicalized ownerless & host-relative KYC URL variants fail closed (403)
      // across REST and WebSocket services, malformed/traversal/encoding internal URLs fail (400),
      // while legitimate external URLs are preserved.
      const kycUrlVariants = [
        `/api/v1/uploads/shared/${kycKey}?download=1#hash`,
        `//evil.example/api/v1/uploads/kyc/${kycKey}`,
        `https://cdn.tascora.com/api/v1/uploads/shared/${kycKey}?download=1#hash`,
        `https://cdn.tascora.com/api/v1/uploads/public/${kycKey}`,
        `https://cdn.tascora.com/api/v1/uploads/${kycKey.split('/')[1]}`,
        `/api/v1/uploads/${kycKey.split('/')[1]}`,
      ];
      for (const variant of kycUrlVariants) {
        await expect(
          MessageService.sendMessage('conv-1', 'seller-1', 'Adversarial KYC leak', variant)
        ).rejects.toMatchObject({ status: 403 });
        await expect(
          OrderService.deliver(
            'seller-1',
            'ord-1',
            'Adversarial delivery leak',
            [variant],
            '00000000-0000-4000-8000-000000000002'
          )
        ).rejects.toMatchObject({ status: 403 });
        await expect(ProfileService.updateBuyerProfile('seller-1', { avatar: variant })).rejects.toMatchObject({
          status: 403,
        });
        await expect(ProfileService.updateSellerProfile('seller-1', { avatar: variant })).rejects.toMatchObject({
          status: 403,
        });
        await expect(OnboardingService.updateStep('seller-1', 1, { avatar: variant })).rejects.toMatchObject({
          status: 403,
        });
        const adSvcRes = await request(ctx.app)
          .put('/api/v1/marketplace/services/c000000000000000000000001/content')
          .set('Authorization', 'Bearer seller-1')
          .send({
            title: 'Valid Service Title Here',
            description: 'A sufficiently detailed marketplace service description here.',
            categoryId: 'c000000000000000000000002',
            packages: [{ type: 'BASIC', title: 'Basic', description: 'Basic pkg', price: 25, deliveryDays: 2, revisions: 1, features: [] }],
            images: [variant],
          });
        expect(adSvcRes.status).toBe(variant.startsWith('http') ? 403 : 400);
      }

      const malformedInternalVariants = [
        `/api/v1/uploads/public/..%2Fkyc/${kycKey}`,
        `/api/v1/uploads/%2e%2e/public/${kycKey}`,
        `https://api.tascora.com/api/v1/uploads/public/../kyc/${kycKey}`,
        `/api/v1/uploads\\public\\${kycKey.replace('/', '\\')}`,
        `/api/v1/uploads/public/${kycKey}\n`,
        `https://user:pass@tascora.com/api/v1/uploads/public/${kycKey}`,
        `/api/v1/uploads/public/seller-1/%252e%252e.png`,
        `/api/v1/uploads/unknown/${kycKey}`,
      ];
      for (const badVariant of malformedInternalVariants) {
        expect(() => resolveCanonicalUploadRef(badVariant, 'seller-1')).toThrow();
        await expect(assertUsableNonKycUpload(badVariant, 'seller-1', false)).rejects.toMatchObject({
          status: 400,
          code: 'INVALID_UPLOAD_REFERENCE',
        });
      }

      const externalUrl = 'https://cdn.example.com/images/portfolio-preview.png';
      expect(resolveCanonicalUploadRef(externalUrl, 'seller-1')).toBe(externalUrl);
      await expect(assertUsableNonKycUpload(externalUrl, 'seller-1', true)).resolves.toBe(externalUrl);
    } finally {
      await ctx.cleanup();
    }
  });

  it('UPL-05: canonicalizes internal upload URLs before persisting in messages, profiles, onboarding, and marketplace images while preserving external URLs', async () => {
    const ctx = await buildTestApp();
    try {
      const sellerUpload = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBytes);
      expect(sellerUpload.status).toBe(201);
      const sellerRef = sellerUpload.body.data.reference as string;
      const sellerKey = sellerRef.slice('upload:'.length);
      const sellerFile = sellerKey.split('/')[1]!;

      const buyerUpload = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer buyer-1')
        .set('Content-Type', 'image/png')
        .send(pngBytes);
      expect(buyerUpload.status).toBe(201);
      const buyerRef = buyerUpload.body.data.reference as string;
      const buyerKey = buyerRef.slice('upload:'.length);

      // 1. Canonical and legacy URL inputs both persist canonical `upload:<owner>/<file>` in MessageService
      await MessageService.sendMessage(
        'conv-1',
        'seller-1',
        'Legacy shared URL',
        `https://cdn.tascora.dev/api/v1/uploads/shared/${sellerKey}?v=1#hash`
      );
      await MessageService.sendMessage(
        'conv-1',
        'seller-1',
        'Ownerless URL',
        `/api/v1/uploads/${sellerFile}`
      );
      await MessageService.sendMessage(
        'conv-1',
        'seller-1',
        'External URL',
        'https://images.unsplash.com/photo-999?w=640'
      );
      expect(store.persistedMessages.map(m => m.attachmentUrl)).toEqual([
        sellerRef,
        sellerRef,
        'https://images.unsplash.com/photo-999?w=640',
      ]);

      // 2. ProfileService (buyer & seller) and OnboardingService persist canonicalized avatar URLs & preserve external URLs
      await ProfileService.updateBuyerProfile('buyer-1', {
        avatar: `https://api.tascora.dev/api/v1/uploads/public/${buyerKey}?size=md`,
      });
      expect(store.persistedBuyerProfiles.get('buyer-1')?.avatar).toBe(buyerRef);

      await ProfileService.updateSellerProfile('seller-1', {
        avatar: `/api/v1/uploads/shared/${sellerKey}`,
      });
      expect(store.persistedSellerProfiles.get('seller-1')?.avatar).toBe(sellerRef);

      await OnboardingService.updateStep('seller-1', 1, {
        avatar: 'https://cdn.partner.example/avatars/seller.png',
      });
      expect(store.persistedSellerProfiles.get('seller-1')?.avatar).toBe(
        'https://cdn.partner.example/avatars/seller.png'
      );

      // 3. Marketplace service content route persists canonical upload refs alongside external URLs
      const svcSave = await request(ctx.app)
        .put('/api/v1/marketplace/services/c000000000000000000000001/content')
        .set('Authorization', 'Bearer seller-1')
        .send({
          title: 'Canonical Image Service Title',
          description: 'A sufficiently detailed marketplace service description here.',
          categoryId: 'c000000000000000000000002',
          packages: [
            {
              type: 'BASIC',
              title: 'Basic',
              description: 'Basic pkg',
              price: 25,
              deliveryDays: 2,
              revisions: 1,
              features: [],
            },
          ],
          images: [
            `https://cdn.tascora.dev/api/v1/uploads/public/${sellerKey}?v=2`,
            'https://images.unsplash.com/photo-888?w=800',
          ],
        });
      expect(svcSave.status).toBe(200);
      expect(store.persistedServiceImages.map(img => img.url)).toEqual([
        sellerRef,
        'https://images.unsplash.com/photo-888?w=800',
      ]);

      // 4. OrderService.deliver canonicalizes valid owner internal upload URLs before persisting
      await OrderService.deliver(
        'seller-1',
        'ord-1',
        'Canonicalized delivery attachment',
        [`https://cdn.tascora.dev/api/v1/uploads/shared/${sellerKey}?v=1#hash`],
        '00000000-0000-4000-8000-000000000008'
      );
      expect(store.persistedDeliveries.map(d => d.files)).toEqual([[sellerRef]]);

      // 5. Cross-owner and unknown upload objects still reject cleanly without persisting
      await expect(
        ProfileService.updateBuyerProfile('seller-1', {
          avatar: `https://cdn.tascora.dev/api/v1/uploads/public/${buyerKey}`,
        })
      ).rejects.toMatchObject({ status: 403 });
      await expect(
        MessageService.sendMessage(
          'conv-1',
          'seller-1',
          'Missing object',
          'https://cdn.tascora.dev/api/v1/uploads/public/seller-1/99999999-9999-4999-8999-999999999999.png'
        )
      ).rejects.toMatchObject({ status: 404, code: 'UPLOAD_OBJECT_NOT_FOUND' });
    } finally {
      await ctx.cleanup();
    }
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import express from 'express';
import request from 'supertest';
const permissions = vi.hoisted(() => ({
  profile: vi.fn().mockResolvedValue(null),
  userUnique: vi.fn().mockResolvedValue(null),
  image: vi.fn().mockResolvedValue(null),
  imageMany: vi.fn().mockResolvedValue([]),
  message: vi.fn().mockResolvedValue(null),
  messageMany: vi.fn().mockResolvedValue([]),
  delivery: vi.fn().mockResolvedValue(null),
  deliveryMany: vi.fn().mockResolvedValue([]),
  kyc: vi.fn().mockResolvedValue(null),
  uploads: new Map<string, {
    id: string;
    objectKey: string;
    reference: string;
    ownerId: string;
    mimeType: string;
    byteSize: number;
    purpose: string;
    lifecycleStatus: string;
    scanStatus: string;
    kycVerificationId: string | null;
  }>(),
}));
vi.mock('../../apps/api/src/lib/prisma', () => ({
  prisma: {
    user: { findFirst: permissions.profile, findUnique: permissions.userUnique },
    serviceImage: { findFirst: permissions.image, findMany: permissions.imageMany },
    message: { findFirst: permissions.message, findMany: permissions.messageMany },
    orderDelivery: { findFirst: permissions.delivery, findMany: permissions.deliveryMany },
    identityVerification: { findFirst: permissions.kyc },
    uploadObject: {
      create: async ({ data }: { data: {
        objectKey: string;
        reference: string;
        ownerId: string;
        mimeType: string;
        byteSize: number;
        purpose: string;
        lifecycleStatus: string;
        scanStatus: string;
      } }) => {
        const row = { id: `uo_${permissions.uploads.size + 1}`, kycVerificationId: null, ...data };
        permissions.uploads.set(row.reference, row);
        return row;
      },
      findUnique: async ({ where }: { where: { reference: string } }) =>
        permissions.uploads.get(where.reference) || null,
    },
  },
}));

vi.mock('../../apps/api/src/modules/auth/token', () => ({ authenticateAccess: async (token: string) => {
  if (!['owner', 'another'].includes(token)) throw new Error('Unauthorized');
  return { userId: token, role: 'BUYER', sessionId: 'session', expiresAt: Date.now() + 1000 };
} }));
import { LocalStorage, S3Storage, ownedKey, validateUpload, uploadLimit } from '../../apps/api/src/modules/upload/storage';
import { uploadRouter } from '../../apps/api/src/modules/upload/upload.route';
import { S3Client } from '@aws-sdk/client-s3';
const folders: string[] = [];
afterEach(async () => {
  for (const folder of folders.splice(0)) await fs.rm(folder, { recursive: true, force: true });
  for (const key of ['profile', 'image', 'message', 'delivery', 'kyc'] as const) {
    permissions[key].mockReset().mockResolvedValue(null);
  }
  permissions.uploads.clear();
});
const png = Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]);

describe('Private upload storage and route controls', () => {
  it('rejects traversal, mismatched MIME, SVG, and oversized data', () => {
    expect(() => ownedKey('../other', 'file')).toThrow();
    expect(() => validateUpload(png, 'image/jpeg')).toThrow();
    expect(() => validateUpload(Buffer.from('<svg/>'), 'image/svg+xml')).toThrow();
    expect(() => validateUpload(Buffer.alloc(uploadLimit + 1), 'image/png')).toThrow();
  });
  it('persists locally across adapter instances and prevents another user from downloading', async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-upload-test-')); folders.push(folder);
    const storage = new LocalStorage(folder);
    const app = express(); app.use('/uploads', uploadRouter(storage));
    app.use((error: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => { res.status(error.status || 500).json({ success: false }); });
    expect((await request(app).post('/uploads').set('Content-Type', 'image/png').send(png)).status).toBe(401);
    const uploaded = await request(app).post('/uploads').set('Authorization', 'Bearer owner').set('Content-Type', 'image/png').send(png);
    expect(uploaded.status).toBe(201);
    const file = uploaded.body.data.id as string;
    expect(uploaded.body.data.reference).toBe(`upload:owner/${file}`);
    const restored = await new LocalStorage(folder).read(ownedKey('owner', file));
    expect(restored.kind).toBe('buffer');
    const download = await request(app).get(`/uploads/${file}`).set('Authorization', 'Bearer owner');
    expect(download.status).toBe(200); expect(download.headers['content-disposition']).toContain('attachment');
    expect((await request(app).get(`/uploads/${file}`).set('Authorization', 'Bearer another')).status).toBe(404);
  });
  it('uses private S3 object keys without contacting the provider', async () => {
    const client = new S3Client({ region: 'test-region', credentials: { accessKeyId: 'test-only', secretAccessKey: 'test-only' } });
    const send = vi.fn().mockResolvedValue({ $metadata: {} });
    (client as unknown as { send: typeof send }).send = send;
    await new S3Storage(client, 'test-bucket').put('owner/key.png', png, 'image/png');
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0]![0].input).toMatchObject({ Bucket: 'test-bucket', Key: 'owner/key.png', ContentDisposition: 'attachment' });
    client.destroy();
  });
  it('shares an attachment only with a persisted conversation or order participant', async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-upload-sharing-')); folders.push(folder);
    const app = express(); app.use('/uploads', uploadRouter(new LocalStorage(folder)));
    app.use((error: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status || 500).json({ success: false }));
    const uploaded = await request(app).post('/uploads').set('Authorization', 'Bearer owner').set('Content-Type', 'image/png').send(png);
    const file = uploaded.body.data.id as string;
    const sharedPath = `/uploads/shared/owner/${file}`;
    expect((await request(app).get(sharedPath)).status).toBe(401);
    expect((await request(app).get(sharedPath).set('Authorization', 'Bearer another')).status).toBe(404);
    permissions.message.mockResolvedValue({ id: 'persisted-message' });
    const shared = await request(app).get(sharedPath).set('Authorization', 'Bearer another');
    expect(shared.status).toBe(200); expect(shared.headers['content-disposition']).toContain('attachment');
    expect(permissions.message.mock.calls.at(-1)![0].where).toEqual({ attachmentUrl: `upload:owner/${file}`, conversation: { OR: [{ participant1Id: 'another' }, { participant2Id: 'another' }] } });
    permissions.message.mockResolvedValue(null); permissions.delivery.mockResolvedValue({ id: 'persisted-delivery' });
    expect((await request(app).get(sharedPath).set('Authorization', 'Bearer another')).status).toBe(200);
    expect(permissions.delivery.mock.calls.at(-1)![0].where.order.OR).toEqual([{ buyerId: 'another' }, { seller: { userId: 'another' } }]);
  });
  it('publishes only referenced raster images and keeps unreferenced uploads private', async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-upload-public-')); folders.push(folder);
    const app = express(); app.use('/uploads', uploadRouter(new LocalStorage(folder)));
    app.use((error: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status || 500).json({ success: false }));
    const uploaded = await request(app).post('/uploads').set('Authorization', 'Bearer owner').set('Content-Type', 'image/png').send(png);
    const publicPath = `/uploads/public/owner/${uploaded.body.data.id}`;
    expect((await request(app).get(publicPath)).status).toBe(404);
    permissions.image.mockResolvedValue({ id: 'published-service-image' });
    const image = await request(app).get(publicPath); expect(image.status).toBe(200);
    expect(image.headers['content-type']).toContain('image/png'); expect(image.headers['cross-origin-resource-policy']).toBe('cross-origin');
    expect(permissions.image.mock.calls.at(-1)![0].where.service).toEqual({ status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } } });
  });
  it('blocks owner, shared, and public delivery for files linked to non-verified KYC submissions', async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-upload-kyc-quarantine-')); folders.push(folder);
    const app = express(); app.use('/uploads', uploadRouter(new LocalStorage(folder)));
    app.use((error: { status?: number; code?: string; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status || 500).json({ success: false, error: { code: error.code, message: error.message } }));
    const uploaded = await request(app).post('/uploads').set('Authorization', 'Bearer owner').set('Content-Type', 'image/png').send(png);
    const file = uploaded.body.data.id as string;

    permissions.kyc.mockResolvedValue({ id: 'kyc-1', sellerProfileId: 'sp-1', status: 'PENDING', scanStatus: 'QUARANTINED' });
    permissions.image.mockResolvedValue({ id: 'published-service-image' });

    const ownerDirect = await request(app).get(`/uploads/${file}`).set('Authorization', 'Bearer owner');
    expect(ownerDirect.status).toBe(423);
    expect(ownerDirect.body.error.code).toBe('KYC_DOCUMENT_QUARANTINED');

    const sharedAttempt = await request(app).get(`/uploads/shared/owner/${file}`).set('Authorization', 'Bearer owner');
    expect(sharedAttempt.status).toBe(404);

    const publicAttempt = await request(app).get(`/uploads/public/owner/${file}`);
    expect(publicAttempt.status).toBe(404);
  });
  it('blocks direct, shared, and public delivery for KYC-purpose uploads before submitKyc and for replaced/unknown files', async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-upload-purpose-kyc-')); folders.push(folder);
    const app = express(); app.use('/uploads', uploadRouter(new LocalStorage(folder)));
    app.use((error: { status?: number; code?: string; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status || 500).json({ success: false, error: { code: error.code, message: error.message } }));

    // Upload flagged purpose=kyc BEFORE any KYC record row is created: still fails closed across all routes
    const uploadedKyc = await request(app).post('/uploads?purpose=kyc').set('Authorization', 'Bearer owner').set('Content-Type', 'image/png').send(png);
    expect(uploadedKyc.status).toBe(201);
    expect(uploadedKyc.body.data.purpose).toBe('KYC');
    expect(uploadedKyc.body.data.scanStatus).toBe('QUARANTINED');
    const kycFile = uploadedKyc.body.data.id as string;

    permissions.image.mockResolvedValue({ id: 'published-service-image' });
    expect((await request(app).get(`/uploads/${kycFile}`).set('Authorization', 'Bearer owner')).status).toBe(423);
    expect((await request(app).get(`/uploads/shared/owner/${kycFile}`).set('Authorization', 'Bearer owner')).status).toBe(404);
    expect((await request(app).get(`/uploads/public/owner/${kycFile}`)).status).toBe(404);

    // Unregistered file without UploadObject fails closed
    expect((await request(app).get('/uploads/11111111-1111-4111-8111-111111111111.png').set('Authorization', 'Bearer owner')).status).toBe(404);

    // Replaced KYC object marked INFECTED stays permanently blocked even without linked active KYC
    const meta = permissions.uploads.get(uploadedKyc.body.data.reference as string)!;
    meta.lifecycleStatus = 'REPLACED';
    meta.scanStatus = 'INFECTED';
    const infectedDirect = await request(app).get(`/uploads/${kycFile}`).set('Authorization', 'Bearer owner');
    expect(infectedDirect.status).toBe(423);
    expect(infectedDirect.body.error.code).toBe('KYC_DOCUMENT_INFECTED');

    // Abandoned KYC upload transitioned to ORPHANED is blocked across all download routes even if non-infected
    meta.lifecycleStatus = 'ORPHANED';
    meta.scanStatus = 'QUARANTINED';
    expect((await request(app).get(`/uploads/${kycFile}`).set('Authorization', 'Bearer owner')).status).toBe(404);
    expect((await request(app).get(`/uploads/kyc/owner/${kycFile}`).set('Authorization', 'Bearer owner')).status).toBe(404);
    expect((await request(app).get(`/uploads/shared/owner/${kycFile}`).set('Authorization', 'Bearer owner')).status).toBe(404);
    expect((await request(app).get(`/uploads/public/owner/${kycFile}`)).status).toBe(404);
  });

  it('supports legacy pre-canonicalized URLs in existing DB rows without permitting cross-owner hijacking', async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-upload-legacy-')); folders.push(folder);
    const app = express(); app.use('/uploads', uploadRouter(new LocalStorage(folder)));
    app.use((error: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status || 500).json({ success: false }));

    const uploaded = await request(app).post('/uploads').set('Authorization', 'Bearer owner').set('Content-Type', 'image/png').send(png);
    const file = uploaded.body.data.id as string;

    // Reset spy defaults for isolated legacy fallback assertions
    permissions.profile.mockResolvedValue(null);
    permissions.image.mockResolvedValue(null);
    permissions.message.mockResolvedValue(null);
    permissions.delivery.mockResolvedValue(null);
    permissions.kyc.mockResolvedValue(null);

    // 1. Legacy persisted service image URL for owner resolves cleanly on /public
    permissions.imageMany.mockResolvedValueOnce([
      {
        id: 'legacy-img-other',
        url: `/api/v1/uploads/${file}`,
        service: { seller: { userId: 'another' } },
      },
    ]);
    expect((await request(app).get(`/uploads/public/owner/${file}`)).status).toBe(404);

    permissions.imageMany.mockResolvedValueOnce([
      {
        id: 'legacy-img-owner',
        url: `https://api.tascora.dev/api/v1/uploads/public/owner/${file}?v=1`,
        service: { seller: { userId: 'owner' } },
      },
    ]);
    expect((await request(app).get(`/uploads/public/owner/${file}`)).status).toBe(200);

    // 2. Legacy persisted message attachment URL resolves cleanly on /shared for conversation participant
    permissions.messageMany.mockResolvedValueOnce([
      {
        id: 'legacy-msg-owner',
        attachmentUrl: `https://cdn.tascora.dev/api/v1/uploads/shared/owner/${file}#frag`,
      },
    ]);
    expect((await request(app).get(`/uploads/shared/owner/${file}`).set('Authorization', 'Bearer another')).status).toBe(200);
  });
});

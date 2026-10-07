import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import express from 'express';
import request from 'supertest';
const permissions = vi.hoisted(() => ({ profile: vi.fn().mockResolvedValue(null), image: vi.fn().mockResolvedValue(null), message: vi.fn().mockResolvedValue(null), delivery: vi.fn().mockResolvedValue(null) }));
vi.mock('../../apps/api/src/lib/prisma', () => ({ prisma: { user: { findFirst: permissions.profile }, serviceImage: { findFirst: permissions.image }, message: { findFirst: permissions.message }, orderDelivery: { findFirst: permissions.delivery } } }));

vi.mock('../../apps/api/src/modules/auth/token', () => ({ authenticateAccess: async (token: string) => {
  if (!['owner', 'another'].includes(token)) throw new Error('Unauthorized');
  return { userId: token, role: 'BUYER', sessionId: 'session', expiresAt: Date.now() + 1000 };
} }));
import { LocalStorage, S3Storage, ownedKey, validateUpload, uploadLimit } from '../../apps/api/src/modules/upload/storage';
import { uploadRouter } from '../../apps/api/src/modules/upload/upload.route';
import { S3Client } from '@aws-sdk/client-s3';
const folders: string[] = [];
afterEach(async () => { for (const folder of folders.splice(0)) await fs.rm(folder, { recursive: true, force: true }); for (const mock of Object.values(permissions)) mock.mockReset().mockResolvedValue(null); });
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
    const send = vi.spyOn(client, 'send').mockResolvedValue({ $metadata: {} });
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
});

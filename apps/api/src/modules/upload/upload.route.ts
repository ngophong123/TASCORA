import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth';
import { createStorage, ownedKey, uploadLimit, uploadTypes, validateUpload } from './storage';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import type { Response } from 'express';

export function uploadRouter(storage = createStorage()) {
  const router = express.Router();
  const sendFile = async (owner: string, file: string, res: Response, publicImage = false) => {
    const result = await storage.read(ownedKey(owner, file));
    res.setHeader('Cache-Control', 'private, no-store');
    if (publicImage) res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (result.kind === 'redirect') { if (publicImage) res.redirect(result.url); else res.json({ success: true, data: { downloadUrl: result.url, expiresIn: 60 } }); return; }
    res.setHeader('Content-Type', publicImage ? ({ png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }[file.split('.').pop()!] || 'application/octet-stream') : 'application/octet-stream');
    res.setHeader('Content-Disposition', `${publicImage ? 'inline' : 'attachment'}; filename="${file}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.send(result.body);
  };
  router.get('/public/:owner/:file', async (req, res, next) => {
    try {
      const { owner, file } = req.params; ownedKey(owner, file);
      if (!/\.(png|jpg|webp)$/.test(file)) throw new HttpError(404, 'Image not found');
      const reference = `upload:${owner}/${file}`;
      const [profile, service] = await Promise.all([
        prisma.user.findFirst({ where: { id: owner, status: 'ACTIVE', OR: [{ buyerProfile: { avatar: reference } }, { sellerProfile: { avatar: reference, status: 'APPROVED' } }] }, select: { id: true } }),
        prisma.serviceImage.findFirst({ where: { url: reference, service: { status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } } } }, select: { id: true } }),
      ]);
      if (!profile && !service) throw new HttpError(404, 'Image not found');
      await sendFile(owner, file, res, true);
    } catch (error) { next(error); }
  });
  router.use(requireAuth);
  router.get('/shared/:owner/:file', async (req: AuthRequest, res, next) => {
    try {
      const { owner, file } = req.params; ownedKey(owner!, file!);
      if (owner !== req.user!.userId) {
        const reference = `upload:${owner}/${file}`;
        const message = await prisma.message.findFirst({ where: { attachmentUrl: reference, conversation: { OR: [{ participant1Id: req.user!.userId }, { participant2Id: req.user!.userId }] } }, select: { id: true } });
        const delivery = await prisma.orderDelivery.findFirst({ where: { files: { has: reference }, order: { OR: [{ buyerId: req.user!.userId }, { seller: { userId: req.user!.userId } }] } }, select: { id: true } });
        if (!message && !delivery) throw new HttpError(404, 'File not found');
      }
      await sendFile(owner!, file!, res);
    } catch (error) { next(error); }
  });
  router.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, keyGenerator: req => (req as AuthRequest).user!.userId, standardHeaders: 'draft-7', legacyHeaders: false }));
  router.post('/', express.raw({ type: () => true, limit: uploadLimit }), async (req: AuthRequest, res, next) => {
    try {
      const type = validateUpload(req.body, req.headers['content-type']?.split(';')[0] || '');
      const file = `${crypto.randomUUID()}.${uploadTypes[type]}`;
      const key = ownedKey(req.user!.userId, file);
      await storage.put(key, req.body, type);
      res.status(201).json({ success: true, data: { id: file, reference: `upload:${req.user!.userId}/${file}`, downloadPath: `/api/v1/uploads/${file}` } });
    } catch (error) { next(error); }
  });
  router.get('/:file', async (req: AuthRequest, res, next) => {
    try {
      const result = await storage.read(ownedKey(req.user!.userId, req.params.file!));
      res.setHeader('Cache-Control', 'private, no-store');
      if (result.kind === 'redirect') { res.json({ success: true, data: { downloadUrl: result.url, expiresIn: 60 } }); return; }
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${req.params.file}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(result.body);
    } catch (error) { next(error); }
  });
  return router;
}

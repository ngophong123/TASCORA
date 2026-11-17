import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth';
import { createStorage, ownedKey, uploadLimit, uploadTypes, validateUpload } from './storage';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import type { Response } from 'express';
import { AuditService, resolveCorrelationId } from '../audit/audit.service';
import { assertDocumentSafeForDelivery } from '../kyc/kyc.state-machine';
import { canonicalizeStoredUploadCandidate } from './references';

const NON_DELIVERABLE_GENERAL_SCAN_STATUSES = new Set([
  'QUARANTINED',
  'PENDING_SCAN',
  'SCANNING',
  'SCAN_FAILED',
  'SCAN_UNAVAILABLE',
  'INFECTED',
]);

function resolveRequestedUploadPurpose(req: AuthRequest): 'GENERAL' | 'KYC' {
  const raw =
    (typeof req.query.purpose === 'string' ? req.query.purpose : undefined) ??
    (typeof req.headers['x-upload-purpose'] === 'string' ? req.headers['x-upload-purpose'] : undefined);
  if (!raw || raw.trim() === '') return 'GENERAL';
  const normalized = raw.trim().toUpperCase();
  if (normalized === 'GENERAL' || normalized === 'KYC') return normalized;
  throw new HttpError(400, 'Invalid upload purpose; expected general or kyc', 'INVALID_UPLOAD_PURPOSE');
}

export function uploadRouter(storage = createStorage()) {
  const router = express.Router();

  const findLinkedKyc = (reference: string, owner?: string) =>
    prisma.identityVerification.findFirst({
      where: {
        ...(owner ? { sellerProfile: { userId: owner } } : {}),
        OR: [
          { documentUrl: reference },
          { documentBackUrl: reference },
          { selfieUrl: reference },
        ],
      },
      select: { id: true, sellerProfileId: true, status: true, scanStatus: true },
    });

  const findUploadObject = async (reference: string) => {
    const record = prisma as unknown as Record<string, unknown>;
    if (!record.uploadObject || typeof prisma.uploadObject.findUnique !== 'function') {
      return null;
    }
    return prisma.uploadObject.findUnique({
      where: { reference },
      select: {
        id: true,
        objectKey: true,
        reference: true,
        ownerId: true,
        purpose: true,
        lifecycleStatus: true,
        scanStatus: true,
        kycVerificationId: true,
      },
    });
  };

  const hasUploadObjectModel = () => {
    const record = prisma as unknown as Record<string, unknown>;
    return Boolean(record.uploadObject && typeof prisma.uploadObject.findUnique === 'function');
  };

  const deliverReadResult = (
    file: string,
    result: Awaited<ReturnType<typeof storage.read>>,
    res: Response,
    publicImage = false
  ) => {
    res.setHeader('Cache-Control', 'private, no-store');
    if (publicImage) res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    else res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    if (result.kind === 'redirect') {
      if (publicImage) res.redirect(result.url);
      else res.json({ success: true, data: { downloadUrl: result.url, expiresIn: 60 } });
      return;
    }
    res.setHeader(
      'Content-Type',
      publicImage
        ? ({ png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }[file.split('.').pop()!] || 'application/octet-stream')
        : 'application/octet-stream'
    );
    res.setHeader('Content-Disposition', `${publicImage ? 'inline' : 'attachment'}; filename="${file}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(result.body);
  };

  const sendFile = async (owner: string, file: string, res: Response, publicImage = false) => {
    const result = await storage.read(ownedKey(owner, file));
    deliverReadResult(file, result, res, publicImage);
  };

  router.get('/public/:owner/:file', async (req, res, next) => {
    try {
      const { owner, file } = req.params;
      ownedKey(owner, file);
      if (!/\.(png|jpg|webp)$/.test(file)) throw new HttpError(404, 'Image not found');
      const reference = `upload:${owner}/${file}`;
      const [initialProfile, initialService, linkedKyc, uploadMeta] = await Promise.all([
        prisma.user.findFirst({
          where: {
            id: owner,
            status: 'ACTIVE',
            OR: [
              { buyerProfile: { avatar: reference } },
              { sellerProfile: { avatar: reference, status: 'APPROVED' } },
            ],
          },
          select: { id: true },
        }),
        prisma.serviceImage.findFirst({
          where: {
            url: reference,
            service: { status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } } },
          },
          select: { id: true },
        }),
        findLinkedKyc(reference, owner),
        findUploadObject(reference),
      ]);
      let profile = initialProfile;
      let service = initialService;
      if (!profile && !service) {
        if (typeof prisma.user.findUnique === 'function') {
          const legacyUser = await prisma.user.findUnique({
            where: { id: owner },
            select: {
              id: true,
              status: true,
              buyerProfile: { select: { avatar: true } },
              sellerProfile: { select: { status: true, avatar: true } },
            },
          });
          if (
            legacyUser?.status === 'ACTIVE' &&
            (canonicalizeStoredUploadCandidate(legacyUser.buyerProfile?.avatar, owner) === reference ||
              (legacyUser.sellerProfile?.status === 'APPROVED' &&
                canonicalizeStoredUploadCandidate(legacyUser.sellerProfile?.avatar, owner) === reference))
          ) {
            profile = { id: legacyUser.id };
          }
        }
        if (!profile && typeof prisma.serviceImage.findMany === 'function') {
          const legacyServiceImages = await prisma.serviceImage.findMany({
            where: {
              url: { contains: file },
              service: { status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } } },
            },
            select: {
              id: true,
              url: true,
              service: { select: { seller: { select: { userId: true } } } },
            },
            take: 20,
          });
          const matched = legacyServiceImages.find(
            img =>
              img.service.seller.userId === owner &&
              canonicalizeStoredUploadCandidate(img.url, owner) === reference
          );
          if (matched) {
            service = { id: matched.id };
          }
        }
      }
      if ((!profile && !service) || linkedKyc) throw new HttpError(404, 'Image not found');
      if (hasUploadObjectModel()) {
        if (
          !uploadMeta ||
          uploadMeta.ownerId !== owner ||
          uploadMeta.purpose !== 'GENERAL' ||
          uploadMeta.lifecycleStatus !== 'ACTIVE' ||
          NON_DELIVERABLE_GENERAL_SCAN_STATUSES.has(uploadMeta.scanStatus)
        ) {
          throw new HttpError(404, 'Image not found');
        }
      }
      await sendFile(owner, file, res, true);
    } catch (error) {
      next(error);
    }
  });

  router.use(requireAuth);

  router.get('/shared/:owner/:file', async (req: AuthRequest, res, next) => {
    try {
      const { owner, file } = req.params;
      ownedKey(owner!, file!);
      const reference = `upload:${owner}/${file}`;
      const [linkedKyc, uploadMeta] = await Promise.all([
        findLinkedKyc(reference, owner),
        findUploadObject(reference),
      ]);
      if (linkedKyc) throw new HttpError(404, 'File not found');
      if (hasUploadObjectModel()) {
        if (
          !uploadMeta ||
          uploadMeta.ownerId !== owner ||
          uploadMeta.purpose === 'KYC' ||
          uploadMeta.lifecycleStatus !== 'ACTIVE' ||
          NON_DELIVERABLE_GENERAL_SCAN_STATUSES.has(uploadMeta.scanStatus)
        ) {
          throw new HttpError(404, 'File not found');
        }
      }
      if (owner !== req.user!.userId) {
        let message = await prisma.message.findFirst({
          where: {
            attachmentUrl: reference,
            conversation: { OR: [{ participant1Id: req.user!.userId }, { participant2Id: req.user!.userId }] },
          },
          select: { id: true },
        });
        let delivery = await prisma.orderDelivery.findFirst({
          where: {
            files: { has: reference },
            order: { OR: [{ buyerId: req.user!.userId }, { seller: { userId: req.user!.userId } }] },
          },
          select: { id: true },
        });
        if (!message && typeof prisma.message.findMany === 'function') {
          const legacyMessages = await prisma.message.findMany({
            where: {
              senderId: owner!,
              attachmentUrl: { contains: file! },
              conversation: { OR: [{ participant1Id: req.user!.userId }, { participant2Id: req.user!.userId }] },
            },
            select: { id: true, attachmentUrl: true },
            take: 20,
          });
          const matchedMsg = legacyMessages.find(
            msg => msg.attachmentUrl && canonicalizeStoredUploadCandidate(msg.attachmentUrl, owner!) === reference
          );
          if (matchedMsg) {
            message = { id: matchedMsg.id };
          }
        }
        if (!message && !delivery && typeof prisma.orderDelivery.findMany === 'function') {
          const legacyDeliveries = await prisma.orderDelivery.findMany({
            where: {
              order: {
                AND: [
                  { seller: { userId: owner! } },
                  { OR: [{ buyerId: req.user!.userId }, { seller: { userId: req.user!.userId } }] },
                ],
              },
            },
            select: { id: true, files: true },
            take: 50,
          });
          const matchedDelivery = legacyDeliveries.find(d =>
            d.files.some(f => canonicalizeStoredUploadCandidate(f, owner!) === reference)
          );
          if (matchedDelivery) {
            delivery = { id: matchedDelivery.id };
          }
        }
        if (!message && !delivery) throw new HttpError(404, 'File not found');
      }
      await sendFile(owner!, file!, res);
    } catch (error) {
      next(error);
    }
  });

  router.get('/kyc/:owner/:file', async (req: AuthRequest, res, next) => {
    try {
      const { owner, file } = req.params;
      const key = ownedKey(owner!, file!);
      const reference = `upload:${owner}/${file}`;
      const [verification, uploadMeta] = await Promise.all([
        findLinkedKyc(reference, owner!),
        findUploadObject(reference),
      ]);

      let activeAdminId: string | null = null;
      if (owner !== req.user!.userId) {
        const actor = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          select: { id: true, role: true, status: true },
        });
        if (!actor || actor.role !== 'ADMIN' || actor.status !== 'ACTIVE') {
          throw new HttpError(404, 'File not found');
        }
        activeAdminId = actor.id;
      }

      if (uploadMeta?.scanStatus === 'INFECTED') {
        assertDocumentSafeForDelivery('INFECTED');
      }
      if (!verification) throw new HttpError(404, 'File not found');
      if (uploadMeta && uploadMeta.lifecycleStatus !== 'ACTIVE') {
        if (verification.scanStatus === 'INFECTED') assertDocumentSafeForDelivery('INFECTED');
        throw new HttpError(404, 'File not found');
      }

      // Fail closed: block raw bytes and S3 presigned URLs until scanner promotes to VERIFIED_SAFE.
      assertDocumentSafeForDelivery(verification.scanStatus);
      if (uploadMeta) {
        assertDocumentSafeForDelivery(uploadMeta.scanStatus);
      }

      const readResult = await storage.read(key);
      if (activeAdminId) {
        await AuditService.record(prisma, {
          adminId: activeAdminId,
          action: 'KYC_DOCUMENT_VIEWED',
          targetEntity: 'IdentityVerification',
          targetId: verification.id,
          previousState: verification.status,
          newState: verification.status,
          metadata: {
            via: 'upload-kyc-route',
            sellerProfileId: verification.sellerProfileId,
            file,
            scanStatus: verification.scanStatus,
          },
          context: {
            correlationId: resolveCorrelationId(
              req.headers['x-correlation-id'] || req.headers['x-request-id']
            ),
            ipAddress: req.ip || '',
            userAgent: req.headers['user-agent'] || '',
          },
        });
      }

      res.setHeader('X-TASCORA-Scan-Status', verification.scanStatus);
      deliverReadResult(file!, readResult, res);
    } catch (error) {
      next(error);
    }
  });

  router.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      keyGenerator: req => (req as AuthRequest).user!.userId,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    })
  );

  router.post('/', express.raw({ type: () => true, limit: uploadLimit }), async (req: AuthRequest, res, next) => {
    try {
      const purpose = resolveRequestedUploadPurpose(req);
      const type = validateUpload(req.body, req.headers['content-type']?.split(';')[0] || '');
      const file = `${crypto.randomUUID()}.${uploadTypes[type]}`;
      const key = ownedKey(req.user!.userId, file);
      const reference = `upload:${req.user!.userId}/${file}`;
      const initialScanStatus = purpose === 'KYC' ? 'QUARANTINED' : 'NOT_REQUIRED';

      await storage.put(key, req.body, type);
      try {
        const record = prisma as unknown as Record<string, unknown>;
        if (record.uploadObject && typeof prisma.uploadObject.create === 'function') {
          await prisma.uploadObject.create({
            data: {
              objectKey: key,
              reference,
              ownerId: req.user!.userId,
              mimeType: type,
              byteSize: req.body.length,
              purpose,
              lifecycleStatus: 'ACTIVE',
              scanStatus: initialScanStatus,
            },
          });
        }
      } catch (dbErr) {
        if (typeof storage.delete === 'function') {
          await storage.delete(key).catch(() => undefined);
        }
        throw dbErr;
      }

      res.status(201).json({
        success: true,
        data: {
          id: file,
          reference,
          purpose,
          scanStatus: initialScanStatus,
          downloadPath:
            purpose === 'KYC'
              ? `/api/v1/uploads/kyc/${req.user!.userId}/${file}`
              : `/api/v1/uploads/${file}`,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:file', async (req: AuthRequest, res, next) => {
    try {
      const key = ownedKey(req.user!.userId, req.params.file!);
      const reference = `upload:${req.user!.userId}/${req.params.file!}`;
      const [linkedKyc, uploadMeta] = await Promise.all([
        findLinkedKyc(reference, req.user!.userId),
        findUploadObject(reference),
      ]);

      if (uploadMeta) {
        if (uploadMeta.ownerId !== req.user!.userId) {
          throw new HttpError(404, 'File not found');
        }
        if (uploadMeta.scanStatus === 'INFECTED') {
          assertDocumentSafeForDelivery('INFECTED');
        }
        if (uploadMeta.lifecycleStatus !== 'ACTIVE') {
          throw new HttpError(404, 'File not found');
        }
        if (uploadMeta.purpose === 'KYC' || linkedKyc) {
          if (linkedKyc) {
            assertDocumentSafeForDelivery(linkedKyc.scanStatus);
          }
          assertDocumentSafeForDelivery(uploadMeta.scanStatus);
          throw new HttpError(
            403,
            'Identity verification documents must be downloaded via the audited KYC endpoint',
            'KYC_ENDPOINT_REQUIRED'
          );
        }
      } else if (linkedKyc) {
        assertDocumentSafeForDelivery(linkedKyc.scanStatus);
        throw new HttpError(
          403,
          'Identity verification documents must be downloaded via the audited KYC endpoint',
          'KYC_ENDPOINT_REQUIRED'
        );
      } else if (hasUploadObjectModel()) {
        // Fail closed for unregistered or orphaned files with no UploadObject record.
        throw new HttpError(404, 'File not found');
      }

      const result = await storage.read(key);
      deliverReadResult(req.params.file!, result, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

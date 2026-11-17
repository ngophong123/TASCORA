import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { AuditService, resolveCorrelationId, type AuditContext } from '../audit/audit.service';
import { KycService, type KycDocumentSlot } from './kyc.service';
import { createStorage, type Storage } from '../upload/storage';

function buildAuditContext(req: AuthRequest): AuditContext {
  return {
    correlationId: resolveCorrelationId(req.headers['x-correlation-id'] || req.headers['x-request-id']),
    ipAddress: req.ip || '',
    userAgent: req.headers['user-agent'] || '',
  };
}

export const getMyKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.getMyKyc(req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const submitMyKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.submitKyc(req.user!.userId, req.body, buildAuditContext(req));
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateMyKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.updatePendingKyc(req.user!.userId, req.body, buildAuditContext(req));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMyPayoutEligibility = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.getSellerPayoutEligibility(req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminKycQueue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    await KycService.requireActiveAdmin(req.user!.userId);
    const data = await KycService.getAdminQueue({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminKycDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.getAdminKycDetail(
      req.params.id!,
      req.user!.userId,
      buildAuditContext(req)
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export function createAdminKycDocumentHandler(storage: Storage = createStorage()) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");

      const result = await KycService.accessAdminKycDocument(
        req.params.id!,
        req.params.slot as KycDocumentSlot,
        req.user!.userId,
        storage,
        buildAuditContext(req)
      );

      res.setHeader('X-TASCORA-Scan-Status', result.scanStatus);

      if (result.readResult.kind === 'redirect') {
        res.status(200).json({
          success: true,
          data: {
            downloadUrl: result.readResult.url,
            expiresIn: 60,
            filename: result.filename,
            scanStatus: result.scanStatus,
          },
        });
        return;
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.readResult.body);
    } catch (error) {
      next(error);
    }
  };
}

export const markAdminKycUnderReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.reviewKycDecision(
      req.params.id!,
      req.user!.userId,
      'UNDER_REVIEW',
      { expectedVersion: req.body?.expectedVersion },
      buildAuditContext(req)
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const approveAdminKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.reviewKycDecision(
      req.params.id!,
      req.user!.userId,
      'APPROVED',
      req.body || {},
      buildAuditContext(req)
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const rejectAdminKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.reviewKycDecision(
      req.params.id!,
      req.user!.userId,
      'REJECTED',
      req.body,
      buildAuditContext(req)
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const requestAdminKycResubmission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    const data = await KycService.reviewKycDecision(
      req.params.id!,
      req.user!.userId,
      'NEEDS_RESUBMISSION',
      req.body,
      buildAuditContext(req)
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const listAdminAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    await KycService.requireActiveAdmin(req.user!.userId);
    const data = await AuditService.listLogs({
      action: typeof req.query.action === 'string' ? req.query.action : undefined,
      targetEntity: typeof req.query.targetEntity === 'string' ? req.query.targetEntity : undefined,
      targetId: typeof req.query.targetId === 'string' ? req.query.targetId : undefined,
      adminId: typeof req.query.adminId === 'string' ? req.query.adminId : undefined,
      correlationId: typeof req.query.correlationId === 'string' ? req.query.correlationId : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

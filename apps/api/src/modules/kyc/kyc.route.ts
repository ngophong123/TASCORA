import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { createStorage, type Storage } from '../upload/storage';
import {
  approveAdminKyc,
  createAdminKycDocumentHandler,
  getAdminKycDetail,
  getAdminKycQueue,
  getMyKyc,
  getMyPayoutEligibility,
  listAdminAuditLogs,
  markAdminKycUnderReview,
  rejectAdminKyc,
  requestAdminKycResubmission,
  submitMyKyc,
  updateMyKyc,
} from './kyc.controller';
import {
  adminAuditLogQuerySchema,
  adminKycApproveSchema,
  adminKycDocumentParamsSchema,
  adminKycIdParamsSchema,
  adminKycQueueQuerySchema,
  adminKycReasonSchema,
  adminKycUnderReviewSchema,
  submitKycSchema,
  updateKycSchema,
} from './kyc.schema';

export function createSellerKycRouter(): Router {
  const router = Router();
  router.get('/seller/kyc', getMyKyc);
  router.post('/seller/kyc', validate(submitKycSchema), submitMyKyc);
  router.put('/seller/kyc', validate(updateKycSchema), updateMyKyc);
  router.get('/seller/kyc/payout-eligibility', getMyPayoutEligibility);
  return router;
}

export function createAdminKycRouter(storage: Storage = createStorage()): Router {
  const router = Router();
  router.get('/kyc', validate(adminKycQueueQuerySchema), getAdminKycQueue);
  router.get('/kyc/:id', validate(adminKycIdParamsSchema), getAdminKycDetail);
  router.get(
    '/kyc/:id/documents/:slot',
    validate(adminKycDocumentParamsSchema),
    createAdminKycDocumentHandler(storage)
  );
  router.post('/kyc/:id/under-review', validate(adminKycUnderReviewSchema), markAdminKycUnderReview);
  router.post('/kyc/:id/approve', validate(adminKycApproveSchema), approveAdminKyc);
  router.post('/kyc/:id/reject', validate(adminKycReasonSchema), rejectAdminKyc);
  router.post(
    '/kyc/:id/request-resubmission',
    validate(adminKycReasonSchema),
    requestAdminKycResubmission
  );
  router.get('/audit-logs', validate(adminAuditLogQuerySchema), listAdminAuditLogs);
  return router;
}

import { z } from 'zod';
import { KYC_DOCUMENT_TYPES } from './kyc.state-machine';

const uploadRefRegex = /^upload:[a-zA-Z0-9_-]{1,128}\/[0-9a-f-]{36}\.(png|jpg|webp|pdf)$/;
const selfieRefRegex = /^upload:[a-zA-Z0-9_-]{1,128}\/[0-9a-f-]{36}\.(png|jpg|webp)$/;

function isValidAdultBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  const now = new Date();
  const minDob = new Date(Date.UTC(now.getUTCFullYear() - 120, now.getUTCMonth(), now.getUTCDate()));
  const maxAdultDob = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()));
  return parsed >= minDob && parsed <= maxAdultDob;
}

const kycPayloadSchema = z
  .object({
    documentType: z.enum(KYC_DOCUMENT_TYPES),
    documentNumber: z
      .string()
      .trim()
      .min(4, 'Document number must be at least 4 characters')
      .max(64, 'Document number must be at most 64 characters')
      .regex(/^[A-Za-z0-9\s-]+$/, 'Document number contains invalid characters'),
    legalName: z
      .string()
      .trim()
      .min(2, 'Legal name is required')
      .max(120, 'Legal name must be at most 120 characters'),
    dateOfBirth: z
      .string()
      .trim()
      .refine(isValidAdultBirthDate, 'Valid YYYY-MM-DD birth date (18+ years old) is required'),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, 'Country must be a 2-letter ISO code'),
    documentFrontUrl: z
      .string()
      .trim()
      .regex(uploadRefRegex, 'Document front image must be a private uploaded PNG, JPEG, WebP, or PDF reference'),
    documentBackUrl: z
      .string()
      .trim()
      .regex(uploadRefRegex, 'Document back image must be a private uploaded PNG, JPEG, WebP, or PDF reference')
      .optional()
      .nullable(),
    selfieUrl: z
      .string()
      .trim()
      .regex(selfieRefRegex, 'Selfie verification image must be a private uploaded PNG, JPEG, or WebP reference')
      .optional()
      .nullable(),
  })
  .strict();

export const submitKycSchema = z.object({
  body: kycPayloadSchema,
});

export const updateKycSchema = z.object({
  body: kycPayloadSchema.partial().refine(
    data => Object.keys(data).length > 0,
    'At least one verification field must be supplied'
  ),
});

export const adminKycQueueQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(['ALL', 'PENDING', 'UNDER_REVIEW', 'NEEDS_RESUBMISSION', 'APPROVED', 'REJECTED', 'VERIFIED'])
      .optional(),
    search: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const adminKycIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/, 'Invalid verification record ID'),
  }),
});

export const adminKycUnderReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/, 'Invalid verification record ID'),
  }),
  body: z
    .object({
      expectedVersion: z.coerce.number().int().min(1, 'expectedVersion is required for optimistic locking'),
    })
    .strict(),
});

export const adminKycDocumentParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/, 'Invalid verification record ID'),
    slot: z.enum(['front', 'back', 'selfie']),
  }),
});

export const adminKycReasonSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/, 'Invalid verification record ID'),
  }),
  body: z
    .object({
      reason: z
        .string()
        .trim()
        .min(5, 'A detailed review reason (minimum 5 characters) is required')
        .max(1000),
      comments: z.string().trim().max(1000).optional(),
      expectedVersion: z.coerce.number().int().min(1, 'expectedVersion is required for optimistic locking'),
    })
    .strict(),
});

export const adminKycApproveSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/, 'Invalid verification record ID'),
  }),
  body: z
    .object({
      reason: z.string().trim().max(1000).optional(),
      comments: z.string().trim().max(1000).optional(),
      expectedVersion: z.coerce.number().int().min(1, 'expectedVersion is required for optimistic locking'),
    })
    .strict(),
});

export const adminAuditLogQuerySchema = z.object({
  query: z.object({
    action: z.string().trim().max(64).optional(),
    targetEntity: z.string().trim().max(64).optional(),
    targetId: z.string().trim().max(64).optional(),
    adminId: z.string().trim().max(64).optional(),
    correlationId: z.string().trim().max(64).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

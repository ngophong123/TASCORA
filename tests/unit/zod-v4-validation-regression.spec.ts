import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { validate } from '../../apps/api/src/middlewares/validate';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../../apps/api/src/modules/auth/auth.schema';
import {
  adminKycApproveSchema,
  adminKycQueueQuerySchema,
  submitKycSchema,
  updateKycSchema,
} from '../../apps/api/src/modules/kyc/kyc.schema';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../../apps/api/src/modules/order/order.schema';
import {
  createPackageSchema,
  createServiceSchema,
  searchServiceSchema,
} from '../../apps/api/src/modules/service/service.schema';
import { projectBriefOutputSchema } from '../../apps/api/src/modules/service/semantic-search.service';
import { reasonSchema, requestKey } from '../../apps/api/src/modules/financial/domain';

const VALID_CUID = 'clx1234567890abcdefghijkl';
const VALID_UPLOAD_REF = 'upload:user_123/12345678-1234-1234-1234-1234567890ab.png';
const VALID_RESET_TOKEN = 'a'.repeat(64);
const VALID_IDEMPOTENCY_KEY = 'idem_key_1234567890abcdef';

describe('Zod v4 schema migration & security regression coverage', () => {
  describe('Authentication payload validation', () => {
    it('accepts valid registration with optional role and rejects missing/weak fields', () => {
      const ok = registerSchema.safeParse({
        body: { email: 'buyer@example.com', password: 'Password1!' },
      });
      expect(ok.success).toBe(true);
      if (ok.success) {
        expect(ok.data.body.role).toBeUndefined();
      }

      const missingEmail = registerSchema.safeParse({ body: { password: 'Password1!' } });
      expect(missingEmail.success).toBe(false);

      const weakPassword = registerSchema.safeParse({
        body: { email: 'buyer@example.com', password: 'onlyletters' },
      });
      expect(weakPassword.success).toBe(false);

      const over72Bytes = registerSchema.safeParse({
        body: { email: 'buyer@example.com', password: `${'a'.repeat(72)}1` },
      });
      expect(over72Bytes.success).toBe(false);
    });

    it('trims forgot-password email, rejects invalid email, and enforces strict keys', () => {
      const trimmed = forgotPasswordSchema.safeParse({
        body: { email: '  user@example.com  ' },
      });
      expect(trimmed.success).toBe(true);
      if (trimmed.success) {
        expect(trimmed.data.body.email).toBe('user@example.com');
      }

      const badEmail = forgotPasswordSchema.safeParse({ body: { email: 'not-an-email' } });
      expect(badEmail.success).toBe(false);

      const extraField = forgotPasswordSchema.safeParse({
        body: { email: 'user@example.com', role: 'ADMIN' },
      });
      expect(extraField.success).toBe(false);
    });

    it('validates login and reset-password tokens strictly', () => {
      expect(
        loginSchema.safeParse({ body: { email: 'user@example.com', password: 'x' } }).success
      ).toBe(true);
      expect(
        resetPasswordSchema.safeParse({
          body: { token: VALID_RESET_TOKEN, password: 'NewPassword1!' },
        }).success
      ).toBe(true);
      expect(
        resetPasswordSchema.safeParse({
          body: { token: 'short', password: 'NewPassword1!' },
        }).success
      ).toBe(false);
      expect(
        resetPasswordSchema.safeParse({
          body: { token: VALID_RESET_TOKEN, password: 'NewPassword1!', extra: true },
        }).success
      ).toBe(false);
    });
  });

  describe('KYC transformations, nullability, refinements, coercion, and strict partial', () => {
    it('normalizes country to uppercase, accepts nullable optional refs, and validates 18+ DOB', () => {
      const parsed = submitKycSchema.safeParse({
        body: {
          documentType: 'PASSPORT',
          documentNumber: '  AB-123456  ',
          legalName: '  Jane Doe  ',
          dateOfBirth: '1995-06-15',
          country: '  us  ',
          documentFrontUrl: VALID_UPLOAD_REF,
          documentBackUrl: null,
          selfieUrl: undefined,
        },
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.body.country).toBe('US');
        expect(parsed.data.body.documentNumber).toBe('AB-123456');
        expect(parsed.data.body.documentBackUrl).toBeNull();
        expect(parsed.data.body.selfieUrl).toBeUndefined();
      }

      const minor = submitKycSchema.safeParse({
        body: {
          documentType: 'PASSPORT',
          documentNumber: 'AB-123456',
          legalName: 'Minor User',
          dateOfBirth: '2020-01-01',
          country: 'US',
          documentFrontUrl: VALID_UPLOAD_REF,
        },
      });
      expect(minor.success).toBe(false);

      const nullRequired = submitKycSchema.safeParse({
        body: {
          documentType: 'PASSPORT',
          documentNumber: null,
          legalName: 'Jane Doe',
          dateOfBirth: '1995-06-15',
          country: 'US',
          documentFrontUrl: VALID_UPLOAD_REF,
        },
      });
      expect(nullRequired.success).toBe(false);
    });

    it('rejects empty partial updates and unknown keys on updateKycSchema', () => {
      expect(updateKycSchema.safeParse({ body: {} }).success).toBe(false);
      expect(updateKycSchema.safeParse({ body: { country: 'vn' } }).success).toBe(true);
      expect(
        updateKycSchema.safeParse({ body: { country: 'vn', status: 'APPROVED' } }).success
      ).toBe(false);
    });

    it('coerces integer query and optimistic-lock version fields cleanly', () => {
      const queue = adminKycQueueQuerySchema.safeParse({
        query: { status: 'PENDING', page: '2', limit: '25' },
      });
      expect(queue.success).toBe(true);
      if (queue.success) {
        expect(queue.data.query.page).toBe(2);
        expect(queue.data.query.limit).toBe(25);
      }

      const approve = adminKycApproveSchema.safeParse({
        params: { id: 'kyc_record_12345' },
        body: { expectedVersion: '3', reason: '  Verified  ' },
      });
      expect(approve.success).toBe(true);
      if (approve.success) {
        expect(approve.data.body.expectedVersion).toBe(3);
        expect(approve.data.body.reason).toBe('Verified');
      }

      expect(
        adminKycApproveSchema.safeParse({
          params: { id: 'kyc_record_12345' },
          body: { expectedVersion: '0' },
        }).success
      ).toBe(false);
    });
  });

  describe('Defaults, coercion, refinements, and nested marketplace/payment schemas', () => {
    it('applies defaults on omitted pagination fields and coerces numeric query strings', () => {
      const defaults = searchServiceSchema.safeParse({ query: {} });
      expect(defaults.success).toBe(true);
      if (defaults.success) {
        expect(defaults.data.query.page).toBe(1);
        expect(defaults.data.query.limit).toBe(10);
      }

      const coerced = searchServiceSchema.safeParse({
        query: { minPrice: '10', maxPrice: '250', rating: '4.5', page: '3', limit: '20' },
      });
      expect(coerced.success).toBe(true);
      if (coerced.success) {
        expect(coerced.data.query.minPrice).toBe(10);
        expect(coerced.data.query.maxPrice).toBe(250);
        expect(coerced.data.query.rating).toBe(4.5);
        expect(coerced.data.query.page).toBe(3);
        expect(coerced.data.query.limit).toBe(20);
      }

      expect(searchServiceSchema.safeParse({ query: { limit: '999' } }).success).toBe(false);
    });

    it('enforces decimal-place price refinement and nested package/service/AI structures', () => {
      expect(
        createPackageSchema.safeParse({
          params: { id: VALID_CUID },
          body: {
            type: 'STANDARD',
            title: 'Standard Package',
            description: 'Full delivery',
            price: 199.99,
            deliveryDays: 5,
            revisions: 2,
            features: ['Source files'],
          },
        }).success
      ).toBe(true);

      expect(
        createPackageSchema.safeParse({
          params: { id: VALID_CUID },
          body: {
            type: 'STANDARD',
            title: 'Standard Package',
            description: 'Too many decimals',
            price: 19.999,
            deliveryDays: 5,
            revisions: 2,
            features: [],
          },
        }).success
      ).toBe(false);

      expect(
        createServiceSchema.safeParse({
          body: {
            categoryId: VALID_CUID,
            title: 'Full-Stack Next.js App',
            description: 'End-to-end TypeScript marketplace architecture and API delivery.',
          },
        }).success
      ).toBe(true);

      expect(
        projectBriefOutputSchema.safeParse({
          summary: 'Build an internationalized freelance marketplace API with ledger controls.',
          suggestedCategory: 'programming',
          deliverables: ['REST API', 'Admin dashboard'],
          requiredSkills: ['TypeScript', 'PostgreSQL'],
          estimatedComplexity: 'HIGH',
          clarifyingQuestions: ['What target SLA is expected?', 'Which locales are required?'],
          advisoryOnly: true,
          providerMode: 'local-deterministic',
        }).success
      ).toBe(true);
    });

    it('validates order, payment, idempotency key, and safe integer cent constraints', () => {
      expect(
        createOrderSchema.safeParse({
          body: {
            serviceId: VALID_CUID,
            packageId: VALID_CUID,
            idempotencyKey: VALID_IDEMPOTENCY_KEY,
          },
        }).success
      ).toBe(true);

      expect(
        createOrderSchema.safeParse({
          body: { serviceId: 'bad-id', packageId: VALID_CUID, idempotencyKey: 'short' },
        }).success
      ).toBe(false);

      expect(
        updateOrderStatusSchema.safeParse({
          params: { id: VALID_CUID },
          body: { status: 'COMPLETED', message: '  Delivered on time  ' },
        }).success
      ).toBe(true);

      expect(requestKey.safeParse(VALID_IDEMPOTENCY_KEY).success).toBe(true);
      expect(requestKey.safeParse('too-short').success).toBe(false);
      expect(reasonSchema.safeParse('  Valid reason  ').success).toBe(true);
      expect(reasonSchema.safeParse('no').success).toBe(false);

      expect(
        createPackageSchema.shape.body.shape.deliveryDays.safeParse(Number.MAX_SAFE_INTEGER + 1)
          .success
      ).toBe(false);
      expect(createPackageSchema.shape.body.shape.deliveryDays.safeParse(3.5).success).toBe(false);
    });

    it('rejects oversized constrained collections cleanly (GHSA-mrhx-c7xc-m3w5 hardening)', () => {
      const oversized = Array.from({ length: 5000 }, (_, i) => `Deliverable item ${i}`);
      const result = projectBriefOutputSchema.safeParse({
        summary: 'Build an internationalized freelance marketplace API with ledger controls.',
        suggestedCategory: 'programming',
        deliverables: oversized,
        requiredSkills: ['TypeScript', 'PostgreSQL'],
        estimatedComplexity: 'HIGH',
        clarifyingQuestions: ['What target SLA is expected?', 'Which locales are required?'],
        advisoryOnly: true,
        providerMode: 'local-deterministic',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Express validate() middleware contract under Zod v4', () => {
    it('passes validated/coerced payload to next() and returns 400 with issues on invalid input', async () => {
      const next = vi.fn();
      const status = vi.fn().mockReturnThis();
      const json = vi.fn();
      const res = { status, json } as unknown as Response;

      const validReq = {
        body: { email: '  valid@example.com  ' },
        query: {},
        params: {},
      } as Request;
      await validate(forgotPasswordSchema)(validReq, res, next);
      expect(next).toHaveBeenCalledOnce();
      expect(validReq.body).toEqual({ email: 'valid@example.com' });

      const invalidNext = vi.fn();
      const invalidReq = {
        body: { email: 'invalid', unexpected: 'field' },
        query: {},
        params: {},
      } as Request;
      await validate(forgotPasswordSchema)(invalidReq, res, invalidNext);
      expect(invalidNext).not.toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            issues: expect.any(Array),
          }),
        })
      );
    });
  });
});

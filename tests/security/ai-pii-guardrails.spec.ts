import { describe, expect, it } from 'vitest';
import {
  assertNoForbiddenAiPayload,
  sanitizeTextForAi,
} from '../../apps/api/src/modules/service/ai-finops';
import {
  evaluateTrustSafetyAdvisory,
  generateProjectBrief,
} from '../../apps/api/src/modules/service/semantic-search.service';

describe('Phase 4F AI Privacy, PII & Non-Destructive Guardrails', () => {
  it('redacts emails, Stripe keys, JWTs, SSNs, and phone/ID digit runs before AI processing', () => {
    const raw =
      'Email alice@example.com phone +1-555-867-5309 ssn 123-45-6789 key sk_test_1234567890abcd jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ.abcdefghijklmnop';
    const sanitized = sanitizeTextForAi(raw);

    expect(sanitized).not.toContain('alice@example.com');
    expect(sanitized).not.toContain('123-45-6789');
    expect(sanitized).not.toContain('sk_test_1234567890abcd');
    expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiJ9');
    expect(sanitized).toContain('[REDACTED_PII]');
  });

  it('rejects any payload object carrying forbidden KYC, password, or token fields', () => {
    for (const forbiddenField of [
      'password',
      'documentNumber',
      'documentNumberEncrypted',
      'dateOfBirth',
      'refreshToken',
      'stripeSecretKey',
    ]) {
      expect(() =>
        assertNoForbiddenAiPayload({ idea: 'Build app', [forbiddenField]: 'secret-value' })
      ).toThrow(`Forbidden sensitive field "${forbiddenField}"`);
    }
  });

  it('never leaks redacted PII into Project Brief output and never auto-enforces Trust & Safety', () => {
    const brief = generateProjectBrief({
      idea: 'Build a dashboard and email john.doe@corp.example with sk_test_9876543210abc',
    });
    expect(brief.summary).not.toContain('john.doe@corp.example');
    expect(brief.summary).not.toContain('sk_test_9876543210abc');

    const advisory = evaluateTrustSafetyAdvisory({
      title: 'Off-platform wire transfer gig',
      description: 'Pay outside on whatsapp guaranteed 100%',
      priceUsd: 99999,
    });
    expect(advisory.automatedEnforcementTaken).toBe(false);
    expect(advisory.disclaimer).toContain('Human administrator review is required');
  });
});

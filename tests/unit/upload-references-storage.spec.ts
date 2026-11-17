import { describe, expect, it, vi } from 'vitest';
import { S3Client } from '@aws-sdk/client-s3';
import {
  authorizeAndCanonicalizeNonKycUpload,
  canonicalizeStoredUploadCandidate,
  resolveCanonicalUploadRef,
} from '../../apps/api/src/modules/upload/references';
import { S3Storage } from '../../apps/api/src/modules/upload/storage';

const UUID = '11111111-1111-4111-8111-111111111111.png';

describe('Upload URL canonicalization and S3Storage idempotency (UPL-03 & S3-01)', () => {
  it('canonicalizes valid internal /api/v1/uploads references across host, scheme, query, case, and slash variants', () => {
    expect(resolveCanonicalUploadRef(undefined, 'user-1')).toBeUndefined();
    expect(resolveCanonicalUploadRef(`upload:user-1/${UUID}`, 'user-1')).toBe(`upload:user-1/${UUID}`);
    expect(resolveCanonicalUploadRef(`/api/v1/uploads/public/user-1/${UUID}`, 'user-2')).toBe(
      `upload:user-1/${UUID}`
    );
    expect(
      resolveCanonicalUploadRef(`https://cdn.tascora.dev/api/v1/uploads/shared/user-1/${UUID}?v=1#frag`, 'user-2')
    ).toBe(`upload:user-1/${UUID}`);
    expect(resolveCanonicalUploadRef(`//api.tascora.dev/api/v1/uploads/kyc/user-1/${UUID}/`, 'user-2')).toBe(
      `upload:user-1/${UUID}`
    );
    expect(resolveCanonicalUploadRef(`/API/V1/Uploads//Public/user-1/${UUID}/`, 'user-2')).toBe(
      `upload:user-1/${UUID}`
    );
    expect(resolveCanonicalUploadRef(`/api/v1/uploads/${UUID}`, 'user-1')).toBe(
      `upload:user-1/${UUID}`
    );
    expect(resolveCanonicalUploadRef(`http://127.0.0.1:4000/api/v1/uploads/${UUID}?download=1`, 'user-1')).toBe(
      `upload:user-1/${UUID}`
    );
  });

  it('rejects malformed internal upload URLs, traversal, encoded slashes, backslashes, userinfo, and double encoding', () => {
    const attackVectors = [
      `/api/v1/uploads/public/../kyc/victim/${UUID}`,
      `/api/v1/uploads/public/%2e%2e/kyc/victim/${UUID}`,
      `/api/v1/uploads/public/victim%2f${UUID}`,
      `/api/v1/uploads/%6b%79%63%2f/victim/${UUID}`,
      `/api/v1/uploads/public/victim%252f${UUID}`,
      `/api/v1/uploads/public/victim%252e/${UUID}`,
      `/api/v1/uploads\\kyc\\victim\\${UUID}`,
      `https://user:pass@tascora.dev/api/v1/uploads/public/victim/${UUID}`,
      `/api/v1/uploads/other/victim/${UUID}`,
      `/api/v1/uploads/public/victim/${UUID}/extra`,
      `/api/v1/uploads/public/${UUID}`,
      `/api/v1/uploads/`,
      `/api/v1/uploads/public/victim/not-a-uuid.png`,
      `/api/v1/uploads/public/victim/${UUID}\n`,
    ];

    for (const vector of attackVectors) {
      expect(() => resolveCanonicalUploadRef(vector, 'attacker')).toThrow();
    }

    // Single-segment internal URL requires an authenticated owner context.
    expect(() => resolveCanonicalUploadRef(`/api/v1/uploads/${UUID}`)).toThrow();
  });

  it('preserves legitimate external media URLs and non-upload relative asset paths', () => {
    expect(resolveCanonicalUploadRef('https://images.unsplash.com/photo-12345?w=800', 'user-1')).toBe(
      'https://images.unsplash.com/photo-12345?w=800'
    );
    expect(resolveCanonicalUploadRef('https://cdn.partner.com/uploads/avatar.jpg', 'user-1')).toBe(
      'https://cdn.partner.com/uploads/avatar.jpg'
    );
    expect(resolveCanonicalUploadRef('/images/placeholders/avatar.png', 'user-1')).toBe(
      '/images/placeholders/avatar.png'
    );
  });

  it('provides safe legacy stored candidate canonicalization and typed authorizeAndCanonicalizeNonKycUpload metadata', async () => {
    expect(
      canonicalizeStoredUploadCandidate(`https://cdn.tascora.dev/api/v1/uploads/public/user-1/${UUID}?v=2`, 'user-1')
    ).toBe(`upload:user-1/${UUID}`);
    expect(canonicalizeStoredUploadCandidate(`/api/v1/uploads/${UUID}`, 'user-1')).toBe(`upload:user-1/${UUID}`);
    expect(canonicalizeStoredUploadCandidate(`/api/v1/uploads/public/../kyc/victim/${UUID}`, 'user-1')).toBeUndefined();
    expect(canonicalizeStoredUploadCandidate('https://images.unsplash.com/photo-1', 'user-1')).toBe(
      'https://images.unsplash.com/photo-1'
    );

    await expect(
      authorizeAndCanonicalizeNonKycUpload('https://images.unsplash.com/photo-1', 'user-1', true)
    ).resolves.toEqual({
      raw: 'https://images.unsplash.com/photo-1',
      canonicalRef: 'https://images.unsplash.com/photo-1',
      isInternalUpload: false,
    });
    await expect(authorizeAndCanonicalizeNonKycUpload(undefined, 'user-1', false)).resolves.toBeUndefined();
  });

  it('treats missing S3 objects as idempotent on delete while rethrowing fatal/permission errors and rejecting invalid keys', async () => {
    const client = new S3Client({
      region: 'us-east-1',
      credentials: { accessKeyId: 'test-only', secretAccessKey: 'test-only' },
    });
    const send = vi.fn();
    (client as unknown as { send: typeof send }).send = send;
    const storage = new S3Storage(client, 'tascora-kyc-test');

    // Normal 204 deletion succeeds.
    send.mockResolvedValueOnce({ $metadata: { httpStatusCode: 204 } });
    await expect(storage.delete(`u1/${UUID}`)).resolves.toBeUndefined();

    // Missing object errors are idempotent.
    send.mockRejectedValueOnce(Object.assign(new Error('NoSuchKey'), { name: 'NoSuchKey', $metadata: { httpStatusCode: 404 } }));
    await expect(storage.delete(`u1/${UUID}`)).resolves.toBeUndefined();

    send.mockRejectedValueOnce(Object.assign(new Error('NotFound'), { Code: 'NotFound', $metadata: { httpStatusCode: 404 } }));
    await expect(storage.delete(`u1/${UUID}`)).resolves.toBeUndefined();

    send.mockRejectedValueOnce(Object.assign(new Error('Not Found'), { $metadata: { httpStatusCode: 404 } }));
    await expect(storage.delete(`u1/${UUID}`)).resolves.toBeUndefined();

    // Misconfigured bucket, permission failures, and network timeouts MUST fail loudly.
    send.mockRejectedValueOnce(Object.assign(new Error('The specified bucket does not exist'), { name: 'NoSuchBucket', $metadata: { httpStatusCode: 404 } }));
    await expect(storage.delete(`u1/${UUID}`)).rejects.toThrow(/bucket does not exist/i);

    send.mockRejectedValueOnce(Object.assign(new Error('Access Denied'), { name: 'AccessDenied', $metadata: { httpStatusCode: 403 } }));
    await expect(storage.delete(`u1/${UUID}`)).rejects.toThrow(/Access Denied/i);

    send.mockRejectedValueOnce(Object.assign(new Error('Socket timeout'), { name: 'TimeoutError', code: 'ECONNRESET' }));
    await expect(storage.delete(`u1/${UUID}`)).rejects.toThrow(/Socket timeout/i);

    // Invalid keys fail client-side before sending S3 DeleteObject.
    await expect(storage.delete('')).rejects.toMatchObject({ status: 400 });
    await expect(storage.delete('   ')).rejects.toMatchObject({ status: 400 });
    await expect(storage.delete(`../u1/${UUID}`)).rejects.toMatchObject({ status: 400 });
    await expect(storage.delete(`u1\\${UUID}`)).rejects.toMatchObject({ status: 400 });

    client.destroy();
  });
});

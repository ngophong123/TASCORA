import path from 'path';
import fs from 'fs/promises';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpError } from '../../lib/errors';

export const uploadLimit = 5 * 1024 * 1024;
export const uploadTypes = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' } as const;
export type UploadType = keyof typeof uploadTypes;
export type StorageRead = { kind: 'buffer'; body: Buffer } | { kind: 'redirect'; url: string };
export interface Storage {
  put(key: string, body: Buffer, contentType: UploadType): Promise<void>;
  read(key: string): Promise<StorageRead>;
  readBuffer?(key: string): Promise<Buffer>;
  delete?(key: string): Promise<void>;
  exists?(key: string): Promise<boolean>;
}

export function ownedKey(owner: string, file: string): string {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(owner) || !/^[0-9a-f-]{36}\.(png|jpg|webp|pdf)$/.test(file)) throw new HttpError(400, 'Invalid file identifier');
  return `${owner}/${file}`;
}
export function validateUpload(body: unknown, contentType: string): UploadType {
  if (!Buffer.isBuffer(body) || body.length === 0) throw new HttpError(400, 'A file body is required');
  if (body.length > uploadLimit) throw new HttpError(413, 'Upload exceeds 5 MiB');
  const png = body.length >= 8 && body.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = body.length >= 3 && body[0] === 255 && body[1] === 216 && body[2] === 255;
  const webp = body.length >= 12 && body.subarray(0,4).toString() === 'RIFF' && body.subarray(8,12).toString() === 'WEBP';
  const pdf = body.length >= 5 && body.subarray(0,5).toString() === '%PDF-';
  const detected = png ? 'image/png' : jpg ? 'image/jpeg' : webp ? 'image/webp' : pdf ? 'application/pdf' : null;
  if (!detected || detected !== contentType) throw new HttpError(415, 'Unsupported or mismatched file type');
  return detected;
}

export class LocalStorage implements Storage {
  constructor(private root: string) {}
  private resolve(key: string) {
    const parts = key.split('/');
    if (parts.length !== 2) throw new HttpError(400, 'Invalid file key');
    ownedKey(parts[0]!, parts[1]!);
    const root = path.resolve(this.root);
    const target = path.resolve(root, key);
    if (!target.startsWith(root + path.sep)) throw new HttpError(400, 'Invalid file key');
    return target;
  }
  async put(key: string, body: Buffer, _contentType: UploadType) {
    const target = this.resolve(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body, { flag: 'wx', mode: 0o600 });
  }
  async read(key: string): Promise<StorageRead> {
    try { return { kind: 'buffer', body: await fs.readFile(this.resolve(key)) }; }
    catch (error) { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') throw new HttpError(404, 'File not found'); throw error; }
  }
  async readBuffer(key: string): Promise<Buffer> {
    const result = await this.read(key);
    if (result.kind !== 'buffer') throw new HttpError(500, 'Expected local buffer');
    return result.body;
  }
  async delete(key: string): Promise<void> {
    try { await fs.unlink(this.resolve(key)); }
    catch (error) { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return; throw error; }
  }
  async exists(key: string): Promise<boolean> {
    try { await fs.access(this.resolve(key)); return true; }
    catch { return false; }
  }
}

function isS3MissingObjectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as {
    name?: string;
    Code?: string;
    code?: string;
    $metadata?: { httpStatusCode?: number };
  };
  const errName = err.Code || err.code || err.name;
  if (errName === 'NoSuchKey' || errName === 'NotFound') return true;
  return err.$metadata?.httpStatusCode === 404 && errName !== 'NoSuchBucket';
}

export class S3Storage implements Storage {
  constructor(private client: S3Client, private bucket: string) {}
  async put(key: string, body: Buffer, contentType: UploadType) {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType, ContentDisposition: 'attachment', CacheControl: 'private, no-store' }));
  }
  async read(key: string): Promise<StorageRead> {
    return { kind: 'redirect', url: await getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key, ResponseContentDisposition: 'attachment', ResponseCacheControl: 'private, no-store' }), { expiresIn: 60 }) };
  }
  async readBuffer(key: string): Promise<Buffer> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!response.Body) throw new HttpError(404, 'File not found');
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      const buf = Buffer.from(chunk);
      total += buf.length;
      if (total > uploadLimit) throw new HttpError(413, 'Stored object exceeds maximum upload size');
      chunks.push(buf);
    }
    return Buffer.concat(chunks);
  }
  async delete(key: string): Promise<void> {
    if (!key || !key.trim() || key !== key.trim() || key.includes('..') || key.includes('\\')) {
      throw new HttpError(400, 'Invalid file key');
    }
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      if (isS3MissingObjectError(error)) return;
      throw error;
    }
  }
  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

export function createStorage(): Storage {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  if (provider === 'local') {
    if (process.env.NODE_ENV === 'production') throw new Error('Production uploads require S3 storage');
    return new LocalStorage(process.env.STORAGE_LOCAL_PATH || path.resolve(__dirname, '../../../../../.uploads'));
  }
  if (provider !== 's3') throw new Error('Unsupported STORAGE_PROVIDER');
  for (const name of ['STORAGE_BUCKET', 'STORAGE_REGION', 'STORAGE_ACCESS_KEY', 'STORAGE_SECRET_KEY']) if (!process.env[name]) throw new Error(`Missing storage configuration: ${name}`);
  return new S3Storage(new S3Client({ endpoint: process.env.STORAGE_ENDPOINT || undefined, region: process.env.STORAGE_REGION,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
    credentials: { accessKeyId: process.env.STORAGE_ACCESS_KEY!, secretAccessKey: process.env.STORAGE_SECRET_KEY! } }), process.env.STORAGE_BUCKET!);
}

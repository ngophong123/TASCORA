import { HttpError } from '../../lib/errors';
import { ownedKey } from './storage';
export function assertOwnedUpload(reference: string | undefined, userId: string, imageOnly = false) {
  if (!reference?.startsWith('upload:')) return;
  const [owner, file, extra] = reference.slice(7).split('/');
  if (owner !== userId || !file || extra) throw new HttpError(403, 'Upload belongs to another user or has an invalid reference');
  ownedKey(owner, file);
  if (imageOnly && !/\.(png|jpg|webp)$/.test(file)) throw new HttpError(400, 'A profile or service image must be PNG, JPEG or WebP');
}

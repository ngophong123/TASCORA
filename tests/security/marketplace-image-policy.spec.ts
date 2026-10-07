import { afterEach, expect, it, vi } from 'vitest';
import { imageUrl, isMediatedImage } from '../../apps/web/src/lib/marketplace';
afterEach(() => vi.unstubAllEnvs());
it('preserves the existing remote image allowlist and rejects arbitrary hosts/schemes', () => {
  expect(imageUrl('https://images.unsplash.com/photo-test')).toBe('https://images.unsplash.com/photo-test');
  expect(imageUrl('https://images.pexels.com/photo-test')).toBe('https://images.pexels.com/photo-test');
  for (const url of ['https://attacker.invalid/photo.png', '//attacker.invalid/photo.png', 'javascript:alert(1)', 'data:image/svg+xml,test', 'https://user:password@images.unsplash.com/photo-test']) expect(imageUrl(url)).toBe('/favicon.svg');
});
it('allows only the configured API mediated raster-image route to bypass optimization', () => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.tascora.test');
  const value = 'upload:owner/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png';
  const mediated = imageUrl(value);
  expect(isMediatedImage(mediated)).toBe(true);
  expect(isMediatedImage(mediated.replace('api.tascora.test', 'api.tascora.test.attacker.invalid'))).toBe(false);
  expect(isMediatedImage(`${mediated}?token=forged`)).toBe(false);
  expect(isMediatedImage(mediated.replace('.png', '.svg'))).toBe(false);
  expect(isMediatedImage('https://images.unsplash.com/photo-test')).toBe(false);
});

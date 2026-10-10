import { describe, it, expect } from 'vitest';
import { loadCatalog, type CatalogRequest } from '../../apps/web/src/lib/catalog-data';

describe('public catalog bootstrap and retry loader', () => {
  it('starts taxonomy with the first page and keeps all pages in API order', async () => {
    const calls: string[] = [];
    let release!: () => void;
    const first = new Promise<void>(resolve => { release = resolve; });
    const request: CatalogRequest = async <T>(path: string, options?: RequestInit) => {
      calls.push(path); expect(options?.signal).toBeInstanceOf(AbortSignal);
      if (path.includes('categories')) { release(); return [{ id: 'parent' }] as T; }
      if (!path.includes('page=2')) { await first; return { services: [{ id: 'first' }], totalPages: 2 } as T; }
      return { services: [{ id: 'last' }] } as T;
    };
    const result = await loadCatalog(request, new AbortController().signal);
    expect(result.services.map(item => item.id)).toEqual(['first', 'last']);
    expect(calls).toEqual(['/api/v1/services?limit=50', '/api/v1/marketplace/categories', '/api/v1/services?limit=50&page=2']);
  });
  it('Explore does not acquire a new taxonomy dependency', async () => {
    const calls: string[] = [];
    const request: CatalogRequest = async <T>(path: string) => { calls.push(path); return { services: [], totalPages: 0 } as T; };
    expect(await loadCatalog(request, new AbortController().signal, false)).toEqual({ services: [], categories: [], error: '' });
    expect(calls).toHaveLength(1);
  });
  it('does not disguise partial-page failure as a complete empty/success result', async () => {
    const request: CatalogRequest = async <T>(path: string) => {
      if (path.includes('page=2')) throw new Error('Catalog temporarily unavailable');
      return { services: [{ id: 'first' }], totalPages: 2 } as T;
    };
    await expect(loadCatalog(request, new AbortController().signal, false)).rejects.toThrow('Catalog temporarily unavailable');
  });
  it('propagates cancellation and rejects malformed page counts', async () => {
    const controller = new AbortController(); controller.abort();
    const aborted: CatalogRequest = async <T>(_path: string, options?: RequestInit) => { options?.signal?.throwIfAborted(); return {} as T; };
    await expect(loadCatalog(aborted, controller.signal, false)).rejects.toThrow();
    const malformed: CatalogRequest = async <T>() => ({ services: [], totalPages: Infinity }) as T;
    await expect(loadCatalog(malformed, new AbortController().signal, false)).rejects.toThrow('Catalog unavailable');
  });
});

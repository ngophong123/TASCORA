import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOriginPolicy, previewOriginConfig } from '../../apps/api/src/lib/origin-policy';

const preview = { teamId: 'team_fixture', projectId: 'prj_fixture', repoId: '123456', refs: ['feat/premium-ui-redesign'], token: 'test-only-control-plane-token' };
const origin = 'https://deployment-random.vercel.app';
const deployment = { url: new URL(origin).hostname, ownerId: preview.teamId, projectId: preview.projectId, readyState: 'READY', target: null,
  gitSource: { type: 'github', repoId: 123456, ref: 'feat/premium-ui-redesign' } };
function fixture(body: unknown = deployment, status = 200) {
  const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => Response.json(body, { status }));
  return { fetcher, policy: createOriginPolicy(['https://staging.example.com', 'https://www.example.com'], { preview, fetch: fetcher }) };
}
afterEach(() => vi.useRealTimers());

describe('Verified Preview origin policy', () => {
  it('keeps canonical staging, production and server requests independent of the Vercel API', async () => {
    const { policy, fetcher } = fixture();
    for (const value of ['https://staging.example.com', 'https://www.example.com', undefined]) expect(await policy(value)).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('admits only an exact READY Preview URL with matching owner, project, repository and trusted ref', async () => {
    const { policy, fetcher } = fixture();
    expect(await policy(origin)).toBe(true);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(String(url)).toBe('https://api.vercel.com/v13/deployments/deployment-random.vercel.app?teamId=team_fixture&withGitRepoInfo=true');
    expect(init).toMatchObject({ redirect: 'error', cache: 'no-store', headers: { Authorization: 'Bearer test-only-control-plane-token' } });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
  it.each([
    { ownerId: 'team_other' }, { projectId: 'prj_other' }, { target: 'production' }, { target: undefined },
    { readyState: 'BUILDING' }, { url: 'different.vercel.app' }, { gitSource: undefined },
    { gitSource: { ...deployment.gitSource, repoId: 999 } },
    { gitSource: { ...deployment.gitSource, ref: 'untrusted-pr' } },
    { gitSource: { ...deployment.gitSource, type: 'gitlab' } },
    { gitSource: { ...deployment.gitSource, repoId: undefined, repo: 'TASCORA' } },
  ])('rejects mismatching/missing authenticated metadata: %j', async fields => {
    expect(await fixture({ ...deployment, ...fields }).policy(origin)).toBe(false);
  });
  it.each([
    'https://tascora-staging.attacker.invalid', 'https://tascora-staging.vercel.app.attacker.invalid',
    'https://vercel.app', 'http://deployment-random.vercel.app', `${origin}:444`, `${origin}/`,
    `${origin}/api`, `${origin}?upstream=http://169.254.169.254`, 'https://user:pass@deployment-random.vercel.app',
    'https://*.vercel.app', 'https://nested.deployment-random.vercel.app', 'null', `${origin}\r\nX-Injected: value`,
  ])('rejects arbitrary/malformed origins without fetching: %s', async value => {
    const { policy, fetcher } = fixture();
    expect(await policy(value)).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not treat a similar project hostname as ownership', async () => {
    expect(await fixture({ ...deployment, url: 'tascora-staging-impostor.vercel.app', projectId: 'prj_attacker' })
      .policy('https://tascora-staging-impostor.vercel.app')).toBe(false);
  });
  it.each([401, 403, 404, 429, 500, 503])('fails closed on control-plane HTTP %s', async status => {
    expect(await fixture({}, status).policy(origin)).toBe(false);
  });
  it('fails closed on redirects, network/timeout errors and malformed or oversized metadata; logs fixed codes only', async () => {
    const diagnostic = vi.fn();
    for (const response of [() => { throw new Error('private upstream information'); },
      () => new Response('invalid json'), () => new Response('x'.repeat(512 * 1024 + 1)), () => new Response(null, { status: 302 })]) {
      const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => response());
      expect(await createOriginPolicy([], { preview, fetch: fetcher, diagnostic })(origin)).toBe(false);
    }
    expect(diagnostic.mock.calls.every(([code]) => code === 'lookup_failed')).toBe(true);
  });
  it('aborts a stalled metadata request with the actual two-second signal', async () => {
    let signal: AbortSignal | undefined;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (_url, init) => {
      signal = init!.signal!;
      return new Promise<Response>((_resolve, reject) => signal!.addEventListener('abort', () => reject(signal!.reason), { once: true }));
    });
    expect(await createOriginPolicy([], { preview, fetch: fetcher })(origin)).toBe(false);
    expect(signal?.aborted).toBe(true);
    expect(signal?.reason.name).toBe('TimeoutError');
  });
  it('single-flights requests, expires grants after 60 seconds, and does not cache a revoked grant forever', async () => {
    let clock = 0;
    const { fetcher } = fixture();
    const policy = createOriginPolicy([], { preview, fetch: fetcher, now: () => clock });
    expect(await Promise.all(Array.from({ length: 20 }, () => policy(origin)))).toEqual(Array(20).fill(true));
    expect(fetcher).toHaveBeenCalledOnce();
    clock = 59_999; expect(await policy(origin)).toBe(true);
    fetcher.mockResolvedValueOnce(Response.json({ ...deployment, readyState: 'DELETED' }));
    clock = 60_000; expect(await policy(origin)).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
    clock = 64_999; expect(await policy(origin)).toBe(false);
    clock = 65_000; expect(await policy(origin)).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it('bounds distinct lookups per minute, concurrency and diagnostic noise without blocking static origins', async () => {
    let clock = 0;
    const diagnostic = vi.fn();
    const { fetcher } = fixture({ ...deployment, projectId: 'prj_other' });
    const policy = createOriginPolicy(['https://staging.example.com'], { preview, fetch: fetcher, now: () => clock, diagnostic });
    for (let i = 0; i < 35; i++) await policy(`https://lookup-${i}.vercel.app`);
    expect(fetcher).toHaveBeenCalledTimes(30);
    expect(diagnostic).toHaveBeenCalledTimes(1);
    expect(await policy('https://staging.example.com')).toBe(true);
    clock = 60_000; await policy('https://new-minute.vercel.app');
    expect(fetcher).toHaveBeenCalledTimes(31);
    const waiting = vi.fn<typeof fetch>().mockImplementation(() => new Promise(() => undefined));
    const limited = createOriginPolicy([], { preview, fetch: waiting });
    for (let i = 0; i < 4; i++) void limited(`https://pending-${i}.vercel.app`);
    expect(await limited('https://fifth.vercel.app')).toBe(false);
    expect(waiting).toHaveBeenCalledTimes(4);
  });
  it('is disabled by default and cannot expand production trust', async () => {
    expect(await createOriginPolicy([])(origin)).toBe(false);
    expect(previewOriginConfig({})).toBeUndefined();
    expect(previewOriginConfig({ VERCEL_PREVIEW_CORS_ENABLED: 'false' })).toBeUndefined();
    expect(() => previewOriginConfig({ VERCEL_PREVIEW_CORS_ENABLED: 'TRUE' })).toThrow();
    expect(() => previewOriginConfig({ NODE_ENV: 'production', APP_ENV: 'production', VERCEL_PREVIEW_CORS_ENABLED: 'true' })).toThrow('staging');
  });
  it('requires complete exact private configuration, not wildcard refs', () => {
    const env = { NODE_ENV: 'production', APP_ENV: 'staging', VERCEL_PREVIEW_CORS_ENABLED: 'true', VERCEL_PREVIEW_TEAM_ID: preview.teamId,
      VERCEL_PREVIEW_PROJECT_ID: preview.projectId, VERCEL_PREVIEW_GITHUB_REPO_ID: preview.repoId,
      VERCEL_PREVIEW_API_TOKEN: preview.token, VERCEL_PREVIEW_GIT_REFS: preview.refs.join(',') };
    expect(previewOriginConfig(env)).toEqual(preview);
    for (const key of ['VERCEL_PREVIEW_TEAM_ID', 'VERCEL_PREVIEW_PROJECT_ID', 'VERCEL_PREVIEW_GITHUB_REPO_ID', 'VERCEL_PREVIEW_API_TOKEN', 'VERCEL_PREVIEW_GIT_REFS']) {
      expect(() => previewOriginConfig({ ...env, [key]: '' })).toThrow('Preview CORS requires');
    }
    expect(() => previewOriginConfig({ ...env, VERCEL_PREVIEW_GIT_REFS: '*' })).toThrow();
    expect(() => previewOriginConfig({ ...env, VERCEL_PREVIEW_API_TOKEN: 'test\r\nInjected: header' })).toThrow();
  });
});

import type { CorsOptions } from 'cors';

type PreviewConfig = { teamId: string; projectId: string; repoId: string; refs: string[]; token: string };
type Diagnostic = 'lookup_failed' | 'lookup_limited';
type Options = {
  preview?: PreviewConfig;
  fetch?: typeof fetch;
  now?: () => number;
  diagnostic?: (code: Diagnostic) => void;
};

// Fail at startup rather than silently enabling a partial/broader trust policy.
export function previewOriginConfig(env: NodeJS.ProcessEnv): PreviewConfig | undefined {
  const enabled = env.VERCEL_PREVIEW_CORS_ENABLED;
  if (enabled && !['true', 'false'].includes(enabled)) throw new Error('VERCEL_PREVIEW_CORS_ENABLED must be true or false');
  if (enabled !== 'true') return undefined;
  if (env.APP_ENV !== 'staging' || env.NODE_ENV !== 'production') throw new Error('Preview CORS requires explicit production-runtime staging');
  const teamId = env.VERCEL_PREVIEW_TEAM_ID || '';
  const projectId = env.VERCEL_PREVIEW_PROJECT_ID || '';
  const repoId = env.VERCEL_PREVIEW_GITHUB_REPO_ID || '';
  const token = env.VERCEL_PREVIEW_API_TOKEN || '';
  const refs = (env.VERCEL_PREVIEW_GIT_REFS || '').split(',').map(ref => ref.trim()).filter(Boolean);
  if (!/^team_[A-Za-z0-9]+$/.test(teamId) || !/^prj_[A-Za-z0-9]+$/.test(projectId) || !/^[1-9][0-9]*$/.test(repoId)
    || !token.trim() || /[\r\n]/.test(token) || !refs.length || refs.some(ref => !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref))) {
    throw new Error('Preview CORS requires valid team/project/repository IDs, exact Git refs and a private API token');
  }
  return { teamId, projectId, repoId, refs: [...new Set(refs)], token };
}

function previewHostname(origin: string): string | undefined {
  try {
    const url = new URL(origin);
    // This only bounds lookup candidates. It is NEVER evidence of ownership.
    if (url.protocol === 'https:' && url.origin === origin && !url.port
      && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(url.hostname)) return url.hostname;
  } catch { /* Malformed origins are untrusted. */ }
  return undefined;
}

async function boundedJson(response: Response): Promise<unknown> {
  if (!response.body) throw new Error('Missing metadata');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 512 * 1024) throw new Error('Metadata limit');
      chunks.push(chunk.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function createOriginPolicy(exactOrigins: readonly string[], options: Options = {}) {
  const exact = new Set(exactOrigins);
  const now = options.now || Date.now;
  const request = options.fetch || fetch;
  const cache = new Map<string, { allowed: boolean; expires: number }>();
  const pending = new Map<string, Promise<boolean>>();
  let windowStart = now(), lookups = 0, lastDiagnostic = -Infinity;
  function diagnostic(code: Diagnostic) {
    if (now() - lastDiagnostic >= 30_000) { lastDiagnostic = now(); options.diagnostic?.(code); }
  }
  async function lookup(hostname: string, config: PreviewConfig): Promise<boolean> {
    try {
      // Client-controlled values can only be an encoded path segment on this fixed HTTPS host.
      const endpoint = new URL(`https://api.vercel.com/v13/deployments/${encodeURIComponent(hostname)}`);
      endpoint.searchParams.set('teamId', config.teamId);
      endpoint.searchParams.set('withGitRepoInfo', 'true');
      const response = await request(endpoint, {
        headers: { Authorization: `Bearer ${config.token}`, Accept: 'application/json' },
        redirect: 'error', signal: AbortSignal.timeout(2000), cache: 'no-store',
      });
      if (!response.ok) { await response.body?.cancel(); diagnostic('lookup_failed'); return false; }
      // Do not log, export or retain the response: owner metadata may contain private values.
      const deployment = record(await boundedJson(response));
      const git = record(deployment.gitSource);
      return deployment.url === hostname && deployment.ownerId === config.teamId
        && deployment.projectId === config.projectId && deployment.target === null
        && deployment.readyState === 'READY' && git.type === 'github'
        && (typeof git.repoId === 'string' || (typeof git.repoId === 'number' && Number.isSafeInteger(git.repoId))) && String(git.repoId) === config.repoId
        && typeof git.ref === 'string' && config.refs.includes(git.ref);
    } catch {
      diagnostic('lookup_failed');
      return false;
    }
  }
  return async function isAllowedOrigin(origin: string | undefined): Promise<boolean> {
    // No-Origin requests retain existing server/native-client behavior. CSRF separately requires Origin.
    if (!origin) return true;
    if (exact.has(origin)) return true;
    const hostname = previewHostname(origin);
    if (!options.preview || !hostname) return false;
    const hit = cache.get(origin);
    if (hit && hit.expires > now()) return hit.allowed;
    const inFlight = pending.get(origin);
    if (inFlight) return inFlight;
    if (now() - windowStart >= 60_000) { windowStart = now(); lookups = 0; }
    // Bound memory, concurrency and control-plane requests before the HTTP API rate limiter.
    if (pending.size >= 4 || lookups >= 30) { diagnostic('lookup_limited'); return false; }
    lookups++;
    const result = lookup(hostname, options.preview).then(allowed => {
      if (cache.size >= 256) cache.delete(cache.keys().next().value!);
      cache.set(origin, { allowed, expires: now() + (allowed ? 60_000 : 5000) });
      return allowed;
    }).finally(() => pending.delete(origin));
    pending.set(origin, result);
    return result;
  };
}

export function corsOriginCallback(policy: (origin: string | undefined) => Promise<boolean>): CorsOptions['origin'] {
  return (origin, callback) => { void policy(origin).then(allowed => callback(null, allowed), () => callback(null, false)); };
}

import crypto from 'node:crypto';

export interface FinOpsEvent {
  operation: 'semantic_embed' | 'brief_assistant' | 'trust_safety_advisory';
  provider: 'local-deterministic' | 'external-configured';
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  cacheHit: boolean;
  error: boolean;
  timestamp: string;
}

export interface FinOpsSummary {
  totalCalls: number;
  cacheHits: number;
  cacheHitRate: number;
  errorCount: number;
  errorRate: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalEstimatedCostUsd: number;
  latencyMs: {
    p50: number;
    p95: number;
    avg: number;
  };
  byOperation: Record<string, { calls: number; cacheHits: number; estimatedCostUsd: number }>;
}

// Sensitive fields that MUST NEVER be sent to any external or internal AI model.
const FORBIDDEN_PII_PATTERNS: RegExp[] = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN-like
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{8,}\b/g, // Stripe keys
  /\bwhsec_[A-Za-z0-9]{8,}\b/g, // Stripe webhook secrets
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, // JWT tokens
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email addresses
  /\b(?:\+?\d[\d\s-]{8,}\d)\b/g, // Phone / national ID digit runs
];

const FORBIDDEN_KEY_NAMES = new Set([
  'password',
  'passwordhash',
  'documentnumber',
  'documentnumberencrypted',
  'dateofbirth',
  'dateofbirthencrypted',
  'kycdocument',
  'refreshtoken',
  'accesstoken',
  'token',
  'stripesecretkey',
  'bankaccount',
  'iban',
  'ssn',
]);

export function sanitizeTextForAi(raw: string): string {
  let clean = raw.trim().slice(0, 2000);
  for (const pattern of FORBIDDEN_PII_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED_PII]');
  }
  return clean;
}

export function assertNoForbiddenAiPayload(payload: Record<string, unknown>): void {
  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_KEY_NAMES.has(key.toLowerCase())) {
      throw new Error(`Forbidden sensitive field "${key}" cannot be passed to AI services`);
    }
  }
}

function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words * 1.35));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return Number(sorted[idx]!.toFixed(2));
}

export class FinOpsTracker {
  private events: FinOpsEvent[] = [];
  private readonly maxEvents: number;

  constructor(maxEvents = 500) {
    this.maxEvents = maxEvents;
  }

  record(event: Omit<FinOpsEvent, 'timestamp'>): FinOpsEvent {
    const full: FinOpsEvent = { ...event, timestamp: new Date().toISOString() };
    this.events.push(full);
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
    return full;
  }

  reset(): void {
    this.events = [];
  }

  summary(): FinOpsSummary {
    const totalCalls = this.events.length;
    const cacheHits = this.events.filter((e) => e.cacheHit).length;
    const errorCount = this.events.filter((e) => e.error).length;
    const totalPromptTokens = this.events.reduce((s, e) => s + e.promptTokens, 0);
    const totalCompletionTokens = this.events.reduce((s, e) => s + e.completionTokens, 0);
    const totalEstimatedCostUsd = Number(
      this.events.reduce((s, e) => s + e.estimatedCostUsd, 0).toFixed(6)
    );
    const latencies = this.events.map((e) => e.latencyMs).sort((a, b) => a - b);
    const avgLatency =
      latencies.length > 0
        ? Number((latencies.reduce((s, v) => s + v, 0) / latencies.length).toFixed(2))
        : 0;

    const byOperation: Record<string, { calls: number; cacheHits: number; estimatedCostUsd: number }> =
      {};
    for (const e of this.events) {
      const bucket = byOperation[e.operation] ?? { calls: 0, cacheHits: 0, estimatedCostUsd: 0 };
      bucket.calls += 1;
      if (e.cacheHit) bucket.cacheHits += 1;
      bucket.estimatedCostUsd = Number((bucket.estimatedCostUsd + e.estimatedCostUsd).toFixed(6));
      byOperation[e.operation] = bucket;
    }

    return {
      totalCalls,
      cacheHits,
      cacheHitRate: totalCalls > 0 ? Number((cacheHits / totalCalls).toFixed(4)) : 0,
      errorCount,
      errorRate: totalCalls > 0 ? Number((errorCount / totalCalls).toFixed(4)) : 0,
      totalPromptTokens,
      totalCompletionTokens,
      totalEstimatedCostUsd,
      latencyMs: {
        p50: percentile(latencies, 0.5),
        p95: percentile(latencies, 0.95),
        avg: avgLatency,
      },
      byOperation,
    };
  }
}

export const finOpsTracker = new FinOpsTracker();

// Lightweight semantic synonym groups for deterministic zero-key embeddings
const CONCEPT_GROUPS: Record<string, string[]> = {
  web_frontend: ['react', 'nextjs', 'next', 'frontend', 'ui', 'ux', 'tailwind', 'website', 'landing', 'spa', 'typescript', 'webapp'],
  backend_api: ['node', 'nodejs', 'express', 'api', 'backend', 'rest', 'graphql', 'prisma', 'postgres', 'postgresql', 'database', 'microservice', 'server'],
  ecommerce: ['ecommerce', 'shop', 'store', 'shopify', 'stripe', 'checkout', 'payment', 'marketplace', 'saas', 'subscription'],
  mobile: ['mobile', 'ios', 'android', 'reactnative', 'flutter', 'app', 'swift', 'kotlin'],
  branding_design: ['logo', 'brand', 'branding', 'identity', 'figma', 'design', 'wireframe', 'prototype', 'typography', 'visual', 'minimalist'],
  seo_marketing: ['seo', 'marketing', 'growth', 'ads', 'copywriting', 'content', 'blog', 'analytics', 'conversion', 'funnel'],
  ai_data: ['ai', 'ml', 'llm', 'chatbot', 'rag', 'embedding', 'python', 'data', 'automation', 'openai', 'agent', 'nlp'],
  devops_security: ['devops', 'docker', 'kubernetes', 'ci', 'cd', 'cloud', 'aws', 'security', 'audit', 'pentest', 'performance', 'lighthouse'],
  video_motion: ['video', 'motion', 'animation', 'editing', 'reel', 'promo', '3d', 'blender', 'aftereffects'],
};

const EMBEDDING_DIM = 64;
const embeddingCache = new Map<string, number[]>();

export function tokenizeNormalized(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function hashSlot(token: string): number {
  const digest = crypto.createHash('sha256').update(token).digest();
  return digest.readUInt16BE(0) % EMBEDDING_DIM;
}

/**
 * Deterministic hashed + concept-expanded unit vector embedding.
 * Provides zero-cost, zero-key semantic matching with graceful fallback when
 * no external AI_API_KEY is configured.
 */
export function computeDeterministicEmbedding(rawText: string): {
  vector: number[];
  cacheHit: boolean;
  tokens: number;
} {
  const start = performance.now();
  const clean = sanitizeTextForAi(rawText);
  const key = crypto.createHash('sha256').update(clean.toLowerCase()).digest('hex');
  const tokens = estimateTokens(clean);

  const cached = embeddingCache.get(key);
  if (cached) {
    finOpsTracker.record({
      operation: 'semantic_embed',
      provider: 'local-deterministic',
      promptTokens: 0,
      completionTokens: 0,
      estimatedCostUsd: 0,
      latencyMs: Number((performance.now() - start).toFixed(3)),
      cacheHit: true,
      error: false,
    });
    return { vector: cached, cacheHit: true, tokens: 0 };
  }

  const vec = new Array<number>(EMBEDDING_DIM).fill(0);
  const words = tokenizeNormalized(clean);

  for (const word of words) {
    vec[hashSlot(word)]! += 1.0;
    // Character trigram hashing helps morphological variants (e.g. design/designer)
    if (word.length >= 4) {
      vec[hashSlot(`tri:${word.slice(0, 4)}`)]! += 0.5;
    }
    for (const [concept, synonyms] of Object.entries(CONCEPT_GROUPS)) {
      if (synonyms.includes(word)) {
        vec[hashSlot(`concept:${concept}`)]! += 2.2;
      }
    }
  }

  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  const normalized = vec.map((v) => v / norm);

  if (embeddingCache.size >= 1000) {
    const firstKey = embeddingCache.keys().next().value;
    if (firstKey) embeddingCache.delete(firstKey);
  }
  embeddingCache.set(key, normalized);

  finOpsTracker.record({
    operation: 'semantic_embed',
    provider: 'local-deterministic',
    promptTokens: tokens,
    completionTokens: 0,
    estimatedCostUsd: 0,
    latencyMs: Number((performance.now() - start).toFixed(3)),
    cacheHit: false,
    error: false,
  });

  return { vector: normalized, cacheHit: false, tokens };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i]! * b[i]!;
  }
  return Number(Math.max(0, Math.min(1, dot)).toFixed(4));
}

export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

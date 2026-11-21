import { z } from 'zod';
import {
  assertNoForbiddenAiPayload,
  computeDeterministicEmbedding,
  cosineSimilarity,
  finOpsTracker,
  sanitizeTextForAi,
  tokenizeNormalized,
} from './ai-finops';

export interface SearchableServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  startingPriceUsd: number;
  ratingAverage: number;
}

export interface HybridSearchResult {
  item: SearchableServiceItem;
  keywordScore: number;
  semanticScore: number;
  hybridScore: number;
}

export function keywordSearchRank(
  query: string,
  catalog: SearchableServiceItem[],
  limit = 5
): HybridSearchResult[] {
  const terms = tokenizeNormalized(sanitizeTextForAi(query));
  return catalog
    .map((item) => {
      const hay = `${item.title} ${item.description} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
      const hits = terms.filter((t) => hay.includes(t)).length;
      const keywordScore = terms.length > 0 ? Number((hits / terms.length).toFixed(4)) : 0;
      return { item, keywordScore, semanticScore: 0, hybridScore: keywordScore };
    })
    .sort((a, b) => b.hybridScore - a.hybridScore || b.item.ratingAverage - a.item.ratingAverage)
    .slice(0, limit);
}

/**
 * Hybrid search blending normalized lexical overlap with deterministic
 * concept-aware vector cosine similarity (with zero-key graceful fallback).
 */
export function hybridSemanticSearch(
  query: string,
  catalog: SearchableServiceItem[],
  limit = 5
): {
  mode: 'hybrid-local-fallback' | 'hybrid-external';
  results: HybridSearchResult[];
  cacheHit: boolean;
} {
  const cleanQuery = sanitizeTextForAi(query);
  const queryTerms = tokenizeNormalized(cleanQuery);
  const { vector: qVec, cacheHit } = computeDeterministicEmbedding(cleanQuery);

  const scored = catalog.map((item) => {
    const docText = `${item.title} ${item.description} ${item.category} ${item.tags.join(' ')}`;
    const lower = docText.toLowerCase();
    const hits = queryTerms.filter((t) => lower.includes(t)).length;
    const keywordScore = queryTerms.length > 0 ? hits / queryTerms.length : 0;
    const { vector: docVec } = computeDeterministicEmbedding(docText);
    const semanticScore = cosineSimilarity(qVec, docVec);
    const ratingBoost = Math.min(item.ratingAverage / 5, 1) * 0.05;
    const hybridScore = Number((semanticScore * 0.65 + keywordScore * 0.3 + ratingBoost).toFixed(4));

    return {
      item,
      keywordScore: Number(keywordScore.toFixed(4)),
      semanticScore,
      hybridScore,
    };
  });

  scored.sort((a, b) => b.hybridScore - a.hybridScore || b.item.ratingAverage - a.item.ratingAverage);

  return {
    mode: process.env.AI_PROVIDER_API_KEY ? 'hybrid-external' : 'hybrid-local-fallback',
    results: scored.slice(0, limit),
    cacheHit,
  };
}

export const projectBriefOutputSchema = z.object({
  summary: z.string().min(10).max(400),
  suggestedCategory: z.string().min(2),
  deliverables: z.array(z.string().min(3)).min(2).max(6),
  requiredSkills: z.array(z.string().min(2)).min(2).max(8),
  estimatedComplexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  clarifyingQuestions: z.array(z.string().min(5)).min(2).max(5),
  advisoryOnly: z.literal(true),
  providerMode: z.enum(['local-deterministic', 'external-configured']),
});

export type ProjectBriefOutput = z.infer<typeof projectBriefOutputSchema>;

export function generateProjectBrief(input: {
  idea: string;
  budgetHintUsd?: number;
  timelineDays?: number;
}): ProjectBriefOutput {
  const start = performance.now();
  assertNoForbiddenAiPayload(input as Record<string, unknown>);
  const cleanIdea = sanitizeTextForAi(input.idea);
  const lower = cleanIdea.toLowerCase();

  let suggestedCategory = 'Web Development';
  let requiredSkills = ['TypeScript', 'React', 'API Integration'];
  let deliverables = [
    'Technical specification and milestone breakdown',
    'Responsive implementation with source repository',
    'Automated test pass and deployment handoff notes',
  ];

  if (/(logo|brand|identity|figma|ui|ux|design)/i.test(lower)) {
    suggestedCategory = 'Brand & UI/UX Design';
    requiredSkills = ['Figma', 'Brand Systems', 'Visual Design', 'Responsive Prototyping'];
    deliverables = [
      'Discovery moodboard and visual direction',
      'Figma component library and desktop/mobile screens',
      'Exportable SVG/PNG brand assets and usage guidelines',
    ];
  } else if (/(ai|llm|chatbot|rag|data|python|automation)/i.test(lower)) {
    suggestedCategory = 'AI & Data Engineering';
    requiredSkills = ['Python', 'TypeScript', 'Prompt Evaluation', 'API Design'];
    deliverables = [
      'Evaluation benchmark dataset and baseline metrics',
      'Schema-validated AI integration service with fallback',
      'Token cost tracking and latency monitoring report',
    ];
  } else if (/(seo|marketing|copy|content|growth|ads)/i.test(lower)) {
    suggestedCategory = 'Growth & SEO';
    requiredSkills = ['Technical SEO', 'Copywriting', 'Analytics', 'Conversion Optimization'];
    deliverables = [
      'Site audit and prioritized keyword roadmap',
      'Optimized landing page copy and metadata',
      'Tracking setup and 30-day KPI measurement plan',
    ];
  } else if (/(mobile|ios|android|flutter|react native)/i.test(lower)) {
    suggestedCategory = 'Mobile Development';
    requiredSkills = ['React Native', 'TypeScript', 'iOS/Android Builds', 'REST APIs'];
    deliverables = [
      'Cross-platform mobile screens and navigation flow',
      'API integration and offline error handling',
      'Staging build instructions for iOS and Android',
    ];
  }

  const budget = input.budgetHintUsd ?? 500;
  const days = input.timelineDays ?? 14;
  const estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' =
    budget >= 2000 || days >= 30 || cleanIdea.length > 260
      ? 'HIGH'
      : budget >= 500 || days >= 10
        ? 'MEDIUM'
        : 'LOW';

  const output = projectBriefOutputSchema.parse({
    summary: `Structured project brief drafted for: ${cleanIdea.slice(0, 180)}`,
    suggestedCategory,
    deliverables,
    requiredSkills,
    estimatedComplexity,
    clarifyingQuestions: [
      'What are the top 2 acceptance criteria required for milestone sign-off?',
      'Do you already have existing brand assets, APIs, or reference examples?',
      'Are there any strict compliance, localization, or deadline constraints?',
    ],
    advisoryOnly: true,
    providerMode: 'local-deterministic',
  });

  finOpsTracker.record({
    operation: 'brief_assistant',
    provider: 'local-deterministic',
    promptTokens: Math.ceil(cleanIdea.split(/\s+/).length * 1.35),
    completionTokens: 120,
    estimatedCostUsd: 0,
    latencyMs: Number((performance.now() - start).toFixed(3)),
    cacheHit: false,
    error: false,
  });

  return output;
}

export interface TrustSafetyAdvisoryResult {
  riskScore: number; // 0-100 advisory score only
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  warnings: string[];
  recommendedAction: 'HUMAN_REVIEW_OPTIONAL' | 'HUMAN_REVIEW_RECOMMENDED';
  automatedEnforcementTaken: false;
  disclaimer: string;
}

/**
 * Admin-only non-destructive Trust & Safety risk advisory.
 * STRICT INVARIANT: Never bans users, never blocks accounts, never rejects
 * payments, and never declares fraud automatically.
 */
export function evaluateTrustSafetyAdvisory(input: {
  title: string;
  description: string;
  priceUsd?: number;
}): TrustSafetyAdvisoryResult {
  const start = performance.now();
  assertNoForbiddenAiPayload(input as Record<string, unknown>);

  const combined = sanitizeTextForAi(`${input.title} ${input.description}`).toLowerCase();
  const warnings: string[] = [];
  let score = 5;

  if (/(whatsapp|telegram|pay outside|off-platform|wire transfer|crypto direct)/i.test(combined)) {
    warnings.push('Potential off-platform payment or contact solicitation detected.');
    score += 40;
  }
  if (/(guaranteed 100%|instant million|hack|bypass|crack|stolen)/i.test(combined)) {
    warnings.push('Suspicious claim or potentially restricted service language detected.');
    score += 35;
  }
  if (typeof input.priceUsd === 'number' && (input.priceUsd < 5 || input.priceUsd > 25000)) {
    warnings.push('Unusual package pricing outside typical marketplace range.');
    score += 20;
  }
  if (combined.length < 25) {
    warnings.push('Very short listing description may lack clear deliverables.');
    score += 15;
  }

  const riskScore = Math.min(100, score);
  const severity: 'LOW' | 'MEDIUM' | 'HIGH' =
    riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';

  finOpsTracker.record({
    operation: 'trust_safety_advisory',
    provider: 'local-deterministic',
    promptTokens: Math.ceil(combined.split(/\s+/).length * 1.35),
    completionTokens: 45,
    estimatedCostUsd: 0,
    latencyMs: Number((performance.now() - start).toFixed(3)),
    cacheHit: false,
    error: false,
  });

  return {
    riskScore,
    severity,
    warnings,
    recommendedAction:
      severity === 'LOW' ? 'HUMAN_REVIEW_OPTIONAL' : 'HUMAN_REVIEW_RECOMMENDED',
    automatedEnforcementTaken: false,
    disclaimer:
      'Advisory signal only. Human administrator review is required; no account, listing, or payment action was taken automatically.',
  };
}

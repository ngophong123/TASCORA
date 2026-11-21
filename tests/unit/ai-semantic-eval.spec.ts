import { describe, expect, it } from 'vitest';
import {
  clearEmbeddingCache,
  computeDeterministicEmbedding,
  finOpsTracker,
} from '../../apps/api/src/modules/service/ai-finops';
import {
  evaluateTrustSafetyAdvisory,
  generateProjectBrief,
  hybridSemanticSearch,
} from '../../apps/api/src/modules/service/semantic-search.service';
import {
  EVAL_CATALOG,
  runSemanticSearchEvaluation,
} from '../../scripts/evaluate-semantic-search';

describe('Phase 4F AI Hybrid Semantic Search, Brief Assistant & FinOps', () => {
  it('runs the repeatable 20-query evaluation benchmark and beats or matches keyword MRR & Recall@3', () => {
    const report = runSemanticSearchEvaluation(3);

    expect(report.queryCount).toBe(20);
    expect(report.hybridSemantic.mrr).toBeGreaterThanOrEqual(0.85);
    expect(report.hybridSemantic.recallAtK).toBeGreaterThanOrEqual(
      report.keywordBaseline.recallAtK
    );
    expect(report.finOps.totalCalls).toBeGreaterThan(0);
    expect(report.finOps.cacheHitRate).toBeGreaterThan(0.5);
    expect(report.finOps.errorRate).toBe(0);
  });

  it('gracefully falls back without external API keys and caches repeated embeddings', () => {
    clearEmbeddingCache();
    finOpsTracker.reset();

    const first = computeDeterministicEmbedding('Next.js SaaS checkout storefront');
    const second = computeDeterministicEmbedding('Next.js SaaS checkout storefront');
    expect(first.cacheHit).toBe(false);
    expect(second.cacheHit).toBe(true);
    expect(second.tokens).toBe(0);

    const search = hybridSemanticSearch('online store checkout', EVAL_CATALOG, 3);
    expect(search.mode).toBe('hybrid-local-fallback');
    expect(search.results).toHaveLength(3);
  });

  it('generates schema-validated advisory project briefs', () => {
    const brief = generateProjectBrief({
      idea: 'Build a minimalist Figma design system and brand logo for a fintech mobile app',
      budgetHintUsd: 1200,
      timelineDays: 14,
    });

    expect(brief.advisoryOnly).toBe(true);
    expect(brief.suggestedCategory).toBe('Brand & UI/UX Design');
    expect(brief.deliverables.length).toBeGreaterThanOrEqual(2);
    expect(brief.requiredSkills.length).toBeGreaterThanOrEqual(2);
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(brief.estimatedComplexity);
  });

  it('produces non-destructive admin Trust & Safety advisories without automated enforcement', () => {
    const risky = evaluateTrustSafetyAdvisory({
      title: 'Instant million hack',
      description: 'Contact me on Telegram to pay outside platform via wire transfer.',
      priceUsd: 2,
    });
    expect(risky.automatedEnforcementTaken).toBe(false);
    expect(risky.severity).toBe('HIGH');
    expect(risky.warnings.length).toBeGreaterThanOrEqual(2);
    expect(risky.recommendedAction).toBe('HUMAN_REVIEW_RECOMMENDED');

    const benign = evaluateTrustSafetyAdvisory({
      title: 'TypeScript REST API Review',
      description: 'Comprehensive Express and Prisma architecture review with automated test plan.',
      priceUsd: 350,
    });
    expect(benign.automatedEnforcementTaken).toBe(false);
    expect(benign.severity).toBe('LOW');
  });
});

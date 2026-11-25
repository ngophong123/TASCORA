# TASCORA AI Semantic Search Evaluation & FinOps Report (Phase 4F)

All numbers below were measured directly by executing `npx tsx scripts/evaluate-semantic-search.ts` against the deterministic 16-service demo catalog and 20 natural-language evaluation queries (`k = 3`).

---

## 1. Search Quality & Latency Comparison (`N = 20` queries, `k = 3`)

| Search Strategy                                                 | Precision@3 | Recall@3 | MRR      | Avg Query Latency |
| --------------------------------------------------------------- | ----------- | -------- | -------- | ----------------- |
| **Keyword Baseline** (`keywordSearchRank`)                      | `0.4167`    | `0.9750` | `1.0000` | `0.203 ms`        |
| **Hybrid Semantic** (`hybridSemanticSearch`, zero-key fallback) | `0.4333`    | `1.0000` | `1.0000` | `1.539 ms`        |

### Key Observations

- **Recall@3 improved from `0.9750` to `1.0000`** (`+2.5` percentage points) and **Precision@3 improved from `0.4167` to `0.4333`** on paraphrased queries (e.g., `"build online shop with checkout payments"` matching both Shopify and Next.js Stripe SaaS gigs without requiring exact keyword matches).
- Average hybrid query latency (`1.539 ms`) remains well under `10 ms` per query with zero external API round-trips.

---

## 2. FinOps Telemetry Summary (Measured Run)

| Metric                                    | Measured Value                    |
| ----------------------------------------- | --------------------------------- |
| Total Embedding Operations                | `340`                             |
| Cache Hits                                | `304` (`89.41%` cache hit rate)   |
| Error Count / Rate                        | `0` (`0.00%`)                     |
| Prompt Tokens (uncached embeddings)       | `648`                             |
| Completion Tokens                         | `0`                               |
| Estimated USD Cost (local fallback)       | `\$0.00`                          |
| Embedding Latency (`p50` / `p95` / `avg`) | `0.02 ms` / `0.29 ms` / `0.06 ms` |

---

## 3. Reproducing Locally

```bash
npx tsx scripts/evaluate-semantic-search.ts
pnpm vitest run tests/unit/ai-semantic-eval.spec.ts tests/security/ai-pii-guardrails.spec.ts
```

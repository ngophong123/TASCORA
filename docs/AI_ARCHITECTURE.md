# TASCORA AI-Powered Marketplace & FinOps Architecture (Phase 4F)

> **Privacy & Safety Boundary:** TASCORA AI endpoints operate strictly on non-sensitive marketplace catalog/brief text. Passwords, JWTs, Stripe keys, KYC documents, `documentNumber`, `dateOfBirth`, emails, and national ID digit patterns are rejected or redacted (`sanitizeTextForAi` / `assertNoForbiddenAiPayload`) prior to processing. Trust & Safety AI outputs are **advisory only** and never auto-ban accounts or block payments.

---

## 1. Architecture Components

1. **Hybrid Semantic + Keyword Search (`GET /api/v1/services/semantic-search`):**
   - Combines lexical term overlap (`30%`), concept-aware deterministic vector cosine similarity (`65%`), and normalized seller rating tie-break (`5%`).
   - **Zero-Key Graceful Fallback:** When `AI_PROVIDER_API_KEY` is unset (default in local/CI/portfolio demo), falls back cleanly to deterministic hashed + concept-expanded 64-dim unit embeddings with an in-memory LRU cache (`1000` entries), ensuring zero runtime crashes and reproducible CI evaluation.
   - **PostgreSQL `pgvector` Trade-Off Evaluation:** Because TASCORA's current catalog fits cleanly in single-query candidate sets (`<= 100` active services) and Neon/CI images do not enable `pgvector` by default in `postgres:15-alpine`, migrating Prisma to raw SQL `vector(1536)` columns would break zero-config `infrastructure-acceptance.yml` reproducibility without measurable benefit at portfolio scale. Introducing `pgvector` is deferred until catalog volume exceeds `10,000+` published services.
2. **Schema-Validated Project Brief Assistant (`POST /api/v1/services/brief-assistant`):**
   - Authenticated endpoint validating structured JSON output via `projectBriefOutputSchema` (Zod): `summary`, `suggestedCategory`, `deliverables`, `requiredSkills`, `estimatedComplexity`, `clarifyingQuestions`, and `advisoryOnly: true`.
3. **Non-Destructive Admin Trust & Safety Advisory (`POST /api/v1/admin/ai/trust-safety/advisory`):**
   - Strictly `ADMIN`-only endpoint generating `riskScore` (`0–100`), `severity` (`LOW`/`MEDIUM`/`HIGH`), human-review warning flags, and `automatedEnforcementTaken: false`.
   - Never suspends users, rejects listings automatically, or blocks payments.
4. **FinOps Telemetry (`GET /api/v1/admin/ai/finops/summary`):**
   - Tracks total calls, embedding cache hit rate, error rate, prompt/completion tokens, estimated USD cost, and latency (`p50`, `p95`, `avg`) per operation in `FinOpsTracker` (`apps/api/src/modules/service/ai-finops.ts`).

# ADR 001: Modular Monolith in a `pnpm` Workspace

- **Status:** Accepted & Implemented
- **Scope:** Repository architecture (`apps/web`, `apps/api`, `prisma/`, `packages/`)

## Context

TASCORA spans buyer discovery, seller onboarding, service catalog management, orders, escrow ledger accounting, disputes, real-time chat, and seller KYC review. Splitting these domains into separate microservices early would introduce distributed transactions across orders, escrow, refunds, and notifications, while increasing operational overhead for a single-team repository.

## Decision

Organize the repository as a **`pnpm` workspace monorepo** with two deployable applications (`apps/web` Next.js 16 frontend and `apps/api` Express 4 + Socket.IO backend) sharing a single PostgreSQL schema (`prisma/schema.prisma`). Within `apps/api/src/modules/`, isolate each business capability behind its own `route` -> `controller` -> `service` structure.

## Consequences

- **Positive:** Atomic ACID transactions span `Order`, `Transaction`, `Escrow`, `FinancialEntry`, `Refund`, `MarketplaceDispute`, and `ProviderEvent` without two-phase commits. Strict TypeScript typechecking and Vitest suites validate cross-module contracts in one pipeline.
- **Trade-offs:** API and real-time Socket.IO currently scale as a single replica because Socket.IO and `express-rate-limit` use in-memory stores. Shared workspace packages (`packages/ui`, `packages/types`, `packages/config`) remain stubs until duplication justifies extraction.

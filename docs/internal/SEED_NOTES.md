# TASCORA Seed & Test Data Reference Guide

This document catalogs the deterministic mock/seed data generated for local testing, QA, and Playwright E2E suites.

Regenerate data anytime with:

```bash
npm run seed
# or
pnpm seed
```

---

## Phase 1: Users, Freelancers & Admin Entity Roster

### Generation Overview

- **Random Seed**: Fixed seed `42` using `@faker-js/faker`. Every run reproduces the exact same IDs, names, ratings, and stats.
- **Total Users Generated**: 46
  - **Admin Account**: 1
  - **Freelancers-only**: 29
  - **Clients-only**: 5
  - **Dual-Role (Both Freelancer & Client)**: 11
  - **Total Freelancer Profiles Available**: 40 (29 + 11)
  - **Total Client Profiles Available**: 16 (5 + 11)

---

## 1. Seeded Admin Test Account

> [!IMPORTANT]
> Admin credentials are **never committed** as plain literals in source code.
> They are sourced dynamically from environment variables:
>
> - Email: `process.env.SEED_ADMIN_EMAIL` (default placeholder: `admin@example.com`)
> - Password: `process.env.SEED_ADMIN_PASSWORD` (default placeholder: `changeme123`)
> - To customize locally without committing, place real values in `.env.local` (already gitignored).

| Property          | Value                                          | Notes                                 |
| :---------------- | :--------------------------------------------- | :------------------------------------ |
| **ID**            | `usr-admin`                                    | Fixed ID for Playwright selectors     |
| **Email**         | Sourced from `SEED_ADMIN_EMAIL`                | Default: `admin@example.com`          |
| **Password Hash** | Bcrypt hashed (10 rounds)                      | Pre-computed during seed generation   |
| **Role**          | `"admin"`                                      | Full system administrative privileges |
| **Name**          | `TASCORA System Administrator`                 | Display name                          |
| **Title**         | `Platform Trust, Safety & Operations Director` | Header badge                          |
| **Status**        | `active`                                       | Verified & online                     |

---

## 2. Fixed Reference Freelancers (Homepage & Regression Tests)

These 4 profiles match the initial curated `FEATURED_FREELANCERS_DATA` on the homepage and will remain stable across all future seed regenerations:

| ID        | Name             | Role         | Primary Domain                                      | Rating | Reviews | Starting Price | Country       |
| :-------- | :--------------- | :----------- | :-------------------------------------------------- | :----- | :------ | :------------- | :------------ |
| **`f-1`** | Alexandre Moreau | `both`       | Senior Full-Stack Architect (Next.js, Node.js)      | 4.99   | 42      | $350           | France        |
| **`f-2`** | Helena Rostova   | `freelancer` | Principal Brand & Product Designer (Figma, SaaS UX) | 5.00   | 38      | $280           | Estonia       |
| **`f-3`** | Marcus Vance     | `freelancer` | AI Engineer & Research Lead (LangChain, RAG)        | 4.96   | 29      | $420           | United States |
| **`f-4`** | Sophia Lindqvist | `freelancer` | B2B SaaS Growth & SEO Strategist                    | 4.94   | 51      | $190           | Sweden        |

---

## 3. Dedicated Client Accounts

| ID                 | Name           | Company                     | Email                           | Country        | Orders |
| :----------------- | :------------- | :-------------------------- | :------------------------------ | :------------- | :----- |
| **`usr-client-1`** | Marcus Thorne  | Fintech Corp Ltd            | `marcus.thorne@fintechcorp.io`  | United Kingdom | 18     |
| **`usr-client-2`** | David Sterling | Apex Capital Ventures       | `david.sterling@apexcap.com`    | United States  | 14     |
| **`usr-client-3`** | Emily Zhang    | Nexus AI Ventures           | `emily.zhang@nexusventures.sg`  | Singapore      | 25     |
| **`usr-client-4`** | Rachel Adams   | Horizon Health Technologies | `rachel.adams@horizonhealth.ca` | Canada         | 11     |
| **`usr-client-5`** | Liam O'Connor  | Nova Dynamics AI            | `liam.oconnor@novadynamics.ie`  | Ireland        | 9      |

---

## 4. Specific Edge Cases Catalog

The following entities were deliberately constructed to test extreme UI states, text overflow, and edge cases in Playwright tests:

### Edge Case 1: Ultra-Long Name & Multi-Paragraph Bio (Text Overflow & Wrap)

- **ID**: `usr-edge-overflow`
- **Name**: `Dr. Bartholomew Alexander Montgomery-Fitzgerald III`
- **Title**: `Executive Distinguished Systems Architect & Global Enterprise Transformation Lead Specialist`
- **Bio**: 25+ years enterprise multi-cloud banking fabric description (320 characters).
- **QA Test Purpose**: Validates that cards, dropdowns, table cells, and profile headers do not break layout or overflow horizontally.

### Edge Case 2: Brand-New Freelancer (Empty States)

- **ID**: `usr-edge-brandnew`
- **Name**: `Oliver Bennett`
- **Rating**: `0.0`
- **Reviews Count**: `0`
- **Completed Orders**: `0`
- **Level**: `"NEW"`
- **QA Test Purpose**: Validates empty review listings, "No reviews yet" badges, and zero-state analytics widgets.

### Edge Case 3: Rapid Turnaround (< 15 mins Response Time)

- **ID**: `usr-edge-fast-response`
- **Name**: `Chloe Nguyen (Minh Chau)`
- **Country**: Vietnam (`Hanoi`)
- **Response Time**: `0-day (< 15 mins)`
- **Rating**: `5.0` (74 reviews)
- **QA Test Purpose**: Tests instant response time formatting, green status indicators, and rapid badge styling.

### Edge Case 4: Consultative Extended Turnaround (Long Response Time)

- **ID**: `usr-edge-slow-response`
- **Name**: `Torsten Lindemann`
- **Country**: Germany (`Munich`)
- **Response Time**: `Within a week`
- **QA Test Purpose**: Tests multi-day response time strings and warning/neutral badge formatting.

### Edge Case 5: Suspended Account

- **ID**: `usr-edge-suspended`
- **Name**: `Sergei Romanov`
- **Status**: `"suspended"`
- **Available**: `false`
- **Response Time**: `N/A (Suspended)`
- **QA Test Purpose**: Tests disabled CTA buttons ("Hire Me" / "Message"), account warning banners, and profile exclusion in public searches.

---

## 5. Summary Table for Test Fixtures

| Fixture Name                | ID                       | Primary Assertion Use Case                     |
| :-------------------------- | :----------------------- | :--------------------------------------------- |
| **Admin User**              | `usr-admin`              | Admin dashboard access, permission gates       |
| **Reference Freelancer**    | `f-1`                    | Featured showcase, gig owner reference         |
| **Overflow Edge Case**      | `usr-edge-overflow`      | CSS text truncation, line clamp, mobile layout |
| **Empty State Edge Case**   | `usr-edge-brandnew`      | Zero reviews, initial onboarding UI            |
| **Fast Response Edge Case** | `usr-edge-fast-response` | Instant turnaround badge formatting            |
| **Slow Response Edge Case** | `usr-edge-slow-response` | Weekly turnaround string formatting            |
| **Suspended Account**       | `usr-edge-suspended`     | Inactive status handling, disabled actions     |

---

## Phase 2: Gigs & Service Catalog Entity Roster

### Generation Overview

- **Deterministic Fixed Seed**: `42`
- **Total Gigs Generated**: 68 (distributed across all 8 market categories / 5 parent slugs)
  - **Web Development** (`programming` / `nextjs`, `fullstack`, `api`): 24 gigs
  - **UI/UX & Design** (`design` / `figma`, `design-systems`, `mobile-app`): 16 gigs
  - **AI & Automation** (`ai` / `llm`, `rag`, `agents`): 13 gigs
  - **Technical SEO & Growth** (`marketing` / `seo`, `growth`, `analytics`): 7 gigs
  - **Technical Writing** (`writing` / `documentation`, `whitepapers`): 8 gigs
- **Structure per Gig**:
  - 3 Package Tiers: `BASIC`, `STANDARD`, `PREMIUM` (with dynamic delivery days, revision quotas, features)
  - 2 to 6 Add-ons (express delivery, security audits, Docker packaging, E2E suites)
  - 3 to 4 FAQs with domain-specific technical Q&A
  - High-resolution gallery item placeholders with descriptive alt tags
  - Realistic statistical profiles (`impressions`, `clicks`, `orders`, `revenue`, `conversionRate`)

---

## 1. Fixed Reference Gigs (E2E & Marketplace Core)

| Gig ID                       | Slug                                                                    | Seller                   | Starting Price | Tier Structure                               | Notes                                                                            |
| :--------------------------- | :---------------------------------------------------------------------- | :----------------------- | :------------- | :------------------------------------------- | :------------------------------------------------------------------------------- |
| **`gig-1`** (alias: `srv-1`) | `full-stack-next-js-15-node-js-production-architecture-with-clean-code` | Alexandre Moreau (`f-1`) | $250           | Basic: $250, Standard: $450, Premium: $850   | Target of `gig-detail-and-order.spec.ts`. Addons: Express ($50), Revision ($35). |
| **`gig-2`**                  | `figma-to-production-design-system-with-tokens-and-atomic-components`   | Helena Rostova (`f-2`)   | $180           | Basic: $180, Standard: $350, Premium: $650   | Design system & token architecture                                               |
| **`gig-3`**                  | `production-rag-agent-with-hybrid-search-and-evals`                     | Marcus Vance (`f-3`)     | $320           | Basic: $320, Standard: $600, Premium: $1,200 | Enterprise AI & vector search pipelines                                          |
| **`gig-4`**                  | `enterprise-core-web-vitals-and-technical-seo-audit-with-remediation`   | Sophia Lindqvist (`f-4`) | $150           | Basic: $150, Standard: $280, Premium: $520   | Performance & Core Web Vitals optimization                                       |

---

## 2. Phase 2 Edge Cases Catalog

| Edge Case Name               | Gig ID                    | Key Characteristics                                                               | QA & Playwright Assertion Purpose                                                                     |
| :--------------------------- | :------------------------ | :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Single-Tier Gig**          | `gig-edge-single-tier`    | Only `BASIC` package tier exists ($350). No Standard or Premium tiers.            | Verifies package selector tabs collapse or handle absent tiers without throwing runtime errors.       |
| **Extreme Title Overflow**   | `gig-edge-overflow-title` | Title: 320 characters describing multi-cloud enterprise compliance.               | Verifies line clamps, text truncation, responsive card heights, and breadcrumb wrap behavior.         |
| **Zero Orders & Cold Start** | `gig-edge-zero-orders`    | Owned by Oliver Bennett (`usr-edge-brandnew`). 0 orders, 0 reviews, 0 conversion. | Verifies zero-state ratings, empty review sections, and zero metrics on seller dashboards.            |
| **Draft Catalog Item**       | `gig-edge-draft`          | Status: `"draft"`. Starts unlisted on public catalog.                             | Tests "Draft" filter tabs on Seller Dashboard (`/dashboard/gigs`) and status badge colors.            |
| **Max Add-ons Expansion**    | `gig-edge-max-addons`     | 6 separate add-ons ranging from $60 to $150.                                      | Tests add-on checkbox stacking, total dynamic price recalculation, and checkout drawer scrollability. |

---

## 3. Data Files Generated in Phase 2

- `apps/web/src/data/gigs.ts`: Complete catalog (`MOCK_GIGS`, `KNOWN_TEST_GIGS`, `getGigById`, `getGigBySlug`, `getGigsBySellerId`, `getGigsByCategory`).
- `apps/web/src/data/dashboard/gigs.ts`: Seller dashboard format (`INITIAL_GIGS`) with metrics, impressions, status, and requirement prompts.
- `apps/web/src/app/[locale]/services/[id]/page.tsx`: Dynamic mock resolution fallback supporting all 68 generated gigs with full packages and add-ons.

---

## Phase 3: Orders, Milestone Contracts & Reviews Roster

### Generation Overview

- **Deterministic Fixed Seed**: `42`
- **Total Orders Generated**: 85
  - **Completed Orders**: 63 (74.1%)
  - **Active In-Progress Orders**: 11 (12.9%)
  - **Delivered / In-Review Orders**: 5 (5.9%)
  - **Cancelled / Refunded Orders**: 6 (7.1%)
- **Total Reviews Generated**: 214
  - **5-Star Reviews**: 200
  - **4-Star Reviews**: 12
  - **3-Star Reviews**: 1
  - **1-Star Reviews**: 1
  - **Reviews with Seller Responses**: 19
- **Strict Cross-Referencing & Integrity Guarantees**:
  - **Milestone Sum Invariant**: Every order's milestone amounts sum _exactly_ to `order.totalAmount`. The final milestone amount is calculated as `price - sum(previous milestones)`.
  - **User & Freelancer ID Resolution**: Every `order.client.id` resolves to a real user in `ALL_CLIENTS`, and every `order.freelancer.id` resolves to the verified seller of `order.gigId` in `ALL_FREELANCERS`.
  - **Review-to-Order Linkage**: Every review generated from an order strictly references `order.id`, and `review.gigId` strictly matches `order.gigId`.
  - **Deterministic Relative Dates**: Formatted relative to fixed anchor date `2026-03-25T12:00:00Z` to prevent date drift across future test runs.

---

## 1. Fixed Reference Orders (Playwright Core)

| Order ID       | Title                                                   | Gig ID  | Tier     | Total | Status      | Client                          | Freelancer               |
| :------------- | :------------------------------------------------------ | :------ | :------- | :---- | :---------- | :------------------------------ | :----------------------- |
| **`ORD-9481`** | Full-Stack Next.js 15 & Node.js Production Architecture | `gig-1` | STANDARD | $450  | `active`    | Marcus Thorne (`usr-client-1`)  | Alexandre Moreau (`f-1`) |
| **`ORD-9420`** | Figma to Production Design System with Tokens           | `gig-2` | STANDARD | $350  | `delivered` | Marcus Thorne (`usr-client-1`)  | Helena Rostova (`f-2`)   |
| **`ORD-9412`** | Production RAG Agent with Hybrid Search and Evals       | `gig-3` | STANDARD | $600  | `completed` | David Sterling (`usr-client-2`) | Marcus Vance (`f-3`)     |
| **`ORD-9390`** | Enterprise Core Web Vitals and Technical SEO Audit      | `gig-4` | STANDARD | $280  | `cancelled` | Marcus Thorne (`usr-client-1`)  | Sophia Lindqvist (`f-4`) |

---

## 2. Phase 3 Order Edge Cases Catalog

| Edge Case Name                            | Order ID     | Key Characteristics                                                                                                       | QA & Playwright Assertion Purpose                                                                          |
| :---------------------------------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------- |
| **Disputed / Cancelled Contract**         | `ORD-EDGE-1` | Scope disagreement during penetration testing. Cancelled with full escrow refund. Tied to 1-star review `rev-edge-1star`. | Tests cancelled status badge, refund display, and review linking on refunded orders.                       |
| **Enterprise 5-Milestone Order**          | `ORD-EDGE-2` | $5,200 multi-month cloud cutover. 5 milestones ($1,000 to $1,200 each). Includes SOC2 audit files.                        | Tests multi-milestone timeline rendering, high dollar formatting ($5,200), and large attachment downloads. |
| **Rapid 24-Hour Turnaround Order**        | `ORD-EDGE-3` | $300 ($250 Basic + $50 Express Add-on). Single milestone completed within 18 hours.                                       | Tests express add-on price computation and single-milestone completed contracts.                           |
| **Multi-Revision Order**                  | `ORD-EDGE-4` | 3 revision requests logged (`rev-edge-4-1`, `rev-edge-4-2`, `rev-edge-4-3`) for Stripe webhook logic.                     | Tests revision history accordion, revision counter badge, and requested change notes in drawer.            |
| **Freshly Initiated Order (0% Progress)** | `ORD-EDGE-5` | Created on March 24, 2026. All milestones pending. Owned by new freelancer `Oliver Bennett`.                              | Tests empty milestone progress bars, initial onboarding actions, and kick-off chat state.                  |

---

## 3. Phase 3 Review Edge Cases Catalog

| Edge Case Name                   | Review ID           | Gig ID  | Rating  | Buyer                           | Key Characteristics & QA Purpose                                                                                                                    |
| :------------------------------- | :------------------ | :------ | :------ | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Constructive Critical Review** | `rev-edge-critical` | `gig-1` | 3 Stars | David Sterling (`usr-client-2`) | Contains 3-star rating, aspect breakdown (Communication: 4, Quality: 4, Value: 3), and official seller response explaining ECS Terraform patch.     |
| **Long Case Study Review**       | `rev-edge-long`     | `gig-1` | 5 Stars | Marcus Thorne (`usr-client-1`)  | 4-paragraph technical analysis of Clean Architecture, Prisma ORM indexing, and Vitest/Playwright CI/CD. Tests text clamp and "Read more" expanders. |
| **1-Star Disputed Review**       | `rev-edge-1star`    | `gig-1` | 1 Star  | Emily Zhang (`usr-client-3`)    | 1-star review linked to `ORD-EDGE-1` with seller rebuttal regarding scope boundaries and prompt escrow refund.                                      |

---

## 4. Data Files Generated in Phase 3

- `apps/web/src/data/dashboard/orders.ts`: Complete order list (`INITIAL_ORDERS`, `ALL_ORDERS`, `KNOWN_TEST_ORDERS`, `getOrderById`, `getOrdersByClientId`, `getOrdersByFreelancerId`, `getOrdersByStatus`).
- `apps/web/src/data/reviews.ts`: Complete review list (`MOCK_REVIEWS`, `KNOWN_TEST_REVIEWS`, `getReviewById`, `getReviewsByGigId`, `getReviewsBySellerId`, `getReviewsByBuyerId`, `getAverageRatingForGig`).
- `apps/web/src/app/[locale]/services/[id]/page.tsx`: Dynamic service detail review resolution displaying real seed reviews and seller responses.

---

## Phase 4: Direct Messages, Notifications & Financial Escrow Ledger

### Generation Overview

- **Deterministic Fixed Seed**: `42`
- **Total Conversations Generated**: 10
  - Strictly linked to verified orders (`ORD-9481`, `ORD-9420`, `ORD-9412`, `ORD-EDGE-1`, `ORD-EDGE-2`, `ORD-EDGE-3`, `ORD-EDGE-4`, `ORD-EDGE-5`, `ORD-9390`, `ORD-8015`)
  - Shared code, Figma, and PDF file attachments
  - Multi-turn back-and-forth technical dialogue, unread indicators, and archived status
- **Total Notifications Generated**: 16
  - Covering milestone payment approvals, order deliverables, message alerts, system badges, and escrow refunds
  - Multi-role tags (`CLIENT`, `FREELANCER`, `BOTH`), `read` states, and relative timestamps
- **Total Financial Transactions Generated**: 18
  - Reconciled against orders and milestones
  - Order milestone payments released (`ORDER_PAYMENT`)
  - Escrow deposits locked (`ESCROW_DEPOSIT`, `ESCROW_HELD`)
  - Platform withdrawals to Stripe Express & Bank ACH (`WITHDRAWAL`)
  - Escrow refund for cancelled contract `ORD-EDGE-1` (`REFUND`)
  - 6-month earnings chart data for freelancers and spending chart data for clients

---

## 1. Direct Messages & Chat Threads Catalog

| Conv ID       | Order ID     | Partner                                 | Role / Title                       | Key Context & QA Assertion Purpose                                                                                       |
| :------------ | :----------- | :-------------------------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **`conv-1`**  | `ORD-9481`   | Alexandre Moreau (`f-1`)                | Senior Full-Stack Architect        | Reference conversation for Next.js 15 monorepo architecture, Prisma schemas, and Docker Compose files.                   |
| **`conv-2`**  | `ORD-9420`   | Helena Rostova (`f-2`)                  | Principal Brand & Product Designer | Design system library handover, token aliases, and dark mode variants.                                                   |
| **`conv-3`**  | `ORD-9412`   | Marcus Vance (`f-3`)                    | AI Engineer & Research Lead        | RAG pipeline evaluation benchmarks, Qdrant vector retrieval, and payment signoff.                                        |
| **`conv-4`**  | `ORD-EDGE-1` | Emily Zhang (`usr-client-3`)            | Client • Nexus AI Ventures         | Disputed order dialogue detailing scope boundary around penetration testing, ending with mutual escrow refund agreement. |
| **`conv-5`**  | `ORD-EDGE-2` | David Sterling (`usr-client-2`)         | Client • Apex Capital Ventures     | Enterprise 5-milestone contract ($5,200), Vanta SOC2 compliance auditor reviews, and Terraform multi-region IaC.         |
| **`conv-6`**  | `ORD-EDGE-4` | Liam O'Connor (`usr-client-5`)          | Client • Nova Dynamics AI          | 3 revision cycles discussing Stripe customer portal return URLs and webhook retry idempotency.                           |
| **`conv-7`**  | `ORD-EDGE-5` | Oliver Bennett (`usr-edge-brandnew`)    | Junior Full-Stack Engineer         | Brand-new onboarding conversation, GitHub repository invite, and initial npm audit check.                                |
| **`conv-8`**  | `ORD-9390`   | Sophia Lindqvist (`f-4`)                | B2B SaaS Growth & SEO Strategist   | Technical SEO audit and mutual cancellation discussion following internal restructuring.                                 |
| **`conv-9`**  | `ORD-8015`   | Chloe Nguyen (`usr-edge-fast-response`) | Senior Cloud & DevOps Engineer     | Rapid Docker container optimization reducing image size from 1.8GB to 142MB.                                             |
| **`conv-10`** | `ORD-EDGE-3` | Rachel Adams (`usr-client-4`)           | Client • Horizon Health            | 24-hour turnaround express delivery handover for successful investor pitch demo.                                         |

---

## 2. Multi-Role Notifications System Catalog

| Notification ID | Type      | Role         | Title                             | Summary / Target Link                                            |
| :-------------- | :-------- | :----------- | :-------------------------------- | :--------------------------------------------------------------- |
| **`notif-1`**   | `payment` | `FREELANCER` | Milestone payment approved        | Milestone 1 ($150.00) released for ORD-9481                      |
| **`notif-2`**   | `order`   | `FREELANCER` | New order received!               | David Sterling ordered Enterprise Cutover ORD-EDGE-2 ($5,200.00) |
| **`notif-3`**   | `message` | `BOTH`       | New message from Helena Rostova   | Figma design library published                                   |
| **`notif-4`**   | `order`   | `CLIENT`     | Order delivered for review        | Helena Rostova submitted deliverables for ORD-9420               |
| **`notif-5`**   | `payment` | `CLIENT`     | Milestone Escrow funded           | $350.00 escrow deposit locked for ORD-EDGE-5                     |
| **`notif-6`**   | `system`  | `FREELANCER` | Profile strength updated          | TOP RATED Specialist badge unlocked (+45% visibility)            |
| **`notif-7`**   | `order`   | `FREELANCER` | Revision requested                | Liam O'Connor requested Revision #3 on ORD-EDGE-4                |
| **`notif-8`**   | `payment` | `CLIENT`     | Escrow refund confirmed           | $350.00 refunded for cancelled order ORD-EDGE-1                  |
| **`notif-9`**   | `system`  | `FREELANCER` | 5-Star Review Received            | Marcus Thorne left comprehensive architecture review             |
| **`notif-10`**  | `payment` | `FREELANCER` | Payout transfer initiated         | $1,500.00 instant payout sent to Stripe Express                  |
| **`notif-11`**  | `order`   | `FREELANCER` | New contract signed               | Rachel Adams signed 24h express order ORD-EDGE-3                 |
| **`notif-12`**  | `system`  | `BOTH`       | SOC2 Compliance Verified          | Vanta auditor approved infrastructure for ORD-EDGE-2             |
| **`notif-13`**  | `message` | `CLIENT`     | New message from Alexandre Moreau | Pushed architecture docs and unit tests                          |
| **`notif-14`**  | `payment` | `CLIENT`     | Invoice #INV-2026-091 ready       | Tax invoice available for ORD-9481 ($450.00)                     |
| **`notif-15`**  | `message` | `CLIENT`     | New message from Oliver Bennett   | Repository cloned, running preliminary audit                     |
| **`notif-16`**  | `system`  | `FREELANCER` | Security scan passed              | Zero CVE vulnerabilities in production release build             |

---

## 3. Financial Ledger & Escrow Transactions Catalog

| Transaction ID         | Type            | Amount     | Order Ref    | Counterpart    | Method                    | Status      |
| :--------------------- | :-------------- | :--------- | :----------- | :------------- | :------------------------ | :---------- |
| **`TXN-ORD-9481-1`**   | `ORDER_PAYMENT` | +$150.00   | `ORD-9481`   | Marcus Thorne  | Tascora Escrow Release    | `COMPLETED` |
| **`TXN-ORD-9481-2`**   | `ESCROW_HELD`   | +$300.00   | `ORD-9481`   | Marcus Thorne  | Escrow Pending Clearance  | `PENDING`   |
| **`TXN-ORD-9412-1`**   | `ORDER_PAYMENT` | +$300.00   | `ORD-9412`   | David Sterling | Tascora Escrow Release    | `COMPLETED` |
| **`TXN-ORD-9412-2`**   | `ORDER_PAYMENT` | +$300.00   | `ORD-9412`   | David Sterling | Tascora Escrow Release    | `COMPLETED` |
| **`TXN-ORD-9420-1`**   | `ORDER_PAYMENT` | +$175.00   | `ORD-9420`   | Marcus Thorne  | Tascora Escrow Release    | `COMPLETED` |
| **`TXN-ORD-EDGE-3`**   | `ORDER_PAYMENT` | +$300.00   | `ORD-EDGE-3` | Rachel Adams   | Tascora Escrow Release    | `COMPLETED` |
| **`TXN-ORD-EDGE-2-1`** | `ORDER_PAYMENT` | +$1,000.00 | `ORD-EDGE-2` | David Sterling | Tascora Escrow Release    | `COMPLETED` |
| **`TXN-ORD-EDGE-2-2`** | `ORDER_PAYMENT` | +$1,200.00 | `ORD-EDGE-2` | David Sterling | Tascora Escrow Release    | `COMPLETED` |
| **`TXN-ORD-EDGE-1`**   | `REFUND`        | -$350.00   | `ORD-EDGE-1` | Emily Zhang    | Escrow Refund             | `COMPLETED` |
| **`TXN-WTH-1`**        | `WITHDRAWAL`    | -$1,500.00 | —            | —              | Stripe Express •••• 4242  | `COMPLETED` |
| **`TXN-WTH-2`**        | `WITHDRAWAL`    | -$2,200.00 | —            | —              | Bank of America •••• 9104 | `COMPLETED` |
| **`TXN-WTH-3`**        | `WITHDRAWAL`    | -$3,000.00 | —            | —              | Stripe Express •••• 4242  | `COMPLETED` |

---

## 4. Data Files Generated in Phase 4

- `apps/web/src/data/dashboard/messages.ts`: Complete chat threads (`MOCK_CONVERSATIONS`) with shared attachments, order context, and live messaging support.
- `apps/web/src/data/dashboard/notifications.ts`: Complete multi-role notifications roster (`MOCK_NOTIFICATIONS`).
- `apps/web/src/data/dashboard/payments.ts`: Financial ledger (`FREELANCER_TRANSACTIONS`, `CLIENT_INVOICES`, `FREELANCER_EARNINGS_SUMMARY`, `CLIENT_PAYMENTS_SUMMARY`, revenue/spending charts, saved payment methods).

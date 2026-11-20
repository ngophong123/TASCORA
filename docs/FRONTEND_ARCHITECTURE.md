# TASCORA Frontend Architecture (`apps/web`)

## 1. Framework & Routing

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS v4.
- **Localization (`next-intl`):** All 25 user-facing routes live under `apps/web/src/app/[locale]/` supporting `en` and `vi` locales configured in `apps/web/src/i18n/routing.ts` and `apps/web/src/proxy.ts`.
- **Locale-Aware Navigation:** Internal links and routers use `Link`, `useRouter`, `usePathname`, and `redirect` from `@/i18n/routing`. Post-login full-page navigation uses `resolvePostLoginRedirect` (`apps/web/src/lib/auth-redirect.ts`) to preserve the active locale while rejecting open redirects.

---

## 2. Route Groups

| Route Group              | Paths (`/[locale]...`)                                                                                                                                                                                                                                                   | Rendering Strategy                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public Marketplace**   | `/`, `/explore`, `/services`, `/services/[id]`, `/categories`, `/categories/[slug]`, `/freelancers/[id]`                                                                                                                                                                 | Server-rendered initial catalog (`catalog-server.ts`) paired with interactive client filter/detail islands                                                           |
| **Authentication**       | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`                                                                                                                                                                                            | Client forms backed by `/api/v1/auth/*` with CSRF header (`X-CSRF-Protection: 1`) and HTTP-only cookie sessions                                                      |
| **Role-Based Dashboard** | `/dashboard`, `/dashboard/orders`, `/dashboard/messages`, `/dashboard/gigs`, `/dashboard/gigs/new`, `/dashboard/gigs/[id]/edit`, `/dashboard/earnings`, `/dashboard/payments`, `/dashboard/saved`, `/dashboard/notifications`, `/dashboard/settings`, `/dashboard/admin` | Shared `DashboardLayout` + `DashboardProvider` (`DashboardContext.tsx`) wrapping sidebar, topbar, mobile drawer, command palette (`Cmd/Ctrl+K`), and toast container |
| **Seller Studio**        | `/seller/dashboard`                                                                                                                                                                                                                                                      | Dedicated seller overview combining `/api/v1/analytics/seller/dashboard`, `SellerFinancialOverview`, `AccountOnboardingPanel`, and `SellerKycPanel`                  |

---

## 3. Data Fetching & Auth Session Handling

- **`apps/web/src/lib/auth-client.ts` (`apiFetch`, `refreshSession`, `logoutSession`):**
  - Enforces `/api/v1/` path prefix.
  - Sends `credentials: "include"` for HTTP-only cookies and attaches cached Bearer tokens when present.
  - Automatically deduplicates concurrent `401` refreshes through a single in-flight `refreshPromise` calling `POST /api/v1/auth/refresh` with `X-CSRF-Protection: 1` before retrying the original request.
- **`apps/web/src/hooks/useApiResource.ts`:**
  - Provides `AbortController`-safe client data fetching (`data`, `error`, `loading`, `reload`) with path-change guards to prevent stale responses from overriding newer route states.
- **`apps/web/src/context/DashboardContext.tsx`:**
  - Centralizes `/api/v1/profile/me`, active role (`CLIENT` / `FREELANCER`, gated by `account.sellerProfile`), `/api/v1/orders/*`, `/api/v1/notifications` polling, and order status/delivery mutations.
- **Real-Time Messaging (`apps/web/src/hooks/useConversationSocket.ts`):**
  - Connects to the Express Socket.IO server with authenticated session credentials and triggers conversation reload revisions on verified room events.

---

## 4. UI State, Accessibility & Payment Truthfulness Patterns

- **Uniform Async Feedback (`apps/web/src/components/feedback/ApiState.tsx`):** Standardizes `role="status"` loading spinners, `role="alert"` error banners with retry callbacks, and empty-state messaging across dashboard pages.
- **Interactive Semantics:** Navigation actions use styled `<Link>` elements without nesting `<button>` inside `<a>`, interactive touch targets maintain `min-h-11` (`44px`), and modals/drawers trap focus via `useDialogFocus`.
- **Payment & Payout Truthfulness (`usePaymentCapability`):** Frontend checkout and payout buttons query backend payment capability and disable cleanly when `PAYMENT_PROVIDER=disabled`, while earnings views explicitly note that external seller payouts remain unavailable until a validated provider adapter exists.

---

## 5. Quality & Verification Toolchain

- Strict zero-warning ESLint (`pnpm lint:strict`) and strict TypeScript (`pnpm typecheck`).
- Unit regressions in `tests/unit/` (`dashboard-baseline-regressions.spec.ts`, `frontend-remediation.spec.ts`, `catalog-filter.spec.ts`, `catalog-data.spec.ts`).
- Fixture-backed Playwright E2E (`pnpm test:e2e --project=chromium`) and Lighthouse CI (`pnpm lhci:mobile`) executed on every PR targeting `main` via `.github/workflows/quality.yml`.

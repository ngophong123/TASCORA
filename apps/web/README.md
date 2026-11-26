# TASCORA Web Application (`apps/web`)

Frontend workspace (`web`) for the TASCORA freelance services marketplace monorepo.

## Tech Stack

- **Framework:** Next.js `16.4.6` (App Router, Turbopack)
- **UI & Styling:** React `19.2.8`, TypeScript `^5`, Tailwind CSS `^4`, `@base-ui/react`, Framer Motion, Lucide Icons
- **Internationalization:** `next-intl` (`en` and `vi` locales)
- **Realtime & Payments Client:** `socket.io-client`, `@stripe/stripe-js` (Stripe Test / Disabled mode only)
- **Testing & Quality:** ESLint (strict zero-warning gate), TypeScript (`tsc --noEmit`), Playwright + `@axe-core/playwright`, Lighthouse CI

## Package Manager & Workspace Prerequisites

This app lives inside the `pnpm` workspace (`packageManager: pnpm@12.4.1`). Install dependencies from the repository root rather than running `npm`, `yarn`, or `bun` inside `apps/web`:

```bash
# From repository root
pnpm install --frozen-lockfile
```

- **Local Web Port:** `http://localhost:3200` (`next dev -p 3200`)
- **Backend API Dependency:** Authenticated workflows, SSR catalog fetches, and Socket.IO messaging expect `apps/api` running on `http://localhost:4000` (configured via `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WEB_URL` in root `.env`).

## Common Commands

Run from the repository root (recommended):

```bash
# Start both Web (:3200) and API (:4000) in development mode
pnpm dev

# Run frontend-only dev server on http://localhost:3200
pnpm --filter web dev

# Typecheck and strict zero-warning ESLint
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web lint:strict

# Production build (requires public URLs at build time)
NEXT_PUBLIC_API_URL=http://localhost:4000 NEXT_PUBLIC_WEB_URL=http://localhost:3200 pnpm --filter web build

# Playwright E2E tests (fixture-backed)
pnpm --filter web test:e2e
pnpm --filter web test:e2e:ui
pnpm --filter web test:e2e:report
```

## Directory Layout & Localization

- `src/app/[locale]/` — `25` localized App Router pages covering public marketplace catalog/discovery, authentication, checkout/orders, buyer/seller messaging, seller onboarding/KYC, and dashboard workflows across `en` and `vi`.
- `messages/` — `en` and `vi` localization message catalogs consumed by `next-intl`.
- `src/i18n/` — `next-intl` routing and locale resolution (`@/i18n/routing`).
- `src/components/` — shared UI primitives (`@base-ui/react`), navigation, service cards, checkout, messaging, and dashboard components.
- `src/lib/` — typed API client, Socket.IO client helpers, and formatting utilities.
- `../../tests/e2e/` — Playwright end-to-end specs and accessibility checks executed from the repository root (`pnpm --filter web test:e2e`).

## Related Documentation

- [Repository Overview](../../README.md)
- [Frontend Architecture](../../docs/FRONTEND_ARCHITECTURE.md)
- [Known Limitations](../../docs/KNOWN_LIMITATIONS.md)

# TASCORA — Premium UI audit

Date: 2026-10-08. Scope: existing Next.js frontend only. Redis changes from the preceding task are preserved. No secrets, hosted data, migrations, payment or authorization changes.

## Evidence and architecture

Read root README, frontend README, MARKETPLACE_INTEGRATION_AUDIT, apps/web/AGENTS and installed Next 16 layout/accessibility/Image guidance. Stack: Next 16.3.5 App Router, React 19, next-intl EN/VI, Tailwind 4 CSS-first theme, Base UI/shadcn, Lucide, Framer Motion, Lenis. Reuse existing Button, Logo, cards/image mediation, API resource/states, catalog filters/chips/pagination, dashboard table/mobile cards and live forms.

Actual API paths exist for services/packages/reviews, public seller profiles, favorites, onboarding, orders/delivery/revisions, chat, account, notifications and admin review/categories. Preserve all request contracts and handlers. Admin is review/categories/financial controls, not a full suite of imaginary admin pages. Forgot/reset password have no existing pages; inspect backend support before presenting such actions.

Baseline homepage desktop rendered and visually reviewed (`premium-ui/before/home-1440.png`): excessive page length, repeated card/gradient compositions, weak distinction between discovery and illustrative financial/trust marketing. Mobile/tablet and listing/auth/dashboard baseline capture follows. Isolated preview initially encountered locale redirect loops and compilation timeout; preview-only explicit locale prefixes and offline cached Geist font faces permit render without modifying real locale routing. Tailwind source detection is scoped to frontend src to avoid scanning unrelated monorepo files. Before/after screenshots use explicit test-only API fixtures and are not hosted-data evidence.

## Findings by impact

| Impact   | Source evidence                                                                                                                  | Planned action                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Critical | Homepage mounts static partner/testimonial/statistic and fabricated product achievement content, despite illustrative disclaimer | Replace with truthful process content and live service/profile records; no unverifiable social proof         |
| High     | Auth labels lack htmlFor/id, errors lack announcement, password toggle targets small                                             | Semantic forms, autocomplete, accessible password controls and status/error feedback                         |
| High     | Mobile favorite invisible except desktop hover; 32px control                                                                     | Always-visible 44px action, pressed/focus state                                                              |
| High     | Mobile filter drawer lacks focus containment/restore                                                                             | Keyboard-safe dialog, preserve existing filter data                                                          |
| High     | Sort custom popup lacks keyboard behavior; search unnamed                                                                        | Native accessible sorting/search labels                                                                      |
| High     | API error accompanied by empty results, no retry                                                                                 | Distinct error/loading/empty states, retry using existing resource path                                      |
| High     | Nav/category copy contains unverifiable specialist counts; cards imply verification from seller level                            | Remove unsupported claims, retain actual ratings/counts only                                                 |
| Medium   | Shared CTA is gradient with colored hover glow; auth and marketing use mesh/blur and large shadows                               | Solid brand indigo, warm neutral surfaces, restrained elevation                                              |
| Medium   | Literal palette/very small typography and repeated complex entrance effects                                                      | Semantic tokens, legible scale, selective motion/reduced-motion                                              |
| Medium   | Global page transition transforms wrapper of sticky/fixed elements                                                               | Remove route-wide transform, use opacity where necessary                                                     |
| Medium   | Assets: SHA256 found 19 duplicate groups spanning 41 files                                                                       | Document asset limitations; avoid claiming stock is actual seller work; use service-provided gallery records |
| Medium   | Catalog downloads every page for local filters                                                                                   | Retain current behavior/API contract; disclose scale limitation rather than unsafe pagination rewrite        |
| Low      | Disabled unimplemented newsletter occupies footer                                                                                | Replace with purposeful existing navigation, no fake form                                                    |

## Direction and system

“Independent work, thoughtfully connected”: warm ivory/paper surfaces, ink text, a distinctive deep indigo, crisp borders, ample but measured whitespace. Geist retained with EN/VI support; editorial display 40–84px, headings 20–48px, body 16px/1.6, secondary 14px, label/caption 12px. Container 1280px; 4/8px spacing rhythm; 8–16px radius; subtle card shadow, elevated shadow reserved for overlays. Semantic background/surface/elevated/foreground/muted/primary/secondary/accent/border/focus/success/warning/error/disabled tokens.

Keep light mode as supported product mode; retain consistent dark token hook, do not advertise untested full dark-mode support. Motion 120–220ms for feedback, opacity/transform, reduced-motion honored; no always-on parallax/tilt or blur entrance for core content. Images have reserved aspect ratio and responsive sizes. No new large animation dependency or image download.

## Implementation and gates

1. Design tokens and primitives; header/navigation/footer. Render + lint/typecheck before homepage.
2. Homepage: editorial search-led hero, live service selection, category navigation, clear buyer/seller steps, live freelancer profiles. No fictitious trust counters/partners.
3. Explore then detail: accessible controls, card hierarchy, responsive drawer and gallery/package readability. Preserve URL filters/order/payment state.
4. Auth/verification/onboarding; then buyer, seller and existing admin dashboard. Preserve actual empty/loading/error states, no invented metrics.
5. Shared motion/state refinements, viewport matrix 360/390/768/1280/1440/1920, keyboard/interactions, production build and SEO inspection.

Each group requires rendered inspection, related lint/typecheck and interaction regression before being marked complete. Any unavailable visual/build proof remains explicitly pending in PREMIUM_UI_HANDOFF.md. No specific Lighthouse or Core Web Vitals score will be claimed without measurement.

# TASCORA Premium UI — progress / evidence

2026-10-08. Work in progress; do not mark whole redesign complete from intermediate passes.

## Completed source groups and current evidence

- Audit/design system: semantic paper/ink/indigo tokens, Geist preserved, focus/skip link, quieter buttons/inputs, no route-wrapper transforms. Frontend lint/typecheck passes recorded per group.
- Header/footer: keyboard disclosure, mobile focus/restore/scroll locking, keyboard language selection, actual navigation only. Render 390/1440 and keyboard tests pass.
- Homepage: search-led editorial composition with live API services/categories/profiles, no fabricated partnership/testimonial/statistics/product finance content. Render 390/768/1440 and search URL test pass.
- Cards/listings: shared card/grid/list states, visible 44px favorite, real counts/prices, no inferred verification/escrow; both /services and /explore preserve filtering/API parameters. Search/sort/clear, retry/outage, favorites reload, drawer focus tests pass. Render mobile/tablet/desktop for /services, mobile/desktop for /explore.
- Detail: accessible gallery/package summary, real FAQs/reviews only, safe text/Markdown presentation without HTML. Render three widths; gallery changes actual source/package price test pass. Existing four disabled-provider checkout/payment/refund/seller/admin controls tests pass; no financial logic changed.
- Auth: premium Login/Register/Verify, associated labels/autocomplete, password visibility/loading/error/status, no dead password-recovery link. No forgot/reset backend exists. Nine rendered cases pass; verify/refresh/profile and sign-in/registration tests pass after fixing test selector casing and Next's separate route-announcer alert ambiguity.
- Public categories/profile: actual taxonomy child service integration test pass; six rendered cases pass. Removed unsupported cover, identity/escrow claims; neutral order count.
- Buyer dashboard/shared shell: actual metrics, responsive orders overview, compact profile editor, real activity empty state, truthful nav counters. 390/1440 pass; initial768 overflow exposed after removing body overflow masking, fixed topbar and retested768 pass.
- Public axe scan: initial15/18 pass, failures were detail rating contrast and overlaid budget targets. Fixed all three and rerun3/3 pass. Final-source broad scan still pending.
- Image audit: 161 local assets, 30 duplicate groups including alias avatars and 19 service-related groups, 4 extension/format mismatches, zero non-avatar assets below640×360. No assets replaced/downloaded. See PREMIUM_IMAGE_AUDIT.md.
- Unit security/presentation: two ServiceDescription tests pass (HTML/script escaping + semantic text).
- Production build snapshot after homepage/listing: PASS42 generated pages, webpack; warning for existing middleware/Edge deprecation + Node API in Edge dependency. Final-source build remains pending.

## Ongoing / remaining

Seller route/layout, buyer supporting settings/saved/notifications/messages/payments, orders table/service editor, admin existing review/category UI; final responsive114-case route matrix at360/390/768/1280/1440/1920, broad axe/functional regressions, final lint/typecheck/build, SEO/OG and source review.

No verified Core Web Vitals/Lighthouse score. Existing whole-catalog client filtering and duplicated category/favorite requests remain scale limitations. Provider, actual content/image provenance and financial release proof remain outside this local UI task. Service-authored FAQ text in fixtures includes escrow wording; no censorship/replacement of persisted seller content was introduced.

## Reproduction and isolation

`node scripts/premium-preview.mjs` creates ignored `.premium-preview` from only whitelisted frontend source/assets/config, never copies/reads .env. Uses existing dependency junctions, cached real Geist assets offline and preview-only `localePrefix:always` workaround for observed Next16 dev rewrite loop. Local server3210; browser routes external requests to explicit fixtures or abort. Production source routing/font mechanism remain unchanged.

`node scripts/premium-preview.mjs --sync-only` updates preview after source group finishes. `pnpm.cmd exec playwright test --config playwright.premium.config.ts` runs dedicated fixture suite; `PREMIUM_PHASE` controls before/after screenshot directory. Individual groups can use `--grep`.

`node scripts/premium-preview.mjs --build --production-check` uses separate ignored `.premium-check`, original routing/layout/next-font code and HTTPS public fixture origins; official Next offline Google-font response hook supplies existing actual WOFF2 bytes. No real API fetches/provider calls. This validates source compilation/static rendering, not hosted integration. Helpers require existing cached Geist build assets; portability enhancement could allow explicit font fixture input later.

Screenshots in docs/premium-ui are QA fixture screenshots, not genuine seller/account/provider data. Page errors/hydration errors/overflow and loaded image checks are included. Axe excludes only Next development tooling portal. Temporary preview directories/dependency junctions are ignored; stop owned server after final validation. Unknown debug.log tool/runtime modifications are preserved.

No commit/push/deploy, backend/schema/migration/secret/auth/payment/order business-rule changes are authorized or performed.

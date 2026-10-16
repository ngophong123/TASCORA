# Cinematic implementation commit allowlist

> Evidence retention (2026-10-16): generated HTML/raw Lighthouse JSON and non-curated screenshots referenced below are retained **locally**, outside Git. Historical counts describe the original capture phase. See [QA evidence guide](QA_EVIDENCE.md) for the 53 versioned compact JSON files, eight curated screenshots and local-only evidence policy. No source evidence was deleted.

Branch: feat/premium-ui-redesign. This is the exact cumulative frontend/motion/quality file allowlist; nothing has been staged. Earlier user changes are included because they implement the existing cinematic feature and verified fixes. No backend, schema, API contract, workflow/deployment, payment or secret changes.

Final user-authorized selection:35 files. This supersedes the original44-file proposal: six raw Lighthouse run JSONs and three interaction-observer JSONs remain unchanged locally and are excluded from the commit. Summaries and compact attribution preserve the reported measurements. Application/configuration/tests do not read the excluded files; audit references to them describe local evidence, not required repository inputs.

## Exact files

Use literal paths (especially [locale]); do not use git add . or directory globs. Review again if the working tree changes.

```text
apps/web/package.json
apps/web/src/app/[locale]/page.tsx
apps/web/src/app/[locale]/services/ServicesClient.tsx
apps/web/src/app/[locale]/services/page.tsx
apps/web/src/app/premium.css
apps/web/src/components/layout/MegaMenu.tsx
apps/web/src/components/layout/Navbar.tsx
apps/web/src/components/layout/SmoothScrollProvider.tsx
apps/web/src/components/motion/HomeCinema.tsx
apps/web/src/components/sections/Hero.tsx
apps/web/src/components/sections/PremiumMarketplace.tsx
apps/web/src/components/sections/StaticMarketplace.tsx
apps/web/src/components/services/ServiceToolbar.tsx
apps/web/src/components/ui/SearchBar.tsx
docs/PREMIUM_CINEMATIC_MOTION.md
docs/PREMIUM_UI_HANDOFF.md
docs/TASCORA_CINEMATIC_ARTIFACT_INVENTORY.json
docs/TASCORA_CINEMATIC_COMMIT_ALLOWLIST.md
docs/TASCORA_CINEMATIC_MOTION_AUDIT.md
docs/TASCORA_CINEMATIC_QUALITY_AUDIT.md
docs/performance/cinematic-mobile-startup-after/summary.json
docs/performance/cinematic-mobile-startup-before/summary.json
docs/performance/cinematic-mobile-startup-profile.json
docs/performance/cinematic-quality-after/summary.json
docs/performance/cinematic-quality-before/summary.json
docs/performance/cinematic-quality-confirm/summary.json
docs/performance/cinematic-quality-desktop/summary.json
docs/performance/cinematic-quality-final/summary.json
docs/performance/cinematic-quality-motion/summary.json
playwright.cinematic.config.ts
pnpm-lock.yaml
scripts/premium-performance.ts
tests/premium/cinematic-catalog-quality.spec.ts
tests/premium/cinematic-motion.spec.ts
tests/premium/cinematic-quality.spec.ts
```

## Evidence policy and cleanup awaiting approval

Original audit evidence inventory:18 files/4,750,762bytes. The authorized commit includes only nine summary/compact-attribution files; the six raw run reports and three observer reports remain intact locally. Raw HTML and full profiling artifacts are excluded. The artifact inventory preserves the original classifications for retention decisions, not staging authorization.

Disposable regenerated HTML: 48 exact paths, 43607244 bytes. Each path is listed under disposableGeneratedHtml in TASCORA_CINEMATIC_ARTIFACT_INVENTORY.json. These are duplicate Lighthouse presentations reproducible from retained JSON. Proposed cleanup requires explicit approval; no deletion occurred.

Preserve/archive historical raw: 58 paths, 35750259 bytes. These preserve earlier default/mobile/desktop results and debugging phases. Excluded from the compact commit allowlist, not declared safe to delete without an approved archive/retention decision. Historic audit references point to locally preserved files; an external evidence location is not yet created.

Ignored full trace/Devtools artifact files are inventoried under ignoredProfiles and should remain local or be archived for investigation, not committed. test-results-premium screenshots/videos, playwright-report, .premium-performance, .premium-payment-check and build outputs are excluded. Never include .env variants, credentials or debug.log.

## Review boundaries

The allowlist covers the cumulative uncommitted cinematic work, not only this latest optimization. Latest source modification: HomeCinema mobile first-scroll activation. Latest test/harness modifications: cinematic-motion, cinematic-quality and premium-performance. Services/search/menu/Lenis fixes belong to the completed prior audit and remain preserved.

Full diff and new source/config/tests reviewed; no unrelated tracked paths found. Signature scan of changed/untracked non-secret files found no private-key, AWS access-key, live Stripe secret or credential-bearing Redis/Postgres URL matches. This is a bounded inspection, not a guarantee from a dedicated secret scanner; .env/secrets were not opened. Git diff --check and final test results are recorded in the quality audit. No staging, commit, push, merge or deploy authorized/performed.

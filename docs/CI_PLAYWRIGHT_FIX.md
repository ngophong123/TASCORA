# Playwright CI failure — 2026-10-10

Branch: feat/premium-ui-redesign. Starting checkout clean at582654a; no reset/revert/commit/push/merge/deploy. No backend/database/payment/auth changes, migrations, secrets or hosted backend connections.

## Evidence

[Run38042198804](https://github.com/ngophong123/TASCORA/actions/runs/38042198804), [E2E job114184793865](https://github.com/ngophong123/TASCORA/actions/runs/38042198804/job/114184793865), PR4, head582654ae06fc21649f490e50f7d89a1e21766905 matches local HEAD. Public API confirmed failed E2E step and successful artifact upload. Raw job-log endpoint403; gh unavailable. Downloaded the public artifact mirror via nightly.link (artifact11665814005,58,731,341bytes; matching GitHub metadata). Read only report JSON/HTML data and relevant error-context; did not execute artifact code or read .env. Raw evidence retained in ignored .premium-performance.

Report stats: total55, unexpected11, expected43, skipped1, flaky0. The quoted43 passed/1 skipped omitted11 failures. Both initial attempt and retry failed. Node-action runtime deprecation annotations are warnings, not the failed-test cause.

| File                                     | Failing tests                                              | Verified cause                                                                                                                                |
| ---------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| marketplace/search-and-filter.spec.ts    | hero search; category filter; rating/clear; pagination (4) | Cards absent; CI snapshot shows Catalog unavailable/Retry. SSR initial list not mocked.                                                       |
| marketplace/gig-detail-and-order.spec.ts | listing→detail (1)                                         | Same missing SSR fixture; failed before opening detail.                                                                                       |
| system/responsive.spec.ts                | tablet services directory (1)                              | Same missing SSR fixture, not demonstrated CSS overflow.                                                                                      |
| marketplace/nav-and-interactions.spec.ts | VI MegaMenu; EN MegaMenu (2)                               | Hover no longer opened menu. Further legacy descriptions/count/badge assertions referenced intentionally removed marketing UI.                |
| marketplace/navigation.spec.ts           | desktop menu click/hover/Escape/outside (1)                | Click/Escape succeeded; hover failed at line36.                                                                                               |
| marketplace/nav-and-interactions.spec.ts | anchors/audience tabs (1)                                  | Anchors reached sections; obsolete100% escrow text assertion failed. Current section has seller registration CTA, no audience tabs/guarantee. |
| dashboard/dashboard-flows.spec.ts        | orders filter/drawer (1)                                   | Actual button aria-pressed=true; assertion looked for aria-selected=true (absent), not a Radix/data-active issue.                             |

SSR fetching moved into catalog-server after Premium performance work. workflow/config still launched normal Next with api.example.com placeholder and only browser route mocks; those cannot intercept server fetch. The generic error is expected fail-closed application behavior. Increasing timeouts would not supply data. Local pre-fix representative run reproduced all3 errors (catalog, hover, Orders) on fresh isolated production build.

## Fix

- playwright.config.ts: default fixture mode for this fixture-based suite, one worker for shared outage/delay store, start loopback public fixture first via explicit health readiness, then production frontend. Public server fetch preload attaches only to next start/dev, **not build**; build keeps normal font fetching. Explicit apps/web directory when invoking Next from monorepo root. Existing retry/forbidOnly/reporters/test assertions remain; no continue-on-error.
- scripts/catalog-fetch-fixture.cjs: QA preload only, intercepts configured public API origin's GET services/categories to localhost3211; rejects credentials/non-read requests and other external server fetch. Production application never imports it.
- scripts/premium-catalog-fixture.ts: explicit fixture readiness response. Existing published-only records/outage/delay controls preserved.
- live-fixtures.ts: synchronization keyed to testInfo.project.use.baseURL origin instead of hardcoded localhost3210, so normal CI3000 works. Same public per-test records feed SSR/browser; no auth/payment fixture behavior altered.
- quality.yml: explicitly marks E2E SSR fixture mode. Existing non-secret synthetic provider marker unchanged; Lighthouse/lint jobs untouched.
- Navbar.tsx: restores mouse hover opening/switching with pointer capability guard; preserves click pin/toggle, Escape/focus return, outside click, focus-inside behavior, touch and keyboard. Hover never forces focus into the popup.
- Orders test: aria-pressed semantics plus actual IN_PROGRESS/COMPLETED order IDs/visible row counts, not just a cosmetic selected flag.
- Menu/anchor tests: localized headings/labels and exact localized destinations; actual workflow steps, seller registration and enterprise browse CTAs replace removed fabricated counts/badges/escrow assertions. No marketing claims reinstated. Mobile variant updated too.

## Validation

- Pre-fix representative3/3 reproduced failure; original artifact identifies all11.
- Post-fix focused11 assertions pass; first sandbox run hung during Windows process-group teardown and was interrupted, so it is not represented as a clean completed run.
- Completed full Chromium run outside sandbox: **54 passed,1 existing skipped, exit0**, retries0. Covers all11 original failures, Favorites success/failure, auth, paid/disabled mock-provider lifecycle, localization, accessibility and responsive checks.
- Existing skipped desktop-suite case is Mobile drawer anchor navigation; separately executed Mobile Chrome1/1 PASS, exit0. No new skip or test deletion.
- Premium keyboard/focus/mobile/search regression3/3 PASS, exit0.
- Strict frontend lint/typecheck PASS; separate strict Playwright config typecheck PASS; isolated webpack production build42 pages PASS; diff check PASS.
- Local validation imports root Playwright config and uses its fixture/preload/webServer lifecycle with an ignored production source-copy directory and cached real fonts. This avoids local .env; it is not a newly run Ubuntu Actions job or a claim of fresh CI PASS. CI root startup command explicitly targets apps/web. Full runner auto-stopped its owned servers.
- Local attempts also hit a temporary config cwd issue and a locked Windows report file. Fixed only ignored validation helper cwd/unique output folder; no weakened product assertions or CI retries. Final full run exit0 proves complete teardown in that environment.

Files changed: quality.yml, playwright.config.ts, Navbar.tsx, premium-catalog-fixture.ts, new catalog-fetch-fixture.cjs, live-fixtures.ts, dashboard-flows.spec.ts, nav-and-interactions.spec.ts, this report. No backend/schema/payment/secrets touched. Downloaded artifact/local helper/report files remain ignored and should not be committed.

After review, a new commit containing these source/config/test changes **must be pushed to the existing draft PR** for GitHub Actions to execute the fix. Current remote run remains failed; no remote rerun/PR comment/commit/push was performed. Re-running the unchanged commit cannot apply these local fixes.

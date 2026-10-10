# Playwright rerun/HEAD audit — 2026-10-10

No commit, push, merge, deployment, reset/revert, secrets, database/backend/payment changes or hosted backend connections. Starting Git checkout clean on feat/premium-ui-redesign at9193adc518bbdc952e89f404559d8948e53f9ace; public GitHub branch API confirms remote SHA identical.

## Fresh GitHub evidence, not reused attempt1 conclusions

- Requested [run38042198804 attempt2](https://github.com/ngophong123/TASCORA/actions/runs/38042198804/attempts/2), E2E [job114196745223](https://github.com/ngophong123/TASCORA/actions/runs/38042198804/job/114196745223), is **582654ae06fc21649f490e50f7d89a1e21766905**, not9193adc. Finished failure2026-10-10T10:57:31Z.
- Downloaded fresh artifact **11666764560**, created10:57:29Z,59,281,988bytes, matching API metadata. Used artifact-ID public nightly.link mirror, not previous attempt1 artifact11665814005. Read embedded report JSON, all failure errors/stacks and extracted11 trace ZIPs; never executed archive code or read .env. Evidence in ignored .premium-performance/ci-attempt2 (failures.json includes full messages/stacks/trace paths).
- Stats:55 total,11 unexpected,43 expected,1 existing skipped,0 flaky. Both attempts per failed test have failure results.
- HEAD's actual [run38046199697](https://github.com/ngophong123/TASCORA/actions/runs/38046199697) is9193adc; lint success, E2E/Lighthouse **cancelled**, not completed failure. E2E [job114196360435](https://github.com/ngophong123/TASCORA/actions/runs/38046199697/job/114196360435) annotation says `Canceling since a higher priority waiting request for Quality & Testing Toolchain-refs/pull/4/merge exists` and `The operation was canceled`.
- Existing workflow uses the same ref-based concurrency group with cancel-in-progress. Old attempt2 starts10:52:19Z, current run cancelled10:52:15Z. Annotation verifies same-group priority cancellation; this is not evidence of a new failing test on HEAD. No artifact exists for the cancelled run; annotation explicitly says no report/results files found. Direct job log API403 without credentials. Cannot infer partial test errors from unavailable logs.
- Public API rechecked at end still shows old run failure/attempt2 and HEAD run cancelled/attempt1. Rerun of the old URL retains its old commit; pushing9193adc does not retroactively change it.

## All failed tests in fresh old-commit artifact

| File                                     | Exact failing titles                                                                                                                                                                                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| marketplace/search-and-filter.spec.ts    | hero search on homepage redirects to /services with query param; filtering by category updates URL and filters result set; filtering by rating updates results and clearing filters restores original count; pagination switches pages and updates active page state |
| marketplace/nav-and-interactions.spec.ts | Vietnamese MegaMenu displays localized column headings and item descriptions on /vi; English MegaMenu displays standard English text on /en; Navbar anchor links scroll smoothly to sections and switch audience tabs                                                |
| dashboard/dashboard-flows.spec.ts        | orders page filters by status tabs and inspects order detail drawer                                                                                                                                                                                                  |
| marketplace/gig-detail-and-order.spec.ts | navigating from services listing to gig detail displays correct service info                                                                                                                                                                                         |
| marketplace/navigation.spec.ts           | desktop mega menu opens on click and hover, and closes on Escape and outside click                                                                                                                                                                                   |
| system/responsive.spec.ts                | tablet viewport (768x1024): services directory adapts layout cleanly                                                                                                                                                                                                 |

Fresh trace findings:

- Orders: goto /dashboard/orders, click order-tab-active, then assert aria-selected=true at old line36. Error DOM shows button aria-pressed=true and aria-selected absent. This is old accessibility-selector mismatch, not failed filter state. HEAD already asserts aria-pressed plus actual row IDs/counts.
- Listing→detail: goto /services, search input visible, then gig-card.first visibility timeout at ServicesPage.ts27; trace has no card-link click and no detail navigation. Old source had no SSR fixture transport; browser interception cannot provide server initial data. Therefore this failure does not demonstrate broken detail params or hydration.
- Six catalog failures share absent cards/error state; three menus fail on hover; anchor test waits for obsolete100% escrow text; Orders asserts obsolete aria-selected. These diagnoses are from the new attempt2 report/trace, independently consistent with old SHA. No new Orders/detail production change is justified.

## HEAD behavior verification

- Existing Orders and listing→detail tests2/2 PASS on9193adc with CI=1, production isolated build and current SSR/browser fixtures.
- Additional ignored diagnostic2/2 PASS: Orders URL remains /dashboard/orders while local filter state changes (the current contract has no query-sync requirement). Active IDs exactly[...020000], Completed[...020001], All[...020000,...020001,...020002], matching real per-test IN_PROGRESS/COMPLETED/DELIVERED records.
- SSR list destination /services/c000000000000000000000070 resolves that exact route param and API GET /api/v1/services/c000000000000000000000070; title equals fixture record;0 browser initial-list GETs;0 page/hydration errors. Detail itself uses client useParams/useApiResource; catalog is SSR. Results in .premium-performance/current-checks-summary.json.

## Separate local failure actually found and fixed

Full HEAD Chromium verification initially:53 passed,1 skipped,1 failed. Only new failure was `gig wizard navigates step progression and validates form interaction`: strict getByTestId wizard-gig-title-input matched2 nodes. Error's accessible snapshot contained1 wizard heading/title input.

Eight instrumented navigation cycles pass and capture duplicate nodes in6 cases: one visible830×44 input, one0×0 input inside hidden/display:none ancestor. This is selector ambiguity against transient hidden production-rendered DOM, not two active forms. Exact internal Next mechanism is not claimed fixed.

Changed only Wizard portion of tests/e2e/dashboard/dashboard-flows.spec.ts: semantic accessible roles/names for title/category/basic package/price/description; assert exactly1 active title input; assert aria-current=step for transitions; retain blank-form/back/forward/save checks and add API201/success plus exact persisted draft title/description/DRAFT/basic price25 assertions. No .first workaround, extra timeout, skip/delete, SSR disable or UI/data/payment changes.

After correction: repeated Wizard8/8 PASS; full Chromium **54 passed,1 existing skipped,exit0**, CI=1/1worker, retries0 (stricter than CI's optional retry). All Orders/detail/Favorites/auth/payment-fixture/localization/accessibility/responsive cases pass. Local validation imports root config with same SSR transport and serves ignored source-copy production directory/cached fonts at3210 rather than real app/.env; it does not prove a new Ubuntu Actions job passed. The only skip is the original mobile-only case in desktop project; no new skip added.

Frontend lint/typecheck and separate Playwright config typecheck PASS; fresh isolated webpack production build PASS42 pages; final diff check PASS. Only test/dashboard-flows and this audit changed, no application implementation change. Owned QA servers auto-stopped. Real GitHub latest-commit E2E remains cancelled; cannot call remote CI green.

## Next action

Open run38046199697, verify9193adc, then use **Re-run all jobs** there, not on38042198804. Existing commit9193adc already contains the Orders/catalog/hover CI fixes. Do not create a fake commit or alter assertions merely to rerun the stale run. No remote action was triggered by this investigation.

The new Wizard regression fix and this audit passed final local checks and are suitable for review/commit/push if desired; it is separate from the stale-run explanation. Nothing has been committed or pushed in this task. New push would produce another HEAD run; validate its SHA and avoid concurrently rerunning an older run in the shared group. No workflow concurrency change was made without a demonstrated need to change that policy.

# Cinematic quality audit — 2026-10-13

Branch `feat/premium-ui-redesign`; existing uncommitted work and Draft PR #4 preserved. This extends `TASCORA_CINEMATIC_MOTION_AUDIT.md`; no new animation sequence, backend/schema/payment/authentication/security/deployment change or dependency installation.

## Confirmed issues and corrections

1. **Text collisions during entrance.** At desktop entry, talent heading/copy gap was -4.63px and CTA gap -2.17px. Mobile/tablet talent spacing compressed to 7.57px. Move the talent heading and paragraph together, and the whole seller invitation panel together. Timings/ranges remain unchanged; measured gaps now remain 12px and 20px.
2. **History scroll overshoot.** Chromium departure/restoration was 2317→2684 with unchanged document height5255px; card top44→-323. WebKit overshot similarly. A browser-only experiment with homepage `overflow-anchor:none` restored exactly2317 in Chromium and2299 in WebKit. The application fix is scoped to `.home-cinema`; routing/scroll restoration is not replaced.
3. **Idle-resume jump.** Frame samples showed reverse scrolling350→99 in one frame; image scale step≈.05761. Lenis computes elapsed time from its last RAF. With an on-demand driver that interval included the idle pause. Prime the public `lenis.time` on wake, reset advancing state when hidden, and retain the existing no-idle-loop behavior. Corrected Chromium sample maximum scale steps were .00773 forward and .01479 reverse. The original .035 step bound and direction assertions were retained; this is not an FPS guarantee.
4. **Unnecessary focus measurements/stale targets.** Focus changes now redraw cached scene progress instead of refreshing all trigger geometry. Track animated targets as well as trigger sections; release removed target records and style snapshots. Node-replacement/focus regression verifies no extra trigger remains when the section survives but its image is replaced.
5. **Early typing lost at hydration.** Five original WebKit regressions exposed search/focus failures. Search worked after confirmed hydration, proving an initialization race rather than an unsupported input event. SearchBar and ServiceToolbar adopt dirty server-field values in layout effects; URL synchronization no longer resets the first typed query. Delayed-script tests verify the actual query survives; search is not hidden or artificially disabled.
6. **WebKit focus behavior.** Pointer activation does not necessarily focus buttons; close cleanup therefore restored the body. Navigation/filter openers explicitly focus themselves before opening. Menu links have explicit tabindex0, verified by a reversible browser experiment and the original Enter/Tab/Escape assertion. No global keyboard interception or weakened assertion.
7. **Catalog sticky collision.** Search input started at80px while fixed navigation ended81px. Toolbar offset now matches5rem header height plus its border. Sidebar sits beneath header+toolbar with a1rem gap, and its scrollable height respects that offset. Rem/dvh calculations preserve scaling rather than adding a content spacer.
8. **Native search fallback.** A native GET preserves query and locale without application handlers. Completely disabled JavaScript exposed hidden React streamed Suspense content. `_native=1` is a frontend-only form hint; this branch awaits the same anonymous public catalog and bypasses both local streaming boundaries. Ordinary navigation retains streaming/loading/error behavior and the backend API is unchanged. Native results are visible in EN/VI in both engines. A noscript notice explains that interactive filters/saved services require JavaScript; authentication and transactions are not presented as supported without JS.

## Visual and animation evidence

Chromium and installed Playwright WebKit were rendered at390,768,1024,1440×900. Existing motion checks also cover360,1280,1920. Capture hero plus talent/categories/featured/workflow/finale at section-top positions78%,45%,12% of the viewport. Geometry checks include overflow, copy spacing and header bounds. Active desktop workflow heading reaches128px; native scrolling remains available and essential search/CTAs are not pinned.

Rapid/reverse wheel scrolling, Home/PageDown, repeated resizing, route navigation, browser Back, reduced-motion switching, low-memory hint, node replacement and focus stability are tested. Per-frame forward/reverse samples verify actual motion and bounded property steps. Movies and screenshots are real browser output, not design mockups or a pixel-diff certification.

Initial evidence: `test-results-premium/cinematic-quality-before` (8 geometry failures/2 stress passes), `cinematic-history-geometry` (overshoot JSON), `cinematic-frame-diagnostic` (reverse jump samples), `catalog-sticky-before` (clipped toolbar). Final evidence is under `test-results-premium/cinematic-quality-verified`; browser artifacts remain ignored and existing premium snapshots were preserved.

Visually inspected desktop hero/workflow/talent and tablet featured grid, plus mobile WebKit invitation. Typography, image aspect ratios and direct service navigation remain consistent with the editorial design. Space between sections is the existing spacing system; sparse talent results are real fixture data and were not filled with invented profiles.

## Application files changed in this audit

- `components/motion/HomeCinema.tsx`: focus redraw/target cleanup.
- `app/premium.css`: homepage anchoring.
- `components/sections/PremiumMarketplace.tsx`, `StaticMarketplace.tsx`: coherent motion groups.
- `components/layout/SmoothScrollProvider.tsx`: resumed clock.
- `components/layout/Navbar.tsx`, `MegaMenu.tsx`: explicit focus behavior.
- `components/ui/SearchBar.tsx`: hydration adoption/native GET.
- `components/services/ServiceToolbar.tsx`: hydration adoption/focus/sticky offset.
- `app/[locale]/services/ServicesClient.tsx`, `page.tsx`: sidebar offset/native-only nonstreaming fallback.

All application paths above are relative to `apps/web/src`. Earlier homepage/Hero/package/lockfile changes were preserved. QA adds `playwright.cinematic.config.ts`, `tests/premium/cinematic-quality.spec.ts`, `cinematic-catalog-quality.spec.ts`; `scripts/premium-performance.ts` records media/CPU metadata and supports explicit additional motion-enabled/home-only audits.

## Performance methodology and preliminary evidence

Production webpack build in the existing isolated whitelist preview, cached original font assets, localhost3210 and synthetic public API fixture3211. No hosted data/secrets. Lighthouse12.6.1/Chromium153, default mobile simulated Slow4G/4×CPU; three runs per route, serial, separate contexts, raw JSON+HTML retained. No simultaneous browser regression suite during Lighthouse.

Baseline medians: Home90/LCP2996ms/TBT264ms; Services85/3591/271; Explore84/3456/313. CLS0 throughout.

Intermediate post-visual-fix batch: Home80/2578/640; Services73/3622/673; Explore66/3758/1003. An unchanged-build confirmation was retained: Home75/2535/1180; Services77/3777/453; Explore66/3559/1350. These are not discarded or replaced by a favorable sample.

CPU benchmark indices recorded by Lighthouse fell from baseline values around1821–1881 on several runs to roughly804–1649 on later runs. Catalog controls changed little and did not load the GSAP vendor chunks in observed traces. This supports host variability as a contributor but does not exclude a regression. Stable-runner validation is still required; no performance-improvement claim.

GSAP core vendor remains51,845 raw/19,930 gzip bytes; ScrollTrigger43,337 raw/17,450 gzip. No library was removed or upgraded. Focus/cleanup optimizations target main-thread work and memory, not a claimed vendor-size reduction. Initial default Lighthouse Home script totals205405→205510bytes; media-state recording on final runs will distinguish reduced motion from actual motion-enabled startup.

Raw batches: `docs/performance/cinematic-quality-before`, `cinematic-quality-after`, `cinematic-quality-confirm`. Final-build measurements and command/results summary will be appended below after completion.

## Limits

Playwright WebKit on Windows is not real Safari/iOS hardware. Touch momentum, browser chrome/dynamic viewport, platform keyboard preferences, thermal/device performance and physical devices are not certified. No field INP or60FPS claim. Fixtures use100ms public API latency and cannot establish hosted latency. Global ScrollTrigger ownership remains homepage-only and version-pinned; future independent owners/pins/timed scrubs require lifecycle review. No commit/push/merge/deploy/new PR occurred.

## Final verification

The final source passed the combined Chromium/WebKit suite: **124/124**, zero skips/retries. The interrupted desktop Lighthouse batch also completed: all three raw reports and its summary are present. No application source was changed during the resumed verification.

### Recorded Lighthouse results

Median of three runs per route. Comparable default mobile runs use simulated Slow4G/4x CPU; the final run explicitly records **reduced motion enabled**, and engine chunks are absent from default Home traces. Earlier default runs used the same harness defaults but did not record media state explicitly. These comparisons do not certify full cinematic startup performance.

| Route    | Baseline score (range) | Final score (range) | LCP before → final | TBT before → final | CLS before → final |
| -------- | ---------------------- | ------------------- | ------------------ | ------------------ | ------------------ |
| Home     | 90 (78–92)             | 89 (79–91)          | 2.996 → 3.063s     | 264 → 232ms        | 0 → 0              |
| Services | 85 (84–87)             | 89 (86–89)          | 3.591 → 3.393s     | 271 → 190ms        | 0 → 0              |
| Explore  | 84 (78–85)             | 83 (79–89)          | 3.456 → 3.318s     | 313 → 231ms        | 0 → 0              |

The intermediate and unchanged-build confirmation batches above remain part of the evidence. Their large TBT/score variance prevents a reliable improvement claim. Final Home LCP/score are slightly worse than baseline; the difference is within observed run dispersion. Catalog LCP still exceeds 2.5s under this local simulated workload.

Explicit **motion-enabled** Home measurements are separate current-state batches, not before/after comparisons:

| Variant                               | Score median (range) | LCP    | TBT   | CLS     | Script transfer, first run |
| ------------------------------------- | -------------------- | ------ | ----- | ------- | -------------------------- |
| Mobile light motion, 412×823, 4x CPU  | 74 (73–85)           | 2.722s | 786ms | 0       | 252,425 bytes              |
| Desktop full motion, 1350×940, 1x CPU | 98 (97–98)           | 1.080s | 46ms  | 0.00172 | 257,346 bytes              |

Mobile motion startup has a material measured main-thread cost compared with the default reduced-motion batch (205,682 script bytes on final Home). Preserve cinematic behavior, but treat mobile startup cost as an unresolved performance risk. There is no comparable motion-enabled pre-fix baseline proving attribution or improvement. The vendor payload is unchanged (37,380 combined gzip bytes); focus/target/clock fixes improve correctness without claiming byte savings. No speculative engine rewrite was made to chase scores.

Harness correction: the first requested desktop batch used a preset flag that did not apply the desktop configuration. Its raw settings identify mobile; `cinematic-quality-motion/summary.json` records that correction. The subsequent `cinematic-quality-desktop` batch passes Lighthouse's official desktop config as the third argument and records actual desktop settings/full motion. Existing filenames contain `mobile`; actual raw settings and summary mode take precedence. All **42 Lighthouse reports** (9 baseline +9 intermediate +9 confirmation +9 final +3 mobile motion +3 desktop motion) have valid JSON and no runtimeError. Raw JSON/HTML are retained. Final Lighthouse accessibility is100 on all routes/variants; these navigation audits do not exercise every interaction.

Actual LCP attribution from representative run2 reports: mobile Home's LCP is the visible hero `h1`, not its artwork. Final default run: TTFB461ms, no image load-delay/load-time phase, render delay2602ms; mobile motion run: TTFB458ms/render delay2243ms. Desktop full-motion run2 instead selects the first live service image: TTFB132ms, resource load delay811ms, load duration5ms, render delay132ms. The existing hero fetches public service data after hydration, explaining an image-discovery dependency; priority cannot preload a URL that is not yet known. This is a measured bottleneck candidate for a separately scoped initial-data improvement, not evidence that image scaling causes the mobile text LCP delay.

Run2 main-thread totals show script evaluation1091ms/default versus1468ms/mobile motion, style/layout635 versus826ms, parsing107 versus152ms. Shared application/runtime chunks dominate the bootup table; these totals include all hydration and enhancement work and are not a GSAP-only profile. Desktop run2 script evaluation460ms and style/layout268ms use different CPU/network settings and cannot be used as a mobile improvement comparison. Long tasks remain in the mobile traces. All data is synthetic localhost; no hosted TTFB/API conclusion.

### Final checks and exact commands

QA setup uses only the isolated whitelist checkout, cached fonts and loopback synthetic API. It does not read/copy `.env` or contact hosted services:

```powershell
node scripts/run-premium-catalog-fixture.mjs
node scripts/premium-preview.mjs --build --production-check --with-payment-fixture --with-catalog-fixture
node scripts/premium-preview.mjs --start --production-check --with-payment-fixture --with-catalog-fixture

$env:PREMIUM_CATALOG_FIXTURE='1'
$env:PREMIUM_RUN_LABEL='cinematic-quality-verified'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts cinematic-quality.spec.ts cinematic-catalog-quality.spec.ts cinematic-motion.spec.ts navigation.spec.ts scroll-lifecycle.spec.ts account.spec.ts marketplace.spec.ts catalog.spec.ts catalog-ssr.spec.ts explore.spec.ts public.spec.ts hydration.spec.ts
# 124/124 PASS, Chromium + WebKit, 1 worker, retries 0; completed before interruption.

$env:PREMIUM_RUN_LABEL='cinematic-quality-axe-final'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts accessibility.spec.ts --grep 'WCAG scan home'
# 4/4 PASS on resume: Chromium/WebKit, 390/1280px; zero WCAG A/AA violations.

$env:PREMIUM_RUN_LABEL='cinematic-quality-observer'
$env:PREMIUM_PERFORMANCE_PHASE='cinematic-quality-observer'
pnpm.cmd exec playwright test --config=playwright.premium.config.ts performance.spec.ts
# 3/3 PASS on resume; Home/Services/Explore local interaction observers.

pnpm.cmd exec vitest run --config .premium-performance/unit-quality.config.ts
# 14/14 PASS, catalog-data/catalog-filter/premium-content, envDir:false.
pnpm.cmd --filter web lint:strict
pnpm.cmd --filter web typecheck
git diff --check
# PASS on resume. Fresh production-build result recorded below.

node scripts/run-premium-performance.mjs cinematic-quality-before
node scripts/run-premium-performance.mjs cinematic-quality-after
node scripts/run-premium-performance.mjs cinematic-quality-confirm
node scripts/run-premium-performance.mjs cinematic-quality-final
node scripts/run-premium-performance.mjs cinematic-quality-motion --home-only --motion --desktop
node scripts/run-premium-performance.mjs cinematic-quality-desktop --home-only --motion --desktop
# Recorded results above; first --desktop request was corrected in metadata.
```

Observer reports in `performance/cinematic-quality-observer`: unthrottled local LCP Home292ms/Services896ms/Explore788ms, CLS0 for each, idleRAF0 over2s for each. Two recorded interactions per route; maximum EventTiming48/40/48ms respectively. These are small lab samples with a16ms event threshold, not INP field data, FPS or a Lighthouse comparison. No console/hydration errors were reported by these scenarios. Vite's config-loader compatibility notice and NO_COLOR/FORCE_COLOR notices are tooling warnings; no tests were skipped or assertions weakened.

### Working tree and artifact review

Reviewed all tracked application/helper/package/lockfile diffs, new controller/config/tests and documentation. Existing source/package changes were preserved; no backend, Prisma, payment or secret files were changed. Git branch remains `feat/premium-ui-redesign`; nothing staged. Untracked performance directories contain generated JSON/HTML, including older historical phases. All67 JSON files across cinematic performance directories parsed with no runtimeError. These directories total approximately74.5MB and should receive an explicit evidence-retention decision before any future commit; do not blindly stage them.

Ignored final browser evidence includes160 PNGs,16 WebM videos and25 JSON files under `test-results-premium/cinematic-quality-verified`, with `.last-run.json` reporting passed/no failed tests. Historical failing experiments are intentionally retained separately and do not represent the final suite. `test-results-premium`, `.premium-payment-check` and `.premium-performance` are Git-ignored; no debug log, browser report or build checkout was staged. Inspection excludes `.env`/secret values. All42 HTML reports contain Lighthouse/LCP report content; selected screenshot links resolve. No incomplete Lighthouse batch remains; local server processes are QA infrastructure, not pending test work.

Selected actual screenshots (local ignored artifacts):

- [Desktop hero](../test-results-premium/cinematic-quality-verified/cinematic-quality-editoria-3989d-and-sticky-geometry-at-1440-chromium/hero.png)
- [Desktop talent entrance](../test-results-premium/cinematic-quality-verified/cinematic-quality-editoria-3989d-and-sticky-geometry-at-1440-chromium/talent-0.78.png)
- [Desktop workflow](../test-results-premium/cinematic-quality-verified/cinematic-quality-editoria-3989d-and-sticky-geometry-at-1440-chromium/workflow-0.12.png)
- [Mobile WebKit finale](../test-results-premium/cinematic-quality-verified/cinematic-quality-editoria-8087e--and-sticky-geometry-at-390-webkit/finale-0.45.png)
- [WebKit catalog sticky geometry](../test-results-premium/cinematic-quality-verified/cinematic-catalog-quality--44f6e-llide-with-fixed-navigation-webkit/catalog-sticky.png)

Review finds consistent image proportions/copy spacing and no horizontal overflow at tested sizes. Ordinary content passes beneath the fixed header while scrolling; essential controls remain reachable. Vietnamese native routing/results were verified, but pre-existing mixed English catalog labels remain a localization limitation, and this is not a full Vietnamese cinematic review.

### Release risks and next steps

1. Repeat mobile motion/reduced-motion benchmarks on a stable runner with matched CPU/network and an explicit motion baseline; profile long tasks and determine an acceptable startup budget before release. Do not interpret the current noisy before/after values as proven improvement.
2. Validate physical Safari/iOS and low-power Android touch scrolling, viewport chrome, focus behavior and thermal performance. Playwright WebKit is engine coverage only.
3. Verify hosted API latency/CWV and collect field INP under separately authorized environment access. Local fixtures do not establish these.
4. Review the listed frontend/QA diffs and choose which raw performance evidence to retain outside Git. Rerun repository CI when a future commit/push is explicitly authorized. Existing124-test suite remains valid because no application source changed after it passed.

### Fresh-build completion

The resumed isolated production build completed successfully (webpack, TypeScript,42 generated pages, Home SSG). The following post-build Chromium/WebKit subset passed **32/32**, workers1/retries0, against the fresh build:

```powershell
$env:PREMIUM_CATALOG_FIXTURE='1'
$env:PREMIUM_RUN_LABEL='cinematic-quality-resume-smoke'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts cinematic-quality.spec.ts cinematic-catalog-quality.spec.ts navigation.spec.ts
```

Source lint/typecheck/unit/build and all resumed tests exited0. No failing or incomplete required local check remains. The earlier124/124 full matrix and new32/32 subset are separate overlapping runs, not156 unique cases. Final docs/diff check passed; the index remains empty. Task-owned preview/fixture servers were stopped after verification. No source fixes were required during this resumed phase; audit/handoff updates and three new observer reports are the only resumed changes.

Preview stderr returned three `The destination stream closed early` entries (digest3562677940) when its accumulated output was collected at shutdown. No route/timestamp was included. The suite deliberately exercises aborted/rapid navigation and disabled JS, so cancellation is plausible, but the entries are not conclusively attributed. Browser runtime/hydration checks and all tests passed; this report does not claim completely clean server logs. Inspect request-correlated server logs during subsequent CI/hosted validation if these entries recur outside cancellation scenarios. Ctrl-C termination of the owned servers exits1 by design and is not a failed test/build.

The local quality audit is complete. It is not a merge/deploy approval or a claim that the mobile performance budget has been met. Existing work and historical artifacts are preserved; no staging, commit, push, merge or deployment occurred.

## Focused mobile startup optimization — 2026-10-13

This section supersedes the preceding unchanged-source verification for the new mobile activation change. The visual design and scene choreography are retained. Application change is confined to `HomeCinema.tsx`; existing user changes remain intact.

### Profiling and attribution

Fresh production Home runs explicitly emulate `prefers-reduced-motion:no-preference`, mobile412×823, simulated Slow4G/4x CPU, Lighthouse12.6.1/Chrome153.0.8010.12, separate browser contexts and73-service loopback fixture with100ms API delay. Both batches use the same harness/build procedure and settings. Runs are serial; no build/test suite runs concurrently with Lighthouse. Raw trace/Devtools artifacts are retained in ignored `.premium-performance/profiles/cinematic-mobile-startup-{before,after}`; compact attribution is committed only if later authorized via `performance/cinematic-mobile-startup-profile.json`. This setup is reproducible, but the shared Windows host is not perfectly stable: median CPU benchmark index1532.5→1726.5. Do not infer a precisely attributable percentage improvement.

The before trace's homepage `FunctionCall E` maps to the compiled HomeCinema render/registerScenes/refresh callback. Its longest observed durations are91.007/78.220/52.232ms across the three runs, with additional25.466/22.260/20.369ms page callbacks. Trace durations are observed, not simulated4x TBT. Shared chunk3158 contains Next.js/RSC/router code and contributes1035–1540ms total bootup per baseline run; React/runtime hydration is also substantial. GSAP core contributes310–330ms total bootup, with one individually reported ScrollTrigger entry60ms (the diagnostic table has reporting thresholds). These inclusive diagnostics must not be summed into a GSAP-only CPU claim. No analytics script exists in the inspected layout. The lab permits only the fixture/loopback resources and cannot determine hosted third-party costs; nothing was disabled in the application.

### Evidence-based change

At top-of-page mobile/coarse-pointer startup, defer engine imports and scene measurements until wheel/touchmove/native scroll or a scrolling key outside editable fields. No arbitrary timer, Lighthouse detection, invisible content or disabled marketplace function. Initial layout remains readable and search/links immediately work. Full desktop, restored scroll positions, and already-engaged resize/preference changes initialize immediately. Activation runs the same light choreography; one-shot passive listeners and stale-import guards clean up on route/preference changes. Reduced motion cancels pending setup and restores static content.

New tests verify pending static content, early typing, preference cancellation, route/back cleanup, keyboard PageDown and real forward/reverse mobile motion. Existing responsive tests now explicitly assert the pending state and issue wheel input before asserting animation; animation/spacing/overflow assertions remain intact. No test was skipped, deleted or given a larger timeout.

### Repeated before/after results

| Mobile Home, motion enabled    | Before (3 runs)    | After (3 runs)                     |
| ------------------------------ | ------------------ | ---------------------------------- |
| Performance median (range)     | 73 (72–77)         | 82 (76–88)                         |
| LCP median                     | 3.099s             | 3.111s                             |
| TBT median (range)             | 945ms (626–1000)   | 441ms (368–640)                    |
| CLS, each run                  | 0                  | 0                                  |
| Script transfer, each run      | 252,425 bytes      | 205,931 bytes                      |
| CPU benchmark median           | 1532.5             | 1726.5                             |
| Enhancement state at audit end | light, initialized | pending, motion preference enabled |

Startup transfer is reproducibly46,494bytes lower and the homepage initialization callbacks/vendor evaluation disappear from the recorded after navigation traces. Script evaluation median1741→1331ms, but shared hydration remains. Median scores/TBT are better in this batch; score/TBT ranges overlap slightly and CPU calibration differs, so the full median reduction cannot be assigned to this change. LCP is effectively unchanged and still above2.5s. Original mobile74/TBT786ms and desktop98 measurements are historical, not the fresh before baseline.

This is a real deferral tradeoff, not removal of animation. First-scroll Chromium at actual4x CDP CPU throttling records53ms and140ms long tasks during a1563ms activation observation window, including a1s settle wait. That window is not interaction latency or INP. WebKit verifies motion but does not expose the Long Tasks API here. Future low-power/device testing must assess the first gesture; runtime cost is postponed rather than eliminated. Vendor bundle bytes are unchanged. No field INP/FPS or hosted performance claim.

### Commands and evidence

```powershell
node scripts/run-premium-performance.mjs cinematic-mobile-startup-before --home-only --motion --profile
node scripts/run-premium-performance.mjs cinematic-mobile-startup-after --home-only --motion --profile
$env:PREMIUM_CATALOG_FIXTURE='1'
$env:PREMIUM_RUN_LABEL='cinematic-mobile-activation'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts cinematic-motion.spec.ts --grep 'mobile activation|mobile first-scroll'
# 4/4 PASS; separate CPU-throttled activation sample, not concurrent with Lighthouse.
$env:PREMIUM_RUN_LABEL='cinematic-mobile-final'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts cinematic-quality.spec.ts cinematic-catalog-quality.spec.ts cinematic-motion.spec.ts navigation.spec.ts scroll-lifecycle.spec.ts account.spec.ts marketplace.spec.ts catalog.spec.ts catalog-ssr.spec.ts explore.spec.ts public.spec.ts hydration.spec.ts
```

The first sandboxed browser launch failed before measurement, and the initial profiling writer used an obsolete artifact key. The successful three-run baseline uses Lighthouse's actual `Trace`/`DevtoolsLog` artifacts; these setup errors are not scored runs. No measurements from those failed attempts are included. Harness now saves optional raw artifacts in the ignored directory, records pending state, and uses actual formFactor in new filenames. Older report filenames remain unchanged.

Final regression/a11y results and Git preparation are recorded below after checks complete.

Regression diagnosis: the first full attempt found three Chromium width cases (360/390/768) with workflow progress0, then was stopped to investigate. An isolated390px run reproduced the exact original `progress > 0` failure. The newly added activation wheel was still easing toward80px when Playwright's `scrollIntoViewIfNeeded` jumped to the workflow; Lenis subsequently restored its active wheel target. Synchronize automated section navigation with actual gesture completion: assert scrollY>75 (or>35 for the40px geometry gesture) and absence of Lenis's `lenis-scrolling` class. No fixed sleep, larger timeout, skipped assertion or application workaround. All six affected Chromium/WebKit width cases passed after that timing correction. The interrupted/failing artifacts are preserved separately; they are not final verification.

Shared-runtime attribution refinement: the trace's repeated chunk3158 line22/column17733 `w` function maps to React Scheduler's MessageChannel work loop (`unstable_now`, priority queue, callbacks). Its child work includes hydration/rendering and cannot be separated into individual dependencies from the bootup total alone. This supports a shared React/Next startup bottleneck in addition to the directly identified HomeCinema callback; it does not justify claiming GSAP causes all TBT.

Bundle accounting refinement: the lazy engine graph also includes chunk9115 (GSAP CSSPlugin/export entry), beyond the previously reported core+ScrollTrigger pair. Before requests are core20,334bytes, entry8,555bytes, ScrollTrigger17,854bytes (47,743 total HTTP transfer); after startup requests none of these three. The homepage controller adds249bytes of transfer, yielding the measured46,494byte net reduction. Full lazy engine local gzip is45,538bytes (core19,930 + entry8,158 + ScrollTrigger17,450), not37,380 for the entire graph. Gzip recompression and HTTP transfer accounting differ slightly. Earlier37,380 values describe only the two named vendor chunks. All three remain available on first activation; no dependency was removed or feature disabled.

### Git preparation and retention

Full cumulative source/package/lockfile/harness diff and new controller/config/tests reviewed. No unrelated tracked path or backend/schema/payment/deployment edit. A bounded signature inspection of changed/untracked non-secret files found no private-key, AWS access-key, live Stripe secret or credential-bearing Redis/Postgres URL matches; it does not replace a dedicated secret scanner. No `.env` file was opened. The index remains empty.

Exact allowlist: [TASCORA_CINEMATIC_COMMIT_ALLOWLIST.md](TASCORA_CINEMATIC_COMMIT_ALLOWLIST.md),44 literal paths. It covers the preserved cumulative cinematic implementation, previous verified UI fixes and current mobile optimization. Essential performance evidence is18 files/4,750,762bytes: all relevant phase summaries (including unfavorable batches), six new raw mobile LHR JSONs, compact trace/activation attribution and the final quality observers.

Every report is classified by exact path/size in [TASCORA_CINEMATIC_ARTIFACT_INVENTORY.json](TASCORA_CINEMATIC_ARTIFACT_INVENTORY.json). Current48 generated HTML presentations total43,607,244bytes and can be regenerated from raw LHR JSON. Proposed deletion of that exact set requires approval; no file was deleted. Another58 historical raw paths/35,750,259bytes are excluded from the compact commit list but preserved locally, pending an approved archive/retention decision. Do not discard unfavorable results. Full trace/Devtools artifacts, browser captures, profiles and isolated build checkouts remain ignored/local; never stage a directory glob or `.env`, secrets, debug logs or browser reports. No external archive has been created, and historical raw links currently refer to local evidence.

### Final optimization verification

Final production build (same source measured above) PASS: webpack/TypeScript42 pages, both Home locales SSG. `pnpm.cmd --filter web lint:strict` and `pnpm.cmd --filter web typecheck` PASS after the controller change. `pnpm.cmd exec vitest run --config .premium-performance/unit-quality.config.ts` PASS14/14 (envDir:false). Before/after raw Lighthouse configSettings compare identical; all six new scored runs have no runtimeError. Profiling/setup failures are disclosed above.

Final full matrix **128/128 PASS**, workers1/retries0, zero skips,6.1min:

```powershell
$env:PREMIUM_CATALOG_FIXTURE='1'
$env:PREMIUM_RUN_LABEL='cinematic-mobile-verified'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts cinematic-quality.spec.ts cinematic-catalog-quality.spec.ts cinematic-motion.spec.ts navigation.spec.ts scroll-lifecycle.spec.ts account.spec.ts marketplace.spec.ts catalog.spec.ts catalog-ssr.spec.ts explore.spec.ts public.spec.ts hydration.spec.ts
$env:PREMIUM_RUN_LABEL='cinematic-mobile-axe'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts accessibility.spec.ts --grep 'WCAG scan home'
# 4/4 PASS; Chromium/WebKit390/1280px, WCAG A/AA violations=[];14.7s.
git diff --check
# PASS; index empty. No staging/commit/push/merge/deploy.
```

Marketplace/auth/navigation/SSR/Favorites/orders/messages/API-error cases remain intact. Real-scroll/reversal, pending cleanup, route/back, responsive360–1920, reduced-motion and idle/lifecycle checks passed. Actual desktop/mobile scene screenshots/videos are in ignored `test-results-premium/cinematic-mobile-verified`; reviewed the [mobile featured entrance](../test-results-premium/cinematic-mobile-verified/cinematic-quality-editoria-8087e--and-sticky-geometry-at-390-chromium/featured-0.45.png), retaining spacing, proportions and direct navigation. No new visual feature or styling was introduced.

Local optimization and Git preparation are complete; no failing required check remains. First-scroll long tasks, shared React/Next hydration, unchanged≈3.11s mobile LCP, CPU variance, hosted/field CWV and physical low-power/Safari/iOS remain explicit limits. Next steps: review the44-file allowlist, approve a precise HTML cleanup/archive policy if desired, evaluate first-gesture performance on devices/stable CI, and separately authorize any future staging/commit/push. Task-owned servers stopped after final verification; user work and all artifacts are preserved.

Final review covers150 modified/untracked non-secret files; the44 allowlisted paths all exist and essential byte totals match the inventory. Index remains empty and diff-check passes. On stopping the preview, accumulated stderr again included four destination-stream-closed entries without request context, the same previously documented digest3562677940. All browser/runtime checks passed, but cancellation attribution is not conclusive and clean server-log certification remains excluded. No unrelated server workaround was introduced.

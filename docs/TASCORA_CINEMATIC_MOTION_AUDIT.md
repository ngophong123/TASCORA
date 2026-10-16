# TASCORA cinematic homepage motion audit

> Evidence retention (2026-10-16): generated HTML/raw Lighthouse JSON and non-curated screenshots referenced below are retained **locally**, outside Git. Historical counts describe the original capture phase. See [QA evidence guide](QA_EVIDENCE.md) for the 53 versioned compact JSON files, eight curated screenshots and local-only evidence policy. No source evidence was deleted.

Date: 2026-10-13. Branch: `feat/premium-ui-redesign`, existing Draft PR #4.

## Starting point

The existing premium marketplace UI, published-service API cards, search, localization, Favorites, dashboards and routing were retained. The uncommitted first motion pass already added GSAP 3.15.0, a small homepage controller, 24px depth and a workflow rail. It had no ScrollTrigger choreography. Existing on-demand Lenis, native route fades, Geist optional font loading, reserved image dimensions and reduced-motion behavior were inspected before extending it.

No new app, Figma work, backend/schema/payment/security/deployment change, production connection, commit, push, merge or PR creation occurred. No additional dependency installation was necessary in this phase. The earlier GSAP package/lockfile changes remain in the working tree; Motion for React is already available as `framer-motion` and was not duplicated or added to these scenes.

## Animation architecture

`HomeCinema` is a homepage-only client enhancement around server-rendered children. The page and `StaticMarketplace` remain server components; both locale homepages remain statically generated. Content is visible in the initial HTML. GSAP core and its included ScrollTrigger plugin load dynamically only when reduced motion is disabled.

ScrollTrigger instances use `scrub: true` and continuous `onUpdate`/`onRefresh` progress callbacks. GSAP `quickSetter` writes transforms; no time-based tween seeking, artificial entrance loader, invisible headline, auto-scroll or competing animation engine owns those properties. Existing card-image CSS hover zoom acts on the nested image, not the GSAP wrapper.

There are no ScrollTrigger pins or horizontal scroll traps. Workflow uses a native CSS sticky heading on capable desktops. Published cards remain in a navigable grid, rather than a pinned horizontal gallery that could obscure focused cards or Favorites. This is the featured-work showcase supported by the current service data, not a fabricated portfolio dataset.

### Event-driven ScrollTrigger integration

The installed 3.15.0 plugin starts a continuous `_rafBugFix` loop and a sync interval when globally enabled. The controller temporarily enables it to register new instances, disables global scheduling without resetting their styles, then enables its owned instances only. A coalesced frame from native scroll/resize events drives `ScrollTrigger.update()`; layout changes drive `refresh()`. No library source is patched and no browser RAF API is overridden by application code.

The homepage is currently the sole ScrollTrigger owner. This version-pinned integration uses public enable/disable/update/refresh APIs, but global scheduling belongs to the controller: a future independent ScrollTrigger user must introduce shared ownership before using the same global controls. GSAP upgrades must rerun lifecycle tests. It deliberately does not support timed scrubs, snap or plugin pins, which would require revisiting the driver.

Lenis remains the existing on-demand implementation: it moves the real browser scroll position and stops when scrolling settles. No GSAP ticker is attached to Lenis, and no smooth-scrolling library is added. Native keyboard scrolling, dashboard scrolling, visibility handling and reduced-motion switching passed the existing regression.

### Cleanup and asynchronous layout

- Generation guards prevent a stale dynamic import from creating a second controller.
- Weak ownership tracking prevents repeated mutation/refresh registration of the same node; removed triggers are killed and trigger IDs are monotonic.
- Public API children added after hydration are discovered by a child-list MutationObserver.
- ResizeObserver, captured image load events and font `loadingdone` refresh measured positions.
- Unmount/preference/breakpoint changes cancel pending frames, disconnect observers, remove listeners, kill owned triggers, restore original inline styles and restore GSAP auto-sleep configuration.
- Hidden documents cancel scheduled frames; visible documents refresh. Focus inside moving content centers that wrapper so interaction does not keep drifting.
- Import failure leaves the static marketplace available. No essential content uses an opacity-zero initial state.

## Scroll sequences

The homepage order is hero → discover talent → categories → featured services → workflow → final CTA.

| Scene           | Implemented motion                                                                                                    | Interaction preserved                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Hero            | Real API service image scales from 1 to 1.20, drifts up to 6%; service panel depth up to -52px; decorative scroll cue | Headline, search and primary actions do not move or fade            |
| Discover talent | Heading and real seller cards enter at different offsets, up to 30/48px                                               | Profile navigation, genuine seller/review data                      |
| Categories      | Restrained up-to-20px stagger across taxonomy links                                                                   | Actual category slugs and direct navigation                         |
| Featured work   | Published service cards enter with varied 40–68px depth, heading 36px                                                 | Card links, seller information, prices and Favorites                |
| Workflow        | Sticky editorial heading, chapter rail and sequential accents over the real three steps                               | All step descriptions remain in document order; no forced scrolling |
| Final CTA       | 40px title reveal into the existing invitation panels                                                                 | Seller registration and service discovery links                     |

There is no decorative background loop or circular mask covering content. Motion was selected for the existing real service imagery and editorial layout rather than adding unrelated media.

## Responsive and reduced motion

Full choreography requires at least 1024px, a fine pointer, no Save-Data hint, at least four hardware threads when reported, and at least 4GB device memory when reported. Other devices use 6–8px entries, a 4% hero image scale and 1% drift; the heading is not sticky. Device hints are optional, not a claimed benchmark of device capacity.

Workflow dimensions are defined in CSS before hydration; enabling motion does not replace its layout or inject pin spacing. At narrower widths the existing natural grid/stack adapts. Reduced motion skips the GSAP imports and disables scrubbing/stickiness, restores inline transforms, retains all text/links, and presents static chapter accents. The no-JavaScript test verifies headline and workflow visibility; the existing API-driven cards still require JavaScript as before.

## Exact application and test files

- `apps/web/src/app/[locale]/page.tsx`: existing section order and homepage-only controller boundary.
- `apps/web/src/components/motion/HomeCinema.tsx`: ScrollTrigger registration, device adaptations, transforms and cleanup.
- `apps/web/src/components/sections/Hero.tsx`: image wrapper, scene hooks and decorative cue.
- `apps/web/src/components/sections/PremiumMarketplace.tsx`: scene hooks and card wrappers; existing fetch/Favorites integrations retained.
- `apps/web/src/components/sections/StaticMarketplace.tsx`: workflow heading grouping, chapter/finale hooks; remains server-only.
- `apps/web/src/app/premium.css`: workflow rail, native sticky desktop layout, card-frame sizing and reduced-motion styles.
- `tests/premium/cinematic-motion.spec.ts`: viewport, real scrub/reverse, chapter movement, destination, resource-adaptation and idle-interval regressions.
- `apps/web/package.json` and `pnpm-lock.yaml`: GSAP addition from the preceding pass, preserved; no unrelated upgrades.
- This audit, `docs/PREMIUM_UI_HANDOFF.md`, and local raw observer/CPU reports document this phase. Earlier motion reports remain historical evidence.

## Failures found and corrected

1. Initial real-wheel test showed image translation but scale stayed at 1. GSAP 3.15.0's quickSetter alias path did not apply `scale` as intended. Explicit `scaleX`/`scaleY` setters fixed the implementation; the scale-change assertion passed unchanged.
2. A longer CPU sample detected eight RAF callbacks every two seconds, despite the older 500ms lifecycle assertion passing. Calling global enable after plugin registration without first disabling registration's scheduler orphaned a sync interval. Corrected initialization produced zero idle/settled callbacks. Added a two-second interval regression without weakening the older test.
3. A new scene test used `scrollIntoViewIfNeeded` on an already-visible next scene, producing no scrolling. It now sends real wheel input through the scrub range and retains the transform-change assertion.
4. The new service navigation test incorrectly assumed `srv-1`; the fixture actually issued `c000000000000000000000001`. It now asserts the exact fixture-issued ID and title, not merely any detail URL.

## Verification

All browser checks use the existing isolated production-preview whitelist and loopback synthetic API fixture. Hosted API calls are blocked; fixture content is confined to testing.

- Source `lint:strict`, final changed-source ESLint, TypeScript and isolated webpack production build passed. Build generated 42 pages; home remains SSG.
- Final affected Chromium suite: **30/30 passed**, no skips. Includes twelve cinematic checks, eleven live-marketplace regressions (Favorites success/failure, orders, messaging and real API state), three keyboard/search smoke tests, three observer scenarios and the original Lenis lifecycle check.
- Homepage axe mobile/desktop: **2/2 passed** at 390/1280. Automated scans are not a complete accessibility certification.
- Motion viewport checks passed at 360, 390, 768, 1024, 1280, 1440 and 1920; check overflow, runtime/hydration console errors, workflow and live reduced-motion cleanup.
- Actual wheel input verifies hero scale/reverse and movement in talent/categories/featured/finale. Service click verifies the exact destination ID/title.
- Preference/breakpoint/route changes preserve trigger counts. A 2GB memory hint at desktop selects light motion. No-JavaScript headline/workflow remains visible.
- Screenshots saved in ignored `test-results-premium/cinematic-scrolltrigger-verified`: hero start/scrub, four scene captures, and workflow at seven widths. Desktop hero/workflow/featured/talent and small-mobile workflow captures were visually inspected. Existing premium before/after snapshots were not overwritten. Screenshots demonstrate state and layout; movement is verified separately by scroll assertions, not a pixel-diff claim.

## Measured performance impact

Single unthrottled Chromium observer samples, 390×844, synthetic fixture data. They are **not** Lighthouse medians, hosted Core Web Vitals, or evidence of improvement beyond measurement noise.

| Route    | Before LCP | After LCP | Before/after CLS | Before/after idle RAF in 2s | Sampled interaction max before/after |
| -------- | ---------- | --------- | ---------------- | --------------------------- | ------------------------------------ |
| Home     | 432ms      | 204ms     | 0 / 0            | 0 / 0                       | 32 / 24ms                            |
| Services | 660ms      | 500ms     | 0 / 0            | 0 / 0                       | 40 / 32ms                            |
| Explore  | 692ms      | 672ms     | 0 / 0            | 0 / 0                       | 48 / 48ms                            |

Home observed JavaScript transfer increased from 231,453 to 250,638 bytes (+19,185; about 18.7KiB), including network overhead/prefetch. This compares against the preceding GSAP-core motion pass, not the original premium UI. Vendor chunk measurements: GSAP core 51,845 raw / 19,930 gzip bytes; ScrollTrigger 43,337 raw / 17,450 gzip bytes. Those two engine chunks were requested on Home and were absent from observed Services/Explore requests. Other page transfer totals vary with shared chunks and prefetch timing and are not treated as a bundle regression comparison.

Home's recorded long tasks were [68,51]ms before and [123,58]ms after. Extra engine parsing/initialization is a cost; these single samples do not establish a causal CPU regression estimate or a speed improvement. Content is never withheld for motion initialization.

Standalone desktop CPU sample at 1440×900, unthrottled, after startup and without concurrent browser tests:

- Idle two seconds: **0 RAF callbacks**, CDP TaskDuration delta **1.937ms**.
- Wheel/settling two seconds: **118 RAF callbacks**, TaskDuration delta **100.717ms**.
- Next settled two seconds: **0 callbacks**, TaskDuration delta **0.465ms**.

RAF callback counts combine Lenis and enhancement callbacks; they are not rendered-frame counts or proof of 60 FPS. CDP TaskDuration is sampled browser main-thread work, not system CPU utilization. No comparable pre-change CDP baseline was collected.

Raw data: `docs/performance/cinematic-scrolltrigger-before`, `cinematic-scrolltrigger-verified`; corrected CPU sample in `cinematic-scrolltrigger-final/cpu-scroll.json`. Earlier `cinematic-scrolltrigger-final` observer samples retain the intermediate interval defect and must not be presented as final results.

## Remaining verification and maintenance

- New throttled Lighthouse medians, field INP, real API/network latency, physical low-power devices and Safari/iOS are not measured in this phase. No hosted improvement or 60 FPS claim.
- Review the approximately 19KB additional homepage transfer against the product's motion budget; GSAP/ScrollTrigger together cost about 37KB gzip versus a native-only approach.
- Global ScrollTrigger scheduling currently assumes one homepage owner. Future pins, timed scrubs, snapping, additional owners or package upgrades require integration changes and lifecycle tests.
- Browser review covered English and the specified widths; Vietnamese copy/routing is preserved but has not received a separate cinematic visual review.
- Full repository CI was not rerun. Existing Draft PR #4 is untouched; work remains uncommitted and must be reviewed before release.

## Subsequent cross-browser quality audit

The historical remaining-verification list above is superseded by [TASCORA_CINEMATIC_QUALITY_AUDIT.md](TASCORA_CINEMATIC_QUALITY_AUDIT.md). Chromium/WebKit combined regression124/124 and final homepage WCAG scans4/4 passed. The quality phase fixes copy collisions, history overshoot, Lenis idle-resume clock jumps, stale animated targets, early-input hydration loss, WebKit focus and catalog sticky offsets. No marketplace/backend/payment contracts changed.

All42 recorded Lighthouse runs are complete; comparable final default mobile medians are Home89/LCP3.063s/TBT232ms, Services89/3.393s/190ms, Explore83/3.318s/231ms, CLS0. Defaults record reduced motion; explicit motion-enabled Home is mobile74/2.722s/786ms/CLS0 and desktop98/1.080s/46ms/CLS0.00172. Host variance prevents an improvement claim and mobile startup cost remains a release risk. Raw reports and screenshots are linked in the quality audit. Physical Safari/iOS and field INP remain unverified. New local observer3/3 and unit14/14 passed; fresh lint/typecheck/production build passed. Nothing staged/committed/pushed/deployed.

Subsequent focused startup pass: mobile engine/scene setup now waits for scroll intent while preserving the same light motion and immediate desktop/restored views. Fresh three-run before/after mobile medians73→82, TBT945→441ms, LCP3.099→3.111s, CLS0; startup transfer46,494bytes lower. CPU variance and remaining first-scroll53/140ms tasks limit improvement claims. Full engine graph includes CSSPlugin entry (45538gzip bytes); earlier37380 counted only the two named chunks. Final128/128 Chromium/WebKit,4/4 homepage WCAG,14/14 unit and lint/typecheck/build PASS. Quality audit contains full evidence and exact44-file commit allowlist link. No cleanup or Git mutation performed.

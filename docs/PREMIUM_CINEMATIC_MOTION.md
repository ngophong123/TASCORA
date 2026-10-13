# Homepage cinematic motion implementation

Historical first pass. The subsequent ScrollTrigger implementation and final
verification are documented in `docs/TASCORA_CINEMATIC_MOTION_AUDIT.md`.

Implemented on `feat/premium-ui-redesign`, building on the existing marketplace UI.

## Scope and architecture

- Homepage hero service panel and featured-services heading have continuous, restrained scroll depth (24px total travel).
- The real three-step workflow has a scroll-linked chapter rail and sequential chapter accents. Desktop and mobile retain the existing semantic reading order.
- GSAP 3.15.0 is dynamically loaded only by the homepage controller, only when reduced motion is disabled. Server-rendered children remain server components and are visible before hydration. No entrance loader, invisible headline, artificial loading, pin spacer, scroll hijacking, fabricated content, or new API behavior.
- `gsap.quickSetter` updates transforms in one scheduled frame per scroll/resize event. No GSAP ticker/Lenis ticker integration. Existing on-demand Lenis remains intact.
- ResizeObserver covers asynchronous content sizing; visibility handling cancels scheduled frames. Unmount and live preference changes restore original inline transforms and remove listeners/observers. Focus inside an animated panel centers its transform for a stable interaction position.
- Reduced motion preserves the complete static layout and chapter accents. No-JavaScript rendering retains the headline and workflow. Existing client-fetched cards still need JavaScript, as before.

## Verification and limits

An initial browser run passed 13 checks and failed the existing settled-frame assertion: paused tween seeking woke GSAP's global ticker (22 frames in the sampled 500ms window). This was an implementation regression, corrected with direct GSAP setters; the assertion was retained.

Production preview uses the existing isolated whitelist checkout and loopback synthetic API fixture, not hosted data. Viewport screenshots are test artifacts under `test-results-premium/cinematic-motion-final`, not production assets. Existing before/after UI snapshots were preserved. Desktop and 360px workflow captures were inspected.

Final verification results are recorded in the UI handoff. Observer reports in `docs/performance/cinematic-motion-final` are single, unthrottled local samples at 390×844 with synthetic API data. They are not Lighthouse scores, field INP, or evidence of hosted performance improvements. This phase has not rerun Lighthouse or the full CI suite.

This implementation concentrates motion on the homepage; catalog results and transactional dashboards retain their existing interaction system. The depth treatment is intentionally restrained and does not yet include pinned horizontal discovery, video sequences, or a whole-site cinematic redesign.

Installation note: the existing pnpm install lifecycle automatically ran Prisma client generation and reported loading an environment file. No secret values were printed or inspected, and no migration/database command was run. The lockfile was limited to the GSAP dependency entries; no unrelated dependency upgrades were retained.

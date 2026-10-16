# QA evidence retention

Updated 2026-10-16. The user approved untracking exactly 345 generated files from the cleanup manifest and a single follow-up commit containing cleanup, verified fixes and essential documentation. Original files remain unchanged on the local disk. No history rewrite, external archive or push is part of this operation.

## Local-only evidence

Raw Lighthouse LHR JSON/HTML, full screenshot matrices, image-loading diagnostics, runtime logs, Playwright traces/video and browser profiles are local evidence. Historical audit references to their paths do not promise files in a clean clone. The original path is preserved as inline code where a former clickable link was replaced with this guide.

The exact approved cleanup paths, original HEAD blob hashes, sizes and main/PR provenance are in [GIT_CLEANUP_MANIFEST.csv](GIT_CLEANUP_MANIFEST.csv). The 345 rows marked `UNTRACK_AFTER_APPROVAL` have now been untracked. Remaining raw reports that were already untracked or ignored are also preserved locally. No remote backup has been created. HTML may be regenerated from retained local LHR JSON; rerunning a benchmark is not guaranteed to reproduce historical measurements.

Some historical inventory sections classify raw files as essential. That classification describes evidentiary value, not a requirement to store every byte in Git. Read [the cleanup proposal and execution record](GIT_CLEANUP_PROPOSAL.md) and the retention metadata in [the cinematic inventory](TASCORA_CINEMATIC_ARTIFACT_INVENTORY.json) before interpreting those older sections.

## Historical compact performance evidence retained (53 JSON files)

All favorable, unfavorable and intermediate phase summaries/comparisons/observers are retained; this cleanup does not select only good scores. Lab measurements are not field INP, real-device certification or hosted performance results.

- [performance/after/explore-interactions.json](performance/after/explore-interactions.json) (7,030 bytes)
- [performance/after/home-interactions.json](performance/after/home-interactions.json) (9,661 bytes)
- [performance/after/services-interactions.json](performance/after/services-interactions.json) (7,515 bytes)
- [performance/after/summary.json](performance/after/summary.json) (28,983 bytes)
- [performance/before/explore-interactions.json](performance/before/explore-interactions.json) (8,472 bytes)
- [performance/before/home-interactions.json](performance/before/home-interactions.json) (9,869 bytes)
- [performance/before/services-interactions.json](performance/before/services-interactions.json) (8,905 bytes)
- [performance/before/summary.json](performance/before/summary.json) (29,029 bytes)
- [performance/cinematic-mobile-startup-after/summary.json](performance/cinematic-mobile-startup-after/summary.json) (10,149 bytes)
- [performance/cinematic-mobile-startup-before/summary.json](performance/cinematic-mobile-startup-before/summary.json) (10,099 bytes)
- [performance/cinematic-mobile-startup-profile.json](performance/cinematic-mobile-startup-profile.json) (39,905 bytes)
- [performance/cinematic-quality-after/summary.json](performance/cinematic-quality-after/summary.json) (28,833 bytes)
- [performance/cinematic-quality-before/summary.json](performance/cinematic-quality-before/summary.json) (28,795 bytes)
- [performance/cinematic-quality-confirm/summary.json](performance/cinematic-quality-confirm/summary.json) (28,814 bytes)
- [performance/cinematic-quality-desktop/summary.json](performance/cinematic-quality-desktop/summary.json) (10,034 bytes)
- [performance/cinematic-quality-final/summary.json](performance/cinematic-quality-final/summary.json) (30,195 bytes)
- [performance/cinematic-quality-motion/summary.json](performance/cinematic-quality-motion/summary.json) (10,527 bytes)
- [performance/cls-attribution/explore-interactions.json](performance/cls-attribution/explore-interactions.json) (8,781 bytes)
- [performance/comparison.json](performance/comparison.json) (4,298 bytes)
- [performance/final/explore-interactions.json](performance/final/explore-interactions.json) (8,146 bytes)
- [performance/final/home-interactions.json](performance/final/home-interactions.json) (10,090 bytes)
- [performance/final/services-interactions.json](performance/final/services-interactions.json) (8,989 bytes)
- [performance/final/summary.json](performance/final/summary.json) (28,980 bytes)
- [performance/phase2-after/explore-interactions.json](performance/phase2-after/explore-interactions.json) (6,488 bytes)
- [performance/phase2-after/home-cls-delayed-categories.json](performance/phase2-after/home-cls-delayed-categories.json) (16,228 bytes)
- [performance/phase2-after/home-cls-no-font.json](performance/phase2-after/home-cls-no-font.json) (16,223 bytes)
- [performance/phase2-after/home-cls-normal.json](performance/phase2-after/home-cls-normal.json) (16,191 bytes)
- [performance/phase2-after/home-interactions.json](performance/phase2-after/home-interactions.json) (8,170 bytes)
- [performance/phase2-after/services-interactions.json](performance/phase2-after/services-interactions.json) (6,434 bytes)
- [performance/phase2-after/summary.json](performance/phase2-after/summary.json) (28,754 bytes)
- [performance/phase2-before/explore-interactions.json](performance/phase2-before/explore-interactions.json) (8,156 bytes)
- [performance/phase2-before/home-cls-delayed-categories.json](performance/phase2-before/home-cls-delayed-categories.json) (16,468 bytes)
- [performance/phase2-before/home-cls-no-font.json](performance/phase2-before/home-cls-no-font.json) (16,226 bytes)
- [performance/phase2-before/home-cls-normal.json](performance/phase2-before/home-cls-normal.json) (16,502 bytes)
- [performance/phase2-before/home-interactions.json](performance/phase2-before/home-interactions.json) (8,676 bytes)
- [performance/phase2-before/services-interactions.json](performance/phase2-before/services-interactions.json) (7,269 bytes)
- [performance/phase2-before/summary.json](performance/phase2-before/summary.json) (29,003 bytes)
- [performance/phase2-comparison.json](performance/phase2-comparison.json) (4,274 bytes)
- [performance/phase2-final/explore-interactions.json](performance/phase2-final/explore-interactions.json) (7,594 bytes)
- [performance/phase2-final/home-cls-delayed-categories.json](performance/phase2-final/home-cls-delayed-categories.json) (16,224 bytes)
- [performance/phase2-final/home-cls-no-font.json](performance/phase2-final/home-cls-no-font.json) (16,200 bytes)
- [performance/phase2-final/home-cls-normal.json](performance/phase2-final/home-cls-normal.json) (16,228 bytes)
- [performance/phase2-final/home-interactions.json](performance/phase2-final/home-interactions.json) (7,953 bytes)
- [performance/phase2-final/services-interactions.json](performance/phase2-final/services-interactions.json) (6,396 bytes)
- [performance/phase2-final/summary.json](performance/phase2-final/summary.json) (28,769 bytes)
- [performance/phase2-verified/explore-interactions.json](performance/phase2-verified/explore-interactions.json) (7,654 bytes)
- [performance/phase2-verified/home-cls-delayed-categories.json](performance/phase2-verified/home-cls-delayed-categories.json) (16,221 bytes)
- [performance/phase2-verified/home-cls-no-font.json](performance/phase2-verified/home-cls-no-font.json) (16,210 bytes)
- [performance/phase2-verified/home-cls-normal.json](performance/phase2-verified/home-cls-normal.json) (16,211 bytes)
- [performance/phase2-verified/home-interactions.json](performance/phase2-verified/home-interactions.json) (9,704 bytes)
- [performance/phase2-verified/services-interactions.json](performance/phase2-verified/services-interactions.json) (6,457 bytes)
- [performance/phase2-verified/summary.json](performance/phase2-verified/summary.json) (28,835 bytes)
- [performance/smoke/summary.json](performance/smoke/summary.json) (3,218 bytes)

The new [pre-merge summary](performance/pre-merge-release-20261016/summary.json) is included in the approved commit scope, bringing the retained performance evidence to **54 compact JSON files**. No raw reports from that phase are added. Formatting may change its serialized byte count; the recorded measurements and configuration remain unchanged.

## Curated historical Premium UI screenshots retained (8)

These illustrate the earlier Premium UI before/after phase using synthetic fixtures. They do not replace the newer cinematic scrolling tests or establish real staging data. Full cinematic captures remain local-only under `test-results-premium`; audit reports retain their relative paths as inline text.

- [premium-ui/after/detail-1440.png](premium-ui/after/detail-1440.png)
- [premium-ui/after/home-1440.png](premium-ui/after/home-1440.png)
- [premium-ui/after/home-390.png](premium-ui/after/home-390.png)
- [premium-ui/after/home-768.png](premium-ui/after/home-768.png)
- [premium-ui/after/services-390.png](premium-ui/after/services-390.png)
- [premium-ui/before/home-1440.png](premium-ui/before/home-1440.png)
- [premium-ui/before/home-390.png](premium-ui/before/home-390.png)
- [premium-ui/before/home-768.png](premium-ui/before/home-768.png)

## Safety and maintenance

- No runtime source, authentication/security contract, database or marketplace data was changed by cleanup. The seven pending source/test fixes are preserved byte for byte.
- Do not add .env, Admin bootstrap SQL, account data, secrets, raw logs or traces. An absence of matching text patterns does not certify every binary/image/encoded field.
- .gitignore contains exact exceptions for the 53 compact JSON files, the fresh pre-merge summary and eight curated images; project configuration, translations, application assets and SQL migrations are not blanket-ignored.
- Untracking reduces the current tracked snapshot, not necessarily .git storage or clone size. Old commits retain their blobs. Other worktrees checking out a future removal commit may remove their tracked copies; back up needed local evidence separately before any later disk cleanup.
- This local commit is not merge approval. Check CI for its new SHA after a separately authorized push, and review the remaining staging/performance limitations in [PRE_MERGE_RELEASE_AUDIT.md](PRE_MERGE_RELEASE_AUDIT.md).

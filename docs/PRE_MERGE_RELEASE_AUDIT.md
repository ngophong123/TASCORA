# TASCORA — Pre-merge release audit

> Evidence retention (2026-10-16): generated HTML/raw Lighthouse JSON and non-curated screenshots referenced below are retained **locally**, outside Git. Historical counts describe the original capture phase. See [QA evidence guide](QA_EVIDENCE.md) for the 53 versioned compact JSON files, eight curated screenshots and local-only evidence policy. No source evidence was deleted.

Ngày kiểm tra: 2026-10-16 (Asia/Bangkok). Nhánh: `feat/premium-ui-redesign`.

**Kết luận: NOT READY để merge ngay.** Các gate còn mở là xác định/kiểm chứng SHA chứa bản sửa local và duyệt log/artifact của PR; không phải một lỗi marketplace runtime mới chưa sửa. Chi tiết/checklist ở cuối.

**Cleanup follow-up (2026-10-16):** người dùng đã phê duyệt phương án đầy đủ345 file; đã stage đúng345 deletion bằng `git rm --cached`, không xóa file vật lý. Index hiện giữ53 compact performance JSON và8 curated screenshots; `.gitignore`/documentation updates chưa stage. Gate lựa chọn retention đã được giải quyết local, nhưng commit review và CI của SHA mới vẫn chưa thực hiện. Xem [nhật ký cleanup](GIT_CLEANUP_PROPOSAL.md#nhật-ký-thực-thi-cleanup-đã-duyệt) và [evidence guide](QA_EVIDENCE.md); các thống kê181/107.86MiB và index-rỗng bên dưới là thời điểm audit **trước cleanup**, không phải trạng thái hiện tại.

## Trạng thái và phạm vi bằng chứng

- Local HEAD và PR #4 head: `dc6fbcfc595377ceaf5578949ed7522c7179892d`.
- GitHub API được đọc lại sau lần gián đoạn: PR open, **Draft**, mergeable=true, mergeable_state=clean. Base main: `5549d3e6d5ff799a24d06e5a38cf0cb5b42939b8`.
- [CI mới nhất 38401357118](https://github.com/ngophong123/TASCORA/actions/runs/38401357118): completed/success, event=pull_request, head_sha đúng SHA trên; cả Lint & Typecheck, Playwright E2E Tests, Lighthouse CI Audits đều success. Không dùng kết quả CI của commit cũ để thay cho commit hiện tại.
- CI đó **không bao phủ working tree chưa commit**, gồm bản sửa thông báo đăng ký EN/VI, trang verification và regression tests. Kết quả local bên dưới kiểm tra working tree này.
- Local `main` đang cũ (`6c1b008…`), không dùng làm chuẩn phạm vi PR. GitHub compare xác nhận ahead=5/behind=1; commit trên main là merge PR #3 Redis, chứa commit `c18f2e2…` đã là tổ tiên feature. Diff theo merge-base `c18f2e2de21f12ca65ed10a102ededd5e8378b8e`: **541 file**, không có thay đổi `apps/api` hoặc `prisma`. Đây khớp changed_files=541 từ PR API. Thống kê ban đầu 936 file/60 backend/4 Prisma là so với local main cũ, không phải phạm vi PR thực tế.
- Không fetch/checkout/reset, stage, commit, push, merge, deploy, seed, migration, SQL hay truy cập database thật. Không đọc `.env`/secret. `docs/STAGING_FIRST_ADMIN_SQL.sql` không được đọc trong lượt này, không sửa và không stage. Các báo cáo được giữ nguyên.

## Tài liệu và triển khai đã rà soát

Đã đọc README gốc/frontend, `apps/web/AGENTS.md`, `PREMIUM_UI_AUDIT`, `PREMIUM_UI_RESUME`, `PREMIUM_UI_HANDOFF`, `PREMIUM_IMAGE_AUDIT`, `PREMIUM_PERFORMANCE_AUDIT`, cinematic motion/quality audit và commit allowlist; đối chiếu `DEPLOYMENT_AUDIT`, `STAGING_SETUP_REQUIRED`, runbook `STAGING_CORS_VERIFICATION`. Các kết quả lịch sử trong đó không tự động trở thành kết quả chạy mới.

Rà soát tập trung vào HomeCinema, SmoothScrollProvider, hero/search/navigation, tokens/CSS responsive, AuthPanel/verification, layout metadata, catalog SSR/data loader, API URL/config validation, CORS middleware, workflow và cấu hình test. Không tuyên bố chứng nhận an toàn toàn bộ 541 file chỉ từ rà soát này.

- GSAP/ScrollTrigger import động, chỉ Home sở hữu scenes; generation/disposed guards tránh import muộn sau cleanup. Observer/listener/RAF/trigger/style được cleanup. Refresh khi resize/font/image thay đổi. Global disable/config giả định chỉ một owner; thêm owner/pinning mới cần integration review.
- Mobile giữ nội dung tĩnh và actions khả dụng, khởi tạo cùng light choreography khi có ý định scroll; desktop/restored scroll khởi tạo ngay. Reduced-motion không khởi tạo cinematic engine, đổi preference cleanup. Không ẩn nội dung để lấy điểm.
- Lenis dùng RAF theo nhu cầu, cleanup visibility/preference, dashboard dùng native scrolling. Một engine không đồng thời điều khiển cùng thuộc tính với engine khác trong các scenes đã kiểm tra.
- Đo lại chunks production hiện tại (gzip Node zlib, không phải tổng route transfer): GSAP core `1d560da6.3528711d48bb638c.js` 51,845 raw/19,930 gzip bytes; ScrollTrigger `9162.ea4af1a628cd310e.js` 43,337/17,450; CSSPlugin `9115.2d898234e905b1a9.js` 19,439/8,158. Tổng engine graph **45,538 gzip bytes**, trùng số liệu audit trước. Không tính chỉ hai chunk rồi bỏ CSSPlugin. Không có thay đổi dependency/runtime animation trong lượt này.
- Catalog SSR dùng API anonymous/no-store, deadline 5 giây; error/retry thật, không thay bằng mock trong production. Vẫn tải toàn bộ trang catalog tuần tự để bảo toàn filter hiện tại: có rủi ro scale/cold-start, chưa phải giải pháp catalog lớn.
- Geist display optional hạn chế font-swap CLS, có đánh đổi fallback font ở kết nối chậm. Canonical/locale/verification noindex được kiểm tra bằng browser. `robots.txt` hiện 404 theo test, không phải cấu hình SEO đầy đủ.
- Form xác minh giữ API/security hiện tại. Thông báo đăng ký workspace là lỗi copy EN/VI đã sửa trong working tree trước lượt audit; handler không tự redirect hoặc cấp token. Không có runtime fix mới trong lượt audit này.
- Lượt browser mới phát hiện test `hero image scrubs … routes and preferences do not duplicate triggers` trên WebKit thất bại ở dòng 74 sau Back về Home tại 768px: expected 21 triggers, thực tế `.home-cinema[data-cinema-pending=true]`. Test đang đòi mobile khởi tạo không có scroll intent, trái với chính sách deferral và test mobile activation hiện hữu. Sửa **test** để wheel thật sau Back, assert scrollY>40, mode=light, giữ exact trigger count và thêm scale>1. Không tăng timeout, skip hay làm giảm assertion về motion/cleanup. Kết quả rerun được ghi phía dưới.

## Kiểm tra local

Production preview được dựng bằng whitelist frontend không copy `.env`, font Geist lấy từ cache đã có, public origin tổng hợp và fixture loopback 73 services/100ms. Không chạy ứng dụng backend với Neon/Redis thật. Các bài unit/API/security dùng in-memory mocks, `envDir:false`, NODE_ENV=test và URL dependency tổng hợp loopback port 1; database suites không chạy.

| Kiểm tra                               | Kết quả đã xác minh                                                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm.cmd lint:strict`                 | PASS, strict frontend ESLint                                                                                                                                                                                                           |
| `pnpm.cmd lint:api`                    | PASS, backend ESLint                                                                                                                                                                                                                   |
| `pnpm.cmd typecheck`                   | PASS, cả apps                                                                                                                                                                                                                          |
| `pnpm.cmd --filter @taskora/api build` | PASS, tsc                                                                                                                                                                                                                              |
| Isolated frontend production build     | PASS, webpack/TypeScript/42 pages, Home EN/VI SSG; giữ kết quả hợp lệ trước gián đoạn, không build lại khi source không đổi                                                                                                            |
| Vitest unit/API/security               | 199/201 PASS ở batch đầu, 2 timeout trust-proxy; chạy riêng cùng assertions/default timeout **2/2 PASS** (4.11s, tests 84%). Không gọi đó là một batch 201/201 PASS; hai lần chạy bao phủ đủ 201 bài. Không tăng timeout/skip/sửa test |
| Browser functional/cinematic/metadata  | Batch rộng 149/150 PASS (7.1min); lỗi test mobile Back đã sửa, targeted rerun 6/6 PASS (3 lượt mỗi engine, 48.2s). Không trình bày thành một batch 150/150                                                                             |
| Các đường CI từng lỗi                  | 8/8 PASS (16.6s): Orders status/detail, dashboard/message, gig wizard, listing→detail, package, add-ons, checkout, Chromium production local                                                                                           |
| Accessibility                          | **80/80 PASS**, 3.5min: 20 routes × 390/1280 × Chromium/WebKit; WCAG2A/AA/2.1AA/2.2AA tags, violations=[]; reduced-motion mặc định. Keyboard và live preference được kiểm tra thêm trong motion suite                                  |
| Lighthouse production local            | **9/9 hoàn tất**, 3 runs/route, motion preference enabled, không runtimeError; bảng metric ở dưới                                                                                                                                      |
| `git diff --check`                     | PASS cuối lượt; Git index rỗng                                                                                                                                                                                                         |

Lệnh build đã hoàn thành:

```powershell
node scripts/premium-preview.mjs --build --production-check --with-payment-fixture --with-catalog-fixture
```

Lệnh browser đã chạy với `PREMIUM_CATALOG_FIXTURE=1` (từng suite tuần tự vì fixture mutable):

```powershell
$env:PREMIUM_RUN_LABEL='pre-merge-functional'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts cinematic-quality.spec.ts cinematic-catalog-quality.spec.ts cinematic-motion.spec.ts navigation.spec.ts scroll-lifecycle.spec.ts account.spec.ts marketplace.spec.ts catalog.spec.ts catalog-ssr.spec.ts explore.spec.ts public.spec.ts hydration.spec.ts registration-verification.spec.ts metadata.spec.ts
$env:PREMIUM_RUN_LABEL='pre-merge-motion-repeat'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts cinematic-motion.spec.ts --grep 'hero image scrubs' --repeat-each=3
pnpm.cmd exec playwright test --config=.premium-performance/pre-merge-e2e.config.ts dashboard/dashboard-flows.spec.ts marketplace/gig-detail-and-order.spec.ts
$env:PREMIUM_RUN_LABEL='pre-merge-accessibility'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts accessibility.spec.ts
```

Config E2E ignored kế thừa config gốc, chỉ bỏ webServer để dùng production preview đã có, baseURL localhost:3210, chromium/workers1/retries0. Giữ timeout/assertions của gốc; không dùng dev server hay retry để che lỗi.

### Visual evidence mới

Batch mới tạo 160 PNG và 16 WebM trong ignored `test-results-premium/pre-merge-functional`. Đã trực tiếp xem desktop hero1440, mobile featured390, workflow tablet768 và desktop1440: hierarchy/spacing, tỉ lệ ảnh và sticky heading không chồng nhau trong những khung hình này. Các bài geometry/motion kiểm tra thêm 360/390/768/1024/1280/1440/1920, wheel thật/đảo chiều/resize/back/reduced-motion, input trước hydration, no-JS search EN/VI, trigger cleanup và idle scheduler. Screenshot không phải chứng minh FPS hoặc tự động pixel-diff mọi hình.

- [Hero desktop — local evidence](QA_EVIDENCE.md#local-only-evidence) (local path: `../test-results-premium/pre-merge-functional/cinematic-quality-editoria-3989d-and-sticky-geometry-at-1440-chromium/hero.png`)
- [Featured mobile — local evidence](QA_EVIDENCE.md#local-only-evidence) (local path: `../test-results-premium/pre-merge-functional/cinematic-quality-editoria-8087e--and-sticky-geometry-at-390-chromium/featured-0.45.png`)
- [Workflow tablet — local evidence](QA_EVIDENCE.md#local-only-evidence) (local path: `../test-results-premium/pre-merge-functional/cinematic-quality-editoria-cf211--and-sticky-geometry-at-768-chromium/workflow-0.45.png`)
- [Workflow desktop — local evidence](QA_EVIDENCE.md#local-only-evidence) (local path: `../test-results-premium/pre-merge-functional/cinematic-quality-editoria-3989d-and-sticky-geometry-at-1440-chromium/workflow-0.12.png`)

Đây là dữ liệu marketplace tổng hợp chỉ trong test; ảnh screenshot không chứng minh catalog staging có records hoặc account thật đã hoạt động. WebKit Playwright không đồng nghĩa Safari/iOS thiết bị thật; chưa thử screen reader thủ công/field INP.

Config local `.premium-performance/pre-merge-vitest.config.mts` là file ignored, include unit/API/security, exclude database/E2E, envDir=false. Lệnh test:

```powershell
pnpm.cmd exec vitest run --config .premium-performance/pre-merge-vitest.config.mts
pnpm.cmd exec vitest run --config .premium-performance/pre-merge-vitest.config.mts tests/api/trust-proxy.spec.ts
```

## Staging configuration và CORS

- Code dùng `WEB_URL` cộng `CORS_ORIGINS` phân cách dấu phẩy, trim/deduplicate, exact HTTPS origin, không wildcard Vercel. Socket và cookie CSRF cùng trust list. `credentials:true`; global cors xử lý OPTIONS trước limiter/auth routes. Không nới authentication, CSRF, rate limit hoặc TLS.
- Vercel build cần `NEXT_PUBLIC_API_URL=https://tascora-api-staging.onrender.com` (không `/api/v1` hoặc slash cuối), `NEXT_PUBLIC_WEB_URL` là canonical HTTPS origin đã được chủ dự án xác nhận. Server Next cũng phải truy cập được API vì catalog SSR.
- Render: `APP_ENV=staging`, `NODE_ENV=production`, `PAYMENTS_PROVIDER=disabled`; giữ các yêu cầu dependency/security hiện hữu. `WEB_URL` canonical và `CORS_ORIGINS` chỉ chứa các origin đã xác minh sở hữu. Không đọc giá trị hosted hoặc secrets để chứng nhận chúng đã đúng.
- Với frontend Vercel và API onrender là hai site khác nhau, operator cần kiểm tra `COOKIE_SAME_SITE=none` cùng Secure/HttpOnly và chính sách third-party-cookie của browser; cấu hình lax không đủ cho refresh cookie cross-site. Không đổi cấu hình trong audit. Kiểm tra login→refresh→logout từ đúng origin với CSRF header; không dán cookie/token vào log. Kiểm tra email delivery qua provider/plan thật theo account setup audit; không bypass verification hoặc dùng SQL Admin để kiểm thử.
- Ngày audit, OPTIONS anonymous public `/api/v1/services` với Preview ví dụ `https://tascora-staging-20yl810b4-realtime3.vercel.app` và control `https://audit-untrusted.invalid` **đều timeout 20s**. Không có status/headers để chứng nhận CORS; không suy diễn đây là lỗi allowlist. Không gửi credentials, gọi SQL hoặc sửa hosted data.
- Catalog staging rỗng đã được người dùng xác nhận trong database đã kiểm tra; đó không phải bằng chứng UI regression hay toàn database rỗng. Real marketplace/account/email delivery/onboarding cần test qua workflow hợp lệ sau này, không tạo tài khoản/dữ liệu trong audit.

## Git hygiene và artifact review

- **Đã có trong Git**: `docs/performance` 181 file = 64 HTML + 117 JSON, **107.86 MiB** theo kích thước working copies tracked. Tất cả thuộc diff PR thực tế. Đây là các đợt cũ, khác với 9 raw JSON được loại khỏi commit cinematic mới nhất.
- `dc6fbcf` đúng 35 file, gồm source/test và summary/compact evidence; không commit lại 9 raw JSON đã loại. Các raw file đó vẫn tồn tại local.
- `debug.log` **đang tracked và thay đổi trong PR**, 12,672 bytes. Không in/đọc nội dung log để tránh phơi lộ dữ liệu. Không chứng nhận log an toàn khi chưa có review riêng; cần chủ dự án quyết định loại khỏi PR hoặc chứng minh nội dung phù hợp. Không tự xóa/untrack.
- Không có `playwright-report`/`test-results` tracked theo filename scan; browser artifacts/checkouts/profiles mới ở các thư mục ignored. Chỉ `.env.example` và `.env.staging.example` có tên `.env*` tracked; không đọc nội dung chúng trong lượt audit.
- Scoped scan source/test/workflow không thấy pattern private key/GitHub token/AWS access key/Stripe live key có độ tin cậy cao; không phải chứng nhận absence mọi secret và không mở rộng kết luận sang log/raw reports.
- Performance reports, screenshots, account/CORS/catalog runbooks untracked hiện hữu được giữ. Không stage cả thư mục hoặc `git add .`. Không đụng đến SQL bootstrap Admin.

## Rủi ro và gate trước merge

1. **Gate còn mở — xác định release candidate**: sửa đăng ký hiện còn local; CI head xanh không bao phủ nó. Nếu muốn đưa bản sửa vào PR, người dùng cần review/chọn đúng source+tests rồi riêng biệt cho phép commit/push và chờ CI của SHA mới.
2. **Gate còn mở — log/artifact scope**: quyết định đối với tracked debug.log và 107.86 MiB HTML/JSON trong PR. Không xóa hay viết lại history ở lượt này. HTML/JSON không tự động là secret, nhưng bulk evidence/log không được xem là implementation đã duyệt.
3. **Giới hạn hosted**: timeout probe không xác minh CORS/reachability/runtime settings. Real Safari/iOS, Android low power, field INP, mail delivery và hosted cold-start chưa được chứng nhận.
4. **Performance**: mobile LCP/TBT và first-scroll activation vẫn cần ngân sách chấp nhận thực tế. CI Performance là warning <80 (không có error minimum65 trong cấu hình thực tế), chỉ 2 runs/route, nên success không chứng minh performance budget. Full-catalog snapshot và translation payload là các giới hạn scale đã biết.
5. **Non-blocker với phạm vi hiện tại**: ảnh cover lặp/format mismatch đã ghi trong image audit, dark mode/VI cinematic chưa có full visual certification; README cũ còn số lượng test/threshold không khớp cấu hình. Không thay ảnh persisted references hoặc mở rộng redesign.

## Lighthouse và performance — đo mới, không phải kết quả CI cũ

```powershell
node scripts/run-premium-performance.mjs pre-merge-release-20261016 --motion
```

Lighthouse12.6.1, Chrome153.0.8010.12, local production localhost3210, mobile412×823, simulated Slow4G/4x CPU, fixture73 services/100ms. Chín lượt serial, không chạy build/browser suite khác đồng thời. Settings của từng route so với historical mobile startup-after khớp JSON. Không upload; không tắt analytics/chức năng ứng dụng. Host vẫn không kiểm soát được tuyệt đối; benchmark index Home dao động **1073–1948.5**, không phải máy benchmark ổn định.

| Route    | Performance median (range) | LCP median (range)       | TBT median (range)   | CLS, mỗi lượt |
| -------- | -------------------------- | ------------------------ | -------------------- | ------------- |
| Home     | **81 (72–85)**             | **2.778s (2.700–3.089)** | **613ms (366–1217)** | 0             |
| Services | **83 (78–84)**             | **3.659s (3.594–4.047)** | **293ms (290–354)**  | 0             |
| Explore  | **75 (73–80)**             | **3.413s (3.369–3.752)** | **529ms (465–757)**  | 0             |

Accessibility100/BestPractices100 cho cả9 lượt; SEO92 Home (canonical domain tổng hợp),100 catalog. Không có runtimeError, runWarnings hoặc blocked third-party hosts trong9 report; không suy diễn điều này chứng minh hosted không có third-party cost.

### Attribution và so sánh đúng giới hạn

- LCP Home cả3 lượt là `h1.premium-display`; Services/Explore là ảnh card `article.group > div.relative > div.relative > img.object-cover`. Services run2 có image discoverable/eager, nhưng insight chưa thấy high fetchpriority hint. Đây là follow-up prioritization, không tự preload mọi ảnh để làm méo đo. Loader first-card preload hiện có được giữ.
- Không có **bất kỳ ba engine chunk GSAP/ScrollTrigger/CSSPlugin** nào trong network của9 lượt startup. Home ghi reducedMotion=false/pending=true: đây là đo navigation trước scroll, không đo chi phí activation. Services/Explore không mount cinema. Không thể quy TBT startup còn lại cho engine chưa tải.
- Home script transfer **205,911 bytes/12 requests** (cả3); Services214,391/13; Explore209,115/12. Đây là tổng observed transfer theo resource-summary, không phải static bundle gzip hay cam kết hosted compression.
- Shared Next/React chunk3158 đứng đầu bootup Services run2 (~756ms total, inclusive lab diagnostics); hydration/rendering vẫn là chi phí. LCP phase insight có thể là observed trace còn LCP metric là simulated; không cộng các phase observed rồi tuyên bố khớp simulated LCP. TBT là lab blocking, không phải INP.
- Historical focused mobile optimization đo trước→sau: Performance73→82, TBT945→441ms, LCP3.099→3.111s, CLS0; full methodology/caveats ở cinematic quality audit. Lượt hiện tại Home81/TBT613/LCP2.778 có range/CPU thay đổi; **không phải một optimization mới**, không tuyên bố cải thiện hoặc causal regression từ chênh median. Catalog3.4–3.7s vẫn vượt2.5s. Desktop98 là lịch sử, không phải một desktop Lighthouse mới trong lượt này.
- Không đo field INP/FPS, real API latency hoặc thiết bị Safari/iOS. First-scroll long tasks53/140ms trong audit trước vẫn là rủi ro đã ghi nhận; motion tests mới kiểm tra activation thật nhưng không biến chúng thành field metric.

Raw mới: [summary](performance/pre-merge-release-20261016/summary.json), cùng9 JSON và9 HTML theo tên `{home,services,explore}-mobile-{1,2,3}`. Tổng19 file/16,158,281bytes, **untracked, không thuộc đề xuất commit**. Các raw này phục vụ kiểm chứng local; không thêm hàng loạt vào PR. Giữ nguyên115 performance files untracked cũ và181 performance files tracked, không xóa/sửa bộ cũ. Không có batch Lighthouse dở dang.

## File thay đổi và trạng thái cuối

Trong lượt audit chỉ sửa `tests/premium/cinematic-motion.spec.ts` (+8 dòng, giải thích/scroll input/assertions) và tạo tài liệu này. Giữ nguyên bản sửa đăng ký từ lượt trước: `apps/web/messages/en.json`, `vi.json`, `src/app/[locale]/register/page.tsx`, `verify-email/page.tsx`, `tests/api/auth-lifecycle.spec.ts`, untracked `tests/premium/registration-verification.spec.ts`.

Nếu sau này được cho phép chuẩn bị commit phần fix+audit, danh sách ứng viên cần review là **8 file** sau, không phải quyền stage/commit trong lượt này:

```text
apps/web/messages/en.json
apps/web/messages/vi.json
apps/web/src/app/[locale]/register/page.tsx
apps/web/src/app/[locale]/verify-email/page.tsx
tests/api/auth-lifecycle.spec.ts
tests/premium/registration-verification.spec.ts
tests/premium/cinematic-motion.spec.ts
docs/PRE_MERGE_RELEASE_AUDIT.md
```

Không bao gồm SQL Admin, các staging runbooks chưa thuộc scope commit, raw performance mới/cũ, debug.log hay browser artifacts. Rà soát Git tiếp trước mọi thao tác được cho phép sau này; danh sách này không giải quyết tự động bulk artifact/log đã commit từ trước.

## Kết luận và checklist trước merge

**NOT READY** cho merge ngay tại SHA hiện tại, dù CI head đang xanh và local QA đã hoàn tất. Lỗi WebKit test vừa sửa cùng bản sửa thông báo đăng ký vẫn ở working tree, không có trong PR; log và bulk evidence chưa có quyết định review. Không còn local test/build/performance script đang chờ kết quả. Không che lịch sử149/150 hoặc199/201: các lỗi được chạy lại riêng đúng phạm vi như bảng trên, không chạy lại các bài đã có kết quả hợp lệ khi không cần thiết.

- [x] Xác minh PR/head/current CI đúngSHA qua GitHub API; actual diff không đổi backend/Prisma.
- [x] Lint frontend/backend, TypeScript, frontend/backend production builds PASS.
- [x] Unit/API/security bao phủ201 bài qua batch199pass+2 rerunpass; browser149pass+affected6repeatpass; regression8pass; axe80pass; Lighthouse9 hoàn tất. Không skip/delete/weaken tests.
- [x] Thực tế render/scroll, screenshots và keyboard/reduced-motion/route/back/resize được kiểm tra. App runtime không đổi trong audit, không cần build lại chỉ vì sửa test/doc.
- [ ] **Người dùng review release candidate**, quyết định đưa8 file fix/audit vào PR; chỉ commit/push khi được cho phép riêng, sau đó chờ cả3CI jobs cho **SHA mới**. Không dùng dc6fbcf CI để phê chuẩn SHA mới.
- [x] **Người dùng đã phê duyệt hygiene/retention**, cleanup345 file thực hiện local và giữ bản trên đĩa. Còn review deletion/ignore/docs và cho phép commit riêng; chưa có SHA/CI mới. Không purge history hoặc chứng nhận binary/log không có mọi dữ liệu nhạy cảm.
- [ ] Operator kiểm tra staging API readiness, exact CORS allowlist, cross-site refresh cookie và mail delivery; xác minh bằng browser Preview/canonical thật theo CORS runbook. Đây là hosted acceptance còn thiếu, không được làm giả bằng fixtures hoặc SQL Admin.
- [ ] Chấp nhận bằng văn bản performance limitations (mobile LCP>2.5s/TBT/first-scroll/full snapshot) hoặc mở follow-up có benchmark ổn định; Safari/iOS thật/Android yếu và fieldINP vẫn chưa được chứng nhận.
- [ ] Sau khi các gate được đáp ứng, kiểm tra lại latest PR SHA/checks và repo merge policy, chuyển Draft sang ready for review nếu người dùng muốn; merge/deploy là quyết định/thao tác riêng, không được thực hiện ở audit này.

Không kết luận còn lỗi marketplace runtime được tái hiện mà chưa xử lý. NOT READY ở đây là gate release/review chưa đóng, không phải khẳng định ứng dụng đã hỏng. Không chạy Admin SQL, không thay đổi dữ liệu thật, không stage/commit/push/merge/deploy hoặc xóa báo cáo.

### Shutdown và server-log limitation

Preview/fixture thuộc lượt audit đã được dừng sau Lighthouse. Khi thu output preview, có **3** entry `The destination stream closed early`, digest3562677940, giống limitation đã ghi trong cinematic quality audit. Chưa có route/request/timestamp để quy nguyên nhân; rapid navigation/no-JS có thể gây cancellation nhưng chưa chứng minh. Browser geometry/runtime/hydration checks và Lighthouse không có runtimeError; không dùng điều đó để tuyên bố server logs sạch. Nếu tái diễn ngoài cancellation, cần request-correlated logs trong một lượt riêng. Ctrl-C hai server trảexit1 là dừng chủ động, không phải test/build failure. Không bỏ qua một ứng dụng lỗi đã được tái hiện và cũng không thêm workaround server theo suy đoán.

### Verification sau cleanup đã phê duyệt

Lượt mới sau untracking/ignore/docs: strict frontend/backend lint và monorepo TypeScript PASS; unit+auth lifecycle **91/91 PASS**; auth/verification/hydration/cinematic Chromium+WebKit **52/52 PASS** (zero retries/skips). `git diff --check`/cached check PASS. Không đổi7source/test trong cleanup, không rebuild/benchmark lại; kết quả build/axe/Lighthouse phía trên vẫn được phân biệt là pre-cleanup. Kiểm tra547 file bảo toàn,345 staged deletions,53 retained compact JSON và8 curated screenshots đều PASS. Chỉ deletion đã được phê duyệt vào index; `.gitignore`,source/docs và fresh summary chưa stage. Chưa commit/push/merge/deploy, chưa có CI cho một SHA mới. Điều kiện tiếp theo là người dùng review/cho phép chuẩn bị commit, sau đó CI và các hosted acceptance còn lại như checklist; không tự tuyên bố READY TO MERGE.

### Commit authorization follow-up

The user has now separately authorized exactly one local cleanup/fix commit (no push/merge/deploy). Its scope is345 manifest deletions plus23 explicit additions/modifications, including the seven verified source/test files and essential evidence documentation. The53 retained historical JSON files and8 screenshots stay intact; one additional compact pre-merge summary is included. The four staging/account/SQL-review documents, Admin bootstrap SQL, environment files, raw reports and local logs are not added. Earlier working-tree/staging statements in this report describe their original audit phase. CI must still be checked for the new commit SHA after a separately authorized push; the previous dc6fbcf CI does not certify that new SHA. Hosted acceptance and the performance limitations remain open.

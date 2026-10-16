# Git cleanup trước merge PR #4 — đã phê duyệt và thực hiện local

Ngày: 2026-10-16. Branch `feat/premium-ui-redesign`, HEAD `dc6fbcfc595377ceaf5578949ed7522c7179892d`. GitHub API xác nhận main `5549d3e6d5ff799a24d06e5a38cf0cb5b42939b8`, PR open/Draft, head khớp local. Không dùng local main cũ để phân loại.

**Trạng thái mới nhất (2026-10-16):** người dùng phê duyệt phương án đầy đủ345 file. Đã thực hiện đúng345 `git rm --cached`, index chỉ chứa345 deletion; mọi file vật lý được giữ nguyên. `.gitignore` và tài liệu được cập nhật nhưng **chưa stage**. Không stage source, SQL Admin, `.env`, không commit/push/merge/deploy hay thao tác database. Các bảng và lệnh phía dưới giữ lại quyết định/guard đã duyệt; nhật ký thực thi ở cuối tài liệu.

Kiểm tra **trước thao tác**: hash readonly của406/406 artifact khớp HEAD; manifest407 dòng hợp lệ, index rỗng. Dry-run chọn đúng345 file trước khi thực thi. Guard từ chối nếu branch/HEAD/manifest/blob/dung lượng thay đổi. Sau thao tác đối chiếu hash547 file (406artifact+134performance local+7source/test): không có file nào mất hoặc đổi nội dung.

## Phân loại 107,86 MiB và artifact liên quan

Dung lượng là byte blob Git HEAD, không phải packfile size. Manifest ghi từng path, action, bytes, kind, origin, size trên main và HEAD blob SHA. `KEEP_TRACKED`/`UNTRACK_AFTER_APPROVAL` chỉ là **đề xuất**, không phải trạng thái index.

| Nhóm hiện tracked                                           |    File |                          Byte | Nguồn gốc                                 | Đề xuất                                   |
| ----------------------------------------------------------- | ------: | ----------------------------: | ----------------------------------------- | ----------------------------------------- |
| Lighthouse HTML generated                                   |      64 |                    58,439,591 | Mới trong PR                              | Bỏ theo dõi, giữ local                    |
| Lighthouse raw LHR JSON                                     |      64 |                    53,870,613 | Mới trong PR                              | Bỏ theo dõi, giữ local làm bằng chứng gốc |
| Summary mỗi phase                                           |      16 |                       363,017 | Mới trong PR                              | Giữ Git, gồm cả phase bất lợi/thử nghiệm  |
| Comparison JSON                                             |       2 |                         8,572 | Mới trong PR                              | Giữ Git                                   |
| Compact startup profile                                     |       1 |                        39,905 | Mới trong PR                              | Giữ Git                                   |
| Interaction/CLS diagnostic evidence gọn                     |      34 |                       373,541 | Mới trong PR                              | Giữ Git để bảo toàn căn cứ nhân quả       |
| **Tổng `docs/performance`**                                 | **181** | **113,095,239 (107.856 MiB)** | **Không có file nào trên main**           | Giữ53/bỏ theo dõi128                      |
| Screenshot matrix `docs/premium-ui`                         |     218 |                   125,027,727 | Toàn bộ mới trong PR                      | Giữ8/bỏ theo dõi210                       |
| Image-loading diagnostic JSON `docs/premium-ui/diagnostics` |       6 |                         8,427 | Mới trong PR                              | Bỏ theo dõi, giữ local                    |
| `debug.log`                                                 |       1 |                        12,672 | **Đã có trên main (7,722 bytes), PR sửa** | Bỏ theo dõi toàn file, giữ local          |

HTML chỉ là presentation có thể dựng lại từ LHR JSON. Raw LHR/ảnh lịch sử là bằng chứng thật, **không vô giá trị và không bảo đảm tái tạo đúng số đo/ảnh bằng rerun**; chuyển chúng ra khỏi Git không có nghĩa xóa khỏi đĩa hay chọn bỏ kết quả xấu. Các raw đã bị loại ở commit trước cũng giữ nguyên local.

## Giữ gì trong Git?

- **53 performance JSON hiện tracked** (785,035bytes/~0.749MiB): tất cả16 `summary.json`, `comparison.json`, `phase2-comparison.json`, `cinematic-mobile-startup-profile.json`, 34 observer/CLS JSON; từng tên trong manifest `KEEP_TRACKED`. Hai comparison có UTF-8 BOM; parser kiểm kê bỏ BOM trong bộ nhớ, không sửa file.
- **8 screenshot lịch sử Premium UI**, tổng10,133,893bytes (~9.664MiB): `docs/premium-ui/before/home-{390,768,1440}.png`, `after/home-{390,768,1440}.png`, `after/services-390.png`, `after/detail-1440.png`. Đây không phải chứng nhận cinematic mới nhất; ảnh cinematic hiện tại vẫn là evidence local/ignored theo audit.
- **Đề xuất thêm riêng** `docs/performance/pre-merge-release-20261016/summary.json`:31,134bytes, manifest `ADD_EVIDENCE_AFTER_APPROVAL`; giữ số đo mới kể cả Home TBT cao/Explore score75. Không thêm18 raw JSON/HTML cùng phase.
- Giữ README, các UI/handoff/performance/cinematic/CI audit Markdown, `docs/TASCORA_CINEMATIC_ARTIFACT_INVENTORY.json` (metadata), code/config/lockfile/tests và runtime assets. JSON package/tsconfig/translations không phải artifact. Không ignore toàn cục `*.json`, `*.png` hoặc `*.sql`.

Không có app/test/CI đọc các file đề xuất bỏ theo dõi làm input; visual tests **ghi screenshot/diagnostic**, không dùng chúng làm golden `toHaveScreenshot` baseline. Markdown có tham chiếu raw/ảnh nên cần cập nhật chú thích/link/inventory **sau phê duyệt, trước commit cleanup**, nói rõ evidence local và curated Git; không tạo đường dẫn archive từ xa giả.

## Lựa chọn phê duyệt và dung lượng

**Đề xuất đầy đủ:** manifest có345 `UNTRACK_AFTER_APPROVAL`,61 `KEEP_TRACKED`,1 `ADD_EVIDENCE_AFTER_APPROVAL` (407 dòng dữ liệu).

- 128 raw HTML/LHR:112,310,204bytes (~107.107MiB).
- 210 screenshot ngoài curated set:114,893,834bytes (~109.571MiB).
- 6 visual diagnostics:8,427bytes; debug.log12,672bytes.
- **Tổng bỏ khỏi snapshot tracked:227,225,137bytes (~216.699MiB)**. Giữ mọi file local. Sau thêm summary31,134bytes, giảm ròng~216.669MiB, chưa tính vài KiB tài liệu/ignore mới.

**Phương án tối thiểu:** chỉ129 file gồm64HTML+64rawLHR+debug.log,112,322,876bytes (~107.119MiB). Giữ toàn bộ screenshot/visual diagnostics tracked; cần phê duyệt đúng phạm vi và dựng lại ignore proposal tương ứng, không áp dụng mù rules của phương án đầy đủ.

Đây **không phải** cam kết `.git`/clone/fetch nhỏ đi216.7MiB. Untrack ở commit mới không purge blob trong lịch sử feature; merge kiểu giữ lịch sử vẫn mang lịch sử đó. Không đề xuất filter-repo/BFG/rebase/force-push/GC trong tác vụ này. Quyết định squash merge hoặc history retention là việc riêng của chủ repository.

## Kiểm tra log, privacy và artifact chưa tracked

- Đã scan nội dung text của log, toàn bộ tracked HTML/JSON trong hai artifact roots và135 report/metadata file bổ sung (134 performance untracked + metadata cinematic). Chỉ xuất loại/count, **không in nội dung/token/URL có credentials**. Không thấy pattern private key/GitHub token/AWS key/Stripe live key/JWT/Bearer/credential URL/secret assignment/email/auth query theo rule đã dùng. Đây không phải chứng nhận không có mọi secret: encoded/binary pixels, trace/ZIP và lịch sử Git chưa được chứng nhận. Không có căn cứ yêu cầu rotate credentials chỉ từ lượt scan này.
- debug.log có65 dòng/64 lần nhắc error, không phải tài liệu dự án hay chứng cứ QA có phương pháp. Không suy đoán nguyên nhân runtime từ log; không đưa raw log vào báo cáo/commit mới.
  -134 performance file untracked:100,065,364bytes/~95.430MiB, giữ nguyên; chỉ summary31KB nêu trên là ứng viên thêm. Chín raw JSON loại ở đợt cinematic trước vẫn ở đây, không sửa/xóa.
- Không có trace ZIP, HAR, WebM, Playwright report hay test-results đang tracked. Known ignored roots đã kiểm kê metadata: `test-results-premium`1537 files (1113PNG/103WebM/11ZIP), `playwright-report`1HTML, `test-results`1JSON; `.premium-performance` có profiles/browser cache/log/ZIP. Chúng không thuộc danh sách commit hoặc untrack vì đã ignored. Không giải nén/đưa trace hay browser storage vào Git.

## Code/test local hợp lệ, sẵn sàng review commit

1. `apps/web/messages/en.json`
2. `apps/web/messages/vi.json`
3. `apps/web/src/app/[locale]/register/page.tsx`
4. `apps/web/src/app/[locale]/verify-email/page.tsx`
5. `tests/api/auth-lifecycle.spec.ts`
6. `tests/premium/registration-verification.spec.ts` (untracked)
7. `tests/premium/cinematic-motion.spec.ts`

Các diff đúng phạm vi: sửa copy/localization verification, không tự đăng nhập/redirect workspace; thêm assertion pending/suspended/no-cookie/no-token; test Back/mobile tạo scroll intent thật, giữ exact trigger count và thêm scale>1. Không đổi backend runtime/auth/financial logic, không skip hay tăng timeout. Sáu tracked files có70insertions/21deletions; test registration mới được đọc đầy đủ. Không thấy local source change ngoài phạm vi.

Kết quả hợp lệ ở [pre-merge audit](PRE_MERGE_RELEASE_AUDIT.md) được giữ: lint/typecheck/build PASS; API/unit/security199pass+2targetedpass; browser149pass+6affectedrepeatpass; CI paths8pass; axe80pass; Lighthouse9 hoàn tất. Không chạy lại test/build chỉ cho việc đọc inventory/tạo tài liệu. Chưa có CI của một SHA chứa các local fixes.

Tài liệu ứng viên: `docs/PRE_MERGE_RELEASE_AUDIT.md`, báo cáo này, manifest này; summary31KB và `.gitignore` **chỉ sau phê duyệt**. Các staging account/CORS/catalog runbooks và `STAGING_FIRST_ADMIN_SQL_REVIEW.md` nằm ngoài commit cleanup/fix hiện tại. **Tuyệt đối không đưa `docs/STAGING_FIRST_ADMIN_SQL.sql`, `.env`, dữ liệu account thật, secrets, log/trace/raw reports vào commit**.

## `.gitignore` đã áp dụng — chưa stage

Rule set đã được thêm vào `.gitignore` thật sau phê duyệt. Danh sách ngoại lệ đối chiếu theo manifest; kiểm tra readonly ban đầu416 path checks không có mismatch. Không thay Git config persistent. [QA_EVIDENCE.md](QA_EVIDENCE.md) là điểm vào lâu dài cho curated và local-only evidence, thay cho link tới helper ignored.

Rules bổ sung: `*.log`; `/docs/performance/**/*.html`, `/docs/performance/**/*.json` kèm **54 ngoại lệ JSON chính xác** từ manifest; `/docs/premium-ui/**/*.png`, `/docs/premium-ui/diagnostics/*.json` kèm8 ngoại lệ screenshot chính xác; `/docs/STAGING_FIRST_ADMIN_SQL.sql`. Giữ rules hiện hữu cho `.env`, test-results/Playwright/LHCI và `.premium-*`. Không blanket-ignore root docs hoặc runtime assets.

## Lệnh/guard đã được phê duyệt — tham khảo lịch sử, không chạy lại

Các điều kiện dưới đã được kiểm chứng cho345-file option. Thao tác đã xong; không chạy lại block này với index hiện tại vì guard index rỗng sẽ từ chối. `git rm --cached` đã stage đúng345 deletion; code/config/docs chưa stage để người dùng review riêng.

```powershell
# SAU KHI NGƯỜI DÙNG PHÊ DUYỆT CHÍNH DANH SÁCH ĐẦY ĐỦ:
if ((git branch --show-current) -ne 'feat/premium-ui-redesign') { throw 'Wrong branch' }
if ((git rev-parse HEAD) -ne 'dc6fbcfc595377ceaf5578949ed7522c7179892d') { throw 'Re-audit new HEAD' }
if (git diff --cached --name-only) { throw 'Review nonempty index first' }
$rows = Import-Csv -LiteralPath 'docs/GIT_CLEANUP_MANIFEST.csv'
$remove = @($rows | Where-Object action -eq 'UNTRACK_AFTER_APPROVAL')
if ($remove.Count -ne 345) { throw 'Unexpected removal manifest' }
foreach ($row in $remove) {
  if ($row.path.Contains('..') -or [IO.Path]::IsPathRooted($row.path)) { throw 'Unsafe path' }
  if ($row.path -ne 'debug.log' -and !$row.path.StartsWith('docs/performance/') -and !$row.path.StartsWith('docs/premium-ui/')) { throw 'Out of scope' }
  if (!(Test-Path -LiteralPath $row.path -PathType Leaf)) { throw 'Missing local evidence' }
  $blob = git hash-object ('--path=' + $row.path) -- $row.path
  if ($LASTEXITCODE -ne 0 -or $blob -ne $row.headBlob) { throw 'Changed evidence; review again' }
}
$pathFile = Join-Path (Get-Location) '.premium-performance/approved-untrack.paths'
$pathsText = (($remove.path -join [char]0) + [char]0)
[IO.File]::WriteAllBytes($pathFile, [Text.UTF8Encoding]::new($false).GetBytes($pathsText))
git --literal-pathspecs rm --cached --dry-run --pathspec-from-file=$pathFile --pathspec-file-nul
# Đối chiếu dry-run đủ345 file trước khi chạy dòng tiếp:
git --literal-pathspecs rm --cached --pathspec-from-file=$pathFile --pathspec-file-nul
git diff --cached --name-status
git diff --cached --check
```

Không có `-f`, không xóa file vật lý, không `git clean`, không reset. Sau untrack phải xác nhận345 file vẫn tồn tại và reviewed staged deletions đúng danh sách. Không tự stage code, commit/push/merge/deploy.

## Rủi ro và điểm dừng

- Khác biệt bản local/hashes/HEAD mới làm approval cũ không còn phù hợp; không force-untrack.
- Relative links đến raw/screenshot đã untrack sẽ không có trong clean clone: cập nhật chú thích/reference/metadata inventory trước commit. Audit Markdown/summary vẫn phải giữ cả unfavorable/failed experiments. Chưa có remote archive hay backup mới; không upload dữ liệu để lấp chỗ trống này.
- Local evidence chỉ còn trên máy và trong lịch sử Git; cần retention/backup riêng trước một đợt xóa đĩa trong tương lai. Máy khác checkout commit removal có thể gỡ file tracked cũ; `--cached` chỉ bảo đảm giữ file tại working tree đang thao tác.
- Cleanup không giải quyết CORS/SMTP/cookie hosted hoặc mobile LCP/field INP/Safari limitations; không tự biến PR thành READY TO MERGE.

**Đã thực hiện phương án đầy đủ345 file.** Không cần phê duyệt lại cleanup; đang hoàn tất verification rồi dừng chờ người dùng review/cho phép chuẩn bị commit. Không tự commit/push.

## Nhật ký thực thi cleanup đã duyệt

- HEAD giữ nguyên `dc6fbcf…`; không ghi commit mới. Dry-run và thực thi đều đúng345 path/227,225,137bytes (216.699MiB snapshot). Không dùng force hoặc filesystem delete. History/packfile không bị purge.
- Trước thao tác đã xác minh406 artifact theo HEAD blob SHA,61 keep entries (53JSON+8PNG),134 report local và7source/test. Sau thao tác547/547 hash còn nguyên; CSV manifest không đổi.
- Quyền sandbox chặn index.lock ở lần dry-run ban đầu; không có thay đổi index ở lần đó. Thực thi được chạy lại với quyền ghi Git được duyệt cho đúng thao tác `--cached`, rồi đối chiếu staged names/status và byte preservation.
- `.gitignore` thêm exact retention exceptions; SQL Admin bị ignore theo đúng path, không đọc/sửa/stage. Fresh pre-merge summary31KB vẫn local/untracked và không bị ignore; không stage nó tự động.
- Thay11 Markdown links tới local-only artifacts bằng link guide kèm original path dạng code; thêm retention notices cho historical audits và retention metadata cho cinematic inventory. Giữ nguyên các danh sách/số đo lịch sử, kể cả kết quả xấu. [QA_EVIDENCE.md](QA_EVIDENCE.md) liệt kê53 JSON và8 screenshot thực sự còn tracked.
- Verification cuối PASS: staged chỉ345 deletion đúng manifest;53 JSON+8 PNG còn trong index;547 file vật lý/source hash không đổi; CSV manifest không đổi; toàn bộ345 removed paths bị ignore đúng, source/config/SQL migrations được bảo vệ. Không còn Markdown link clickable tới artifact đã local-only (path gốc vẫn được giữ dạng code).
- Scan lại226 text files gồm debug.log/raw/retained reports/source/documents: không thấy high-confidence credential pattern theo rules; không in nội dung nhạy cảm. Không chứng nhận binary pixels/encoded data hoặc purge secret khỏi lịch sử. SQL Admin tồn tại và ignored, chưa đọc/sửa/stage.
- Kết quả mới: `git diff --check` và `git diff --cached --check` PASS; `pnpm.cmd lint:strict`, `pnpm.cmd lint:api`, `pnpm.cmd typecheck` PASS; Vitest91/91 (10files,8.05s) và Chromium/WebKit52/52 (2.1min) PASS, zero retries/skips. Không thay assertions trong lượt cleanup.

Lệnh test đã chạy (NODE_ENV/APP_ENV=test, URL dependency tổng hợp loopback port1, envDir=false; không dùng Neon/Redis thật):

```powershell
pnpm.cmd exec vitest run --config .premium-performance/pre-merge-vitest.config.mts tests/unit tests/api/auth-lifecycle.spec.ts
$env:PREMIUM_CATALOG_FIXTURE='1'
$env:PREMIUM_RUN_LABEL='cleanup-verification'
pnpm.cmd exec playwright test --config=playwright.cinematic.config.ts account.spec.ts hydration.spec.ts registration-verification.spec.ts cinematic-motion.spec.ts
```

Browser dùng production build hợp lệ từ pre-merge audit và isolated preview/fixture loopback3210/3211. Không rebuild hoặc đo Lighthouse lại vì runtime/dependencies không đổi; kết quả91/52 là lượt chạy mới, còn80axe/9Lighthouse trong pre-merge là lịch sử được giữ riêng. Không cộng thành một lượt test tổng giả.

Git status cuối lượt: **345 staged D**, **17 unstaged M** (.gitignore,6tracked source/test,10tracked documentation/metadata), **10 untracked files** (4cleanup/audit docs,4staging docs ngoài commit scope,1fresh compact summary,1registration test). SQL Admin và tất cả raw/log/artifact bị bỏ theo dõi nay ignored, vẫn có trên đĩa. Fresh summary31KB chưa stage. Không stage bất kỳ source/doc/config mới nào ngoài345 deletion được duyệt. HEAD không đổi; dừng để người dùng kiểm tra và phê duyệt commit.

## Commit preparation — separately authorized follow-up

The user subsequently approved one local commit with message `chore: clean generated QA artifacts and finalize pre-merge fixes`, without push/merge/deploy. The approved scope is the unchanged345 deletion manifest plus23 explicitly named additions/modifications: the17 modified files above, four cleanup/audit/evidence documents, the fresh compact performance summary and the new registration regression test. Four untracked staging/account/SQL-review documents remain outside this commit; Admin SQL and environment files are excluded.

The53 original compact performance JSON files and8 curated images remain unchanged; adding the approved pre-merge summary makes54 compact JSON files in the resulting tree. Hook-equivalent lint-staged tasks run explicitly with `--no-stash --no-hide-partially-staged --no-revert`; their formatting is reviewed before commit, with JSON values and source/test semantics checked against the pre-hook snapshot. The commit suppresses a duplicate Husky invocation only after those same tasks and staged-diff/security checks pass, avoiding the default stash/reset workflow while preserving local evidence. No failing check is bypassed. The final SHA and working-tree status are reported separately; the historical execution records above remain timestamped evidence of earlier states.

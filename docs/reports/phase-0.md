# TASCORA — Phase 0 Report: Project Baseline & Engineering Audit

## 1. Mục tiêu

- Xác minh độc lập toàn bộ hiện trạng repository trên `origin/main` (`a6501f380a00f38cf5e1d4e9b05720eb5e8a90d2`) trước khi triển khai các phase tiếp theo.
- Chuẩn hóa tài liệu nguồn sự thật `docs/PROJECT_CURRENT_STATE.md` và phân loại các tài liệu handoff lịch sử đã lỗi thời.
- Xác minh và xử lý dứt điểm các lỗi thực sự còn tồn tại trong Phase 0 (`CommandPalette`, `WithdrawDialog`, dashboard analytics notice) kèm regression tests mà không làm thay đổi Auth, Financial Ledger, KYC, Upload Security, database schema hay cấu trúc package.

---

## 2. Baseline Branch & Commit

- **Baseline (`origin/main`):** `a6501f380a00f38cf5e1d4e9b05720eb5e8a90d2` (`fix(ci): complete Phase 4A.6 database acceptance (#6)`)
- **Phase 0 Branch:** `chore/phase-0-baseline-audit` (tạo mới từ `origin/main` trong git worktree cô lập)

---

## 3. Hiện trạng trước khi làm

- `origin/main` đã merge PR #6 (`a6501f3`) với `Quality & Testing Toolchain` PASS (`Run 44245858381`: Lint & Typecheck, Playwright E2E, Lighthouse CI) và `Infrastructure Acceptance (PostgreSQL & ClamAV)` PASS (`Run 44239671402`: `6/6` migrations, `36/36` DB tests, live ClamAV).
- Tuy nhiên, kiểm toán trực tiếp source code trên `origin/main` phát hiện:
  1. `CommandPalette.tsx` trỏ tới route không tồn tại `/dashboard/gigs/create`, dùng `next/navigation` thay vì router giữ locale `@/i18n/routing`, và có chuỗi hardcode `"Explore 48+ verified gigs and specialists"` cùng mô tả withdrawal gây hiểu nhầm.
  2. `WithdrawDialog.tsx` vẫn tồn tại trong codebase dù không còn caller nào (`0` references), chứa logic `setTimeout(..., 1200)` và dữ liệu giả (`PayPal (alexandre.dev@example.com)`) mô phỏng rút tiền thành công.
  3. `/dashboard` overview không còn hardcode số liệu doanh thu/rating giả (đã đọc dữ liệu thực từ `useDashboard().rawOrders` và `/api/v1/services/seller/me`), nhưng thông báo analytics ở phần giữa trang chưa phản ánh đúng việc đã có màn hình `Earnings` / `Payments & Billing` cho số dư server-confirmed.
  4. `6` tài liệu handoff ở thư mục gốc (`CONTINUE_TOMORROW.md`, `DEPLOYMENT_AUDIT.md`, `STAGING_SETUP_REQUIRED.md`, `HOSTED_PROVIDER_VALIDATION.md`, `FINANCIAL_SYSTEM_AUDIT.md`, `MARKETPLACE_INTEGRATION_AUDIT.md`) dừng ở mốc `2026-10-07` (`feat/seed-data`), chưa có cảnh báo đã lỗi thời so với `main`.

---

## 4. Root Cause

- **Broken Route trong `CommandPalette.tsx`:** Khi route tạo dịch vụ được chuẩn hóa thành `/dashboard/gigs/new` (`apps/web/src/app/[locale]/dashboard/gigs/new/page.tsx`), action `action-new-gig` trong `CommandPalette.tsx` không được cập nhật và thiếu unit regression test kiểm tra mapping giữa command routes với cây route thực tế.
- **Orphaned Fake Payout Dialog (`WithdrawDialog.tsx`):** Khi màn hình `/dashboard/earnings` được thay bằng `LiveEarnings.tsx` (đọc ledger thật và chặn external payouts), file `WithdrawDialog.tsx` cũ không được dọn bỏ, để lại dead code chứa dữ liệu giả và mô phỏng rút tiền sai lệch với kiến trúc bảo mật tài chính.
- **Lệch tài liệu handoff:** Các báo cáo từ tháng 10/2026 chưa được đánh dấu superseded sau PR #4, #5 và #6, dễ gây hiểu nhầm về số lượng migration, trạng thái KYC/ClamAV và cấu hình staging.

---

## 5. Giải pháp đã thực hiện

1. **Sửa `CommandPalette` và tách cấu hình route có thể kiểm thử:**
   - Tạo `apps/web/src/components/dashboard/ui/command-palette-items.ts` chứa `getCommandPaletteItems(role)` (pure data, không phụ thuộc DOM/framer-motion).
   - Cập nhật `apps/web/src/components/dashboard/ui/CommandPalette.tsx` sang `useRouter` từ `@/i18n/routing`, đổi `/dashboard/gigs/create` → `/dashboard/gigs/new`, bỏ chuỗi hardcode `"48+"` và làm rõ copy `Earnings` là `Ledger balances and payout request status`.
2. **Xóa component mô phỏng payout giả (`WithdrawDialog.tsx`):**
   - Xác minh `git grep -n "WithdrawDialog"` có `0` caller và `0` runtime dependency trên toàn monorepo, sau đó xóa `apps/web/src/components/dashboard/payments/WithdrawDialog.tsx`. Không tạo UI mô phỏng rút tiền mới và không bật Stripe Connect / external payouts.
3. **Rà soát Dashboard & làm rõ thông báo Analytics:**
   - Xác minh toàn bộ live dashboard pages (`/dashboard`, `/seller/dashboard`, `/dashboard/gigs`, `/dashboard/orders`, `/dashboard/earnings`, `/dashboard/payments`, `/dashboard/saved`, `/dashboard/notifications`, `/dashboard/settings`) không hiển thị số liệu doanh thu/rating/profile-view giả lập.
   - Cập nhật notice trên `apps/web/src/app/[locale]/dashboard/page.tsx` để nêu rõ time-series analytics, profile views và conversion metrics chưa khả dụng, đồng thời dẫn link tới `Earnings` / `Payments & Billing` cho số dư server-confirmed.
4. **Bổ sung Regression Tests:**
   - Tạo `tests/unit/dashboard-baseline-regressions.spec.ts` (`4` test cases) kiểm tra: `action-new-gig` trỏ `/dashboard/gigs/new`, toàn bộ navigation href trong `CommandPalette` đều tương ứng một `page.tsx` tồn tại thực tế, `CommandPalette.tsx` dùng `@/i18n/routing`, `WithdrawDialog.tsx` đã bị xóa và `LiveEarnings.tsx` không chứa `setTimeout` mô phỏng rút tiền.
5. **Chuẩn hóa tài liệu Baseline & đánh dấu tài liệu cũ:**
   - Tạo `docs/PROJECT_CURRENT_STATE.md` và `docs/reports/phase-0.md`.
   - Gắn banner `Historical / Superseded (2026-10-07)` không phá hủy nội dung gốc trên `6` file handoff cũ ở thư mục gốc.

---

## 6. Files thay đổi

- **Code & Tests:**
  - `A` `apps/web/src/components/dashboard/ui/command-palette-items.ts`
  - `M` `apps/web/src/components/dashboard/ui/CommandPalette.tsx`
  - `D` `apps/web/src/components/dashboard/payments/WithdrawDialog.tsx`
  - `M` `apps/web/src/app/[locale]/dashboard/page.tsx`
  - `A` `tests/unit/dashboard-baseline-regressions.spec.ts`
- **Documentation:**
  - `A` `docs/PROJECT_CURRENT_STATE.md`
  - `A` `docs/reports/phase-0.md`
  - `M` `CONTINUE_TOMORROW.md`
  - `M` `DEPLOYMENT_AUDIT.md`
  - `M` `STAGING_SETUP_REQUIRED.md`
  - `M` `HOSTED_PROVIDER_VALIDATION.md`
  - `M` `FINANCIAL_SYSTEM_AUDIT.md`
  - `M` `MARKETPLACE_INTEGRATION_AUDIT.md`

---

## 7. Commit Hashes

1. `19d3b5a6389775a71839a5b67595c86623b19438` — `fix(web): fix CommandPalette route, remove fake WithdrawDialog and clarify dashboard notice`
2. _(Docs commit appended immediately after this report via `docs(audit): add Phase 0 baseline state, report and mark legacy handoff docs`)_

---

## 8. Test đã chạy & 9. Kết quả thật

| Kiểm tra                                | Lệnh                                | Exit Code | Kết quả thực tế                                                                                                                                                     |
| :-------------------------------------- | :---------------------------------- | :-------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prisma schema validation                | `pnpm exec prisma validate`         |    `0`    | Schema valid (`42` models, `12` enums)                                                                                                                              |
| Database tests typecheck                | `pnpm run typecheck:tests:database` |    `0`    | Pass                                                                                                                                                                |
| Monorepo typecheck                      | `pnpm typecheck`                    |    `0`    | Pass (`apps/*` + `tsconfig.tests.json`)                                                                                                                             |
| Backend ESLint                          | `pnpm lint:api`                     |    `0`    | Pass                                                                                                                                                                |
| Web strict ESLint                       | `pnpm lint:strict`                  |    `0`    | Pass (`--max-warnings=0`)                                                                                                                                           |
| Unit tests                              | `pnpm test:unit`                    |    `0`    | `13` files passed, `99` tests passed (gồm `4/4` test mới trong `dashboard-baseline-regressions.spec.ts`)                                                            |
| API tests                               | `pnpm test:api`                     |    `0`    | `11` files passed, `87` tests passed                                                                                                                                |
| Security tests                          | `pnpm test:security`                |    `0`    | `17` files passed, `138` tests passed                                                                                                                               |
| Production build                        | `pnpm build`                        |    `0`    | `apps/api` build Done; `apps/web` build Done (`46/46` routes)                                                                                                       |
| Playwright E2E / Live Postgres & ClamAV | _(Not re-run locally in Phase 0)_   |    N/A    | Chưa chạy local trong Phase 0 (không chạm DB/API/ClamAV/E2E infra; baseline `a6501f3` đã CI PASS trên Run `44245858381` & `44239671402`; sẽ chạy trên CI khi mở PR) |

---

## 10. Verification Level

- **Phase 0 fixes (`CommandPalette`, xóa `WithdrawDialog`, dashboard notice, regression tests):** **`TESTED`** (đã pass đầy đủ local typecheck, lint strict, `99` unit tests, `87` API tests, `138` security tests và production build; chưa push nên chưa ở mức `CI VERIFIED`).
- **Baseline `origin/main` (`a6501f3`):** **`CI VERIFIED`** (chưa `HOSTED VERIFIED`).

---

## 11. Technical Debt

1. **`ENABLE_CRON` default mâu thuẫn:** `apps/api/src/index.ts` mặc định bật cron trừ khi `ENABLE_CRON === 'false'`, trong khi tài liệu staging khuyến nghị tắt mặc định / 1 cron owner duy nhất.
2. **Naming inconsistency:** `TASCORA` vs `taskora` / `@taskora/*` / `web` (chỉ ghi nhận, chưa đổi tên).
3. **Empty workspace packages:** `packages/ui`, `packages/types`, `packages/config` không có thư mục `src/` và `0` imports.
4. **Unused legacy dashboard components:** `ClientPaymentMethods.tsx`, `BalanceCards.tsx`, `RevenueBarChart.tsx`, `TransactionsTable.tsx`, `ProfileStrengthCard.tsx`, `RecommendedSpecialists.tsx`, `RevenueAreaChart.tsx` và các mảng sample trong `apps/web/src/data/dashboard/*` (0 live callers, chuyển sang Phase FE.1).
5. **Single-replica runtime constraints:** Socket.IO in-memory adapter, `express-rate-limit` in-memory store, Docker `worker` placeholder.
6. **Outdated `README.md`:** Cần viết lại theo chuẩn portfolio ở phase tài liệu cuối.

---

## 12. Known Limitations

- External seller payouts và Stripe Connect vẫn tắt có chủ đích (`externalPayoutsAvailable: false`).
- Hosted staging (Render + Vercel + Neon + Layerbase + Backblaze B2 + Mailtrap) chưa có vòng xác minh runtime cuối trên `a6501f3`.
- Chưa chạy Playwright E2E local trong Phase 0; regression route được phủ bởi unit test ánh xạ trực tiếp tới cây `apps/web/src/app/[locale]/**/page.tsx`.

---

## 13. Công việc còn thiếu

- Chạy CI trên PR của nhánh `chore/phase-0-baseline-audit` sau khi chủ dự án duyệt và push.
- Thực hiện **Phase 4A.7 (Staging Readiness)** để hoàn thiện ma trận biến môi trường, Stripe Test Mode guard, safe seed allowlist, quy ước `ENABLE_CRON` single owner và `docs/STAGING_RUNBOOK.md`.
- Thực hiện **Phase FE.1 (Frontend Engineering Audit)** để kiểm toán route/data-flow/responsive/a11y/performance và dọn nốt các component dashboard không sử dụng.

---

## 14. Giải thích cho phỏng vấn (Tiếng Việt)

- **Vấn đề kỹ thuật là gì?**
  Khi tiếp quản một codebase đã qua nhiều vòng phát triển (PR #1–#6), rủi ro lớn nhất không nằm ở thiếu tính năng mới mà ở **drift giữa tài liệu, UI và backend**: `CommandPalette` trỏ sang route chết (`/dashboard/gigs/create`) và dùng `next/navigation` làm mất locale prefix; component `WithdrawDialog` mồ côi chứa `setTimeout` mô phỏng rút tiền giả vẫn nằm trong repo; còn các tài liệu handoff cũ dễ khiến kỹ sư đọc nhầm hiện trạng.
- **Vì sao chọn giải pháp này?**
  Thay vì sửa chắp vá string route trong component UI, tôi tách danh sách lệnh ra module thuần dữ liệu (`command-palette-items.ts`), chuyển sang router có nhận diện locale (`@/i18n/routing`), xóa hẳn dead code mô phỏng tài chính (`WithdrawDialog.tsx`) sau khi kiểm tra 0 tham chiếu, và viết unit regression test đối chiếu trực tiếp mọi `href` của CommandPalette với file `page.tsx` thật trên filesystem.
- **Những phương án thay thế?**
  1. Giữ lại `WithdrawDialog.tsx` rồi sửa thành modal "unavailable" — nhưng component không có caller nào nên giữ lại chỉ tăng diện tích bảo trì và dead code.
  2. Test `CommandPalette` bằng full Playwright E2E — tốn thời gian khởi động server hơn cho một lỗi mapping route thuần túy; unit test đối chiếu filesystem chạy trong ~14ms và chặn regression ngay từ bước `test:unit`.
- **Trade-off?**
  Unit test kiểm tra tồn tại của `page.tsx` không thay thế hoàn toàn browser E2E (không kiểm tra keyboard focus hay animation mở dialog), nhưng đổi lại cực nhanh, deterministic và ngăn 100% lỗi broken link khi đổi tên route sau này. Tương tự, gắn banner lịch sử lên các file handoff cũ giữ nguyên audit trail thay vì xóa mất lịch sử quyết định kiến trúc.
- **Có thể gặp câu hỏi phỏng vấn nào & cách trả lời?**
  - _“Khi vào dự án có sẵn nhiều technical debt và tài liệu cũ, bạn bắt đầu như thế nào?”_
    → Bắt đầu bằng read-only audit trực tiếp từ source of truth (`origin/main`, CI logs, schema, route tree), phân loại tính năng theo mức độ xác minh thực tế (`IMPLEMENTED` vs `TESTED` vs `CI VERIFIED` vs `HOSTED VERIFIED`), cô lập sửa lỗi trên git worktree riêng, và khóa lại bằng regression test trước khi chạm tới các tính năng lớn hơn.
  - _“Tại sao bạn xóa `WithdrawDialog` thay vì để lại cho demo đẹp hơn?”_
    → Trong hệ thống có nghiệp vụ FinTech/escrow, tuyệt đối không để tồn tại UI giả lập giao dịch thành công bằng `setTimeout` và dữ liệu ngân hàng/PayPal hardcode. Tính trung thực trạng thái (`LiveEarnings` phản ánh đúng ledger và trạng thái payout provider disabled) quan trọng hơn hiệu ứng demo giả.

---

## Handoff Summary

- **Current project state:** `docs/PROJECT_CURRENT_STATE.md` đã chuẩn hóa trên nền `origin/main` (`a6501f3`).
- **Completed work:** Phase 0 Read-Only Audit, sửa `CommandPalette`, xóa `WithdrawDialog`, cập nhật dashboard analytics notice, bổ sung `4` regression tests, đánh dấu `6` tài liệu handoff lịch sử, tạo `docs/PROJECT_CURRENT_STATE.md` và `docs/reports/phase-0.md`.
- **Remaining work:** Đợi chủ dự án nghiệm thu, push nhánh `chore/phase-0-baseline-audit` và tạo PR.
- **Known risks:** Chưa chạy hosted staging validation; `ENABLE_CRON` vẫn opt-out cho tới Phase 4A.7; nhánh gốc `feat/outcrowd-cinematic-redesign` vẫn có thay đổi chưa dọn (được giữ nguyên vẹn theo yêu cầu).
- **Next recommended phase:** **Phase 4A.7 – Staging Readiness** (phụ thuộc: PR Phase 0 được review/merge hoặc xác nhận baseline mới).

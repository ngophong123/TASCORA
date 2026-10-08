# TASCORA — Redis / Render (2026-10-08)

## Kết luận và phạm vi

Đã xác minh lỗi cấu hình TLS trong code: ioredis 5.11.1 đang cài chỉ nhận `rediss://`, không được cấp `tls.servername`. Connector của phiên bản này gọi Node TLS với host/port và TLS options; không tự thêm SNI. Layerbase yêu cầu SNI để định tuyến database trên cổng chung 6379:
https://layerbase.com/docs/cloud/connecting/redis

Đây là lỗi tương thích xác minh được từ source và tài liệu provider, chưa phải bằng chứng rằng đó là nguyên nhân duy nhất của hai deploy thất bại. Chưa truy cập Render hoặc Redis thật để xác minh runtime. DNS, credentials, allowlist, trạng thái dịch vụ và certificate chain vẫn cần kiểm tra nếu bản sửa chưa giải quyết được.

Log cũ bỏ toàn bộ error và chỉ in một câu mỗi lần lỗi, nên không phân biệt được TLS/auth/DNS/timeout. Chỉ có một Redis client trong source API; server và entrypoint dùng cùng module singleton. Redis hiện chỉ dùng cho health PING và shutdown, không có Socket.IO Redis adapter.

## Thay đổi

- `apps/api/src/lib/redis-connection.ts`: kiểm tra URL với lỗi chung không chứa secret; lấy hostname để cấp SNI cho DNS hostname; giữ `rejectUnauthorized: true`. Không tự đổi hostname, password hoặc port. ioredis tiếp tục giải mã username/password đã percent-encode.
- `apps/api/src/lib/redis.ts`: giữ singleton lazy; từ chối URL query/fragment để không ghi đè TLS/timeout policy; logging chỉ xuất event/category/status/retryAttempts/suppressed, tối đa một log lỗi mỗi 30 giây và log phục hồi.
- Connect timeout 10 giây cho cold start; command timeout 3 giây; hai retries mỗi request; reconnect tiếp tục với backoff 250 ms tăng tuyến tính tới 5 giây. Không kết thúc khả năng phục hồi chỉ vì health request thất bại. Ready check được bật.
- `apps/api/src/lib/health.ts`: probes song song, deadline tổng 4 giây; dependency lỗi hoặc quá hạn vẫn 503, cả hai thành công mới 200. Chia sẻ probes chưa hoàn tất để tránh tích lũy công việc khi nhiều health requests. Deadline không hủy truy vấn Prisma đang chạy; nếu truy vấn treo vĩnh viễn, readiness tiếp tục 503, cần timeout phù hợp ở tầng database/driver.
- `apps/api/src/server.ts`: health trước API rate limiter, tránh health định kỳ bị 429 do quota chung. `/health/live` chỉ xác nhận process.
- `tests/api/redis-health.spec.ts`: TLS connector mock, SNI/certificate verification/auth parsing, retry/timeouts, lỗi cấu hình, phân loại/redaction/throttling/recovery, health timeout/in-flight reuse/phục hồi.

Đã kiểm tra thêm `config.ts`, `index.ts`, API/root package.json, vitest config, tests payment-provider-disabled/production-config và source ioredis đang cài. `index.ts` đã bind `0.0.0.0` và dùng `process.env.PORT`; không cần sửa. Không có Render blueprint trong repo được tìm thấy; Dashboard settings chưa được xác minh.

## Kiểm thử và giới hạn

Các kiểm tra dùng fixture/mock, không đọc `.env`, không kết nối Redis/Neon thật, không chạy migration/seed. Test TLS kiểm tra tham số truyền xuống connector thật với transport bị mock; chưa chứng minh handshake/auth/reconnect thành công với Layerbase hosted. Test retry xác minh policy và event diagnostics, không phải thử gián đoạn network thật.

Kết quả source cuối: 28 tests PASS trong 3 files (`redis-health`, `payment-provider-disabled`, `production-config`); backend `tsc --noEmit`, lint và production build PASS; `git diff --check` PASS. Không chạy frontend build vì không sửa frontend. PowerShell chặn shim `pnpm.ps1`; dùng `pnpm.cmd` mà không đổi execution policy. Một lượt build trung gian phát hiện overload TypeScript không hỗ trợ thứ tự options/URL; đã sửa về overload chính thức URL/options và kiểm tra lại thành công.

## Render settings và quy trình triển khai lại

1. Review diff và kết quả kiểm thử. Người vận hành tự commit/push theo quy trình dự án; phiên kiểm tra này không commit/push/deploy.
2. Render service: branch `main`, region Singapore, Root Directory là repository root để pnpm workspace hoạt động. Đối chiếu build command hiện có với `pnpm install --frozen-lockfile && pnpm --filter @taskora/api build`; nếu cần generate Prisma Client, dùng `pnpm db:generate` trước build (generate không phải migration). Không thêm migrate/seed vào lần sửa Redis này.
3. Start command: `pnpm --filter @taskora/api start`. Health Check Path: `/health`. Để Render cấp `PORT`; không cần ép port khác. Render yêu cầu HTTP probe thành công trong 5 giây: https://render.com/docs/health-checks . Không chuyển readiness sang `/health/live` để che lỗi dependency.
4. Giữ `NODE_ENV=production`, `APP_ENV=staging`, `PAYMENTS_PROVIDER=disabled`; giữ nguyên các secrets/config DB, SMTP, storage, CORS đang được quản lý. Không đặt `NODE_TLS_REJECT_UNAUTHORIZED=0` hoặc cấu hình bỏ xác minh chứng chỉ.
5. Trong Dashboard Layerbase, xác nhận đúng database `tascora-staging`, Running, không locked/archived; đối chiếu Quick Connect native Redis TLS với secret `REDIS_URL` trong Render. URL phải dùng `rediss://`, DNS hostname đúng database, port 6379, username/password đúng provider, không dấu nháy hoặc khoảng trắng. Nếu tự ghép URL, percent-encode credentials; ưu tiên chuỗi provider cấp. Không đưa URL/credentials vào tickets, logs hoặc shell command history.
6. Nếu bật IP allowlist, đối chiếu outbound addresses của Render service với policy Layerbase. Không mở toàn bộ mạng chỉ để thử lỗi. Auto-hibernate có thể gây cold start; theo tài liệu lifecycle, thường khoảng 1–5 giây, không đảm bảo mọi lần: https://layerbase.com/docs/database-lifecycle . Reconnect phải có cơ hội phục hồi trước khi lần health tiếp theo pass.
7. Người vận hành manual deploy revision đã review. Quan sát `redis_unavailable` và `redis_recovered`; `/health/live` có thể 200 trong khi `/health` 503 lúc dependencies chưa sẵn sàng. Chỉ chấp nhận deploy khi `/health` thật sự 200 với `db=ok`, `redis=ok`, payments vẫn disabled.
8. Nếu còn lỗi: `ENOTFOUND`/`EAI_AGAIN` → kiểm tra DNS hostname; `ECONNREFUSED`/`ETIMEDOUT` → port, network/allowlist và lifecycle; `ECONNRESET` → kiểm tra revision có SNI và trạng thái router provider; `TLS` → hostname/certificate/CA chain; `AUTH` → username/password/ACL; `TIMEOUT` → độ trễ, cold start hoặc PING/INFO chậm. `ECONNRESET` tự nó không chứng minh thiếu SNI.
9. Nếu Redis phục hồi nhưng health còn 503, kiểm tra PostgreSQL/Neon và thời gian response qua telemetry riêng đã redaction. `/health` không trả lỗi nội bộ ra public. Nếu cần escalation provider, chỉ gửi timestamp UTC, region, category/status và retry count; không gửi secrets hoặc toàn bộ error.

Không chỉnh sửa logic tài chính, Stripe mode, migrations, `.env`; không thay đổi frontend. Chưa xác nhận deploy hosted đã Live.

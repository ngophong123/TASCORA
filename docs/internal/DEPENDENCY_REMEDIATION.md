# Workstream 1 — Security & Dependency Remediation Report

- **Branch:** `fix/ws1-security-dependency-remediation`
- **Base:** `origin/main` (`38abe5513772e1c806f7dd9f9eb20b5787899caf`)
- **Policy:** Zero blind `pnpm.overrides` used to hide vulnerabilities; all fixes applied via direct version upgrades, removal of unused CLI runtime dependencies, and semver-compatible lockfile updates.

---

## 1. Before vs. After `pnpm audit` Summary

| Severity     | Baseline (Before WS1) | After WS1 (All Deps) | After WS1 (`--prod` Runtime Only) | Reduction (All Deps) |
| ------------ | --------------------- | -------------------- | --------------------------------- | -------------------- |
| **Critical** | `4`                   | **`0`**              | **`0`**                           | **`-4` (`100%`)**    |
| **High**     | `31`                  | **`5`**              | **`1`**                           | **`-26` (`83.9%`)**  |
| **Moderate** | `53`                  | **`5`**              | **`1`**                           | **`-48` (`90.6%`)**  |
| **Low**      | `7`                   | **`1`**              | **`0`**                           | **`-6` (`85.7%`)**   |
| **Total**    | **`95`**              | **`11`**             | **`2`**                           | **`-84` (`88.4%`)**  |

---

## 2. Remediations Applied

1. **Next.js (`apps/web/package.json`):** Upgraded `next` & `eslint-config-next` from `16.3.5` -> `16.4.6` — resolves all **3 Critical** RCE advisories, **2 High** (SSRF/DoS), and **12+ Moderate** advisories in Next.js, plus `sharp` (`>=0.35.5`).
2. **Removed Unused CLI Dependency `shadcn@4.21.0` (`apps/web/package.json`):** Confirmed `0` runtime imports across `apps/web/src/`; removing this scaffolding CLI from runtime `dependencies` eliminated transitive vulnerabilities in `@modelcontextprotocol/sdk`, `undici`, `systeminformation`, `zod`, `proxy-addr`, `body-parser`, `source-map-js`, and `brace-expansion` (`-265` unused packages).
3. **Express 4, `proxy-addr` & `body-parser` (`apps/api/package.json`, `package.json`, `pnpm-lock.yaml`):** Upgraded `express` (`^4.18.2 -> ^4.22.3`) and refreshed semver-compatible transitive lockfile entries (`proxy-addr >= 2.0.8`, `body-parser >= 1.20.9`, `qs >= 6.16.1`, `source-map-js >= 1.2.2`) — resolves the **1 Critical** IP-spoofing advisory in `proxy-addr` and **High** DoS in `body-parser`.
4. **Nodemailer (`apps/api/package.json`):** Upgraded `nodemailer` (`^10.0.9 -> ^10.6.1`) — resolves all **6 Moderate** SMTP/addressparser/DKIM DoS advisories.
5. **Vitest & ESLint Config (`package.json`, `packages/eslint-config/package.json`):** Upgraded `vitest` (`^5.0.2 -> ^5.1.1`) and migrated `@taskora/eslint-config` from legacy `eslint@8` + `eslint-config-next@14.1.0` to `eslint@^9` + `eslint-config-next@16.4.6` — resolves `vite` High/Moderate, `@vitest/mocker` Moderate, `glob` High, and `minimatch`/`brace-expansion` High advisories.

---

## 3. Remaining Advisories (Transparent Accounting)

| Severity                         | Package                                                    | Scope / Dependency Path                                                           | Why Not Force-Overridden                                                                                                                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High**                         | `zod` (`patched >=4.6.6`)                                  | `apps/api > zod` (`3.x`, runtime) & `@lhci/cli` (dev)                             | Upgrading `zod` from v3 (`3.22.x`) to v4 (`4.6.6+`) is a breaking major API migration across all 21 API validation schemas. Mitigated in runtime by strict Express body size limits and bounded array/string validators (`max()`). Tracked for dedicated Zod v4 migration PR. |
| **High** (x2)                    | `extract-zip` (no upstream patch)                          | `. > @lhci/cli > lighthouse > puppeteer-core > @puppeteer/browsers > extract-zip` | Strictly CI/dev-only Lighthouse tooling; zero production runtime exposure.                                                                                                                                                                                                    |
| **High**                         | `tmp` (`>=0.2.6`)                                          | `. > @lhci/cli > inquirer > external-editor > tmp`                                | Strictly CI/dev-only Lighthouse CLI; zero production runtime exposure.                                                                                                                                                                                                        |
| **High**                         | `basic-ftp` (`>=6.2.1`)                                    | `. > @lhci/cli > proxy-agent > pac-proxy-agent > get-uri > basic-ftp`             | Strictly CI/dev-only Lighthouse CLI; zero production runtime exposure.                                                                                                                                                                                                        |
| **Moderate** (x5) & **Low** (x1) | `uuid`, `ip-address`, `basic-ftp` (x2), `minimatch`, `tmp` | Dev/CI tooling (`@lhci/cli`, `nodemon`, `typescript-eslint`)                      | Zero production runtime exposure; tracked for upstream `@lhci/cli` / tooling major updates.                                                                                                                                                                                   |

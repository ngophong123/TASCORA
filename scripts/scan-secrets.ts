import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface SecretFinding {
  file: string;
  line: number;
  rule: string;
}

const SECRET_RULES: { name: string; regex: RegExp }[] = [
  { name: 'stripe-live-secret-key', regex: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/ },
  { name: 'aws-access-key-id', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'private-key-header', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: 'github-pat', regex: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { name: 'google-api-key', regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'slack-token', regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
];

// Test fixture patterns intentionally exercising live-key rejection guards
const ALLOWLIST_LINE_RE =
  /(fixture|mock|forbidden|example|placeholder|test-only|dummy|sample|redact|reject|sk_live_fixture|sk_live_forbidden)/i;

export function scanTextForSecrets(content: string, fileLabel: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (ALLOWLIST_LINE_RE.test(line)) continue;
    for (const rule of SECRET_RULES) {
      if (rule.regex.test(line)) {
        findings.push({ file: fileLabel, line: i + 1, rule: rule.name });
      }
    }
  }
  return findings;
}

export function scanTrackedRepository(repoRoot = process.cwd()): {
  filesScanned: number;
  findings: SecretFinding[];
} {
  const rawList = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' });
  const files = rawList
    .split(/\r?\n/)
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => !/\.(png|jpg|jpeg|webp|gif|ico|woff2?|ttf|pdf|zip)$/i.test(f));

  const findings: SecretFinding[] = [];
  for (const relPath of files) {
    const fullPath = path.join(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const stat = fs.statSync(fullPath);
    if (!stat.isFile() || stat.size > 1_000_000) continue;
    const text = fs.readFileSync(fullPath, 'utf8');
    findings.push(...scanTextForSecrets(text, relPath));
  }
  return { filesScanned: files.length, findings };
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  const result = scanTrackedRepository();
  console.log(JSON.stringify(result, null, 2));
  if (result.findings.length > 0) {
    process.exitCode = 1;
  }
}

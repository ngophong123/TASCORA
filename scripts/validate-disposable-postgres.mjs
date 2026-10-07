// Only for an explicitly created disposable Docker database. Never reads .env.
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync, cpSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const supplied = process.env.TASCORA_DISPOSABLE_DATABASE_URL;
if (!supplied) throw new Error('Explicit TASCORA_DISPOSABLE_DATABASE_URL required; no DATABASE_URL fallback');
const url = new URL(supplied);
if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.port === '5432' || !url.port || url.username !== 'tascora_test' || !/^\/tascora_migration_test(?:_second|_repeat)?$/.test(url.pathname)) {
  throw new Error('Refusing target: require dedicated loopback random port, test user and disposable database name');
}
const scratch = mkdtempSync(path.join(tmpdir(), 'tascora-prisma-validation-'));
const schema = readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8');
writeFileSync(path.join(scratch, 'schema.prisma'), schema.replace('provider = "prisma-client-js"', 'provider = "prisma-client-js"\n  output = "./generated-client"'));
writeFileSync(path.join(scratch, 'package.json'), JSON.stringify({ name: 'tascora-disposable-validation', private: true }));
symlinkSync(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'junction');
cpSync(path.join(root, 'prisma/migrations'), path.join(scratch, 'migrations'), { recursive: true });
const env = { ...process.env, DATABASE_URL: supplied, TASCORA_VALIDATION_CLIENT: path.join(scratch, 'generated-client/index.js'), PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true', NODE_ENV: 'test', ENABLE_CRON: 'false', STRIPE_SECRET_KEY: 'sk_test_disposable_mock', JWT_ACCESS_SECRET: 'disposable-validation-only-secret-32-chars' };
function run(file, args, cwd = scratch, allowed = [0]) {
  const result = spawnSync(process.execPath, [file, ...args], { cwd, env, encoding: 'utf8', timeout: 180000 });
  // Temporary credentials need not appear in retained reports.
  const output = `${result.stdout || ''}${result.stderr || ''}`.replaceAll(supplied, '[disposable URL]').replaceAll(url.password, '[temporary password]');
  console.log(output);
  if (!allowed.includes(result.status)) throw new Error(`Validation command failed (${result.status}): ${args.join(' ')}`);
}
try {
  const prismaCli = require.resolve('prisma/build/index.js');
  run(prismaCli, ['validate', '--schema', 'schema.prisma']);
  run(prismaCli, ['migrate', 'status', '--schema', 'schema.prisma'], scratch, [1]); // Fresh DB must have unapplied migration.
  run(prismaCli, ['migrate', 'deploy', '--schema', 'schema.prisma']);
  run(prismaCli, ['generate', '--schema', 'schema.prisma']);
  run(prismaCli, ['migrate', 'status', '--schema', 'schema.prisma']);
  run(prismaCli, ['migrate', 'deploy', '--schema', 'schema.prisma']);
  run(prismaCli, ['migrate', 'diff', '--from-schema-datasource', 'schema.prisma', '--to-schema-datamodel', 'schema.prisma', '--exit-code']);
  run(path.join(path.dirname(require.resolve('vitest/package.json')), 'vitest.mjs'), ['run', '--config', path.join(root, 'vitest.database.config.mts')], root);
  console.log('DISPOSABLE MIGRATION AND DATABASE SUITE PASSED');
} finally {
  // This is the exact mkdtemp directory created above, never a database or repository directory.
  if (path.dirname(scratch) !== path.resolve(tmpdir()) || !path.basename(scratch).startsWith('tascora-prisma-validation-')) throw new Error('Invalid scratch cleanup target');
  rmSync(scratch, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
}

// Generates clients/migration SQL without dotenv discovery or DB connections.
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
if (process.argv.includes('--migration') && existsSync(path.join(root, 'prisma/migrations/20261006000000_financial_system/migration.sql'))) throw new Error('Refusing to overwrite existing financial migration; create a new migration for schema changes');
const scratch = mkdtempSync(path.join(tmpdir(), 'tascora-financial-prisma-'));
const env = { ...process.env, DATABASE_URL: 'postgresql://unused:unused@127.0.0.1:1/tascora_test_unused', PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true' };
function run(args) {
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), ...args], { cwd: scratch, env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}
try {
  const schema = readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8');
  writeFileSync(path.join(scratch, 'schema.prisma'), schema);
  if (process.argv.includes('--migration')) {
    const old = spawnSync('git', ['show', 'HEAD:prisma/schema.prisma'], { cwd: root, encoding: 'utf8' });
    if (old.status !== 0) throw new Error('Cannot read baseline schema');
    writeFileSync(path.join(scratch, 'old.prisma'), old.stdout);
    const sql = run(['migrate', 'diff', '--from-schema-datamodel', 'old.prisma', '--to-schema-datamodel', 'schema.prisma', '--script']);
    const directory = path.join(root, 'prisma/migrations/20261006000000_financial_system');
    mkdirSync(directory, { recursive: true }); writeFileSync(path.join(directory, 'migration.sql'), sql);
    console.log('Additive financial migration generated; no database connection');
  }
  const clientRequire = createRequire(require.resolve('@prisma/client'));
  const output = path.dirname(clientRequire.resolve('.prisma/client/default'));
  writeFileSync(path.join(scratch, 'schema.prisma'), schema.replace('provider = "prisma-client-js"', `provider = "prisma-client-js"\n  output = "${output.replaceAll('\\', '/')}"`));
  writeFileSync(path.join(scratch, 'package.json'), '{"private":true}');
  symlinkSync(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'junction');
  console.log(run(['validate', '--schema', 'schema.prisma']));
  console.log(run(['generate', '--schema', 'schema.prisma']));
} finally {
  if (path.dirname(scratch) !== path.resolve(tmpdir()) || !path.basename(scratch).startsWith('tascora-financial-prisma-')) throw new Error('Invalid scratch path');
  rmSync(scratch, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}

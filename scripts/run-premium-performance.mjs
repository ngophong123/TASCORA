// Bundle the TypeScript QA harness without tsx's unavailable OS-user lookup.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const requireTsx = createRequire(fs.realpathSync('node_modules/tsx/package.json'));
const { build } = requireTsx('esbuild');
const output = path.resolve('.premium-performance/runner.mjs');
fs.mkdirSync(path.dirname(output), { recursive: true });
await build({ entryPoints: ['scripts/premium-performance.ts'], outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', logLevel: 'error' });
const child = spawn(process.execPath, [output, ...process.argv.slice(2)], { stdio: 'inherit', cwd: process.cwd() });
child.on('exit', code => process.exit(code || 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));

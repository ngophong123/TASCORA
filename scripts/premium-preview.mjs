// Isolated preview: copies only frontend source/config/assets; never copies .env.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productionCheck = process.argv.includes('--production-check');
const paymentFixture = process.argv.includes('--with-payment-fixture');
const catalogFixture = process.argv.includes('--with-catalog-fixture');
const root = path.join(repo, productionCheck ? paymentFixture ? '.premium-payment-check' : '.premium-check' : '.premium-preview');
const web = path.join(root, 'apps', 'web');
fs.mkdirSync(web, { recursive: true });
for (const item of ['src', 'messages', 'public', 'next.config.ts', 'next-env.d.ts', 'tsconfig.json', 'postcss.config.mjs', 'package.json', 'eslint.config.mjs']) {
  fs.cpSync(path.join(repo, 'apps/web', item), path.join(web, item), { recursive: true, filter: source => !path.basename(source).startsWith('.env') });
}
// Remove only stale routing entrypoints from this owned generated checkout.
for (const entrypoint of ['middleware.ts', 'proxy.ts']) {
  const source = path.join(repo, 'apps/web/src', entrypoint);
  const target = path.join(web, 'src', entrypoint);
  if (!fs.existsSync(source) && fs.existsSync(target)) fs.unlinkSync(target);
}
const configPath = path.join(web, 'next.config.ts');
fs.writeFileSync(configPath, fs.readFileSync(configPath, 'utf8').replace('path.resolve(__dirname, "../../")', JSON.stringify(repo)));
// Offline preview reuses already-installed Geist font assets, preserving unicode ranges.
const cache = path.join(repo, 'apps/web/.next/static');
let fontCss = '';
const mockedFonts = { sans: '', mono: '' };
for (const name of fs.readdirSync(path.join(cache, 'chunks')).filter(name => name.endsWith('.css'))) {
  const css = fs.readFileSync(path.join(cache, 'chunks', name), 'utf8');
  for (const block of css.match(/@font-face\{[^}]+\}/g) || []) {
    if (!/font-family:["']?Geist/.test(block)) continue;
    if (block.includes('src:url(../media/')) {
      const family = /font-family:Geist Mono;/.test(block) ? 'mono' : 'sans';
      // Next's official offline font hook reads these actual cached WOFF2 bytes.
      const mock = block.replace(/\.\.\/media\/([^)"]+)/g, (_match, filename) => '//?/' + path.join(cache, 'media', filename).replaceAll('\\', '/')).replace('src:url(', 'src: url(');
      const range = block.match(/unicode-range:([^}]+)/)?.[1] || '';
      const subset = range.startsWith('U+??') ? 'latin' : range.startsWith('U+102-103') ? 'vietnamese' : range.startsWith('U+100-2BA') ? 'latin-ext' : range.startsWith('U+460-52F') ? 'cyrillic-ext' : range.startsWith('U+301') ? 'cyrillic' : 'symbols';
      mockedFonts[family] += `/* ${subset} */\n` + mock + '\n';
    }
    fontCss += block.replace(/\.\.\/media\/([^)"]+)/g, (_match, filename) => {
      fs.mkdirSync(path.join(web, 'public/fonts'), { recursive: true });
      fs.copyFileSync(path.join(cache, 'media', filename), path.join(web, 'public/fonts', filename));
      return `/fonts/${filename}`;
    }) + '\n';
  }
}
if (fontCss && !productionCheck) {
  const layoutPath = path.join(web, 'src/app/[locale]/layout.tsx');
  let layout = fs.readFileSync(layoutPath, 'utf8').replace(/import \{ Geist, Geist_Mono \} from "next\/font\/google"\r?\n/, '');
  layout = layout.replace(/const geistSans = Geist\(\{[\s\S]*?\}\)/, 'const geistSans = { variable: "" }').replace(/const geistMono = Geist_Mono\(\{[\s\S]*?\}\)/, 'const geistMono = { variable: "" }');
  fs.writeFileSync(layoutPath, layout);
  fs.appendFileSync(path.join(web, 'src/app/globals.css'), `\n${fontCss}\n:root { --font-geist-sans: Geist; --font-geist-mono: "Geist Mono"; }\n`);
}
for (const [source, target] of [[path.join(repo, 'node_modules'), path.join(root, 'node_modules')], [path.join(repo, 'apps/web/node_modules'), path.join(web, 'node_modules')]]) {
  if (!fs.existsSync(target)) fs.symlinkSync(source, target, 'junction');
}
console.log(`Isolated frontend: ${web}`);
if (process.argv.includes('--sync-only')) process.exit(0);
const env = { ...process.env, NEXT_PUBLIC_API_URL: 'https://api.tascora.test', NEXT_PUBLIC_WEB_URL: 'https://tascora.example', NEXT_TELEMETRY_DISABLED: '1' };
if (catalogFixture) {
  // Explicit QA-only Node fetch interception; application API configuration and
  // browser fixtures remain unchanged. Server SSR never contacts a hosted API.
  const preload = path.join(root, 'catalog-fetch.cjs');
  fs.writeFileSync(preload, `const original = globalThis.fetch; globalThis.fetch = (input, init) => {
    const address = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
    const url = new URL(address);
    if (url.origin === 'https://api.tascora.test' && ['/api/v1/services', '/api/v1/marketplace/categories'].includes(url.pathname)) {
      const local = 'http://localhost:3211' + url.pathname + url.search;
      return original(typeof input === 'string' || input instanceof URL ? local : new Request(local, input), init);
    }
    if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return original(input, init);
    throw new Error('Non-loopback server fetch blocked by QA harness');
  };`);
  env.NODE_OPTIONS = `--require "${preload.replaceAll('\\', '/')}"`;
}
// Synthetic, test-only public key. Browser API/provider traffic remains mocked.
if (paymentFixture) env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_fixture_only';
if (productionCheck) {
  const responsePath = path.join(root, 'font-responses.cjs');
  fs.writeFileSync(responsePath, `const fonts = ${JSON.stringify(mockedFonts)}; module.exports = new Proxy({}, { get: (_, url) => { const display = new URL(String(url)).searchParams.get('display') || 'swap'; return (String(url).includes('Geist+Mono') ? fonts.mono : fonts.sans).replace(/font-display:[^;}]+/g, 'font-display:' + display); } });`);
  env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES = responsePath;
}
const next = path.join(repo, 'apps/web/node_modules/next/dist/bin/next');
const args = process.argv.includes('--build') ? ['build', '--webpack'] : process.argv.includes('--start') ? ['start', '-p', '3210', '-H', 'localhost'] : ['dev', '--webpack', '-p', '3210', '-H', 'localhost'];
const child = spawn(process.execPath, [next, ...args], { cwd: web, env, stdio: 'inherit' });
child.on('exit', code => process.exit(code || 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));

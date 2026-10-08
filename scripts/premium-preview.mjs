// Isolated preview: copies only frontend source/config/assets; never copies .env.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productionCheck = process.argv.includes('--production-check');
const root = path.join(repo, productionCheck ? '.premium-check' : '.premium-preview');
const web = path.join(root, 'apps', 'web');
fs.mkdirSync(web, { recursive: true });
for (const item of ['src', 'messages', 'public', 'next.config.ts', 'next-env.d.ts', 'tsconfig.json', 'postcss.config.mjs', 'package.json', 'eslint.config.mjs']) {
  fs.cpSync(path.join(repo, 'apps/web', item), path.join(web, item), { recursive: true, filter: source => !path.basename(source).startsWith('.env') });
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
      mockedFonts[family] += '/* latin */\n' + mock + '\n';
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
const routingPath = path.join(web, 'src/i18n/routing.ts');
if (!productionCheck) fs.writeFileSync(routingPath, fs.readFileSync(routingPath, 'utf8').replace('localePrefix: "as-needed"', 'localePrefix: "always"'));
for (const [source, target] of [[path.join(repo, 'node_modules'), path.join(root, 'node_modules')], [path.join(repo, 'apps/web/node_modules'), path.join(web, 'node_modules')]]) {
  if (!fs.existsSync(target)) fs.symlinkSync(source, target, 'junction');
}
console.log(`Isolated frontend: ${web}`);
if (process.argv.includes('--sync-only')) process.exit(0);
const env = { ...process.env, NEXT_PUBLIC_API_URL: 'https://api.tascora.test', NEXT_PUBLIC_WEB_URL: 'https://tascora.example', NEXT_TELEMETRY_DISABLED: '1' };
if (productionCheck) {
  const responsePath = path.join(root, 'font-responses.cjs');
  fs.writeFileSync(responsePath, `const fonts = ${JSON.stringify(mockedFonts)}; module.exports = new Proxy({}, { get: (_, url) => String(url).includes('Geist+Mono') ? fonts.mono : fonts.sans });`);
  env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES = responsePath;
}
const next = path.join(repo, 'apps/web/node_modules/next/dist/bin/next');
const args = process.argv.includes('--build') ? ['build', '--webpack'] : process.argv.includes('--start') ? ['start', '-p', '3210', '-H', '127.0.0.1'] : ['dev', '--webpack', '-p', '3210', '-H', '127.0.0.1'];
const child = spawn(process.execPath, [next, ...args], { cwd: web, env, stdio: 'inherit' });
child.on('exit', code => process.exit(code || 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));

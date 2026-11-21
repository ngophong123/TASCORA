import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const webSrcDir = path.join(process.cwd(), 'apps/web/src');
const localeAppDir = path.join(webSrcDir, 'app/[locale]');

function walkFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function collectValidRoutes(): Set<string> {
  const pages = walkFiles(localeAppDir, ['page.tsx']);
  const routes = new Set<string>();
  for (const page of pages) {
    const rel = path
      .relative(localeAppDir, path.dirname(page))
      .replace(/\\/g, '/');
    routes.add(rel === '' ? '/' : `/${rel}`);
  }
  return routes;
}

describe('Workstream 6 Frontend Route & UX Integrity Audit', () => {
  it('ensures every static internal href and router.push target resolves to a real App Router page', () => {
    const validRoutes = collectValidRoutes();
    const files = walkFiles(webSrcDir, ['.tsx', '.ts']);
    const broken: { file: string; href: string }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = [
        ...content.matchAll(/href=["'](\/[^"'${}]*?)["']/g),
        ...content.matchAll(/router\.(?:push|replace)\(["'](\/[^"'${}]*?)["']/g),
      ];
      for (const m of matches) {
        const raw = m[1]!;
        if (raw.startsWith('/api/') || raw.startsWith('/images/') || raw.startsWith('/favicon')) {
          continue;
        }
        const routeOnly = raw.split(/[?#]/)[0] || '/';
        if (!validRoutes.has(routeOnly)) {
          broken.push({
            file: path.relative(process.cwd(), file).replace(/\\/g, '/'),
            href: raw,
          });
        }
      }
    }

    expect(broken, `Dead internal frontend routes found: ${JSON.stringify(broken)}`).toEqual([]);
  });

  it('forbids blocking native window.alert calls in frontend UI components', () => {
    const files = walkFiles(webSrcDir, ['.tsx', '.ts']);
    const hits: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (/\bwindow\.alert\s*\(/.test(content)) {
        hits.push(path.relative(process.cwd(), file).replace(/\\/g, '/'));
      }
    }
    expect(hits).toEqual([]);
  });
});

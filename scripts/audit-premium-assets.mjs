import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const repo = process.cwd();
const root = path.join(repo, 'apps/web/public/images');
const sharp = createRequire(fs.realpathSync(path.join(repo, 'apps/web/node_modules/next/package.json')))('sharp');
const files = [];
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) walk(file);
    else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(item.name)) files.push(file);
  }
}
walk(root);
const records = [];
for (const file of files) {
  const buffer = fs.readFileSync(file);
  const metadata = await sharp(buffer).metadata().catch(() => ({}));
  records.push({ path: path.relative(root, file).replaceAll('\\', '/'), bytes: buffer.length, hash: crypto.createHash('sha256').update(buffer).digest('hex'), width: metadata.width, height: metadata.height, format: metadata.format });
}
const groups = Map.groupBy(records, record => record.hash);
const duplicates = [...groups.values()].filter(group => group.length > 1);
const mismatches = records.filter(record => (record.path.endsWith('.webp') && record.format !== 'webp') || (record.path.endsWith('.jpg') && record.format !== 'jpeg'));
const small = records.filter(record => !/(^|\/)avatars?(\/|-|\.)/.test(record.path) && (record.width < 640 || record.height < 360));
const lines = ['# Premium image audit', '', 'Local metadata/SHA256 audit only; no image downloads or provider access. Existing licensed/source provenance must be confirmed by the asset owner before international publication. Test screenshots use fixtures and are not proof of actual sellers or portfolios.', '', `Images inspected: ${records.length}. Duplicate groups: ${duplicates.length}. Extension/format mismatches: ${mismatches.length}. Non-avatar images below 640×360: ${small.length}.`, '', '## Duplicate groups', '', ...duplicates.map(group => '- ' + group.map(record => '`' + record.path + '`').join(', ')), '', '## Format mismatches', '', ...mismatches.map(record => `- ${record.path}: actual ${record.format}`), '', '## Lower-resolution assets to review', '', ...small.map(record => `- ${record.path}: ${record.width}×${record.height}`), '', 'No automatic replacement or deduplication: filenames may be persisted references. Live cards/detail continue using service-provided image records; missing images use an explicit brand placeholder, not unrelated stock. Owner should replace repeated or irrelevant portfolio covers at their source and supply proper originals.', ''];
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/PREMIUM_IMAGE_AUDIT.md', lines.join('\n'));
console.log(JSON.stringify({ inspected: records.length, duplicateGroups: duplicates.length, formatMismatches: mismatches.length, lowResolution: small.length }));

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Let's check all service images across the folders
const base = path.resolve('apps/web/public/images/services');
const allServiceFiles: string[] = [];

function walk(dir: string) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (f.endsWith('.jpg') || f.endsWith('.webp') || f.endsWith('.png')) {
      allServiceFiles.push(p);
    }
  });
}

walk(base);

console.log('Total service image files found:', allServiceFiles.length);

const hashes: Record<string, string[]> = {};
allServiceFiles.forEach(f => {
  const h = crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
  hashes[h] = hashes[h] || [];
  hashes[h].push(path.relative(base, f));
});

let dupCount = 0;
Object.entries(hashes).forEach(([h, group]) => {
  if (group.length > 1) {
    dupCount++;
    console.log(`Duplicate hash group (${group.length} files):`, group.join(', '));
  }
});
console.log('Duplicate service image sets:', dupCount);

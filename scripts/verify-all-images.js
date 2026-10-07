const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../apps/web/public');
const filesToCheck = [
  'apps/web/src/data/gigs.ts',
  'apps/web/src/data/freelancers.ts',
  'apps/web/src/data/dashboard/gigs.ts',
  'apps/web/src/data/reviews.ts',
  'apps/web/src/data/dashboard/orders.ts',
  'apps/web/src/data/dashboard/messages.ts',
  'apps/web/src/data/gigCovers.ts',
  'apps/web/src/data/avatars.ts',
  'apps/web/src/data/images.ts'
];

const imgRegex = /"(\/images\/[^"]+)"/g;
let found = 0;
const missing = new Set();
const uniquePaths = new Set();

for (const relFile of filesToCheck) {
  const fullFilePath = path.resolve(__dirname, '..', relFile);
  if (!fs.existsSync(fullFilePath)) {
    console.warn('File not found to check:', fullFilePath);
    continue;
  }
  const content = fs.readFileSync(fullFilePath, 'utf-8');
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    found++;
    const rel = match[1];
    uniquePaths.add(rel);
    const full = path.join(publicDir, rel);
    if (!fs.existsSync(full)) {
      missing.add(rel);
    }
  }
}

console.log('Checked total image references:', found);
console.log('Unique image paths:', uniquePaths.size);
console.log('Missing images count:', missing.size);
if (missing.size > 0) {
  console.log('Missing files:', Array.from(missing));
  process.exit(1);
} else {
  console.log('SUCCESS: 100% of all image references exist on disk!');
}

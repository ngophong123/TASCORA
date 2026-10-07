import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { PHOTO_MAP } from './test-candidate-photos';

function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    function get(currentUrl: string, redirects = 0) {
      if (redirects > 5) return resolve(false);
      https.get(currentUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          console.error(`Status ${res.statusCode} for ${currentUrl}`);
          return resolve(false);
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
        fileStream.on('error', () => resolve(false));
      }).on('error', () => resolve(false));
    }
    get(url);
  });
}

async function main() {
  console.log('=== DOWNLOADING & SAVING ALL 73 UNIQUE GIG COVERS ===');
  const base = path.resolve('apps/web/public/images/services');

  for (const [gigId, item] of Object.entries(PHOTO_MAP)) {
    const dest = path.join(base, item.folder, item.name);
    const url = `https://images.unsplash.com/${item.id}?auto=format&fit=crop&w=1200&h=750&q=80`;
    console.log(`[${gigId}] ${item.folder}/${item.name}...`);
    const ok = await downloadImage(url, dest);
    if (!ok) {
      console.error(`  FAILED: ${url}`);
    } else {
      console.log(`  ✓ OK (${fs.statSync(dest).size} bytes)`);
    }
  }

  console.log('\n=== CHECKING MD5 HASHES OF ALL 73 COVERS ===');
  const hashes = new Map<string, string>();
  let dups = 0;

  for (const [gigId, item] of Object.entries(PHOTO_MAP)) {
    const dest = path.join(base, item.folder, item.name);
    if (fs.existsSync(dest)) {
      const h = crypto.createHash('md5').update(fs.readFileSync(dest)).digest('hex');
      if (hashes.has(h)) {
        console.error(`Duplicate hash for ${gigId} (${item.name}) with ${hashes.get(h)}`);
        dups++;
      } else {
        hashes.set(h, `${gigId} (${item.name})`);
      }
    } else {
      console.error(`File missing: ${dest}`);
      dups++;
    }
  }

  if (dups === 0) {
    console.log(`ALL 73 GIG COVERS ARE 100% UNIQUE HASHES! Zero duplication!`);
  } else {
    console.error(`Found ${dups} issues.`);
  }
}

main().catch(console.error);

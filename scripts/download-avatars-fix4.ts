import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';

function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    function get(currentUrl: string, redirects = 0) {
      if (redirects > 5) return resolve(false);
      https.get(currentUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) return resolve(false);
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

// Fresh Unsplash portrait IDs
const fixList = [
  { file: 'torsten-lindemann.jpg', id: 'photo-1519085360753-af0119f7cbe7' },
  { file: 'jonas-vestergaard.jpg', id: 'photo-1522075469751-3a6694fb2f61' },
  { file: 'linnea-holm.jpg', id: 'photo-1580489944761-15a19d654956' },
  { file: 'yuka-sato.jpg', id: 'photo-1524504388940-b1c1722653e1' },
];

async function run() {
  for (const item of fixList) {
    const dest = path.resolve('apps/web/public/images/avatars', item.file);
    const url = `https://images.unsplash.com/${item.id}?auto=format&fit=crop&w=400&h=400&q=80`;
    console.log(`Downloading ${item.file}...`, await downloadImage(url, dest));
  }
}

run().catch(console.error);

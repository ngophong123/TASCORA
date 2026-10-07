import fs from 'fs';
import path from 'path';
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

const list = [
  { file: 'david-chen.jpg', id: 'photo-1535713875002-d1d0cf377fde' },
  { file: 'torsten-lindemann.jpg', id: 'photo-1560250097-0b93528c311a' },
  { file: 'jonas-vestergaard.jpg', id: 'photo-1519085360753-af0119f7cbe7' },
  { file: 'yuka-sato.jpg', id: 'photo-1573496359142-b8d87734a5a2' },
  { file: 'liam-oconnor.jpg', id: 'photo-1566492031773-4f4e44671857' },
  { file: 'linnea-holm.jpg', id: 'photo-1573497019940-1c28c88b4f3e' },
  { file: 'sarah-jenkins.jpg', id: 'photo-1548142813-c348350df52b' },
];

async function run() {
  for (const item of list) {
    const dest = path.resolve('apps/web/public/images/avatars', item.file);
    const url = `https://images.unsplash.com/${item.id}?auto=format&fit=crop&w=400&h=400&q=80`;
    console.log(`Downloading ${item.file}...`, await downloadImage(url, dest));
  }
}

run().catch(console.error);

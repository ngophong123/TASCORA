import fs from 'fs';
import path from 'path';
import https from 'https';

function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
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

async function run() {
  const p1 = path.resolve('apps/web/public/images/services/design/cinematic-product-reveal-trailer.jpg');
  const u1 = 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&h=750&q=80';
  console.log('Downloading gig-54...', await downloadImage(u1, p1));

  const p2 = path.resolve('apps/web/public/images/services/ai/enterprise-semantic-search.jpg');
  const u2 = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&h=750&q=80';
  console.log('Downloading gig-32...', await downloadImage(u2, p2));
}

run().catch(console.error);

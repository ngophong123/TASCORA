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
  const p1 = path.resolve('apps/web/public/images/services/programming/defi-web3-staking-protocol.jpg');
  const u1 = 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&h=750&q=80';
  console.log('Downloading defi...', await downloadImage(u1, p1));

  const p2 = path.resolve('apps/web/public/images/services/programming/ecommerce-stripe-storefront.jpg');
  const u2 = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&h=750&q=80';
  console.log('Downloading ecommerce...', await downloadImage(u2, p2));
}

run().catch(console.error);

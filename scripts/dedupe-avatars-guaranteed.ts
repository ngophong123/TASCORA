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

function getExistingHashes(avatarDir: string, ignoreFile: string): Set<string> {
  const hashes = new Set<string>();
  fs.readdirSync(avatarDir).forEach(f => {
    if (f !== ignoreFile && fs.statSync(path.join(avatarDir, f)).isFile()) {
      const h = crypto.createHash('md5').update(fs.readFileSync(path.join(avatarDir, f))).digest('hex');
      hashes.add(h);
    }
  });
  return hashes;
}

// Candidates for avatars
const candidateIds = [
  'photo-1544717305-2782549b5136',
  'photo-1544717302-de2939b7ef71',
  'photo-1560250097-0b93528c311a',
  'photo-1570295999919-56ceb5ecca61',
  'photo-1534528741775-53994a69daeb',
  'photo-1517841905240-472988babdf9',
  'photo-1539571696357-5a69c17a67c6',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1500648767791-00dcc994a43e',
  'photo-1494790108377-be9c29b29330',
  'photo-1566492031773-4f4e44671857',
  'photo-1583863788434-e58a36330cf0',
  'photo-1501196354995-cbb51c65aaea',
  'photo-1472099645785-5658abf4ff4e',
  'photo-1519085360753-af0119f7cbe7',
  'photo-1567532939604-b6b5b0db2604',
  'photo-1580489944761-15a19d654956',
  'photo-1524504388940-b1c1722653e1',
  'photo-1506794778202-cad84cf45f1d',
  'photo-1508214751196-bcfd4ca60f91',
  'photo-1534751516642-a171edd2521d',
  'photo-1573496359142-b8d87734a5a2',
  'photo-1573497019940-1c28c88b4f3e',
  'photo-1573497019236-17f8177b81e8',
  'photo-1492562080023-ab3db95bfbce',
  'photo-1522075469751-3a6694fb2f61',
  'photo-1522529599102-193c0d76b5b6',
  'photo-1507081323647-4d2504a4b919',
  'photo-1548142813-c348350df52b',
  'photo-1535713875002-d1d0cf377fde',
  'photo-1607746882042-944635dfe10e',
  'photo-1560250097-0b93528c311a',
  'photo-1584999734482-05c3c10859f7',
  'photo-1529626455594-4ff0802cfb7e',
  'photo-1628157582853-a796fa650a6a',
  'photo-1544005313-94ddf0286df2',
  'photo-1531746020798-e6953c6e8e04'
];

async function run() {
  const avatarDir = path.resolve('apps/web/public/images/avatars');
  const targetFiles = ['linnea-holm.jpg', 'torsten-lindemann.jpg', 'jonas-vestergaard.jpg', 'yuka-sato.jpg'];

  for (const file of targetFiles) {
    const existingHashes = getExistingHashes(avatarDir, file);
    const dest = path.join(avatarDir, file);
    let matched = false;

    for (const cid of candidateIds) {
      const tempPath = path.join(avatarDir, `_temp_${file}`);
      const url = `https://images.unsplash.com/${cid}?auto=format&fit=crop&w=400&h=400&q=80`;
      const ok = await downloadImage(url, tempPath);
      if (ok) {
        const hash = crypto.createHash('md5').update(fs.readFileSync(tempPath)).digest('hex');
        if (!existingHashes.has(hash)) {
          fs.renameSync(tempPath, dest);
          console.log(`Assigned unique portrait ${cid} to ${file} (hash: ${hash})`);
          matched = true;
          break;
        } else {
          fs.unlinkSync(tempPath);
        }
      }
    }

    if (!matched) {
      console.error(`Could not find unique candidate for ${file}`);
    }
  }
}

run().catch(console.error);

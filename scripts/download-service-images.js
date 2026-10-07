const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_DIR = path.resolve(__dirname, '../apps/web/public/images');

const IMAGE_MANIFEST = [
  // 1. Programming & Tech
  {
    category: 'programming',
    filename: 'full-stack-nextjs-node.jpg',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Fotis Fotopoulos',
    unsplashId: 'photo-1555066931-4365d14bab8c',
    alt: 'Professional software developer workstation with clean Next.js and TypeScript code',
  },
  {
    category: 'programming',
    filename: 'developer-workstation-dual-monitors.jpg',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Christopher Gower',
    unsplashId: 'photo-1498050108023-c5249f4df085',
    alt: 'Software engineer dual-monitor setup with code architecture and terminal',
  },
  {
    category: 'programming',
    filename: 'modern-frontend-minimalist.jpg',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Clément H',
    unsplashId: 'photo-1517694712202-14dd9538aa97',
    alt: 'Modern minimalist responsive frontend development on MacBook',
  },
  {
    category: 'programming',
    filename: 'cybersecurity-soc-monitor.jpg',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'FlyD',
    unsplashId: 'photo-1563986768609-322da13575f3',
    alt: 'Cybersecurity professional analyzing enterprise security infrastructure',
  },
  {
    category: 'programming',
    filename: 'cloud-devops-infrastructure.jpg',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'NASA / Science',
    unsplashId: 'photo-1451187580459-43490279c0fa',
    alt: 'Distributed cloud networking and DevOps infrastructure visualization',
  },
  {
    category: 'programming',
    filename: 'smart-contracts-blockchain.jpg',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Shubham Dhage',
    unsplashId: 'photo-1639762681485-074b7f938ba0',
    alt: 'Smart contract security protocol and decentralized ledger architecture',
  },
  {
    category: 'programming',
    filename: 'mobile-app-engineering.jpg',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Daniel Korpai',
    unsplashId: 'photo-1512941937669-90a1b58e7e9c',
    alt: 'Mobile application engineer designing cross-platform iOS and Android UI',
  },

  // 2. Graphics & Design
  {
    category: 'design',
    filename: 'luxury-brand-identity-stationery.jpg',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Igor Miske',
    unsplashId: 'photo-1507238691740-187a5b1d37b8',
    alt: 'Luxury editorial brand identity system and responsive typography',
  },
  {
    category: 'design',
    filename: 'saas-design-system-figma.jpg',
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Theme Photos',
    unsplashId: 'photo-1581291518857-4e27b48ff24e',
    alt: 'SaaS design system token architecture and wireframes in Figma',
  },
  {
    category: 'design',
    filename: 'visual-brand-guidelines-swatches.jpg',
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'NordWood Themes',
    unsplashId: 'photo-1561070791-2526d30994b5',
    alt: 'Minimalist brand guidelines, bespoke stationery and typography color swatches',
  },
  {
    category: 'design',
    filename: 'motion-graphics-3d-workstation.jpg',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Milad Fakurian',
    unsplashId: 'photo-1634017839464-5c339ebe3cb4',
    alt: 'Professional 3D product render and abstract motion visual design',
  },
  {
    category: 'design',
    filename: 'packaging-editorial-typography.jpg',
    url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Kelly Sikkema',
    unsplashId: 'photo-1586717791821-3f44a563fa4c',
    alt: 'Physical brand packaging and tactile editorial design materials',
  },

  // 3. AI & Automation
  {
    category: 'ai',
    filename: 'neural-network-ai-workstation.jpg',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'DeepMind',
    unsplashId: 'photo-1620712943543-bcc4688e7485',
    alt: 'Deep learning neural network topology and AI research architecture',
  },
  {
    category: 'ai',
    filename: 'llm-rag-fine-tuning-code.jpg',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Markus Spiske',
    unsplashId: 'photo-1526374965328-7f61d4dc18c5',
    alt: 'Autonomous AI agent workflows and large language model code pipeline',
  },
  {
    category: 'ai',
    filename: 'machine-learning-computer-vision.jpg',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'ThisisEngineering',
    unsplashId: 'photo-1581091226825-a6a2a5aee158',
    alt: 'Computer vision robotics and machine learning engineer at workstation',
  },

  // 4. Technical SEO & Growth Marketing
  {
    category: 'marketing',
    filename: 'technical-seo-analytics-growth.jpg',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Carlos Muza',
    unsplashId: 'photo-1460925895917-afdab827c52f',
    alt: 'Technical SEO analytics dashboard with organic traffic growth charts',
  },
  {
    category: 'marketing',
    filename: 'data-attribution-dashboard.jpg',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Luke Chesser',
    unsplashId: 'photo-1551288049-bebda4e38f71',
    alt: 'Enterprise revenue attribution metrics and multi-touch data dashboard',
  },
  {
    category: 'marketing',
    filename: 'conversion-optimization-strategy.jpg',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Campaign Creators',
    unsplashId: 'photo-1557804506-669a67965ba0',
    alt: 'Growth marketing team analyzing conversion rate optimization funnels',
  },

  // 5. Technical Writing
  {
    category: 'writing',
    filename: 'technical-documentation-editorial.jpg',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Aaron Burden',
    unsplashId: 'photo-1455390582262-044cdead277a',
    alt: 'Technical developer documentation and manuscript workspace',
  },
  {
    category: 'writing',
    filename: 'system-architecture-whitepaper.jpg',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Patrick Tomasso',
    unsplashId: 'photo-1457369804613-52c61a468e7d',
    alt: 'Comprehensive architectural whitepaper drafts and technical research library',
  },

  // 6. Video & Motion
  {
    category: 'video',
    filename: 'video-production-studio-editing.jpg',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Sam McGhee',
    unsplashId: 'photo-1574717024653-61fd2cf4d44d',
    alt: 'Professional video post-production editing workstation with timeline',
  },
  {
    category: 'video',
    filename: 'cinematic-motion-postproduction.jpg',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Caleb Oquendo',
    unsplashId: 'photo-1492691527719-9d1e07e534b4',
    alt: 'Cinematic video camera production and motion graphics studio',
  },

  // 7. Business & Consulting
  {
    category: 'business',
    filename: 'enterprise-consulting-boardroom.jpg',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Sean Pollock',
    unsplashId: 'photo-1486406146926-c627a92ad1ab',
    alt: 'Enterprise executive consulting and business strategy meeting',
  },
  {
    category: 'business',
    filename: 'financial-modeling-advisory.jpg',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Adeolu Eletu',
    unsplashId: 'photo-1554224155-8d04cb21cd6c',
    alt: 'Financial modeling, valuation advisory, and strategic balance sheet analysis',
  },

  // 8. Service Detail Galleries
  {
    category: 'gallery',
    filename: 'code-architecture-blueprint.jpg',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Fotis Fotopoulos',
    unsplashId: 'photo-1555066931-4365d14bab8c',
    alt: 'Clean code architecture and Next.js production repository preview',
  },
  {
    category: 'gallery',
    filename: 'analytics-revenue-metrics.jpg',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Luke Chesser',
    unsplashId: 'photo-1551288049-bebda4e38f71',
    alt: 'Detailed analytics and real-time order revenue charts',
  },
  {
    category: 'gallery',
    filename: 'cloud-server-datacenter.jpg',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=750&q=80',
    photographer: 'Thomas Jensen',
    unsplashId: 'photo-1558494949-ef010cbdcc31',
    alt: 'High-availability server rack cluster in enterprise datacenter',
  },
];

// 9. Real Specialist Avatars (400x400)
const AVATAR_MANIFEST = [
  {
    filename: 'alexandre-moreau.jpg',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Alexandre Moreau',
    photographer: 'Joseph Gonzalez',
  },
  {
    filename: 'helena-rostova.jpg',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Helena Rostova',
    photographer: 'Aiony Haust',
  },
  {
    filename: 'marcus-vance.jpg',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Marcus Vance',
    photographer: 'Jurica Koletić',
  },
  {
    filename: 'sophia-chen.jpg',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Sophia Chen',
    photographer: 'Christina @ wocintechchat.com',
  },
  {
    filename: 'dmitri-volkov.jpg',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Dmitri Volkov',
    photographer: 'Austin Distel',
  },
  {
    filename: 'chloe-laurent.jpg',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Chloé Laurent',
    photographer: 'Michael Dam',
  },
  {
    filename: 'client-marcus.jpg',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Marcus Thorne',
    photographer: 'Ali Morshedlou',
  },
  {
    filename: 'client-emily.jpg',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Emily Watson',
    photographer: 'Stephanie Liverani',
  },
  {
    filename: 'reviewer-sarah.jpg',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Sarah Jenkins',
    photographer: 'Foto DC',
  },
  {
    filename: 'default-avatar.jpg',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
    name: 'Default User',
    photographer: 'Christopher Campbell',
  },
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(destPath);
          console.log(`[Downloaded] ${path.basename(destPath)} (${Math.round(stats.size / 1024)} KB)`);
          resolve(stats.size);
        });
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function main() {
  console.log('--- Starting TASCORA Local Image Asset Downloader ---');

  // Ensure directories exist
  const categories = ['programming', 'design', 'ai', 'marketing', 'writing', 'video', 'business', 'gallery'];
  for (const cat of categories) {
    const catDir = path.join(BASE_DIR, 'services', cat);
    fs.mkdirSync(catDir, { recursive: true });
  }
  const avatarDir = path.join(BASE_DIR, 'avatars');
  fs.mkdirSync(avatarDir, { recursive: true });

  // 1. Download Service Images
  console.log(`\nDownloading ${IMAGE_MANIFEST.length} service photographs...`);
  for (const item of IMAGE_MANIFEST) {
    const dest = path.join(BASE_DIR, 'services', item.category, item.filename);
    try {
      await downloadFile(item.url, dest);
    } catch (err) {
      console.error(`Error downloading ${item.filename}:`, err.message);
    }
  }

  // 2. Download Default Fallback Service Image
  const defaultServiceSrc = path.join(BASE_DIR, 'services/programming/full-stack-nextjs-node.jpg');
  const defaultServiceDestJpg = path.join(BASE_DIR, 'services/default-service.jpg');
  const defaultServiceDestWebp = path.join(BASE_DIR, 'services/default-service.webp');
  if (fs.existsSync(defaultServiceSrc)) {
    fs.copyFileSync(defaultServiceSrc, defaultServiceDestJpg);
    fs.copyFileSync(defaultServiceSrc, defaultServiceDestWebp);
    console.log('[Fallback Asset Created] /images/services/default-service.jpg and .webp');
  }

  // 3. Download Avatars
  console.log(`\nDownloading ${AVATAR_MANIFEST.length} avatars...`);
  for (const item of AVATAR_MANIFEST) {
    const dest = path.join(avatarDir, item.filename);
    try {
      await downloadFile(item.url, dest);
    } catch (err) {
      console.error(`Error downloading ${item.filename}:`, err.message);
    }
  }

  // 4. Generate IMAGE_SOURCES.md documentation
  let docContent = `# TASCORA Commercially-Licensed Stock Photography Registry\n\n`;
  docContent += `All assets in this repository are genuine, high-resolution photographs curated from professional photographers via Unsplash under the Unsplash License (free for commercial and non-commercial use, no permission needed).\n\n`;
  docContent += `## 1. Marketplace Service Photography\n\n`;
  docContent += `| Category | Local Path | Photographer | Alt Text | Original Source |\n`;
  docContent += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const item of IMAGE_MANIFEST) {
    docContent += `| \`${item.category}\` | \`/images/services/${item.category}/${item.filename}\` | ${item.photographer} | ${item.alt} | [Unsplash](https://unsplash.com/photos/${item.unsplashId}) |\n`;
  }

  docContent += `\n## 2. Professional Freelancer Avatars\n\n`;
  docContent += `| Name | Local Path | Photographer | Source |\n`;
  docContent += `| :--- | :--- | :--- | :--- |\n`;
  for (const item of AVATAR_MANIFEST) {
    docContent += `| ${item.name} | \`/images/avatars/${item.filename}\` | ${item.photographer} | Unsplash License |\n`;
  }

  const docPath = path.join(BASE_DIR, 'services/IMAGE_SOURCES.md');
  fs.writeFileSync(docPath, docContent, 'utf-8');
  console.log(`\n[Documentation Created] ${docPath}`);

  console.log('\n--- Image Asset Download Complete! ---');
}

main().catch(console.error);

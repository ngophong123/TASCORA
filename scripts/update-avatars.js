const fs = require("fs");
const path = require("path");

const file = path.resolve(__dirname, "../apps/web/src/data/avatars.ts");
let content = fs.readFileSync(file, "utf8");

const maleAvatars = [
  "/images/avatars/alexandre-moreau.jpg",
  "/images/avatars/marcus-vance.jpg",
  "/images/avatars/dmitri-volkov.jpg",
  "/images/avatars/client-marcus.jpg",
  "/images/avatars/default-avatar.jpg",
];

const femaleAvatars = [
  "/images/avatars/helena-rostova.jpg",
  "/images/avatars/sophia-chen.jpg",
  "/images/avatars/chloe-laurent.jpg",
  "/images/avatars/reviewer-sarah.jpg",
  "/images/avatars/client-emily.jpg",
];

let mIdx = 0;
let fIdx = 0;

content = content.replace(
  /(\{\s*id:\s*"[^"]+",\s*)url:\s*"https:\/\/images\.unsplash\.com\/[^"]+",(\s*name:\s*"[^"]+",\s*gender:\s*"(male|female)")/g,
  (match, prefix, suffix, gender) => {
    const chosen =
      gender === "female"
        ? femaleAvatars[(fIdx++) % femaleAvatars.length]
        : maleAvatars[(mIdx++) % maleAvatars.length];
    return `${prefix}url: "${chosen}",${suffix}`;
  }
);

content = content.replace(
  'const getCurated = (idx: number): string => CURATED_AVATARS[idx]?.url ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80"',
  'const getCurated = (idx: number): string => CURATED_AVATARS[idx]?.url ?? "/images/avatars/default-avatar.jpg"'
);

fs.writeFileSync(file, content, "utf8");
console.log("Updated avatars.ts successfully!");

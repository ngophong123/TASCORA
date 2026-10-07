import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MOCK_GIGS } from '../apps/web/src/data/gigs';
import { getGigCoverUrl } from '../apps/web/src/data/gigCovers';

console.log('ID | CATEGORY | SUBCATEGORY | TITLE | CURRENT_COVER | SELLER_TITLE');
console.log('---|---|---|---|---|---');
MOCK_GIGS.forEach((g) => {
  const cover = getGigCoverUrl(g);
  console.log(`${g.id} | ${g.categorySlug} | ${g.subCategorySlug} (${g.subCategoryName}) | ${g.title} | ${cover} | ${g.seller.name}`);
});

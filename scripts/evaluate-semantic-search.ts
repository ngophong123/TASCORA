import { pathToFileURL } from 'node:url';
import {
  hybridSemanticSearch,
  keywordSearchRank,
  type SearchableServiceItem,
} from '../apps/api/src/modules/service/semantic-search.service';
import { clearEmbeddingCache, finOpsTracker } from '../apps/api/src/modules/service/ai-finops';

export const EVAL_CATALOG: SearchableServiceItem[] = [
  { id: 'svc-web-1', title: 'Next.js SaaS Web Application & Stripe Billing', description: 'Full-stack React TypeScript web app with checkout and subscription billing', category: 'Web Development', tags: ['nextjs', 'react', 'typescript', 'stripe', 'saas'], startingPriceUsd: 650, ratingAverage: 4.9 },
  { id: 'svc-web-2', title: 'High-Converting Landing Page UI in Tailwind', description: 'Responsive frontend website built with React and modern accessibility', category: 'Web Development', tags: ['frontend', 'tailwind', 'landing', 'spa'], startingPriceUsd: 320, ratingAverage: 4.8 },
  { id: 'svc-api-1', title: 'Node.js Express PostgreSQL REST API Architecture', description: 'Scalable backend server with Prisma schema design and relational queries', category: 'Backend Engineering', tags: ['nodejs', 'express', 'postgresql', 'prisma', 'api'], startingPriceUsd: 550, ratingAverage: 4.9 },
  { id: 'svc-api-2', title: 'GraphQL Microservice & Database Optimization', description: 'Query tuning, indexing, and backend API reliability review', category: 'Backend Engineering', tags: ['graphql', 'database', 'backend', 'postgres'], startingPriceUsd: 480, ratingAverage: 4.7 },
  { id: 'svc-brand-1', title: 'Minimalist Brand Identity & Logo System', description: 'Custom vector logo mark, typography palette, and brand guidelines', category: 'Design & Creative', tags: ['logo', 'branding', 'identity', 'minimalist', 'visual'], startingPriceUsd: 290, ratingAverage: 4.9 },
  { id: 'svc-brand-2', title: 'Figma Design System & Interactive Prototype', description: 'Wireframes, clickable UX prototype, and reusable UI component tokens', category: 'Design & Creative', tags: ['figma', 'ux', 'ui', 'prototype', 'wireframe'], startingPriceUsd: 420, ratingAverage: 4.8 },
  { id: 'svc-mobile-1', title: 'Cross-Platform React Native iOS & Android App', description: 'Mobile app development with native navigation and REST API integration', category: 'Mobile Development', tags: ['reactnative', 'ios', 'android', 'mobile'], startingPriceUsd: 890, ratingAverage: 4.8 },
  { id: 'svc-mobile-2', title: 'Flutter Consumer Mobile Application', description: 'Fast cross-platform mobile storefront for iOS and Android devices', category: 'Mobile Development', tags: ['flutter', 'mobile', 'app'], startingPriceUsd: 780, ratingAverage: 4.6 },
  { id: 'svc-ai-1', title: 'Custom LLM RAG Chatbot & Semantic Search', description: 'Python and OpenAI retrieval augmented generation pipeline with embeddings', category: 'AI & Data', tags: ['ai', 'llm', 'rag', 'chatbot', 'embedding', 'python'], startingPriceUsd: 950, ratingAverage: 4.9 },
  { id: 'svc-ai-2', title: 'Workflow Automation & NLP Data Pipeline', description: 'Automated text classification and data extraction agents in Python', category: 'AI & Data', tags: ['automation', 'nlp', 'python', 'data', 'agent'], startingPriceUsd: 620, ratingAverage: 4.7 },
  { id: 'svc-seo-1', title: 'Technical SEO Audit & Organic Growth Roadmap', description: 'Core Web Vitals, schema markup, keyword strategy, and analytics tracking', category: 'Marketing', tags: ['seo', 'growth', 'analytics', 'marketing'], startingPriceUsd: 260, ratingAverage: 4.8 },
  { id: 'svc-seo-2', title: 'SaaS Conversion Copywriting & Sales Funnel', description: 'Persuasive landing page copy, blog articles, and conversion funnel edits', category: 'Marketing', tags: ['copywriting', 'content', 'conversion', 'funnel'], startingPriceUsd: 310, ratingAverage: 4.7 },
  { id: 'svc-sec-1', title: 'Docker CI/CD Pipeline & AWS Cloud Hardening', description: 'Containerized deployments, Kubernetes manifests, and infrastructure checks', category: 'DevOps & Security', tags: ['docker', 'kubernetes', 'aws', 'ci', 'cloud', 'devops'], startingPriceUsd: 600, ratingAverage: 4.9 },
  { id: 'svc-sec-2', title: 'Web Application Security Audit & Pentest Review', description: 'OWASP vulnerability review, auth hardening, and Lighthouse performance pass', category: 'DevOps & Security', tags: ['security', 'audit', 'pentest', 'performance', 'lighthouse'], startingPriceUsd: 700, ratingAverage: 4.9 },
  { id: 'svc-vid-1', title: 'SaaS Product Demo Video & Motion Graphics', description: 'Explainer animation, After Effects editing, and promotional launch reel', category: 'Video & Animation', tags: ['video', 'motion', 'animation', 'promo', 'reel'], startingPriceUsd: 390, ratingAverage: 4.8 },
  { id: 'svc-ecom-1', title: 'Shopify Custom Theme & Checkout Optimization', description: 'Online store redesign with faster checkout and payment integration', category: 'E-Commerce', tags: ['shopify', 'ecommerce', 'store', 'checkout', 'payment'], startingPriceUsd: 520, ratingAverage: 4.8 },
];

export interface EvalQueryCase {
  query: string;
  relevantIds: string[];
}

export const EVAL_QUERIES: EvalQueryCase[] = [
  { query: 'build online shop with checkout payments', relevantIds: ['svc-ecom-1', 'svc-web-1'] },
  { query: 'react web dashboard frontend interface', relevantIds: ['svc-web-1', 'svc-web-2'] },
  { query: 'postgresql rest server api with prisma', relevantIds: ['svc-api-1', 'svc-api-2'] },
  { query: 'company visual identity minimalist mark', relevantIds: ['svc-brand-1'] },
  { query: 'clickable ux wireframe tokens in figma', relevantIds: ['svc-brand-2'] },
  { query: 'ios and android smartphone app build', relevantIds: ['svc-mobile-1', 'svc-mobile-2'] },
  { query: 'rag assistant using embeddings and llm', relevantIds: ['svc-ai-1'] },
  { query: 'python agent automating nlp data workflow', relevantIds: ['svc-ai-2'] },
  { query: 'improve organic search traffic and analytics', relevantIds: ['svc-seo-1'] },
  { query: 'landing page sales copy and funnel optimization', relevantIds: ['svc-seo-2'] },
  { query: 'containerized cloud deployment with docker', relevantIds: ['svc-sec-1'] },
  { query: 'security review pentest and lighthouse speed', relevantIds: ['svc-sec-2'] },
  { query: 'animated product promo launch video', relevantIds: ['svc-vid-1'] },
  { query: 'shopify store checkout speed improvement', relevantIds: ['svc-ecom-1'] },
  { query: 'typescript saas subscription platform', relevantIds: ['svc-web-1'] },
  { query: 'database query tuning graphql backend', relevantIds: ['svc-api-2', 'svc-api-1'] },
  { query: 'flutter mobile storefront', relevantIds: ['svc-mobile-2', 'svc-mobile-1'] },
  { query: 'branding typography palette for startup', relevantIds: ['svc-brand-1'] },
  { query: 'aws kubernetes devops pipeline', relevantIds: ['svc-sec-1'] },
  { query: 'motion graphics explainer reel editing', relevantIds: ['svc-vid-1'] },
];

export interface SearchEvalMetrics {
  queryCount: number;
  k: number;
  keywordBaseline: {
    precisionAtK: number;
    recallAtK: number;
    mrr: number;
    avgLatencyMs: number;
  };
  hybridSemantic: {
    precisionAtK: number;
    recallAtK: number;
    mrr: number;
    avgLatencyMs: number;
  };
  finOps: ReturnType<typeof finOpsTracker.summary>;
}

export function runSemanticSearchEvaluation(k = 3): SearchEvalMetrics {
  clearEmbeddingCache();
  finOpsTracker.reset();

  const evaluate = (rankFn: (q: string) => { item: SearchableServiceItem }[]) => {
    let precisionSum = 0;
    let recallSum = 0;
    let mrrSum = 0;
    let latencySum = 0;

    for (const testCase of EVAL_QUERIES) {
      const t0 = performance.now();
      const top = rankFn(testCase.query).slice(0, k);
      latencySum += performance.now() - t0;

      const relevantSet = new Set(testCase.relevantIds);
      const hits = top.filter((r) => relevantSet.has(r.item.id)).length;
      precisionSum += hits / k;
      recallSum += hits / relevantSet.size;

      const firstHitIdx = top.findIndex((r) => relevantSet.has(r.item.id));
      if (firstHitIdx >= 0) {
        mrrSum += 1 / (firstHitIdx + 1);
      }
    }

    const n = EVAL_QUERIES.length;
    return {
      precisionAtK: Number((precisionSum / n).toFixed(4)),
      recallAtK: Number((recallSum / n).toFixed(4)),
      mrr: Number((mrrSum / n).toFixed(4)),
      avgLatencyMs: Number((latencySum / n).toFixed(3)),
    };
  };

  const keywordBaseline = evaluate((q) => keywordSearchRank(q, EVAL_CATALOG, k));
  const hybridSemantic = evaluate((q) => hybridSemanticSearch(q, EVAL_CATALOG, k).results);

  return {
    queryCount: EVAL_QUERIES.length,
    k,
    keywordBaseline,
    hybridSemantic,
    finOps: finOpsTracker.summary(),
  };
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  console.log(JSON.stringify(runSemanticSearchEvaluation(3), null, 2));
}

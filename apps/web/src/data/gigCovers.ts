/**
 * TASCORA Curated Commercially-Licensed Stock Photography for Gig Covers
 * Sourced from free, commercially-licensed Unsplash collections and stored locally
 * in /images/services/ for guaranteed 100% offline persistence.
 */

export interface GigCoverPhoto {
  id: string
  url: string
  alt: string
  category: string
  subCategory?: string
  photographer: string
}

/**
 * 24 Curated High-Resolution Real Stock Photographs for Marketplace Services
 * Stored locally in /images/services/ (Aspect Ratio: 16:10 - 1200x750px)
 */
export const CURATED_GIG_COVERS: GigCoverPhoto[] = [
  // 1. Web Development & Full-Stack Next.js / TypeScript
  {
    id: "cov-web-1",
    url: "/images/services/programming/full-stack-nextjs-node.jpg",
    alt: "Full-Stack Next.js and TypeScript development environment with clean modular code",
    category: "programming",
    subCategory: "nextjs",
    photographer: "Fotis Fotopoulos",
  },
  {
    id: "cov-web-2",
    url: "/images/services/programming/developer-workstation-dual-monitors.jpg",
    alt: "Software engineer workstation with dual high-resolution displays and code architecture",
    category: "programming",
    subCategory: "fullstack",
    photographer: "Christopher Gower",
  },
  {
    id: "cov-web-3",
    url: "/images/services/programming/modern-frontend-minimalist.jpg",
    alt: "Modern responsive web development on laptop in minimalist studio",
    category: "programming",
    subCategory: "frontend",
    photographer: "Clément H",
  },

  // 2. Graphics & Design / Brand Identity & Design Systems
  {
    id: "cov-design-1",
    url: "/images/services/design/luxury-brand-identity-stationery.jpg",
    alt: "Luxury editorial brand identity system and responsive web design layout",
    category: "design",
    subCategory: "branding",
    photographer: "Igor Miske",
  },
  {
    id: "cov-design-2",
    url: "/images/services/design/saas-design-system-figma.jpg",
    alt: "Comprehensive SaaS design system and typographic UI layout in Figma",
    category: "design",
    subCategory: "ui-ux",
    photographer: "Theme Photos",
  },
  {
    id: "cov-design-3",
    url: "/images/services/design/visual-brand-guidelines-swatches.jpg",
    alt: "Minimalist brand guidelines, bespoke stationery and typography color swatches",
    category: "design",
    subCategory: "brand-identity",
    photographer: "NordWood Themes",
  },

  // 3. AI & Automation / Machine Learning & Autonomous Agents
  {
    id: "cov-ai-1",
    url: "/images/services/ai/llm-rag-fine-tuning-code.jpg",
    alt: "Autonomous AI agent neural pipeline and LLM orchestration architecture",
    category: "ai",
    subCategory: "ai-agents",
    photographer: "Markus Spiske",
  },
  {
    id: "cov-ai-2",
    url: "/images/services/ai/neural-network-ai-workstation.jpg",
    alt: "High-dimensional vector embeddings and generative deep learning algorithms",
    category: "ai",
    subCategory: "machine-learning",
    photographer: "DeepMind",
  },
  {
    id: "cov-ai-3",
    url: "/images/services/ai/machine-learning-computer-vision.jpg",
    alt: "Production computer vision and automated machine learning workflows",
    category: "ai",
    subCategory: "rag",
    photographer: "ThisisEngineering",
  },

  // 4. Digital Marketing & SEO Growth
  {
    id: "cov-mkt-1",
    url: "/images/services/marketing/technical-seo-analytics-growth.jpg",
    alt: "Technical SEO performance analytics and organic traffic growth charts",
    category: "marketing",
    subCategory: "seo",
    photographer: "Carlos Muza",
  },
  {
    id: "cov-mkt-2",
    url: "/images/services/marketing/data-attribution-dashboard.jpg",
    alt: "Conversion attribution modeling and multi-channel revenue analytics",
    category: "marketing",
    subCategory: "growth",
    photographer: "Luke Chesser",
  },
  {
    id: "cov-mkt-3",
    url: "/images/services/marketing/conversion-optimization-strategy.jpg",
    alt: "Conversion rate optimization team strategy and growth experiments",
    category: "marketing",
    subCategory: "cro",
    photographer: "Campaign Creators",
  },

  // 5. Cloud Architecture, DevOps & Cybersecurity
  {
    id: "cov-cloud-1",
    url: "/images/services/programming/cybersecurity-soc-monitor.jpg",
    alt: "Enterprise cybersecurity operations center and threat mitigation telemetry",
    category: "programming",
    subCategory: "cybersecurity",
    photographer: "FlyD",
  },
  {
    id: "cov-cloud-2",
    url: "/images/services/programming/cloud-devops-infrastructure.jpg",
    alt: "High-availability multi-region cloud cluster and Kubernetes container orchestration",
    category: "programming",
    subCategory: "devops",
    photographer: "NASA / Science",
  },
  {
    id: "cov-cloud-3",
    url: "/images/services/gallery/cloud-server-datacenter.jpg",
    alt: "Enterprise tier-4 datacenter server racks with high-speed fiber interconnects",
    category: "programming",
    subCategory: "cloud",
    photographer: "Thomas Jensen",
  },

  // 6. Mobile Engineering
  {
    id: "cov-mob-1",
    url: "/images/services/programming/mobile-app-engineering.jpg",
    alt: "Cross-platform mobile application development with React Native and Swift",
    category: "programming",
    subCategory: "mobile",
    photographer: "Daniel Korpai",
  },

  // 7. 3D Design, Motion Graphics & Video
  {
    id: "cov-3d-1",
    url: "/images/services/design/motion-graphics-3d-workstation.jpg",
    alt: "3D product rendering workstation with raytraced lighting and procedural materials",
    category: "design",
    subCategory: "3d",
    photographer: "Milad Fakurian",
  },
  {
    id: "cov-vid-1",
    url: "/images/services/video/video-production-studio-editing.jpg",
    alt: "Professional video editing workstation and color grading studio",
    category: "video",
    subCategory: "video-editing",
    photographer: "Sam McGhee",
  },
  {
    id: "cov-vid-2",
    url: "/images/services/video/cinematic-motion-postproduction.jpg",
    alt: "Cinematic camera rig and commercial video production set",
    category: "video",
    subCategory: "cinematography",
    photographer: "Caleb Oquendo",
  },

  // 8. Technical Writing & Documentation
  {
    id: "cov-wri-1",
    url: "/images/services/writing/technical-documentation-editorial.jpg",
    alt: "Developer documentation drafting and technical architecture whitepaper",
    category: "writing",
    subCategory: "api-docs",
    photographer: "Aaron Burden",
  },
  {
    id: "cov-wri-2",
    url: "/images/services/writing/system-architecture-whitepaper.jpg",
    alt: "System architecture specifications and fintech research reference materials",
    category: "writing",
    subCategory: "whitepapers",
    photographer: "Patrick Tomasso",
  },

  // 9. Business & Strategy Consulting
  {
    id: "cov-biz-1",
    url: "/images/services/business/enterprise-consulting-boardroom.jpg",
    alt: "Enterprise corporate strategy, executive advisory, and board governance",
    category: "business",
    subCategory: "consulting",
    photographer: "Sean Pollock",
  },
  {
    id: "cov-biz-2",
    url: "/images/services/business/financial-modeling-advisory.jpg",
    alt: "Financial modeling, venture valuation, and startup investor pitch readiness",
    category: "business",
    subCategory: "finance",
    photographer: "Adeolu Eletu",
  },
]

/**
 * Named Service Key to Specific Cover Mapping for guaranteed visual consistency
 */
export const SPECIFIC_GIG_COVERS: Record<string, string> = {
  // Programming & Tech (24)
  "gig-1": "/images/services/programming/full-stack-nextjs-node.jpg",
  "full-stack-next-js-15-node-js-production-architecture-with-clean-code":
    "/images/services/programming/full-stack-nextjs-node.jpg",
  "gig-2": "/images/services/programming/saas-landing-page-frontend.jpg",
  "high-converting-saas-landing-page-in-next-js-framer-motion":
    "/images/services/programming/saas-landing-page-frontend.jpg",
  "gig-3": "/images/services/programming/api-microservices-backend.jpg",
  "scalable-graphql-rest-microservices-backend-in-nestjs-and-redis":
    "/images/services/programming/api-microservices-backend.jpg",
  "gig-4": "/images/services/programming/golang-microservices-terminal.jpg",
  "high-performance-go-golang-microservice-engine-with-grpc-rabbitmq":
    "/images/services/programming/golang-microservices-terminal.jpg",
  "gig-5": "/images/services/programming/aws-terraform-cloud-console.jpg",
  "zero-downtime-aws-ecs-terraform-infrastructure-as-code-setup":
    "/images/services/programming/aws-terraform-cloud-console.jpg",
  "gig-6": "/images/services/programming/kubernetes-devops-workstation.jpg",
  "kubernetes-production-cluster-setup-with-argocd-gitops-pipeline":
    "/images/services/programming/kubernetes-devops-workstation.jpg",
  "gig-7": "/images/services/programming/solidity-smart-contracts-code.jpg",
  "audited-solidity-smart-contracts-with-formal-erc-20-erc-721-security":
    "/images/services/programming/solidity-smart-contracts-code.jpg",
  "gig-8": "/images/services/programming/defi-web3-staking-protocol.jpg",
  "defi-staking-protocol-cross-chain-bridge-web3-integration":
    "/images/services/programming/defi-web3-staking-protocol.jpg",
  "gig-9": "/images/services/programming/react-native-expo-mobile.jpg",
  "cross-platform-react-native-expo-mobile-app-with-offline-sqlite-sync":
    "/images/services/programming/react-native-expo-mobile.jpg",
  "gig-10": "/images/services/programming/ios-swiftui-native-app.jpg",
  "native-ios-swift-6-swiftui-application-with-biometric-authentication":
    "/images/services/programming/ios-swiftui-native-app.jpg",
  "gig-11": "/images/services/programming/flutter-crossplatform-mobile.jpg",
  "high-performance-flutter-mobile-app-with-bloc-pattern-architecture":
    "/images/services/programming/flutter-crossplatform-mobile.jpg",
  "gig-12": "/images/services/programming/ecommerce-stripe-storefront.jpg",
  "next-js-15-e-commerce-platform-with-stripe-checkout-webhook-pipeline":
    "/images/services/programming/ecommerce-stripe-storefront.jpg",
  "gig-13": "/images/services/programming/cloudflare-edge-workers-api.jpg",
  "serverless-cloudflare-workers-d1-edge-api-with-global-sub-50ms-latency":
    "/images/services/programming/cloudflare-edge-workers-api.jpg",
  "gig-14": "/images/services/programming/realtime-websocket-engine.jpg",
  "real-time-websocket-socket-io-collaborative-canvas-engine":
    "/images/services/programming/realtime-websocket-engine.jpg",
  "gig-55": "/images/services/programming/mobile-aso-fastlane-pipeline.jpg",
  "mobile-app-store-optimization-aso-fastlane-automated-release-pipeline":
    "/images/services/programming/mobile-aso-fastlane-pipeline.jpg",
  "gig-56": "/images/services/programming/mobile-chat-geolocation-app.jpg",
  "real-time-chat-geolocation-tracking-mobile-app-in-react-native":
    "/images/services/programming/mobile-chat-geolocation-app.jpg",
  "gig-57": "/images/services/programming/mobile-audio-streaming-podcast.jpg",
  "audio-streaming-podcast-mobile-application-with-background-playback":
    "/images/services/programming/mobile-audio-streaming-podcast.jpg",
  "gig-58": "/images/services/programming/fintech-mobile-wallet-biometric.jpg",
  "secure-fintech-mobile-wallet-ui-with-biometric-vault-push-notification-rails":
    "/images/services/programming/fintech-mobile-wallet-biometric.jpg",
  "gig-59": "/images/services/programming/headless-shopify-nextjs.jpg",
  "headless-shopify-next-js-storefront-with-algolia-instantsearch":
    "/images/services/programming/headless-shopify-nextjs.jpg",
  "gig-60": "/images/services/programming/saas-auth-rbac-engine.jpg",
  "multi-tenant-b2b-saas-auth-engine-with-rbac-organization-invitations":
    "/images/services/programming/saas-auth-rbac-engine.jpg",
  "gig-edge-single-tier": "/images/services/programming/cybersecurity-cve-audit.jpg",
  "rapid-security-vulnerability-cve-audit":
    "/images/services/programming/cybersecurity-cve-audit.jpg",
  "gig-edge-overflow-title": "/images/services/programming/enterprise-multicloud-architecture.jpg",
  "enterprise-heterogeneous-multi-cloud-high-throughput-microservices":
    "/images/services/programming/enterprise-multicloud-architecture.jpg",
  "gig-edge-zero-orders": "/images/services/programming/accessible-tailwind-components.jpg",
  "fresh-react-components-tailwind-ui":
    "/images/services/programming/accessible-tailwind-components.jpg",
  "gig-edge-max-addons": "/images/services/programming/cloud-saas-enterprise-suite.jpg",
  "fullstack-enterprise-cloud-suite-maximum-addons":
    "/images/services/programming/cloud-saas-enterprise-suite.jpg",

  // UI/UX & Product Design (16)
  "gig-15": "/images/services/design/saas-design-system-figma.jpg",
  "scalable-figma-design-system-with-design-tokens-auto-layout-variables":
    "/images/services/design/saas-design-system-figma.jpg",
  "gig-16": "/images/services/design/b2b-saas-dashboard-ui.jpg",
  "complex-b2b-saas-dashboard-ui-ux-design-with-dark-mode-mobile-flows":
    "/images/services/design/b2b-saas-dashboard-ui.jpg",
  "gig-17": "/images/services/design/fintech-banking-mobile-ui.jpg",
  "fintech-banking-payment-mobile-app-ui-ux-with-high-fidelity-prototype":
    "/images/services/design/fintech-banking-mobile-ui.jpg",
  "gig-18": "/images/services/design/wcag-accessible-ui-kit.jpg",
  "accessible-wcag-2-1-aa-compliant-web-application-ui-kit-in-figma":
    "/images/services/design/wcag-accessible-ui-kit.jpg",
  "gig-19": "/images/services/design/ecommerce-journey-mapping-ux.jpg",
  "e-commerce-user-journey-mapping-checkout-flow-conversion-redesign":
    "/images/services/design/ecommerce-journey-mapping-ux.jpg",
  "gig-20": "/images/services/design/luxury-brand-identity-stationery.jpg",
  "minimalist-modern-tech-logo-vector-brand-identity-system":
    "/images/services/design/luxury-brand-identity-stationery.jpg",
  "gig-21": "/images/services/design/startup-brand-guidelines-deck.jpg",
  "complete-startup-brand-book-custom-typography-guidelines-pitch-deck":
    "/images/services/design/startup-brand-guidelines-deck.jpg",
  "gig-22": "/images/services/design/3d-brand-assets-iconography.jpg",
  "custom-3d-brand-asset-pack-vector-iconography-set-for-web-mobile":
    "/images/services/design/3d-brand-assets-iconography.jpg",
  "gig-23": "/images/services/design/motion-graphics-3d-workstation.jpg",
  "photorealistic-3d-product-commercial-render-animation-in-cinema4d":
    "/images/services/design/motion-graphics-3d-workstation.jpg",
  "gig-24": "/images/services/design/threejs-webgl-interactive-3d.jpg",
  "interactive-three-js-webgl-3d-experience-for-modern-tech-marketing-sites":
    "/images/services/design/threejs-webgl-interactive-3d.jpg",
  "gig-50": "/images/services/design/motion-graphics-kinetic-typography.jpg",
  "high-end-2d-motion-graphics-kinetic-typography-explainer-video":
    "/images/services/design/motion-graphics-kinetic-typography.jpg",
  "gig-51": "/images/services/design/app-promo-video-screencasts.jpg",
  "app-store-saas-promo-video-with-ui-screencasts-sound-design":
    "/images/services/design/app-promo-video-screencasts.jpg",
  "gig-52": "/images/services/design/lottie-micro-interactions-ui.jpg",
  "custom-lottie-animations-for-web-mobile-app-micro-interactions":
    "/images/services/design/lottie-micro-interactions-ui.jpg",
  "gig-53": "/images/services/design/blender-isometric-tech-scene.jpg",
  "blender-3d-isometric-saas-scene-architectural-tech-isometric-render":
    "/images/services/design/blender-isometric-tech-scene.jpg",
  "gig-54": "/images/services/design/cinematic-product-reveal-trailer.jpg",
  "cinematic-product-reveal-trailer-with-dynamic-particle-physics-cgi":
    "/images/services/design/cinematic-product-reveal-trailer.jpg",
  "gig-61": "/images/services/design/storybook-component-testing.jpg",
  "interactive-storybook-ui-component-documentation-with-automated-visual-regression":
    "/images/services/design/storybook-component-testing.jpg",

  // AI & Machine Learning (13)
  "gig-25": "/images/services/ai/autonomous-ai-agents-workflow.jpg",
  "autonomous-ai-agent-workflow-architecture-with-langchain-tools-memory":
    "/images/services/ai/autonomous-ai-agents-workflow.jpg",
  "gig-26": "/images/services/ai/llm-rag-vector-knowledge.jpg",
  "enterprise-rag-knowledge-system-with-vector-database-citation-metadata":
    "/images/services/ai/llm-rag-vector-knowledge.jpg",
  "gig-27": "/images/services/ai/custom-llm-fine-tuning-lora.jpg",
  "custom-llm-fine-tuning-pipeline-with-lora-qlora-on-llama-3-mistral":
    "/images/services/ai/custom-llm-fine-tuning-lora.jpg",
  "gig-28": "/images/services/ai/multi-agent-crewai-engine.jpg",
  "multi-agent-simulation-decision-engine-using-crewai-autogen":
    "/images/services/ai/multi-agent-crewai-engine.jpg",
  "gig-29": "/images/services/ai/yolo-computer-vision-hardware.jpg",
  "real-time-computer-vision-pipeline-for-object-detection-defect-tracking":
    "/images/services/ai/yolo-computer-vision-hardware.jpg",
  "gig-30": "/images/services/ai/whisper-speech-transcription.jpg",
  "low-latency-speech-to-text-audio-transcription-pipeline-with-whisper-ai":
    "/images/services/ai/whisper-speech-transcription.jpg",
  "gig-31": "/images/services/ai/zendesk-ai-customer-agent.jpg",
  "ai-customer-support-agent-with-zendesk-api-sentiment-intent-routing":
    "/images/services/ai/zendesk-ai-customer-agent.jpg",
  "gig-32": "/images/services/ai/enterprise-semantic-search.jpg",
  "enterprise-semantic-search-engine-over-large-pdf-markdown-repositories":
    "/images/services/ai/enterprise-semantic-search.jpg",
  "gig-33": "/images/services/ai/multimodal-ocr-data-extraction.jpg",
  "automated-data-extraction-pdf-ocr-pipeline-using-multimodal-vision-llms":
    "/images/services/ai/multimodal-ocr-data-extraction.jpg",
  "gig-34": "/images/services/ai/github-ai-code-review.jpg",
  "code-review-security-vulnerability-detection-ai-assistant-for-github":
    "/images/services/ai/github-ai-code-review.jpg",
  "gig-35": "/images/services/ai/synthetic-training-dataset-pipeline.jpg",
  "autonomous-web-scraping-synthetic-training-dataset-generation-pipeline":
    "/images/services/ai/synthetic-training-dataset-pipeline.jpg",
  "gig-62": "/images/services/ai/webgpu-inbrowser-local-llm.jpg",
  "local-offline-llm-in-browser-inference-engine-using-webgpu-transformers-js":
    "/images/services/ai/webgpu-inbrowser-local-llm.jpg",
  "gig-edge-draft": "/images/services/ai/quantum-computing-simulator.jpg",
  "internal-draft-quantum-computing-simulator":
    "/images/services/ai/quantum-computing-simulator.jpg",

  // Technical SEO & Growth (7)
  "gig-36": "/images/services/marketing/programmatic-seo-traffic-growth.jpg",
  "programmatic-seo-architecture-with-next-js-isr-for-50-000-indexed-pages":
    "/images/services/marketing/programmatic-seo-traffic-growth.jpg",
  "gig-37": "/images/services/marketing/saas-cro-conversion-audit.jpg",
  "saas-conversion-rate-optimization-cro-audit-multi-variant-growth-plan":
    "/images/services/marketing/saas-cro-conversion-audit.jpg",
  "gig-38": "/images/services/marketing/ga4-multitouch-attribution.jpg",
  "full-funnel-multi-touch-attribution-google-analytics-4-server-side-setup":
    "/images/services/marketing/ga4-multitouch-attribution.jpg",
  "gig-39": "/images/services/marketing/core-web-vitals-speed.jpg",
  "core-web-vitals-technical-speed-audit-for-100-mobile-lighthouse-score":
    "/images/services/marketing/core-web-vitals-speed.jpg",
  "gig-40": "/images/services/marketing/cold-email-deliverability.jpg",
  "b2b-saas-cold-outbound-email-infrastructure-deliverability-warmup-setup":
    "/images/services/marketing/cold-email-deliverability.jpg",
  "gig-41": "/images/services/marketing/posthog-product-telemetry.jpg",
  "mixpanel-posthog-event-taxonomy-architecture-for-product-analytics":
    "/images/services/marketing/posthog-product-telemetry.jpg",
  "gig-42": "/images/services/marketing/international-seo-hreflang.jpg",
  "international-multi-region-hreflang-subfolder-seo-localization-engine":
    "/images/services/marketing/international-seo-hreflang.jpg",

  // Technical Writing (8)
  "gig-43": "/images/services/writing/mintlify-openapi-developer-docs.jpg",
  "comprehensive-openapi-3-1-interactive-mintlify-developer-documentation":
    "/images/services/writing/mintlify-openapi-developer-docs.jpg",
  "gig-44": "/images/services/writing/system-architecture-whitepaper.jpg",
  "fintech-ai-web3-architecture-whitepaper-with-formal-mathematical-proofs":
    "/images/services/writing/system-architecture-whitepaper.jpg",
  "gig-45": "/images/services/writing/developer-sdk-quickstart-guides.jpg",
  "developer-sdk-quickstart-guides-code-snippets-postman-public-workspace":
    "/images/services/writing/developer-sdk-quickstart-guides.jpg",
  "gig-46": "/images/services/writing/system-architecture-rfc-specs.jpg",
  "system-architecture-rfc-high-level-engineering-specifications-document":
    "/images/services/writing/system-architecture-rfc-specs.jpg",
  "gig-47": "/images/services/writing/docusaurus-developer-portal.jpg",
  "self-hosted-docusaurus-developer-portal-with-search-versioning":
    "/images/services/writing/docusaurus-developer-portal.jpg",
  "gig-48": "/images/services/writing/soc2-compliance-policy-docs.jpg",
  "security-soc2-compliance-policy-documentation-for-enterprise-audits":
    "/images/services/writing/soc2-compliance-policy-docs.jpg",
  "gig-49": "/images/services/writing/database-disaster-runbook.jpg",
  "database-disaster-recovery-runbook-incident-response-guidelines":
    "/images/services/writing/database-disaster-runbook.jpg",
  "gig-63": "/images/services/writing/engineering-onboarding-wiki.jpg",
  "developer-onboarding-runbooks-architecture-adr-documentation-template":
    "/images/services/writing/engineering-onboarding-wiki.jpg",

  // Business & Consulting (5)
  "gig-64": "/images/services/business/enterprise-corporate-strategy.jpg",
  "enterprise-corporate-strategy-executive-advisory":
    "/images/services/business/enterprise-corporate-strategy.jpg",
  "gig-65": "/images/services/business/financial-modeling-advisory.jpg",
  "startup-financial-valuation-model-investor-pitch-deck":
    "/images/services/business/financial-modeling-advisory.jpg",
  "gig-66": "/images/services/business/web3-tokenomics-dao-strategy.jpg",
  "web3-tokenomics-dao-governance-crypto-venture-advisory":
    "/images/services/business/web3-tokenomics-dao-strategy.jpg",
  "gig-67": "/images/services/business/fractional-cto-advisory.jpg",
  "fractional-cto-digital-architecture-transformation-advisory":
    "/images/services/business/fractional-cto-advisory.jpg",
  "gig-68": "/images/services/business/market-research-tam-sizing.jpg",
  "market-research-competitive-intelligence-tam-sizing-report":
    "/images/services/business/market-research-tam-sizing.jpg",
}

/**
 * Category-based fallback photo list
 */
const CATEGORY_COVERS_MAP: Record<string, string[]> = {
  programming: [
    "/images/services/programming/full-stack-nextjs-node.jpg",
    "/images/services/programming/developer-workstation-dual-monitors.jpg",
    "/images/services/programming/modern-frontend-minimalist.jpg",
    "/images/services/programming/cloud-devops-infrastructure.jpg",
    "/images/services/programming/cybersecurity-soc-monitor.jpg",
    "/images/services/programming/mobile-app-engineering.jpg",
    "/images/services/programming/database-systems-cluster.jpg",
    "/images/services/programming/api-microservices-backend.jpg",
  ],
  design: [
    "/images/services/design/luxury-brand-identity-stationery.jpg",
    "/images/services/design/saas-design-system-figma.jpg",
    "/images/services/design/visual-brand-guidelines-swatches.jpg",
    "/images/services/design/motion-graphics-3d-workstation.jpg",
    "/images/services/design/packaging-editorial-typography.jpg",
    "/images/services/design/product-ui-design-studio.jpg",
  ],
  ai: [
    "/images/services/ai/llm-rag-fine-tuning-code.jpg",
    "/images/services/ai/neural-network-ai-workstation.jpg",
    "/images/services/ai/machine-learning-computer-vision.jpg",
    "/images/services/ai/data-science-deep-learning.jpg",
  ],
  marketing: [
    "/images/services/marketing/technical-seo-analytics-growth.jpg",
    "/images/services/marketing/data-attribution-dashboard.jpg",
    "/images/services/marketing/conversion-optimization-strategy.jpg",
  ],
  video: [
    "/images/services/video/video-production-studio-editing.jpg",
    "/images/services/video/cinematic-motion-postproduction.jpg",
    "/images/services/design/motion-graphics-3d-workstation.jpg",
  ],
  writing: [
    "/images/services/writing/technical-documentation-editorial.jpg",
    "/images/services/writing/system-architecture-whitepaper.jpg",
  ],
  business: [
    "/images/services/business/enterprise-consulting-boardroom.jpg",
    "/images/services/business/financial-modeling-advisory.jpg",
  ],
  photography: ["/images/services/photography/commercial-product-photography.jpg"],
}

function hashStr(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Returns a high-resolution, category-relevant stock photograph for any gig.
 * Deterministic mapping ensures zero layout shift and identical images on reload.
 */
export function getGigCoverUrl(gig: {
  id?: string
  slug?: string
  categorySlug?: string
  subCategorySlug?: string
  gallery?: { url: string }[]
}): string {
  // 1. Direct match by id or slug
  const directKey = (gig.id || gig.slug || "").toLowerCase()
  if (directKey && directKey in SPECIFIC_GIG_COVERS) {
    const match = SPECIFIC_GIG_COVERS[directKey]
    if (match) return match
  }

  // 2. If gallery has a valid photo (local path or https) that isn't an svg illustration
  if (gig.gallery && gig.gallery.length > 0) {
    const firstUrl = gig.gallery[0]?.url
    if (firstUrl && !firstUrl.endsWith(".svg")) {
      return firstUrl
    }
  }

  // 3. Category match
  const catKey = (gig.categorySlug || "").toLowerCase()
  const catPool = CATEGORY_COVERS_MAP[catKey]
  if (catPool && catPool.length > 0) {
    const hash = hashStr(gig.id || gig.slug || catKey)
    const index = hash % catPool.length
    const match = catPool[index]
    if (match) return match
  }

  // 4. Default fallback to flagship web development photography
  return CURATED_GIG_COVERS[0]?.url ?? "/images/fallbacks/service.webp"
}

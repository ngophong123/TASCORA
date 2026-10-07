import fs from 'fs';
import path from 'path';
import https from 'https';

// Helper to download an image with redirects
function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    function get(currentUrl: string, redirects = 0) {
      if (redirects > 5) {
        console.error(`Too many redirects for ${url}`);
        resolve(false);
        return;
      }

      https.get(currentUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location, redirects + 1);
          return;
        }

        if (res.statusCode !== 200) {
          console.error(`Failed ${res.statusCode} for ${currentUrl}`);
          resolve(false);
          return;
        }

        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
        fileStream.on('error', (err) => {
          console.error(`Stream error for ${destPath}:`, err);
          resolve(false);
        });
      }).on('error', (err) => {
        console.error(`Request error for ${currentUrl}:`, err);
        resolve(false);
      });
    }

    get(url);
  });
}

// 1. Service Images Definition: 73 unique entries for all 73 gigs
interface ServiceAssetDef {
  gigId: string;
  topic: string;
  intent: string;
  badge: string;
  freelancerRole: string;
  localPath: string;
  unsplashId: string;
  photographer: string;
}

const SERVICE_ASSETS: ServiceAssetDef[] = [
  // 1. Programming & Tech (24)
  {
    gigId: "gig-1",
    topic: "Next.js Fullstack",
    intent: "software engineer nextjs fullstack workstation clean code",
    badge: "Web Development",
    freelancerRole: "Senior Full-Stack Architect",
    localPath: "apps/web/public/images/services/programming/full-stack-nextjs-node.jpg",
    unsplashId: "photo-1498050108023-c5249f4df085",
    photographer: "Christopher Gower",
  },
  {
    gigId: "gig-2",
    topic: "Frontend & Landing Page",
    intent: "frontend web developer building responsive web application",
    badge: "Web Development",
    freelancerRole: "Next.js & React 19 Core Engineer",
    localPath: "apps/web/public/images/services/programming/saas-landing-page-frontend.jpg",
    unsplashId: "photo-1507238691740-187a5b1d37b8",
    photographer: "Balazs Ketyi",
  },
  {
    gigId: "gig-3",
    topic: "Backend & Microservices",
    intent: "backend developer nestjs redis microservices code terminal",
    badge: "Backend Development",
    freelancerRole: "Distributed Backend & Node.js Specialist",
    localPath: "apps/web/public/images/services/programming/api-microservices-backend.jpg",
    unsplashId: "photo-1526374965328-7f61d4dc18c5",
    photographer: "Sigmund",
  },
  {
    gigId: "gig-4",
    topic: "Go Microservice Engine",
    intent: "golang backend developer coding terminal grpc microservices",
    badge: "Backend Development",
    freelancerRole: "Go & High-Concurrency Backend Engineer",
    localPath: "apps/web/public/images/services/programming/golang-microservices-terminal.jpg",
    unsplashId: "photo-1555066931-4365d14bab8c",
    photographer: "Fotis Fotopoulos",
  },
  {
    gigId: "gig-5",
    topic: "AWS & Terraform IaC",
    intent: "cloud devops engineer terraform aws infrastructure code",
    badge: "DevOps & Cloud",
    freelancerRole: "Cloud Platform & Terraform Architect",
    localPath: "apps/web/public/images/services/programming/aws-terraform-cloud-console.jpg",
    unsplashId: "photo-1618401471353-b98afee0b2eb",
    photographer: "Lianhao Qu",
  },
  {
    gigId: "gig-6",
    topic: "Kubernetes & GitOps",
    intent: "devops engineer kubernetes cluster monitoring terminal sre",
    badge: "DevOps & Cloud",
    freelancerRole: "Principal DevOps & SRE Engineer",
    localPath: "apps/web/public/images/services/programming/kubernetes-devops-workstation.jpg",
    unsplashId: "photo-1558494949-ef010cbdcc31",
    photographer: "Thomas Jensen",
  },
  {
    gigId: "gig-7",
    topic: "Solidity Smart Contracts",
    intent: "blockchain developer coding solidity smart contract ide",
    badge: "Blockchain & Web3",
    freelancerRole: "Senior Smart Contract & Security Engineer",
    localPath: "apps/web/public/images/services/programming/solidity-smart-contracts-code.jpg",
    unsplashId: "photo-1639762681485-074b7f938ba0",
    photographer: "Shubham Dhage",
  },
  {
    gigId: "gig-8",
    topic: "DeFi & Web3 Staking",
    intent: "web3 defi developer fintech crypto trading protocol",
    badge: "Blockchain & Web3",
    freelancerRole: "Web3 & DeFi Protocol Architect",
    localPath: "apps/web/public/images/services/programming/defi-web3-staking-protocol.jpg",
    unsplashId: "photo-1622979135225-d2ba269bc1df",
    photographer: "Kanchanara",
  },
  {
    gigId: "gig-9",
    topic: "React Native Mobile App",
    intent: "mobile app developer testing react native smartphone app",
    badge: "Mobile Development",
    freelancerRole: "Senior React Native & Expo Specialist",
    localPath: "apps/web/public/images/services/programming/react-native-expo-mobile.jpg",
    unsplashId: "photo-1512941937669-90a1b58e7e9c",
    photographer: "Daniel Korpai",
  },
  {
    gigId: "gig-10",
    topic: "iOS Swift 6 Native",
    intent: "ios swift developer testing app on iphone device workstation",
    badge: "Mobile Development",
    freelancerRole: "Lead iOS & SwiftUI Engineer",
    localPath: "apps/web/public/images/services/programming/ios-swiftui-native-app.jpg",
    unsplashId: "photo-1551650975-87deedd944c3",
    photographer: "Thor Alvis",
  },
  {
    gigId: "gig-11",
    topic: "Flutter Cross-Platform",
    intent: "flutter mobile developer cross platform mobile workstation",
    badge: "Mobile Development",
    freelancerRole: "Senior Flutter & Cross-Platform Engineer",
    localPath: "apps/web/public/images/services/programming/flutter-crossplatform-mobile.jpg",
    unsplashId: "photo-1526406915894-7bcd65f60845",
    photographer: "Faizur Rehman",
  },
  {
    gigId: "gig-12",
    topic: "Next.js E-Commerce Stripe",
    intent: "ecommerce web developer stripe payment online store checkout",
    badge: "Web Development",
    freelancerRole: "E-Commerce & Next.js Architect",
    localPath: "apps/web/public/images/services/programming/ecommerce-stripe-storefront.jpg",
    unsplashId: "photo-1556742049-0a67c5574f73",
    photographer: "Blake Wisz",
  },
  {
    gigId: "gig-13",
    topic: "Cloudflare Edge Workers",
    intent: "serverless edge cloud network api developer console",
    badge: "DevOps & Cloud",
    freelancerRole: "Serverless & Edge Systems Engineer",
    localPath: "apps/web/public/images/services/programming/cloudflare-edge-workers-api.jpg",
    unsplashId: "photo-1451187580459-43490279c0fa",
    photographer: "NASA",
  },
  {
    gigId: "gig-14",
    topic: "Real-Time WebSockets",
    intent: "real-time collaborative data streaming dashboard monitor",
    badge: "Backend Development",
    freelancerRole: "Real-Time Systems & WebSocket Engineer",
    localPath: "apps/web/public/images/services/programming/realtime-websocket-engine.jpg",
    unsplashId: "photo-1504868584819-f8e8b4b6d7e3",
    photographer: "Franki Chamaki",
  },
  {
    gigId: "gig-55",
    topic: "Mobile ASO & Fastlane",
    intent: "mobile app store optimization analytics and release console",
    badge: "Mobile Development",
    freelancerRole: "Mobile DevOps & Release Engineer",
    localPath: "apps/web/public/images/services/programming/mobile-aso-fastlane-pipeline.jpg",
    unsplashId: "photo-1563986768494-4dee2763ff3f",
    photographer: "Austin Distel",
  },
  {
    gigId: "gig-56",
    topic: "Mobile Chat & Geolocation",
    intent: "person holding phone showing map navigation chat app interface",
    badge: "Mobile Development",
    freelancerRole: "Mobile Geospatial & Chat Engineer",
    localPath: "apps/web/public/images/services/programming/mobile-chat-geolocation-app.jpg",
    unsplashId: "photo-1524678606370-a47ad25cb82a",
    photographer: "Henry & Co.",
  },
  {
    gigId: "gig-57",
    topic: "Mobile Audio & Podcast",
    intent: "studio desk headphones audio gear music podcast smartphone",
    badge: "Mobile Development",
    freelancerRole: "Audio & Media Mobile Specialist",
    localPath: "apps/web/public/images/services/programming/mobile-audio-streaming-podcast.jpg",
    unsplashId: "photo-1508700115892-45ecd05ae2ad",
    photographer: "Wes Hicks",
  },
  {
    gigId: "gig-58",
    topic: "FinTech Mobile Wallet",
    intent: "fintech mobile wallet banking app payment on smartphone",
    badge: "Mobile Development",
    freelancerRole: "FinTech Mobile Security Architect",
    localPath: "apps/web/public/images/services/programming/fintech-mobile-wallet-biometric.jpg",
    unsplashId: "photo-1563986768609-322da13575f3",
    photographer: "Austin Distel",
  },
  {
    gigId: "gig-59",
    topic: "Headless Shopify Store",
    intent: "ecommerce headless shopify storefront web design monitor",
    badge: "Web Development",
    freelancerRole: "Headless Commerce & Shopify Engineer",
    localPath: "apps/web/public/images/services/programming/headless-shopify-nextjs.jpg",
    unsplashId: "photo-1517694712202-14dd9538aa97",
    photographer: "Clément H",
  },
  {
    gigId: "gig-60",
    topic: "SaaS Auth & RBAC",
    intent: "software security authentication login access control permissions",
    badge: "Backend Development",
    freelancerRole: "Security & Identity Systems Engineer",
    localPath: "apps/web/public/images/services/programming/saas-auth-rbac-engine.jpg",
    unsplashId: "photo-1544383835-bda2bc66a55d",
    photographer: "Ian Battaglia",
  },
  {
    gigId: "gig-edge-single-tier",
    topic: "Security CVE Audit",
    intent: "cybersecurity analyst inspecting vulnerability security audit",
    badge: "Cybersecurity",
    freelancerRole: "Application Security & Pentest Specialist",
    localPath: "apps/web/public/images/services/programming/cybersecurity-soc-monitor.jpg",
    unsplashId: "photo-1573164574572-cb89e39749b4",
    photographer: "wocintechchat",
  },
  {
    gigId: "gig-edge-overflow-title",
    topic: "Enterprise Microservices",
    intent: "enterprise systems architect multi-monitor workstation",
    badge: "DevOps & Cloud",
    freelancerRole: "Executive Distinguished Systems Architect",
    localPath: "apps/web/public/images/services/programming/developer-workstation-dual-monitors.jpg",
    unsplashId: "photo-1573164713988-8665fc963095",
    photographer: "Christina @ wocintechchat",
  },
  {
    gigId: "gig-edge-zero-orders",
    topic: "Accessible UI Components",
    intent: "frontend developer building accessible ui components browser",
    badge: "Web Development",
    freelancerRole: "Frontend UI & Accessibility Engineer",
    localPath: "apps/web/public/images/services/programming/modern-frontend-minimalist.jpg",
    unsplashId: "photo-1517694712202-14dd9538aa97",
    photographer: "Clément H",
  },
  {
    gigId: "gig-edge-max-addons",
    topic: "Enterprise SaaS Suite",
    intent: "fullstack cloud saas enterprise dashboard engineering workstation",
    badge: "Web Development",
    freelancerRole: "Senior Full-Stack Architect",
    localPath: "apps/web/public/images/services/programming/enterprise-multicloud-architecture.jpg",
    unsplashId: "photo-1542831371-29b0f74f9713",
    photographer: "Florian Olivo",
  },

  // 2. UI/UX & Product Design (16)
  {
    gigId: "gig-15",
    topic: "Figma Design System",
    intent: "figma design system tokens auto-layout components on laptop",
    badge: "Design Systems",
    freelancerRole: "Design Systems & SaaS UX Architect",
    localPath: "apps/web/public/images/services/design/saas-design-system-figma.jpg",
    unsplashId: "photo-1581291518857-4e27b48ff24e",
    photographer: "Theme Photos",
  },
  {
    gigId: "gig-16",
    topic: "B2B SaaS Dashboard UI",
    intent: "complex b2b saas dashboard ui figma dark mode data tables",
    badge: "UI/UX Design",
    freelancerRole: "Principal SaaS Product Designer",
    localPath: "apps/web/public/images/services/design/b2b-saas-dashboard-ui.jpg",
    unsplashId: "photo-1551288049-bebda4e38f71",
    photographer: "Luke Chesser",
  },
  {
    gigId: "gig-17",
    topic: "FinTech Banking Mobile UI",
    intent: "fintech banking mobile app ui high-fidelity figma prototype",
    badge: "UI/UX Design",
    freelancerRole: "FinTech Product & Mobile UX Designer",
    localPath: "apps/web/public/images/services/design/fintech-banking-mobile-ui.jpg",
    unsplashId: "photo-1555774698-0b77e0d5fac6",
    photographer: "Daniel Korpai",
  },
  {
    gigId: "gig-18",
    topic: "WCAG Accessible UI Kit",
    intent: "accessible wcag compliant design tokens typography color palette",
    badge: "Design Systems",
    freelancerRole: "Accessibility & Design Systems Specialist",
    localPath: "apps/web/public/images/services/design/wcag-accessible-ui-kit.jpg",
    unsplashId: "photo-1561070791-2526d30994b5",
    photographer: "NordWood Themes",
  },
  {
    gigId: "gig-19",
    topic: "E-Commerce Journey UX",
    intent: "ux designer mapping ecommerce checkout journey on whiteboard",
    badge: "UI/UX Design",
    freelancerRole: "E-Commerce UX & Conversion Strategist",
    localPath: "apps/web/public/images/services/design/ecommerce-journey-mapping-ux.jpg",
    unsplashId: "photo-1542744094-3a31f272c490",
    photographer: "Campaign Creators",
  },
  {
    gigId: "gig-20",
    topic: "Tech Logo & Brand Identity",
    intent: "minimalist vector brand logo sketches stationery branding",
    badge: "Brand & Identity",
    freelancerRole: "Principal Brand Identity Designer",
    localPath: "apps/web/public/images/services/design/luxury-brand-identity-stationery.jpg",
    unsplashId: "photo-1586717791821-3f44a563fa4c",
    photographer: "Kelly Sikkema",
  },
  {
    gigId: "gig-21",
    topic: "Startup Brand Guidelines",
    intent: "printed brand book style guide typography swatches on studio desk",
    badge: "Brand & Identity",
    freelancerRole: "Visual Brand Guidelines Director",
    localPath: "apps/web/public/images/services/design/visual-brand-guidelines-swatches.jpg",
    unsplashId: "photo-1561070791-2526d30994b5",
    photographer: "NordWood Themes",
  },
  {
    gigId: "gig-22",
    topic: "3D Brand Assets & Icons",
    intent: "3d vector iconography set rendering workstation",
    badge: "3D & Motion",
    freelancerRole: "3D Brand Asset & Iconography Artist",
    localPath: "apps/web/public/images/services/design/3d-brand-assets-iconography.jpg",
    unsplashId: "photo-1618005182384-a83a8bd57fbe",
    photographer: "Milad Fakurian",
  },
  {
    gigId: "gig-23",
    topic: "Cinema4D Product Render",
    intent: "photorealistic 3d product render lighting workstation studio",
    badge: "3D & Motion",
    freelancerRole: "Senior 3D Artist & Motion Director",
    localPath: "apps/web/public/images/services/design/motion-graphics-3d-workstation.jpg",
    unsplashId: "photo-1581092160607-ee22621dd758",
    photographer: "ThisisEngineering",
  },
  {
    gigId: "gig-24",
    topic: "Three.js WebGL Experience",
    intent: "interactive threejs webgl 3d marketing experience on screen",
    badge: "3D & Motion",
    freelancerRole: "Creative Technologist & WebGL Lead",
    localPath: "apps/web/public/images/services/design/threejs-webgl-interactive-3d.jpg",
    unsplashId: "photo-1626785774573-4b799315345d",
    photographer: "Ales Nesetril",
  },
  {
    gigId: "gig-50",
    topic: "2D Motion Explainer Video",
    intent: "kinetic typography after effects motion graphics timeline",
    badge: "3D & Motion",
    freelancerRole: "Commercial Motion Designer",
    localPath: "apps/web/public/images/services/design/motion-graphics-kinetic-typography.jpg",
    unsplashId: "photo-1574717024653-61fd2cf4d44d",
    photographer: "Sam McGhee",
  },
  {
    gigId: "gig-51",
    topic: "App Store SaaS Promo Video",
    intent: "video editor timeline cutting app promo with sound design",
    badge: "3D & Motion",
    freelancerRole: "SaaS Video Producer & Editor",
    localPath: "apps/web/public/images/services/video/video-production-studio-editing.jpg",
    unsplashId: "photo-1574717024653-61fd2cf4d44d",
    photographer: "Sam McGhee",
  },
  {
    gigId: "gig-52",
    topic: "Custom Lottie Animations",
    intent: "vector micro interactions animation ui prototyping figma",
    badge: "UI/UX Design",
    freelancerRole: "UI Micro-Interaction & Lottie Artist",
    localPath: "apps/web/public/images/services/design/lottie-micro-interactions-ui.jpg",
    unsplashId: "photo-1507238691740-187a5b1d37b8",
    photographer: "Balazs Ketyi",
  },
  {
    gigId: "gig-53",
    topic: "Blender 3D Isometric Scene",
    intent: "blender 3d isometric tech scene modeling workstation",
    badge: "3D & Motion",
    freelancerRole: "Isometric 3D Illustrator & Modeler",
    localPath: "apps/web/public/images/services/design/blender-isometric-tech-scene.jpg",
    unsplashId: "photo-1626785774573-4b799315345d",
    photographer: "Ales Nesetril",
  },
  {
    gigId: "gig-54",
    topic: "CGI Product Reveal Trailer",
    intent: "cinematic camera cinema4d particle physics product trailer",
    badge: "3D & Motion",
    freelancerRole: "CGI Director & Technical VFX Artist",
    localPath: "apps/web/public/images/services/video/cinematic-motion-postproduction.jpg",
    unsplashId: "photo-1492691527719-9d1e07e534b4",
    photographer: "Caleb Oquendo",
  },
  {
    gigId: "gig-61",
    topic: "Storybook Visual Testing",
    intent: "storybook ui component library test documentation on monitor",
    badge: "Design Systems",
    freelancerRole: "Design Technologist & Storybook Specialist",
    localPath: "apps/web/public/images/services/design/storybook-component-testing.jpg",
    unsplashId: "photo-1581291518857-4e27b48ff24e",
    photographer: "Theme Photos",
  },

  // 3. AI & Machine Learning (13)
  {
    gigId: "gig-25",
    topic: "Autonomous AI Agents",
    intent: "autonomous langchain ai agent workflow architecture python",
    badge: "Autonomous AI Agents",
    freelancerRole: "AI Systems Architect & LLM Engineer",
    localPath: "apps/web/public/images/services/ai/autonomous-ai-agents-workflow.jpg",
    unsplashId: "photo-1555066931-4365d14bab8c",
    photographer: "Fotis Fotopoulos",
  },
  {
    gigId: "gig-26",
    topic: "Enterprise RAG Knowledge",
    intent: "enterprise rag vector database pinecone semantic embeddings",
    badge: "AI & Machine Learning",
    freelancerRole: "RAG & Vector Architecture Specialist",
    localPath: "apps/web/public/images/services/ai/llm-rag-fine-tuning-code.jpg",
    unsplashId: "photo-1555066931-4365d14bab8c",
    photographer: "Markus Spiske",
  },
  {
    gigId: "gig-27",
    topic: "LLM LoRA Fine-Tuning",
    intent: "custom llm fine-tuning lora pytorch gpu training cluster",
    badge: "AI & Machine Learning",
    freelancerRole: "Lead LLM Fine-Tuning Engineer",
    localPath: "apps/web/public/images/services/ai/neural-network-ai-workstation.jpg",
    unsplashId: "photo-1531482615713-2afd69097998",
    photographer: "wocintechchat",
  },
  {
    gigId: "gig-28",
    topic: "CrewAI Multi-Agent Simulation",
    intent: "multi-agent simulation autogen decision engine python code",
    badge: "Autonomous AI Agents",
    freelancerRole: "Multi-Agent Simulation Architect",
    localPath: "apps/web/public/images/services/ai/multi-agent-crewai-engine.jpg",
    unsplashId: "photo-1677442136019-21780ecad995",
    photographer: "Sanket Mishra",
  },
  {
    gigId: "gig-29",
    topic: "YOLO Computer Vision",
    intent: "real-time computer vision yolo object detection robotics lab",
    badge: "AI & Machine Learning",
    freelancerRole: "Computer Vision & Multimodal Researcher",
    localPath: "apps/web/public/images/services/ai/machine-learning-computer-vision.jpg",
    unsplashId: "photo-1581091226825-a6a2a5aee158",
    photographer: "ThisisEngineering",
  },
  {
    gigId: "gig-30",
    topic: "Whisper Audio Transcription",
    intent: "speech-to-text audio transcription waveform whisper ai studio",
    badge: "AI & Machine Learning",
    freelancerRole: "Speech AI & Audio Processing Specialist",
    localPath: "apps/web/public/images/services/ai/whisper-speech-transcription.jpg",
    unsplashId: "photo-1590602847861-f357a9332bbc",
    photographer: "Cooperation Studio",
  },
  {
    gigId: "gig-31",
    topic: "Zendesk AI Support Agent",
    intent: "ai customer support routing zendesk agent customer service",
    badge: "Autonomous AI Agents",
    freelancerRole: "Enterprise Support Automation Consultant",
    localPath: "apps/web/public/images/services/ai/zendesk-ai-customer-agent.jpg",
    unsplashId: "photo-1516321318423-f06f85e504b3",
    photographer: "John Schnobrich",
  },
  {
    gigId: "gig-32",
    topic: "Enterprise Semantic Search",
    intent: "semantic search milvus vector index documentation retrieval",
    badge: "AI & Machine Learning",
    freelancerRole: "Search Relevance & Information Retrieval Lead",
    localPath: "apps/web/public/images/services/ai/enterprise-semantic-search.jpg",
    unsplashId: "photo-1504868584819-f8e8b4b6d7e3",
    photographer: "Franki Chamaki",
  },
  {
    gigId: "gig-33",
    topic: "Multimodal Vision OCR",
    intent: "ocr pdf data extraction vision llm scanned invoice parser",
    badge: "AI & Machine Learning",
    freelancerRole: "Document AI & Multimodal Specialist",
    localPath: "apps/web/public/images/services/ai/multimodal-ocr-data-extraction.jpg",
    unsplashId: "photo-1586717791821-3f44a563fa4c",
    photographer: "Kelly Sikkema",
  },
  {
    gigId: "gig-34",
    topic: "AI GitHub Code Review",
    intent: "code review security vulnerability detection github action devsecops",
    badge: "AI & Machine Learning",
    freelancerRole: "DevSecOps & AI Code Review Engineer",
    localPath: "apps/web/public/images/services/ai/github-ai-code-review.jpg",
    unsplashId: "photo-1526374965328-7f61d4dc18c5",
    photographer: "Sigmund",
  },
  {
    gigId: "gig-35",
    topic: "Synthetic Data & Scraping",
    intent: "web scraping synthetic training dataset generation pipeline",
    badge: "AI & Machine Learning",
    freelancerRole: "Synthetic Data & Scraping Pipeline Engineer",
    localPath: "apps/web/public/images/services/ai/data-science-deep-learning.jpg",
    unsplashId: "photo-1504868584819-f8e8b4b6d7e3",
    photographer: "Franki Chamaki",
  },
  {
    gigId: "gig-62",
    topic: "In-Browser WebGPU LLM",
    intent: "webgpu browser local llm inference transformers js terminal",
    badge: "AI & Machine Learning",
    freelancerRole: "Client-Side AI & WebGPU Technologist",
    localPath: "apps/web/public/images/services/ai/webgpu-inbrowser-local-llm.jpg",
    unsplashId: "photo-1555066931-4365d14bab8c",
    photographer: "Fotis Fotopoulos",
  },
  {
    gigId: "gig-edge-draft",
    topic: "Quantum Simulator Qiskit",
    intent: "quantum computing simulator math algorithms python qiskit research",
    badge: "AI & Machine Learning",
    freelancerRole: "Quantum Computing & Algorithm Researcher",
    localPath: "apps/web/public/images/services/ai/quantum-computing-simulator.jpg",
    unsplashId: "photo-1635070041078-e363dbe005cb",
    photographer: "DeepMind",
  },

  // 4. Technical SEO & Growth (7)
  {
    gigId: "gig-36",
    topic: "Programmatic SEO Next.js",
    intent: "programmatic seo google analytics traffic graph search console",
    badge: "Technical SEO",
    freelancerRole: "B2B SaaS Growth & Technical SEO Strategist",
    localPath: "apps/web/public/images/services/marketing/technical-seo-analytics-growth.jpg",
    unsplashId: "photo-1460925895917-afdab827c52f",
    photographer: "Carlos Muza",
  },
  {
    gigId: "gig-37",
    topic: "SaaS CRO Conversion Plan",
    intent: "cro conversion rate optimization funnel testing strategy team",
    badge: "Growth & CRO",
    freelancerRole: "Conversion Rate Optimization (CRO) Lead",
    localPath: "apps/web/public/images/services/marketing/conversion-optimization-strategy.jpg",
    unsplashId: "photo-1557804506-669a67965ba0",
    photographer: "Campaign Creators",
  },
  {
    gigId: "gig-38",
    topic: "GA4 Multi-Touch Attribution",
    intent: "ga4 attribution modeling server side gtm multi channel dashboard",
    badge: "Technical SEO",
    freelancerRole: "Attribution Modeling & Tracking Architect",
    localPath: "apps/web/public/images/services/marketing/data-attribution-dashboard.jpg",
    unsplashId: "photo-1551288049-bebda4e38f71",
    photographer: "Luke Chesser",
  },
  {
    gigId: "gig-39",
    topic: "Core Web Vitals & Speed",
    intent: "lighthouse 100 mobile speed audit web performance devtools",
    badge: "Technical SEO",
    freelancerRole: "Web Performance & Core Web Vitals Auditor",
    localPath: "apps/web/public/images/services/marketing/core-web-vitals-speed.jpg",
    unsplashId: "photo-1551288049-bebda4e38f71",
    photographer: "Luke Chesser",
  },
  {
    gigId: "gig-40",
    topic: "B2B SaaS Outbound Email",
    intent: "b2b cold email infrastructure spf dkim deliverability dns desk",
    badge: "Growth & CRO",
    freelancerRole: "Outbound Deliverability & Email Systems Lead",
    localPath: "apps/web/public/images/services/marketing/cold-email-deliverability.jpg",
    unsplashId: "photo-1557804506-669a67965ba0",
    photographer: "Campaign Creators",
  },
  {
    gigId: "gig-41",
    topic: "PostHog Product Analytics",
    intent: "posthog mixpanel event taxonomy product telemetry dashboard",
    badge: "Technical SEO",
    freelancerRole: "Product Analytics & Event Taxonomy Architect",
    localPath: "apps/web/public/images/services/marketing/posthog-product-telemetry.jpg",
    unsplashId: "photo-1460925895917-afdab827c52f",
    photographer: "Carlos Muza",
  },
  {
    gigId: "gig-42",
    topic: "International Hreflang SEO",
    intent: "international multi-region hreflang global map seo strategy",
    badge: "Technical SEO",
    freelancerRole: "International SEO & Multi-Region Specialist",
    localPath: "apps/web/public/images/services/marketing/international-seo-hreflang.jpg",
    unsplashId: "photo-1451187580459-43490279c0fa",
    photographer: "NASA",
  },

  // 5. Technical Writing (8)
  {
    gigId: "gig-43",
    topic: "Mintlify OpenAPI Docs",
    intent: "openapi mintlify developer documentation code samples screen",
    badge: "API Documentation",
    freelancerRole: "API Documentation & Developer Content Architect",
    localPath: "apps/web/public/images/services/writing/mintlify-openapi-developer-docs.jpg",
    unsplashId: "photo-1516321318423-f06f85e504b3",
    photographer: "John Schnobrich",
  },
  {
    gigId: "gig-44",
    topic: "FinTech & Web3 Whitepaper",
    intent: "fintech web3 whitepaper mathematical proofs research journal",
    badge: "Technical Writing",
    freelancerRole: "Fintech & Deep-Tech Whitepaper Author",
    localPath: "apps/web/public/images/services/writing/system-architecture-whitepaper.jpg",
    unsplashId: "photo-1499750310107-5fef28a66643",
    photographer: "Patrick Tomasso",
  },
  {
    gigId: "gig-45",
    topic: "Developer SDK Guides",
    intent: "developer quickstart guides code snippets postman workspace desk",
    badge: "API Documentation",
    freelancerRole: "Developer Experience & SDK Technical Writer",
    localPath: "apps/web/public/images/services/writing/developer-sdk-quickstart-guides.jpg",
    unsplashId: "photo-1455390582262-044cdead277a",
    photographer: "Aaron Burden",
  },
  {
    gigId: "gig-46",
    topic: "System Architecture RFC",
    intent: "system architecture rfc engineering specifications document",
    badge: "System Architecture",
    freelancerRole: "Principal Systems Technical Architect",
    localPath: "apps/web/public/images/services/writing/system-architecture-rfc-specs.jpg",
    unsplashId: "photo-1499750310107-5fef28a66643",
    photographer: "Patrick Tomasso",
  },
  {
    gigId: "gig-47",
    topic: "Docusaurus Developer Portal",
    intent: "self hosted docusaurus developer documentation search portal",
    badge: "API Documentation",
    freelancerRole: "Developer Documentation Infrastructure Lead",
    localPath: "apps/web/public/images/services/writing/docusaurus-developer-portal.jpg",
    unsplashId: "photo-1516321318423-f06f85e504b3",
    photographer: "John Schnobrich",
  },
  {
    gigId: "gig-48",
    topic: "SOC2 Compliance Policies",
    intent: "soc2 compliance security policy document enterprise audit desk",
    badge: "Technical Writing",
    freelancerRole: "Compliance & Security Documentation Author",
    localPath: "apps/web/public/images/services/writing/soc2-compliance-policy-docs.jpg",
    unsplashId: "photo-1450133064473-71024230f91b",
    photographer: "Scott Graham",
  },
  {
    gigId: "gig-49",
    topic: "SRE Disaster Runbooks",
    intent: "sre incident response runbook database disaster recovery guide",
    badge: "System Architecture",
    freelancerRole: "SRE & Resilience Runbook Specialist",
    localPath: "apps/web/public/images/services/writing/database-disaster-runbook.jpg",
    unsplashId: "photo-1504868584819-f8e8b4b6d7e3",
    photographer: "Franki Chamaki",
  },
  {
    gigId: "gig-63",
    topic: "Developer Onboarding ADRs",
    intent: "architecture decision records adr onboarding technical wiki",
    badge: "API Documentation",
    freelancerRole: "Engineering Onboarding & Wiki Architect",
    localPath: "apps/web/public/images/services/writing/technical-documentation-editorial.jpg",
    unsplashId: "photo-1455390582262-044cdead277a",
    photographer: "Aaron Burden",
  },

  // 6. Business & Consulting (5)
  {
    gigId: "gig-64",
    topic: "Corporate Strategy Advisory",
    intent: "corporate strategy advisory executive boardroom meeting",
    badge: "Corporate Strategy",
    freelancerRole: "Managing Director & Corporate Strategy Advisor",
    localPath: "apps/web/public/images/services/business/enterprise-consulting-boardroom.jpg",
    unsplashId: "photo-1556761175-5973dc0f32e7",
    photographer: "Windows / Office",
  },
  {
    gigId: "gig-65",
    topic: "Financial Valuation Model",
    intent: "startup financial valuation model pitch deck dcf sheets desk",
    badge: "Financial Modeling",
    freelancerRole: "Venture Financial Modeler & Valuation Analyst",
    localPath: "apps/web/public/images/services/business/financial-modeling-advisory.jpg",
    unsplashId: "photo-1554224155-8d04cb21cd6c",
    photographer: "Adeolu Eletu",
  },
  {
    gigId: "gig-66",
    topic: "Web3 Tokenomics & DAO",
    intent: "web3 tokenomics dao crypto venture advisory meeting",
    badge: "Corporate Strategy",
    freelancerRole: "Web3 Tokenomics & DAO Governance Advisor",
    localPath: "apps/web/public/images/services/business/web3-tokenomics-dao-strategy.jpg",
    unsplashId: "photo-1639762681485-074b7f938ba0",
    photographer: "Shubham Dhage",
  },
  {
    gigId: "gig-67",
    topic: "Fractional CTO Advisory",
    intent: "fractional cto digital enterprise architecture advisory boardroom",
    badge: "Corporate Strategy",
    freelancerRole: "Fractional CTO & Executive Technology Advisor",
    localPath: "apps/web/public/images/services/business/fractional-cto-advisory.jpg",
    unsplashId: "photo-1556761175-5973dc0f32e7",
    photographer: "Windows / Office",
  },
  {
    gigId: "gig-68",
    topic: "Market Research & TAM",
    intent: "market research competitive analysis tam sizing report desk",
    badge: "Corporate Strategy",
    freelancerRole: "Market Research & Competitive Intelligence Lead",
    localPath: "apps/web/public/images/services/business/market-research-tam-sizing.jpg",
    unsplashId: "photo-1454165804606-c3d57bc86b40",
    photographer: "Campaign Creators",
  },
];

// 2. Avatar Replacements: 16 distinct real human portrait photos
const AVATAR_REPLACEMENTS = [
  { file: "yuka-sato.jpg", unsplashId: "photo-1534528741775-53994a69daeb", name: "Yuka Sato" },
  { file: "anh-pham.jpg", unsplashId: "photo-1517841905240-472988babdf9", name: "Anh Pham" },
  { file: "oliver-bennett.jpg", unsplashId: "photo-1506794778202-cad84cf45f1d", name: "Oliver Bennett" },
  { file: "david-chen.jpg", unsplashId: "photo-1507003211169-0a1dd7228f2d", name: "David Chen" },
  { file: "linnea-holm.jpg", unsplashId: "photo-1573496359142-b8d87734a5a2", name: "Linnea Holm" },
  { file: "jonas-vestergaard.jpg", unsplashId: "photo-1519085360753-af0119f7cbe7", name: "Jonas Vestergaard" },
  { file: "liam-oconnor.jpg", unsplashId: "photo-1500648767791-00dcc994a43e", name: "Liam O'Connor" },
  { file: "julian-thorne.jpg", unsplashId: "photo-1492562080023-ab3db95bfbce", name: "Julian Thorne" },
  { file: "minh-nguyen.jpg", unsplashId: "photo-1522075469751-3a6694fb2f61", name: "Minh Nguyen" },
  { file: "kofi-boateng.jpg", unsplashId: "photo-1501196354995-cbb51c65aaea", name: "Kofi Boateng" },
  { file: "maya-patel.jpg", unsplashId: "photo-1573497019940-1c28c88b4f3e", name: "Maya Patel" },
  { file: "stefan-richter.jpg", unsplashId: "photo-1522529599102-193c0d76b5b6", name: "Stefan Richter" },
  { file: "torsten-lindemann.jpg", unsplashId: "photo-1472099645785-5658abf4ff4e", name: "Torsten Lindemann" },
  { file: "valerie-mercier.jpg", unsplashId: "photo-1524504388940-b1c1722653e1", name: "Valerie Mercier" },
  { file: "sarah-jenkins.jpg", unsplashId: "photo-1544005313-94ddf0286df2", name: "Sarah Jenkins" },
  { file: "tariq-sterling.jpg", unsplashId: "photo-1539571696357-5a69c17a67c6", name: "Tariq Sterling" },
];

async function main() {
  console.log('=== 1. AUDITING & DOWNLOADING SERVICE IMAGES ===');
  let downloadedServices = 0;
  for (const item of SERVICE_ASSETS) {
    const fullPath = path.resolve(item.localPath);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).size === 0) {
      console.log(`Downloading ${item.gigId} -> ${item.localPath}...`);
      const url = `https://images.unsplash.com/${item.unsplashId}?auto=format&fit=crop&w=1200&h=750&q=80`;
      const ok = await downloadImage(url, fullPath);
      if (ok) {
        downloadedServices++;
        console.log(`  ✓ Success (${fs.statSync(fullPath).size} bytes)`);
      } else {
        console.error(`  ✗ Failed to download ${item.gigId}`);
      }
    } else {
      console.log(`  Existing: ${item.localPath} (${fs.statSync(fullPath).size} bytes)`);
    }
  }
  console.log(`Service images check complete. Downloaded: ${downloadedServices}`);

  console.log('\n=== 2. AUDITING & DOWNLOADING AVATARS (DEDUPLICATION) ===');
  let downloadedAvatars = 0;
  for (const av of AVATAR_REPLACEMENTS) {
    const destPath = path.resolve('apps/web/public/images/avatars', av.file);
    console.log(`Downloading distinct avatar for ${av.file} (${av.name})...`);
    const url = `https://images.unsplash.com/${av.unsplashId}?auto=format&fit=crop&w=400&h=400&q=80`;
    const ok = await downloadImage(url, destPath);
    if (ok) {
      downloadedAvatars++;
      console.log(`  ✓ Success (${fs.statSync(destPath).size} bytes)`);
    } else {
      console.error(`  ✗ Failed to download avatar ${av.file}`);
    }
  }
  console.log(`Avatar deduplication complete. Replaced: ${downloadedAvatars}`);
}

main().catch(console.error);

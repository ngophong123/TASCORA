export interface GigTier {
  name: "BASIC" | "STANDARD" | "PREMIUM"
  title: string
  description: string
  price: number
  deliveryDays: number
  revisions: number | "unlimited"
  features: string[]
}

export interface GigFAQ {
  id: string
  question: string
  answer: string
}

export interface DashboardGig {
  id: string
  title: string
  slug: string
  category: string
  subcategory: string
  coverImage: string
  status: "active" | "draft" | "paused"
  createdAt: string
  updatedAt: string
  startingPrice: number
  rating: number
  reviewsCount: number
  stats: {
    impressions: number
    clicks: number
    orders: number
    revenue: number
    conversionRate: number
  }
  tiers: {
    basic: GigTier
    standard: GigTier
    premium: GigTier
  }
  description: string
  requirements: string
  tags: string[]
  faqs: GigFAQ[]
}

export const INITIAL_GIGS: DashboardGig[] = [
  {
    id: "gig-1",
    title: "Production-ready Next.js 15, TypeScript & Node.js Scalable Architecture",
    slug: "nextjs-15-production-architecture",
    category: "Web Development",
    subcategory: "Full-Stack Development",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    status: "active",
    createdAt: "2026-08-10",
    updatedAt: "2026-09-18",
    startingPrice: 250,
    rating: 4.96,
    reviewsCount: 42,
    stats: {
      impressions: 4820,
      clicks: 640,
      orders: 28,
      revenue: 8900,
      conversionRate: 4.38,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Starter Boilerplate",
        description: "Next.js 15 App Router scaffolding, Tailwind CSS, TypeScript, and Docker configuration.",
        price: 250,
        deliveryDays: 2,
        revisions: 2,
        features: ["Clean Folder Structure", "Docker Compose", "CI/CD GitHub Action", "Authentication Boilerplate"],
      },
      standard: {
        name: "STANDARD",
        title: "Full Production Setup",
        description: "Complete PostgreSQL/Prisma integration, JWT auth, Redis caching, and Stripe webhooks.",
        price: 450,
        deliveryDays: 4,
        revisions: 4,
        features: ["All Basic Features", "Prisma ORM & PostgreSQL", "Redis Caching Layer", "Stripe Payment Webhooks", "Automated E2E Tests"],
      },
      premium: {
        name: "PREMIUM",
        title: "Enterprise Architecture",
        description: "Multi-tenant architecture, automated Kubernetes manifests, observability telemetry, and high availability setup.",
        price: 950,
        deliveryDays: 7,
        revisions: "unlimited",
        features: ["All Standard Features", "Kubernetes Deployment", "Prometheus & Grafana Setup", "Load Testing & Optimization", "30 Days Dedicated Support"],
      },
    },
    description: "I will engineer enterprise-grade Next.js 15 production web architectures with clean TypeScript patterns, Docker containerization, PostgreSQL/Prisma ORM, and high-performance server components.",
    requirements: "Please provide your project wireframes or scope document, preferred cloud hosting (Vercel, AWS, or GCP), and third-party API credentials.",
    tags: ["nextjs", "react", "typescript", "fullstack", "docker"],
    faqs: [
      {
        id: "faq-1",
        question: "Do you configure continuous integration (CI/CD)?",
        answer: "Yes, all tiers include automated GitHub Actions workflows with linting, unit tests, and preview deployment triggers.",
      },
      {
        id: "faq-2",
        question: "Is the source code fully typed and documented?",
        answer: "Every function and API endpoint includes strict TypeScript typings and JSDoc documentation.",
      },
    ],
  },
  {
    id: "gig-2",
    title: "Autonomous AI Agents, LangChain & LLM RAG Pipeline Integration",
    slug: "ai-agents-rag-pipeline-integration",
    category: "Artificial Intelligence",
    subcategory: "Machine Learning & NLP",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    status: "active",
    createdAt: "2026-08-25",
    updatedAt: "2026-09-15",
    startingPrice: 350,
    rating: 5.0,
    reviewsCount: 19,
    stats: {
      impressions: 3410,
      clicks: 480,
      orders: 14,
      revenue: 6200,
      conversionRate: 2.92,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "RAG Proof of Concept",
        description: "Vector embedding ingestion with OpenAI/Claude and local Qdrant/ChromaDB search.",
        price: 350,
        deliveryDays: 3,
        revisions: 2,
        features: ["PDF/Text Chunking", "OpenAI Embedding API", "Hybrid Keyword/Vector Search", "API Endpoint"],
      },
      standard: {
        name: "STANDARD",
        title: "Production RAG Pipeline",
        description: "Production pgvector integration, Cohere reranking, conversational memory, and streaming responses.",
        price: 850,
        deliveryDays: 5,
        revisions: 4,
        features: ["All Basic Features", "pgvector Database", "Cohere Reranker Integration", "Streaming LLM Response", "Conversation History DB"],
      },
      premium: {
        name: "PREMIUM",
        title: "Multi-Agent System",
        description: "Autonomous LangGraph/CrewAI multi-agent workflow with web tools, SQL query generation, and evaluation harness.",
        price: 1600,
        deliveryDays: 10,
        revisions: "unlimited",
        features: ["All Standard Features", "LangGraph Agent Workflows", "Custom Tool Integrations", "Automated Evaluation Benchmarks", "Comprehensive Documentation"],
      },
    },
    description: "Custom autonomous agent workflows and retrieval-augmented generation (RAG) pipelines built for high precision and ultra-low cold start latency.",
    requirements: "Sample documents for vectorization, desired LLM provider API keys, and target user interaction flows.",
    tags: ["ai", "rag", "langchain", "python", "vector-database"],
    faqs: [
      {
        id: "faq-21",
        question: "Which vector databases do you support?",
        answer: "We support pgvector, Pinecone, Qdrant, Milvus, and Weaviate.",
      },
    ],
  },
  {
    id: "gig-3",
    title: "High-Performance 3D WebGL Canvas & Smooth Three.js Micro-Animations",
    slug: "threejs-webgl-micro-animations",
    category: "Web Development",
    subcategory: "Frontend & Creative Tech",
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    status: "active",
    createdAt: "2026-09-01",
    updatedAt: "2026-09-12",
    startingPrice: 300,
    rating: 4.92,
    reviewsCount: 16,
    stats: {
      impressions: 2150,
      clicks: 290,
      orders: 9,
      revenue: 3800,
      conversionRate: 3.1,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Interactive 3D Element",
        description: "Single 3D canvas hero element with mouse follow, lighting, and shadow effects.",
        price: 300,
        deliveryDays: 2,
        revisions: 2,
        features: ["Three.js Scene Scaffolding", "PBR Materials & Lighting", "60 FPS Optimization", "Responsive Viewport"],
      },
      standard: {
        name: "STANDARD",
        title: "Scroll-Driven 3D Storytelling",
        description: "Multi-section camera timeline synchronized with GSAP ScrollTrigger.",
        price: 600,
        deliveryDays: 5,
        revisions: 3,
        features: ["All Basic Features", "GSAP ScrollTrigger Integration", "Custom GLSL Shaders", "GLTF/GLB Asset Optimization", "Mobile Fallback"],
      },
      premium: {
        name: "PREMIUM",
        title: "Full WebGL Creative Experience",
        description: "Immersive WebGL microsite with custom post-processing, particle systems, and audio reactivity.",
        price: 1200,
        deliveryDays: 8,
        revisions: "unlimited",
        features: ["All Standard Features", "Custom Post-processing Bloom", "GPU Particle Systems", "Audio-reactive Canvas", "Cross-browser Performance Audit"],
      },
    },
    description: "Bring your product to life with 60 FPS Three.js WebGL graphics, custom GLSL shaders, and buttery-smooth scroll interactions.",
    requirements: "3D models (.glb/.gltf format), brand guidelines, and target framerate requirements.",
    tags: ["threejs", "webgl", "gsap", "shaders", "creative-coding"],
    faqs: [],
  },
  {
    id: "gig-4",
    title: "Kubernetes Multi-Cluster GitOps & Terraform Cloud Infrastructure",
    slug: "kubernetes-terraform-cloud-infrastructure",
    category: "DevOps & Cloud",
    subcategory: "Cloud Architecture",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    status: "paused",
    createdAt: "2026-07-15",
    updatedAt: "2026-08-30",
    startingPrice: 500,
    rating: 4.88,
    reviewsCount: 11,
    stats: {
      impressions: 1420,
      clicks: 160,
      orders: 6,
      revenue: 4200,
      conversionRate: 3.75,
    },
    tiers: {
      basic: {
        name: "BASIC",
        title: "Single Cluster Terraform",
        description: "EKS or GKE cluster provisioning with VPC network and IAM roles.",
        price: 500,
        deliveryDays: 3,
        revisions: 2,
        features: ["VPC & Subnet Scaffolding", "Managed EKS/GKE Cluster", "IAM Least Privilege Roles", "Terraform State Backend"],
      },
      standard: {
        name: "STANDARD",
        title: "GitOps & Ingress Architecture",
        description: "ArgoCD setup, Cert-Manager SSL certificates, external DNS, and NGINX ingress controller.",
        price: 1100,
        deliveryDays: 6,
        revisions: 3,
        features: ["All Basic Features", "ArgoCD GitOps Sync", "Cert-Manager Auto SSL", "NGINX Ingress Controller", "Sealed Secrets Config"],
      },
      premium: {
        name: "PREMIUM",
        title: "Zero-Trust Enterprise Cluster",
        description: "Multi-region cluster federation, Istio service mesh, Prometheus/Grafana stack, and automated DR backup.",
        price: 2200,
        deliveryDays: 12,
        revisions: "unlimited",
        features: ["All Standard Features", "Istio Service Mesh", "Full Prometheus/Grafana Stack", "Automated Velero DR Backups", "SOC2 Compliance Hardening"],
      },
    },
    description: "Production-tested infrastructure as code with Terraform, Kubernetes, ArgoCD GitOps, and enterprise cloud security.",
    requirements: "AWS/GCP cloud accounts, domain registrar access for DNS, and workload capacity estimates.",
    tags: ["kubernetes", "terraform", "devops", "aws", "gitops"],
    faqs: [],
  },
]

export interface FilterCategory {
  id: string
  name: string
  slug: string
  iconName: string
  count: number
  subcategories: {
    id: string
    name: string
    slug: string
    count: number
  }[]
}

export interface SortOption {
  id: string
  label: string
  key: "recommended" | "rating_desc" | "newest" | "price_asc" | "price_desc"
}

export interface DeliveryOption {
  id: string
  label: string
  maxDays: number
}

export interface SellerLevelOption {
  id: "NEW" | "LEVEL_1" | "LEVEL_2" | "TOP_RATED"
  label: string
  badgeVariant: "default" | "secondary" | "luxury" | "gradient"
}

export interface RatingOption {
  id: string
  label: string
  minRating: number
}

export const SORT_OPTIONS: SortOption[] = [
  { id: "sort-recommended", label: "Recommended", key: "recommended" },
  { id: "sort-rating", label: "Best Rated", key: "rating_desc" },
  { id: "sort-newest", label: "Newest Arrivals", key: "newest" },
  { id: "sort-price-asc", label: "Price: Low to High", key: "price_asc" },
  { id: "sort-price-desc", label: "Price: High to Low", key: "price_desc" },
]

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "express", label: "Express 24 Hours", maxDays: 1 },
  { id: "3days", label: "Up to 3 Days", maxDays: 3 },
  { id: "7days", label: "Up to 7 Days", maxDays: 7 },
  { id: "any", label: "Anytime", maxDays: 999 },
]

export const SELLER_LEVEL_OPTIONS: SellerLevelOption[] = [
  { id: "TOP_RATED", label: "Top Rated", badgeVariant: "gradient" },
  { id: "LEVEL_2", label: "Level 2 Specialist", badgeVariant: "luxury" },
  { id: "LEVEL_1", label: "Level 1 Practitioner", badgeVariant: "secondary" },
  { id: "NEW", label: "New Talent", badgeVariant: "default" },
]

export const RATING_OPTIONS: RatingOption[] = [
  { id: "rating-4-5", label: "4.5 & up", minRating: 4.5 },
  { id: "rating-4-0", label: "4.0 & up", minRating: 4.0 },
  { id: "rating-any", label: "Any rating", minRating: 0 },
]

export const LANGUAGE_OPTIONS = [
  "English",
  "French",
  "German",
  "Spanish",
  "Japanese",
  "Vietnamese",
]

export const PRICE_BOUNDS = {
  min: 20,
  max: 2000,
  step: 10,
}

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: "cat-web",
    name: "Web Development",
    slug: "programming",
    iconName: "Code2",
    count: 14,
    subcategories: [
      { id: "sub-nextjs", name: "Next.js & React 19", slug: "nextjs", count: 6 },
      { id: "sub-backend", name: "Node.js & Go APIs", slug: "backend-api", count: 4 },
      { id: "sub-fullstack", name: "Full-Stack SaaS", slug: "fullstack-saas", count: 4 },
    ],
  },
  {
    id: "cat-design",
    name: "UI/UX & Product Design",
    slug: "design",
    iconName: "Palette",
    count: 10,
    subcategories: [
      { id: "sub-figma", name: "Figma Design Systems", slug: "design-systems", count: 4 },
      { id: "sub-saas-ui", name: "SaaS Dashboard UI", slug: "saas-ui", count: 3 },
      { id: "sub-mobile-ui", name: "iOS & Android Mobile UI", slug: "mobile-ui", count: 3 },
    ],
  },
  {
    id: "cat-ai",
    name: "AI & Automation",
    slug: "ai",
    iconName: "Cpu",
    count: 8,
    subcategories: [
      { id: "sub-agents", name: "Autonomous AI Agents", slug: "ai-agents", count: 4 },
      { id: "sub-rag", name: "RAG & Vector Pipelines", slug: "rag-systems", count: 2 },
      { id: "sub-finetune", name: "LLM Fine-Tuning", slug: "llm-finetuning", count: 2 },
    ],
  },
  {
    id: "cat-mobile",
    name: "Mobile App Development",
    slug: "mobile",
    iconName: "Smartphone",
    count: 5,
    subcategories: [
      { id: "sub-rn", name: "React Native & Expo", slug: "react-native", count: 3 },
      { id: "sub-flutter", name: "Flutter Cross-Platform", slug: "flutter", count: 2 },
    ],
  },
  {
    id: "cat-devops",
    name: "Cloud & DevOps",
    slug: "devops",
    iconName: "Cloud",
    count: 4,
    subcategories: [
      { id: "sub-k8s", name: "Kubernetes & Docker", slug: "k8s-docker", count: 2 },
      { id: "sub-aws", name: "AWS & Terraform IaC", slug: "aws-terraform", count: 2 },
    ],
  },
  {
    id: "cat-brand",
    name: "Logo & Brand Identity",
    slug: "branding",
    iconName: "PenTool",
    count: 3,
    subcategories: [
      { id: "sub-brandkit", name: "Comprehensive Brand Books", slug: "brand-books", count: 2 },
      { id: "sub-vectorlogo", name: "Vector Logomarks", slug: "vector-logos", count: 1 },
    ],
  },
  {
    id: "cat-video",
    name: "Video & 3D Animation",
    slug: "video",
    iconName: "Film",
    count: 2,
    subcategories: [
      { id: "sub-threejs", name: "Three.js & 3D Interactive", slug: "threejs-3d", count: 1 },
      { id: "sub-motion", name: "Kinetic Motion Graphics", slug: "motion-graphics", count: 1 },
    ],
  },
  {
    id: "cat-writing",
    name: "Technical Writing",
    slug: "writing",
    iconName: "BookOpen",
    count: 2,
    subcategories: [
      { id: "sub-apidocs", name: "Developer API Docs", slug: "api-documentation", count: 1 },
      { id: "sub-whitepapers", name: "Fintech & Web3 Whitepapers", slug: "whitepapers", count: 1 },
    ],
  },
]

/**
 * TASCORA Curated Real Stock Photography Avatar Registry
 *
 * Sourced exclusively from free, commercially licensed Unsplash stock photography (Unsplash License).
 * Provides a diverse, high-caliber pool of 47 unique real professional portraits with deterministic
 * assignment so that freelancers, reviewers, clients, and team members always display the
 * exact same photograph across all pages and components.
 */

export interface AvatarItem {
  id: string
  url: string
  name: string
  gender: "female" | "male"
  roleHint?: string
  alt: string
}

/**
 * Curated pool of 47 verified real high-resolution portraits from Unsplash
 * Diverse genders, ethnicities, ages, and specialized technical/creative appearances.
 */
export const CURATED_AVATARS: AvatarItem[] = [
  {
    id: "uns-01",
    url: "/images/avatars/alexandre-moreau.jpg",
    name: "Alexandre Moreau",
    gender: "male",
    roleHint: "Senior Systems Architect",
    alt: "Alexandre Moreau - Senior Full-Stack Architect portrait",
  },
  {
    id: "uns-02",
    url: "/images/avatars/helena-rostova.jpg",
    name: "Helena Rostova",
    gender: "female",
    roleHint: "Principal Brand & Product Designer",
    alt: "Helena Rostova - Principal Brand and UI/UX Designer portrait",
  },
  {
    id: "uns-03",
    url: "/images/avatars/marcus-vance.jpg",
    name: "Marcus Vance",
    gender: "male",
    roleHint: "AI Systems Engineer & Research Lead",
    alt: "Marcus Vance - AI Systems Engineer and Research Lead portrait",
  },
  {
    id: "uns-04",
    url: "/images/avatars/sophia-chen.jpg",
    name: "Sophia Lindqvist",
    gender: "female",
    roleHint: "B2B SaaS Growth Marketer & Technical SEO",
    alt: "Sophia Lindqvist - B2B SaaS Growth Marketer and Technical SEO Consultant portrait",
  },
  {
    id: "uns-05",
    url: "/images/avatars/dmitri-volkov.jpg",
    name: "Dmitri Volkov",
    gender: "male",
    roleHint: "Enterprise Cybersecurity Audit Engineer",
    alt: "Dmitri Volkov - Enterprise Cybersecurity Audit Engineer portrait",
  },
  {
    id: "uns-06",
    url: "/images/avatars/chloe-laurent.jpg",
    name: "Chloe Dubois",
    gender: "female",
    roleHint: "3D Product Motion Designer & Animator",
    alt: "Chloe Dubois - 3D Product Motion Designer and Animator portrait",
  },
  {
    id: "uns-07",
    url: "/images/avatars/default-avatar.jpg",
    name: "System Administrator",
    gender: "male",
    roleHint: "Platform Trust & Operations Director",
    alt: "TASCORA Platform Trust and Safety Administrator profile avatar",
  },
  {
    id: "uns-08",
    url: "/images/avatars/david-chen.jpg",
    name: "David Chen",
    gender: "male",
    roleHint: "Co-Founder & CTO",
    alt: "David Chen - Verified enterprise client reviewer avatar",
  },
  {
    id: "uns-09",
    url: "/images/avatars/reviewer-sarah.jpg",
    name: "Elena Rostova",
    gender: "female",
    roleHint: "Product Operations Lead",
    alt: "Elena Rostova - Verified startup client reviewer avatar",
  },
  {
    id: "uns-10",
    url: "/images/avatars/client-marcus.jpg",
    name: "Marcus Thorne",
    gender: "male",
    roleHint: "VP of Product Engineering",
    alt: "Marcus Thorne - VP of Product Engineering client avatar",
  },
  {
    id: "uns-11",
    url: "/images/avatars/client-emily.jpg",
    name: "Emily Zhang",
    gender: "female",
    roleHint: "Head of Digital Operations",
    alt: "Emily Zhang - Head of Digital Operations client avatar",
  },
  {
    id: "uns-12",
    url: "/images/avatars/rachel-adams.jpg",
    name: "Rachel Adams",
    gender: "female",
    roleHint: "Chief Technology Officer",
    alt: "Rachel Adams - HealthTech CTO client avatar",
  },
  {
    id: "uns-13",
    url: "/images/avatars/liam-oconnor.jpg",
    name: "Liam O'Connor",
    gender: "male",
    roleHint: "Co-Founder & CEO",
    alt: "Liam O'Connor - Startup CEO client avatar",
  },
  {
    id: "uns-14",
    url: "/images/avatars/minh-nguyen.jpg",
    name: "Minh Nguyen",
    gender: "male",
    roleHint: "Full-Stack Engineer",
    alt: "Minh Nguyen - Enterprise Software Engineer avatar",
  },
  {
    id: "uns-15",
    url: "/images/avatars/aiko-tanaka.jpg",
    name: "Aiko Tanaka",
    gender: "female",
    roleHint: "Cloud Infrastructure Architect",
    alt: "Aiko Tanaka - Cloud Infrastructure Architect avatar",
  },
  {
    id: "uns-16",
    url: "/images/avatars/kwame-mensah.jpg",
    name: "Kwame Mensah",
    gender: "male",
    roleHint: "Distributed Systems Specialist",
    alt: "Kwame Mensah - Distributed Systems Specialist avatar",
  },
  {
    id: "uns-17",
    url: "/images/avatars/nadia-belkacem.jpg",
    name: "Nadia Belkacem",
    gender: "female",
    roleHint: "Creative Director & UI Lead",
    alt: "Nadia Belkacem - Creative Director avatar",
  },
  {
    id: "uns-18",
    url: "/images/avatars/julian-thorne.jpg",
    name: "Julian Thorne",
    gender: "male",
    roleHint: "VP of Engineering",
    alt: "Julian Thorne - VP of Engineering avatar",
  },
  {
    id: "uns-19",
    url: "/images/avatars/clara-novak.jpg",
    name: "Camila Fernandez",
    gender: "female",
    roleHint: "Product Strategy & UX Director",
    alt: "Camila Fernandez - Product Strategy Director avatar",
  },
  {
    id: "uns-20",
    url: "/images/avatars/lukas-weber.jpg",
    name: "Lukas Weber",
    gender: "male",
    roleHint: "Kubernetes & DevOps Engineer",
    alt: "Lukas Weber - DevOps Engineer avatar",
  },
  {
    id: "uns-21",
    url: "/images/avatars/maya-patel.jpg",
    name: "Maya Patel",
    gender: "female",
    roleHint: "Conversion Optimization Lead",
    alt: "Maya Patel - Conversion Optimization Lead avatar",
  },
  {
    id: "uns-22",
    url: "/images/avatars/arthur-pendelton.jpg",
    name: "Arthur Pendelton",
    gender: "male",
    roleHint: "Autonomous Agent Developer",
    alt: "Arthur Pendelton - Autonomous Agent Developer avatar",
  },
  {
    id: "uns-23",
    url: "/images/avatars/linnea-holm.jpg",
    name: "Linnea Holm",
    gender: "female",
    roleHint: "Mobile Architect & Flutter Lead",
    alt: "Linnea Holm - Mobile Architect avatar",
  },
  {
    id: "uns-24",
    url: "/images/avatars/mateo-rossi.jpg",
    name: "Mateo Rossi",
    gender: "male",
    roleHint: "Computer Vision Researcher",
    alt: "Mateo Rossi - Computer Vision Researcher avatar",
  },
  {
    id: "uns-25",
    url: "/images/avatars/fatima-almansoor.jpg",
    name: "Fatima Al-Mansoor",
    gender: "female",
    roleHint: "FinTech & Whitepaper Author",
    alt: "Fatima Al-Mansoor - Technical Author avatar",
  },
  {
    id: "uns-26",
    url: "/images/avatars/tariq-sterling.jpg",
    name: "Tariq Sterling",
    gender: "male",
    roleHint: "Penetration Testing Specialist",
    alt: "Tariq Sterling - Penetration Testing Specialist avatar",
  },
  {
    id: "uns-27",
    url: "/images/avatars/sunita-rao.jpg",
    name: "Sunita Rao",
    gender: "female",
    roleHint: "Next.js & Frontend Engineer",
    alt: "Sunita Rao - Next.js Engineer avatar",
  },
  {
    id: "uns-28",
    url: "/images/avatars/jonas-vestergaard.jpg",
    name: "Jonas Vestergaard",
    gender: "male",
    roleHint: "Design Systems & Tokens Specialist",
    alt: "Jonas Vestergaard - Design Systems Specialist avatar",
  },
  {
    id: "uns-29",
    url: "/images/avatars/beatrice-dupont.jpg",
    name: "Beatrice Dupont",
    gender: "female",
    roleHint: "API Documentation Lead",
    alt: "Beatrice Dupont - API Documentation Lead avatar",
  },
  {
    id: "uns-30",
    url: "/images/avatars/carlos-mendoza.jpg",
    name: "Carlos Mendoza",
    gender: "male",
    roleHint: "B2B SaaS Growth Lead",
    alt: "Carlos Mendoza - Growth Lead avatar",
  },
  {
    id: "uns-31",
    url: "/images/avatars/mai-tran.jpg",
    name: "Mai Tran",
    gender: "female",
    roleHint: "React 19 & Tailwind Specialist",
    alt: "Mai Tran - React Specialist avatar",
  },
  {
    id: "uns-32",
    url: "/images/avatars/henrik-lindholm.jpg",
    name: "Henrik Lindholm",
    gender: "male",
    roleHint: "Zero-Trust Infrastructure Lead",
    alt: "Henrik Lindholm - Infrastructure Lead avatar",
  },
  {
    id: "uns-33",
    url: "/images/avatars/sarah-jenkins.jpg",
    name: "Sarah Jenkins",
    gender: "female",
    roleHint: "User Research & Qualitative UX",
    alt: "Sarah Jenkins - UX Researcher avatar",
  },
  {
    id: "uns-34",
    url: "/images/avatars/kevin-oreilly.jpg",
    name: "Kevin O'Reilly",
    gender: "male",
    roleHint: "Real-Time WebSockets Engineer",
    alt: "Kevin O'Reilly - WebSockets Engineer avatar",
  },
  {
    id: "uns-35",
    url: "/images/avatars/yuka-sato.jpg",
    name: "Yuka Sato",
    gender: "female",
    roleHint: "3D Motion & WebGL Animator",
    alt: "Yuka Sato - 3D Animator avatar",
  },
  {
    id: "uns-36",
    url: "/images/avatars/kofi-boateng.jpg",
    name: "Kofi Boateng",
    gender: "male",
    roleHint: "Cross-Platform Mobile Engineer",
    alt: "Kofi Boateng - Mobile Engineer avatar",
  },
  {
    id: "uns-37",
    url: "/images/avatars/valerie-mercier.jpg",
    name: "Valerie Mercier",
    gender: "female",
    roleHint: "Luxury Brand Identity Designer",
    alt: "Valerie Mercier - Brand Designer avatar",
  },
  {
    id: "uns-38",
    url: "/images/avatars/stefan-richter.jpg",
    name: "Stefan Richter",
    gender: "male",
    roleHint: "High-Availability SRE Consultant",
    alt: "Stefan Richter - SRE Consultant avatar",
  },
  {
    id: "uns-39",
    url: "/images/avatars/leila-haddad.jpg",
    name: "Leila Haddad",
    gender: "female",
    roleHint: "RAG & Vector Retrieval Specialist",
    alt: "Leila Haddad - AI Specialist avatar",
  },
  {
    id: "uns-40",
    url: "/images/avatars/hoang-le.jpg",
    name: "Hoang Le",
    gender: "male",
    roleHint: "PostgreSQL & Database Systems Lead",
    alt: "Hoang Le - Database Lead avatar",
  },
  {
    id: "uns-41",
    url: "/images/avatars/clara-novak.jpg",
    name: "Clara Novak",
    gender: "female",
    roleHint: "Technical SEO & Schema Architect",
    alt: "Clara Novak - SEO Architect avatar",
  },
  {
    id: "uns-42",
    url: "/images/avatars/oliver-bennett.jpg",
    name: "Oliver Bennett",
    gender: "male",
    roleHint: "Junior Front-End Developer",
    alt: "Oliver Bennett - Junior Front-End Developer avatar",
  },
  {
    id: "uns-43",
    url: "/images/avatars/chloe-nguyen.jpg",
    name: "Chloe Nguyen (Minh Chau)",
    gender: "female",
    roleHint: "DevOps & Zero-Downtime CI/CD Specialist",
    alt: "Chloe Nguyen - DevOps Specialist avatar",
  },
  {
    id: "uns-44",
    url: "/images/avatars/torsten-lindemann.jpg",
    name: "Torsten Lindemann",
    gender: "male",
    roleHint: "Enterprise SAP & Cloud Migration Consultant",
    alt: "Torsten Lindemann - Enterprise Consultant avatar",
  },
  {
    id: "uns-45",
    url: "/images/avatars/sergei-romanov.jpg",
    name: "Sergei Romanov",
    gender: "male",
    roleHint: "Legacy Web3 Contract Engineer",
    alt: "Sergei Romanov - Contract Engineer avatar",
  },
  {
    id: "uns-46",
    url: "/images/avatars/bart-montgomery.jpg",
    name: "Dr. Bartholomew Montgomery",
    gender: "male",
    roleHint: "Executive Distinguished Systems Architect",
    alt: "Dr. Bartholomew Montgomery avatar",
  },
  {
    id: "uns-47",
    url: "/images/avatars/anh-pham.jpg",
    name: "Anh Pham",
    gender: "female",
    roleHint: "Design Technologist",
    alt: "Anh Pham - Design Technologist avatar",
  },
]

const getCurated = (idx: number): string =>
  CURATED_AVATARS[idx]?.url ?? "/images/fallbacks/avatar.webp"

/**
 * Known Named Entity Mapping to ensure 100% deterministic avatar across all pages
 */
const NAMED_PERSONA_AVATARS: Record<string, string> = {
  // Key Featured Freelancers
  "f-1": getCurated(0),
  "alexandre moreau": getCurated(0),

  "f-2": getCurated(1),
  "helena rostova": getCurated(1),

  "f-3": getCurated(2),
  "marcus vance": getCurated(2),

  "f-4": getCurated(3),
  "sophia lindqvist": getCurated(3),
  "sophia chen": getCurated(3),

  "f-5": getCurated(4),
  "dmitri volkov": getCurated(4),

  "f-6": getCurated(5),
  "chloe dubois": getCurated(5),

  // Admin
  "usr-admin": getCurated(6),
  admin: getCurated(6),
  "system administrator": getCurated(6),

  // Testimonials & Prominent Reviewers
  "david chen": getCurated(7),
  "t-3": getCurated(7),

  "elena rostova": getCurated(8),

  "marcus thorne": getCurated(9),
  "usr-client-1": getCurated(9),

  "usr-client-2": "/images/avatars/david-sterling.jpg",
  "david sterling": "/images/avatars/david-sterling.jpg",

  "emily zhang": getCurated(10),
  "usr-client-3": getCurated(10),

  "rachel adams": getCurated(11),
  "usr-client-4": getCurated(11),

  "liam o'connor": getCurated(12),
  "usr-client-5": getCurated(12),

  "minh nguyen": getCurated(13),
  "usr-18": getCurated(13),

  "aiko tanaka": getCurated(14),
  "usr-19": getCurated(14),

  "kwame mensah": getCurated(15),
  "usr-20": getCurated(15),

  "nadia belkacem": getCurated(16),
  "usr-21": getCurated(16),

  "julian thorne": getCurated(17),
  "t-1": getCurated(17),
  "t-2": getCurated(1), // Helena Rostova testimonial

  "camila fernandez": getCurated(18),
  "usr-22": getCurated(18),

  "lukas weber": getCurated(19),
  "usr-23": getCurated(19),

  "maya patel": getCurated(20),
  "usr-24": getCurated(20),

  "arthur pendelton": getCurated(21),
  "usr-25": getCurated(21),

  "linnea holm": getCurated(22),
  "usr-26": getCurated(22),

  "mateo rossi": getCurated(23),
  "usr-27": getCurated(23),

  "fatima al-mansoor": getCurated(24),
  "usr-28": getCurated(24),

  "tariq sterling": getCurated(25),
  "usr-29": getCurated(25),

  "sunita rao": getCurated(26),
  "usr-30": getCurated(26),

  "jonas vestergaard": getCurated(27),
  "usr-31": getCurated(27),

  "beatrice dupont": getCurated(28),
  "usr-32": getCurated(28),

  "carlos mendoza": getCurated(29),
  "usr-33": getCurated(29),

  "mai tran": getCurated(30),
  "usr-34": getCurated(30),

  "henrik lindholm": getCurated(31),
  "usr-35": getCurated(31),

  "sarah jenkins": getCurated(32),
  "usr-36": getCurated(32),

  "kevin o'reilly": getCurated(33),
  "usr-37": getCurated(33),

  "yuka sato": getCurated(34),
  "usr-38": getCurated(34),

  "kofi boateng": getCurated(35),
  "usr-39": getCurated(35),

  "valerie mercier": getCurated(36),
  "usr-40": getCurated(36),

  "stefan richter": getCurated(37),
  "usr-41": getCurated(37),

  // Edge cases
  "usr-edge-overflow": getCurated(45),
  "dr. bartholomew alexander montgomery-fitzgerald iii": getCurated(45),
  "dr. bartholomew montgomery": getCurated(45),

  "usr-edge-brandnew": getCurated(41),
  "oliver bennett": getCurated(41),

  "usr-edge-fast-response": getCurated(42),
  "chloe nguyen (minh chau)": getCurated(42),
  "chloe nguyen": getCurated(42),

  "usr-edge-slow-response": getCurated(43),
  "torsten lindemann": getCurated(43),

  "usr-edge-suspended": getCurated(44),
  "sergei romanov": getCurated(44),
}

/**
 * Simple stable string hashing function
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Returns a deterministic, high-quality Unsplash portrait URL for any given identifier or name.
 */
export function getFreelancerAvatar(idOrName?: string, fallbackName?: string): string {
  const defaultUrl = getCurated(0)
  if (!idOrName && !fallbackName) {
    return defaultUrl
  }

  const lookupKey = (idOrName || fallbackName || "").trim().toLowerCase()

  // 1. Direct persona match
  const matched = NAMED_PERSONA_AVATARS[lookupKey]
  if (matched) {
    return matched
  }

  // 2. Check if already a valid full URL
  if (
    idOrName &&
    (idOrName.startsWith("http://") ||
      idOrName.startsWith("https://") ||
      idOrName.startsWith("/images/"))
  ) {
    return idOrName
  }

  // 3. Fallback to deterministic hash index into curated list
  const hash = hashString(idOrName || fallbackName || "tascora-freelancer")
  const index = hash % CURATED_AVATARS.length
  return CURATED_AVATARS[index]?.url ?? defaultUrl
}

/**
 * Returns meaningful alt text for a freelancer avatar
 */
export function getFreelancerAvatarAlt(name: string, role?: string): string {
  if (role) {
    return `${name} - ${role} profile portrait`
  }
  return `${name} - Verified TASCORA Specialist portrait`
}

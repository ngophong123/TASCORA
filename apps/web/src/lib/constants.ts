export const SITE_CONFIG = {
  name: "TASCORA",
  tagline: "Connect. Work. Deliver.",
  description:
    "The modern freelance marketplace for high-velocity teams and vetted independent specialists. Built with escrow milestone protection.",
  url: process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3200",
  links: {
    twitter: "https://twitter.com/tascora",
    github: "https://github.com/tascora",
  },
} as const

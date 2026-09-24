import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Professional Services & Vetted Freelancers | TASCORA",
  description:
    "Browse top-tier independent developers, UI/UX designers, AI automation architects, and digital specialists. Escrow milestone protection and guaranteed delivery.",
  keywords: [
    "hire web developers",
    "hire UI UX designers",
    "freelance AI automation",
    "freelance services catalog",
    "vetted freelancers",
    "escrow protected contracts",
    "TASCORA services",
  ],
  openGraph: {
    title: "Explore Professional Services — TASCORA",
    description:
      "Hire top 1% vetted independent developers, designers, and specialists worldwide with milestone escrow protection.",
    url: "https://tascora.com/services",
    siteName: "TASCORA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Professional Services — TASCORA",
    description:
      "Hire top 1% vetted independent developers, designers, and specialists worldwide with milestone escrow protection.",
  },
  alternates: {
    canonical: "https://tascora.com/services",
  },
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

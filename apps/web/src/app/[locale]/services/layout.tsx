import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Services & Independent Specialists | TASCORA",
  description:
    "Compare published services, package details and seller reviews to find the right specialist for your project.",
  keywords: [
    "hire web developers",
    "hire UI UX designers",
    "freelance AI automation",
    "freelance services catalog",
    "independent specialists",
    "project collaboration",
    "TASCORA services",
  ],
  openGraph: {
    title: "Explore Professional Services — TASCORA",
    description:
      "Explore independent specialists, compare service packages and start a conversation about your project.",
    url: "/services",
    siteName: "TASCORA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Professional Services — TASCORA",
    description:
      "Explore independent specialists, compare service packages and start a conversation about your project.",
  },
  alternates: {
    canonical: "/services",
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

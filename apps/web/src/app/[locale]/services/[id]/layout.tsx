import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const canonical = `${locale === "en" ? "" : `/${locale}`}/services/${encodeURIComponent(id)}`
  return {
    title: locale === "vi" ? "Chi tiết dịch vụ | TASCORA" : "Service details | TASCORA",
    alternates: { canonical },
    openGraph: { url: canonical },
  }
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}

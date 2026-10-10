import type { Metadata } from "next"
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonical = `${locale === "en" ? "" : `/${locale}`}/explore`
  const title = locale === "vi" ? "Khám phá dịch vụ | TASCORA" : "Explore services | TASCORA"
  return { title, alternates: { canonical }, openGraph: { title, url: canonical } }
}
export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}

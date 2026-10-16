import type { Metadata } from "next"
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonical = `${locale === "en" ? "" : `/${locale}`}/categories`
  const title = locale === "vi" ? "Danh mục dịch vụ | TASCORA" : "Service categories | TASCORA"
  return { title, alternates: { canonical }, openGraph: { title, url: canonical } }
}
export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}

import type { Metadata } from "next"
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const canonical = `${locale === "en" ? "" : `/${locale}`}/freelancers/${encodeURIComponent(id)}`
  const title = locale === "vi" ? "Hồ sơ người bán | TASCORA" : "Seller profile | TASCORA"
  return { title, alternates: { canonical }, openGraph: { title, url: canonical } }
}
export default function SellerProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}

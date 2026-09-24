import { redirect } from "@/i18n/routing"

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, locale } = await params
  redirect({
    href: `/services?category=${encodeURIComponent(slug)}`,
    locale: locale || "en",
  })
}

import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { getInitialCatalog } from "@/lib/catalog-server"
import ServicesClient from "./ServicesClient"

async function Catalog() {
  return <ServicesClient initialCatalog={await getInitialCatalog(true)} />
}

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  params: Promise<{ locale: string }>
}) {
  // Native GET submission has no application JS to reveal a streamed Suspense
  // boundary. Await the same anonymous catalog before rendering this fallback.
  // Normal client navigation retains its streaming/loading/error behavior.
  if ((await searchParams)._native === "1") {
    const { locale } = await params
    return (
      <>
        <noscript>
          <p className="premium-container py-4 text-sm text-text-secondary">
            {locale === "vi"
              ? "Bật JavaScript để dùng bộ lọc tương tác và lưu dịch vụ."
              : "Enable JavaScript to use interactive filters and saved services."}
          </p>
        </noscript>
        <ServicesClient initialCatalog={await getInitialCatalog(true)} streaming={false} />
      </>
    )
  }
  const t = await getTranslations("common")
  return (
    <Suspense
      fallback={
        <div
          className="premium-container min-h-screen p-12 text-center text-text-muted"
          role="status"
        >
          {t("loading")}
        </div>
      }
    >
      <Catalog />
    </Suspense>
  )
}

import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { getInitialCatalog } from "@/lib/catalog-server"
import ServicesClient from "./ServicesClient"

async function Catalog() {
  return <ServicesClient initialCatalog={await getInitialCatalog(true)} />
}

export default async function Page() {
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

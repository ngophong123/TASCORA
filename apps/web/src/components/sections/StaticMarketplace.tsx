import "server-only"
import { getTranslations } from "next-intl/server"
import { ArrowRight, ArrowUpRight, Compass, MessageSquare, PackageCheck } from "lucide-react"
import { Link } from "@/i18n/routing"

export async function WorkingSteps({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "premiumHome" })
  return (
    <section id="how-it-works" className="premium-section premium-container">
      <p className="premium-eyebrow mb-3">{t("howEyebrow")}</p>
      <h2 className="premium-title">{t("howTitle")}</h2>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {[Compass, MessageSquare, PackageCheck].map((Icon, index) => (
          <li key={index} className="border-t border-border-default pt-6">
            <div className="mb-6 flex items-center justify-between">
              <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
              <span className="font-mono text-xs text-text-muted">0{index + 1}</span>
            </div>
            <h3 className="text-xl font-medium tracking-tight">{t(`step${index + 1}Title`)}</h3>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              {t(`step${index + 1}Text`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export async function MarketplaceInvitation({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "premiumHome" })
  return (
    <section className="premium-section premium-container">
      <div className="grid gap-6 lg:grid-cols-2">
        <div id="for-freelancers" className="rounded-xl bg-[#e9e5f5] p-7 sm:p-10">
          <p className="premium-eyebrow mb-4">{t("sellerEyebrow")}</p>
          <h2 className="premium-title max-w-lg">{t("sellerTitle")}</h2>
          <p className="premium-body mt-5">{t("sellerText")}</p>
          <Link href="/register?role=seller" className="premium-link mt-6">
            {t("sellerCta")}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <div id="enterprise" className="premium-panel p-7 sm:p-10">
          <p className="premium-eyebrow mb-4">{t("businessEyebrow")}</p>
          <h2 className="premium-title max-w-lg">{t("businessTitle")}</h2>
          <p className="premium-body mt-5">{t("businessText")}</p>
          <Link href="/services" className="premium-link mt-6">
            {t("businessCta")}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider"
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar"
import { PageTransition } from "@/components/layout/PageTransition"
import "../globals.css"
import "../premium.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
  // Keep first-paint metrics stable when the font arrives late on slow links.
  // Preload is retained; a quickly available Geist still paints normally.
  display: "optional",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3200"
  const canonicalUrl = locale === "en" ? siteUrl : `${siteUrl}/${locale}`

  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim()),
    authors: [{ name: "TASCORA Inc." }],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: siteUrl,
        vi: `${siteUrl}/vi`,
        "x-default": siteUrl,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonicalUrl,
      siteName: "TASCORA",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate that the incoming locale is supported
  if (!routing.locales.includes(locale as "en" | "vi")) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Load all messages for the current locale
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ colorScheme: "light" }}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="premium-skip">
          {locale === "vi" ? "Đến nội dung chính" : "Skip to content"}
        </a>
        <NextIntlClientProvider messages={messages}>
          <NavigationProgressBar />
          <SmoothScrollProvider>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

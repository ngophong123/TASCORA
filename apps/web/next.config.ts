import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Public API configuration is baked into browser bundles during production builds.
if (process.env.NODE_ENV === "production") {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is required for production builds");
  const siteUrl = process.env.NEXT_PUBLIC_WEB_URL;
  if (!siteUrl) throw new Error("NEXT_PUBLIC_WEB_URL is required for production builds");
  const site = new URL(siteUrl);
  if (site.protocol !== "https:" || site.origin !== siteUrl || ["localhost", "127.0.0.1", "[::1]"].includes(site.hostname)) {
    throw new Error("NEXT_PUBLIC_WEB_URL must be an exact public HTTPS origin");
  }
  const url = new URL(apiUrl);
  if (url.protocol !== "https:" || url.origin !== apiUrl || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("NEXT_PUBLIC_API_URL must be an exact public HTTPS origin");
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

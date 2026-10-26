import type { NextConfig } from "next";
import { redirects } from "./lib/seo/redirects";

// Same rule as lib/seo/metadata.ts isIndexable(): Vercel previews stay noindex even if the env is mis-set.
const isProductionSite =
  process.env.NEXT_PUBLIC_SITE_ENV === "production" &&
  (process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
  // Old Shopify URLs -> new routes (SEO lane, lib/seo/redirects.ts).
  redirects,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          // noindex layer 2 of 3 (robots.ts + meta robots are the others). Removed only in production.
          ...(isProductionSite
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]),
        ],
      },
      { source: "/studio/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/:file(llms.txt|llms-full.txt)",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;

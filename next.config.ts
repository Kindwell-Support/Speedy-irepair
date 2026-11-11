import type { NextConfig } from "next";

/**
 * The production domain, as a host regex. Every other host (the *.vercel.app URLs, previews, localhost) gets a
 * noindex header, so only speedyirepair.com can show up in search.
 */
const PRODUCTION_HOST = "(www\\.)?speedyirepair\\.com";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Inlined at build time so the booking widget formats times in the same zone as the server (lib/repair-time.ts).
  env: { GHL_TIMEZONE: process.env.GHL_TIMEZONE ?? "" },
  async redirects() {
    // Old Shopify URLs (from speedyirepair.com/sitemap.xml + Shopify's default policy URLs, 2026-11-11). Product handles are unchanged.
    const shopify: [string, string][] = [
      ["/products/:handle", "/shop/:handle"],
      ["/collections/:path*", "/shop"],
      ["/collections", "/shop"],
      ["/cart", "/shop"],
      ["/pages/contact-us", "/contact"],
      ["/pages/faq", "/faq"],
      ["/pages/instant-quote", "/instant-quote"],
      ["/pages/sell-your-device", "/sell-your-device"],
      ["/pages/repair-pricing", "/services"],
      ["/pages/about-us", "/"],
      ["/pages/privacy-policy", "/policies/privacy"],
      ["/policies/privacy-policy", "/policies/privacy"],
      ["/pages/terms-conditions", "/policies/terms"],
      ["/policies/terms-of-service", "/policies/terms"],
      ["/pages/return-policy", "/policies/shipping-return"],
      ["/policies/refund-policy", "/policies/shipping-return"],
      ["/policies/shipping-policy", "/policies/shipping-return"],
      ["/blogs/:path*", "/blog"],
      ["/agents.md", "/llms.txt"],
    ];
    return [
      { source: "/schedule-repair", destination: "/repair", permanent: true },
      ...shopify.map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  // The availability data is read from disk at runtime (lib/internet-availability/check.ts), so ship it with these routes.
  outputFileTracingIncludes: {
    "/api/internet/availability": ["./data/internet-coverage.json"],
    "/api/forms/[type]": ["./data/internet-coverage.json"],
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // noindex by host (see PRODUCTION_HOST). Never on speedyirepair.com, whatever the env vars say.
      {
        source: "/:path*",
        missing: [{ type: "host", value: PRODUCTION_HOST }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
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

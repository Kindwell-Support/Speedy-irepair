import type { NextConfig } from "next";

const isProductionSite = process.env.NEXT_PUBLIC_SITE_ENV === "production";

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
    return [{ source: "/schedule-repair", destination: "/repair", permanent: true }];
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
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          // noindex layer 2 of 3 (robots.ts + meta robots are the others). Removed only in production.
          ...(isProductionSite ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]),
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

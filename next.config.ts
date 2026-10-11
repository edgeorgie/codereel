import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// Static export for GitHub Pages is opt-in; the default build targets a Node host such as Vercel.
const pages = process.env.DEPLOY_TARGET === "pages";

const nextConfig: NextConfig = {
  // Turbopack leaves an unset NEXT_PUBLIC_* as a runtime lookup, which keeps the
  // lazy posthog-js chunk in the build. A build-time "" makes the key check in
  // lib/analytics.ts constant, so without a key the SDK is dead code and absent.
  env: { NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "" },
  ...(pages
    ? { output: "export", trailingSlash: true, images: { unoptimized: true }, basePath: process.env.PAGES_BASE_PATH ?? "" }
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
        // Same-origin proxy for analytics (lib/analytics.ts): tracking blockers
        // filter by domain, and the browser never talks to a third party. Order
        // matters: static and array before the catch-all. Dormant until
        // NEXT_PUBLIC_POSTHOG_KEY is set, since nothing requests /ingest without it.
        // A static export cannot rewrite, so the Pages build points at PostHog directly.
        async rewrites() {
          return [
            { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
            { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
            { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
          ];
        },
        // PostHog endpoints end in "/" (e.g. /e/); Next's trailing-slash redirect would drop events.
        skipTrailingSlashRedirect: true,
      }),
};

export default nextConfig;

import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

function supabaseStorageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return [];

  try {
    const { hostname, protocol } = new URL(supabaseUrl);
    const normalizedProtocol = protocol.replace(":", "") as "https" | "http";
    return [
      {
        protocol: normalizedProtocol,
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: "tsconfig.build.json",
    ignoreBuildErrors: process.env.VERCEL === "1",
  },
  images: {
    remotePatterns: supabaseStorageRemotePatterns(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const sentryEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN);
const config = withBundleAnalyzer(nextConfig);

export default sentryEnabled
  ? withSentryConfig(config, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: false,
      tunnelRoute: "/monitoring",
      silent: !process.env.CI,
      sourcemaps: {
        disable: false,
      },
      disableLogger: true,
    })
  : config;

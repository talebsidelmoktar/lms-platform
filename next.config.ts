import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function isSupabaseServiceRoleKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  // Supabase keys are JWT-like strings.
  const parts = trimmed.split(".");
  if (parts.length < 2) return false;

  try {
    const payloadPart = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const json = Buffer.from(payloadPart, "base64").toString("utf8");
    const payload = JSON.parse(json) as { role?: unknown };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

if (isSupabaseServiceRoleKey(process.env.SUPABASE_ANON_KEY)) {
  throw new Error(
    "SUPABASE_ANON_KEY appears to be a service role key. Never expose a service role key to the client.",
  );
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
    ],
  },
  // Optimize for Vercel deployment
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // For image uploads
    },
  },
  // Transpile Sanity packages for proper build
  transpilePackages: [
    "next-sanity",
    "@sanity/vision",
    "@sanity/sdk",
    "@sanity/sdk-react",
    "sanity-plugin-mux-input",
  ],
  // Fix for Sanity schema imports during build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);

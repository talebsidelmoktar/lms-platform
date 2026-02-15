import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
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

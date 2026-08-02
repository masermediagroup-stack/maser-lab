import type { NextConfig } from "next";
import path from "path";

const repoRoot = path.join(process.cwd(), "..");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: repoRoot,
    resolveAlias: {
      "@projects": path.join(repoRoot, "projects"),
    },
  },
  outputFileTracingRoot: repoRoot,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@projects": path.join(repoRoot, "projects"),
    };
    return config;
  },
};

export default nextConfig;

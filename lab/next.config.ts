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
    rules: {
      "*.wgsl": {
        loaders: ["@vgpu/wgsl/loader-webpack"],
        as: "*.js",
      },
    },
  },
  outputFileTracingRoot: repoRoot,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@projects": path.join(repoRoot, "projects"),
    };
    const rules = config.module?.rules;
    if (Array.isArray(rules)) {
      rules.push({
        test: /\.wgsl$/,
        loader: "@vgpu/wgsl/loader-webpack",
      });
    }
    return config;
  },
};

export default nextConfig;

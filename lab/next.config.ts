import type { NextConfig } from "next";
import path from "path";

const repoRoot = path.join(process.cwd(), "..");

const emptyModule = path.join(process.cwd(), "src/lib/empty-module.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["onnxruntime-node", "sharp"],
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
      sharp: emptyModule,
      "onnxruntime-node": emptyModule,
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
      sharp: false,
      "onnxruntime-node": false,
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

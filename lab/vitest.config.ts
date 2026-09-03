import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/components/projects/display/maser-dither-engine/export/__tests__/**/*.test.ts",
      "src/components/projects/scroll/type-world/__tests__/**/*.test.ts",
      "src/components/projects/display/heatmap-poster/__tests__/**/*.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

/**
 * Sprint 8 — Dependency classification for transfers.
 */

import type {
  ExportDependencyManifest,
  ReactExportStrategy,
} from "./types";

export function buildDependencyManifest(
  strategy: ReactExportStrategy = "shared-runtime",
): ExportDependencyManifest {
  const dependencies: ExportDependencyManifest["dependencies"] = [
    {
      name: "react",
      version: "^19",
      classification: "required-runtime",
      reason: "Component and SurfaceCanvas are React client components.",
    },
    {
      name: "react-dom",
      version: "^19",
      classification: "required-runtime",
      reason: "Required peer for React 19 apps.",
    },
    {
      name: "WebGL2",
      classification: "required-runtime",
      reason:
        "Primary renderer. Canvas2D fallback exists for reduced capability.",
    },
  ];

  if (strategy === "shared-runtime") {
    dependencies.push({
      name: "@maser/dither-engine",
      version: "^0.8.0",
      classification: "required-runtime",
      reason:
        "Shared SurfaceCanvas + engine controllers. Do not duplicate the GLSL program.",
    });
  } else {
    dependencies.push({
      name: "engine/ + react/SurfaceCanvas + selected adapter",
      classification: "required-runtime",
      reason: "Standalone transfer copies only required runtime modules.",
    });
  }

  dependencies.push(
    {
      name: "three",
      classification: "maser-lab-only",
      reason: "Not used by Maser Dither Engine. Must not export.",
    },
    {
      name: "leva / demo-chrome / shell",
      classification: "maser-lab-only",
      reason: "Lab editor tooling — never include in production packages.",
    },
    {
      name: "typescript",
      classification: "development",
      reason: "Optional for typed hosts.",
    },
  );

  return { dependencies };
}

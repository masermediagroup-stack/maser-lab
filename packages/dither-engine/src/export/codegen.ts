/**
 * Sprint 8 — Code generation for runtime, React, CSS, shader, docs.
 */

import { ENGINE_NAME, ENGINE_VERSION, MONOCHROME_DEFAULTS } from "../constants";
import { DEFAULT_COMPONENT_CONTENT } from "../content/types";
import { DEFAULT_ANIMATION_CONFIG } from "../engine/animation";
import { DEFAULT_COLOR_MATERIAL } from "../engine/color";
import { DEFAULT_DITHER_CONFIG } from "../engine/dither";
import { DEFAULT_INTERACTION_CONFIG } from "../engine/interaction";
import { DEFAULT_LIGHT_SHAPE } from "../engine/lighting";
import { DEFAULT_MATERIAL_CONFIG } from "../engine/material";
import { getComponent } from "../components/registry";
import { omitDefaults, toPresetRuntime } from "./schema";
import { buildCssVariables, buildDesignTokens, buildTailwindMap } from "./tokens";
import { buildDependencyManifest } from "./dependencies";
import { generateTransferMarkdown } from "./transfer-doc";
import type {
  CodeFormat,
  Completeness,
  ExportOptions,
  GeneratedFile,
  MaserDitherExport,
  MaserDitherRuntimeConfig,
  PackageFileMap,
  ReactExportStrategy,
  ShaderSnapshot,
} from "./types";

const RUNTIME_IMPORT = "@maser/dither-engine";

const ADAPTER_EXPORT_NAMES: Record<string, string> = {
  card: "DitherCard",
  navigation: "DitherNavigation",
  button: "DitherButton",
  scrollbar: "DitherScrollbar",
  badge: "DitherBadge",
  avatar: "DitherAvatar",
  input: "DitherInput",
  "section-background": "DitherSectionBackground",
  "image-frame": "DitherImageFrame",
  "progress-bar": "DitherProgressBar",
  loader: "DitherLoader",
};

const COMPONENT_WRAPPER_NAMES: Record<string, string> = {
  card: "MaserDitherCard",
  navigation: "MaserDitherNavigation",
  button: "MaserDitherButton",
  scrollbar: "MaserDitherScrollbar",
  badge: "MaserDitherBadge",
  avatar: "MaserDitherAvatar",
  input: "MaserDitherInput",
  "section-background": "MaserDitherSectionBackground",
  "image-frame": "MaserDitherImageFrame",
  "progress-bar": "MaserDitherProgressBar",
  loader: "MaserDitherLoader",
};

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function runtimePayload(
  runtime: MaserDitherRuntimeConfig,
  completeness: Completeness,
): Record<string, unknown> {
  if (completeness === "complete") {
    return {
      componentId: runtime.componentId,
      params: runtime.params,
      animation: runtime.animation,
      interaction: runtime.interaction,
      color: runtime.color,
      light: runtime.light,
      dither: runtime.dither,
      material: runtime.material,
      content: runtime.content,
      sourceUrl: runtime.sourceUrl,
      sourceLightMix: runtime.sourceLightMix,
      basePresetId: runtime.basePresetId,
      accessibility: runtime.accessibility,
      ...(runtime.assets ? { assets: runtime.assets } : {}),
    };
  }

  return {
    componentId: runtime.componentId,
    params: omitDefaults(runtime.params, MONOCHROME_DEFAULTS),
    animation: omitDefaults(runtime.animation, DEFAULT_ANIMATION_CONFIG),
    interaction: omitDefaults(
      runtime.interaction,
      DEFAULT_INTERACTION_CONFIG,
    ),
    color: omitDefaults(runtime.color, DEFAULT_COLOR_MATERIAL),
    light: omitDefaults(runtime.light, DEFAULT_LIGHT_SHAPE),
    dither: omitDefaults(runtime.dither, DEFAULT_DITHER_CONFIG),
    material: omitDefaults(runtime.material, DEFAULT_MATERIAL_CONFIG),
    content: omitDefaults(runtime.content, DEFAULT_COMPONENT_CONTENT),
    ...(runtime.sourceUrl ? { sourceUrl: runtime.sourceUrl } : {}),
    sourceLightMix: runtime.sourceLightMix,
    basePresetId: runtime.basePresetId,
    accessibility: runtime.accessibility,
  };
}

export function generateRuntimeConfigCode(
  runtime: MaserDitherRuntimeConfig,
  format: CodeFormat = "typescript",
  completeness: Completeness = "minimal",
): string {
  const payload = runtimePayload(runtime, completeness);
  const json = pretty(payload);

  if (format === "json") {
    return json;
  }

  const isTs = format === "typescript";
  const typeImport = isTs
    ? `import type { MaserDitherRuntimeConfig } from "${RUNTIME_IMPORT}/export";\n\n`
    : "";
  const typeAnno = isTs ? ": MaserDitherRuntimeConfig" : "";

  return `${typeImport}// ${ENGINE_NAME} v${ENGINE_VERSION} — runtime configuration
// Import path: shared runtime barrel (no Lab editor)
export const materialConfig${typeAnno} = ${json} as const;
`;
}

export function generateProjectFile(doc: MaserDitherExport): string {
  return pretty({
    ...doc,
    kind: "project",
    schemaVersion: "2.0.0",
  });
}

export function generatePresetFile(
  doc: MaserDitherExport,
  includeComponentSettings: boolean,
): string {
  const runtime = toPresetRuntime(doc.runtime, includeComponentSettings);
  return pretty({
    schemaVersion: "2.0.0",
    engineVersion: doc.engineVersion || ENGINE_VERSION,
    kind: "preset",
    createdAt: new Date().toISOString(),
    runtime,
  });
}

export function generateReactComponentCode(
  runtime: MaserDitherRuntimeConfig,
  strategy: ReactExportStrategy = "shared-runtime",
  completeness: Completeness = "minimal",
): string {
  const adapter = ADAPTER_EXPORT_NAMES[runtime.componentId] ?? "DitherCard";
  const wrapper =
    COMPONENT_WRAPPER_NAMES[runtime.componentId] ?? "MaserDitherCard";
  const def = getComponent(runtime.componentId);
  const config = runtimePayload(runtime, completeness);
  const reduced =
    runtime.accessibility.reducedMotionPolicy === "force-reduce"
      ? "true"
      : runtime.accessibility.reducedMotionPolicy === "ignore"
        ? "false"
        : "undefined";

  if (strategy === "standalone") {
    return `/**
 * ${wrapper} — standalone transfer sketch
 * ${ENGINE_NAME} v${ENGINE_VERSION}
 *
 * Standalone strategy: copy the runtime modules listed in the package
 * dependency manifest (engine/, react/SurfaceCanvas, selected adapter).
 * Prefer Shared Runtime when the host already includes the dither engine.
 */
"use client";

import { ${adapter} } from "./adapters/${adapter}";
import type { ComponentContent } from "./content/types";
import config from "./config/material-config.json";

export type ${wrapper}Props = {
  className?: string;
  content?: Partial<ComponentContent>;
  reducedMotion?: boolean;
  src?: string | null;
  alt?: string;
};

export function ${wrapper}({
  className,
  content,
  reducedMotion = ${reduced === "undefined" ? "false" : reduced},
  src,
  alt,
}: ${wrapper}Props) {
  return (
    <${adapter}
      className={className}
      params={config.params}
      animation={config.animation}
      interaction={config.interaction}
      color={config.color}
      light={config.light}
      dither={config.dither}
      material={config.material}
      content={{ ...config.content, ...content${
        runtime.componentId === "image-frame"
          ? ', ...(alt ? { imageCaption: alt } : {})'
          : ""
      } }}
      sourceUrl={src ?? config.sourceUrl}
      sourceLightMix={config.sourceLightMix}
      reducedMotion={reducedMotion}
      aria-label={alt ?? ${JSON.stringify(def?.label ?? "Dither surface")}}
    />
  );
}
`;
  }

  return `/**
 * ${wrapper} — shared runtime export
 * ${ENGINE_NAME} v${ENGINE_VERSION} — ${def?.label ?? runtime.componentId}
 *
 * Shared Runtime: imports the portable engine package already in the host app.
 * Cleanup is handled by SurfaceCanvas on unmount. No Lab editor imports.
 */
"use client";

import {
  ${adapter},
  type ComponentContent,
} from "${RUNTIME_IMPORT}";

const config = ${pretty(config)};

export type ${wrapper}Props = {
  className?: string;
  content?: Partial<ComponentContent>;
  reducedMotion?: boolean;
  /** Image Frame / Avatar source override (public path). */
  src?: string | null;
  alt?: string;
};

export function ${wrapper}({
  className,
  content,
  reducedMotion,
  src,
  alt,
}: ${wrapper}Props) {
  const honorReduced =
    reducedMotion ??
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  return (
    <${adapter}
      className={className}
      params={config.params}
      animation={config.animation}
      interaction={config.interaction}
      color={config.color}
      light={config.light}
      dither={config.dither}
      material={config.material}
      content={{
        ...config.content,
        ...content,
        ${
          runtime.componentId === "image-frame"
            ? "...(alt ? { imageCaption: alt } : {}),"
            : ""
        }
      }}
      sourceUrl={src ?? config.sourceUrl}
      sourceLightMix={config.sourceLightMix}
      reducedMotion={${
        runtime.accessibility.reducedMotionPolicy === "force-reduce"
          ? "true"
          : runtime.accessibility.reducedMotionPolicy === "ignore"
            ? "false"
            : "honorReduced"
      }}
      aria-label={alt ?? ${JSON.stringify(
        runtime.accessibility.ariaLabel ?? def?.label ?? "Dither surface",
      )}}
    />
  );
}
`;
}

export function buildShaderSnapshot(
  runtime: MaserDitherRuntimeConfig,
): ShaderSnapshot {
  return {
    advanced: true,
    materialId: runtime.material.materialId,
    ditherAlgorithm: runtime.dither.algorithm,
    matrixSize: runtime.dither.matrixSize ?? runtime.params.ditherSize,
    animationMode: runtime.animation.modeId,
    interactionMode: runtime.interaction.modeId,
    performanceTier: runtime.material.lowQuality ? "mobile-low" : "standard",
    uniforms: {
      contrast: runtime.params.contrast,
      brightness: runtime.params.brightness,
      bloom: runtime.params.bloom,
      grainAmount: runtime.params.grainAmount,
      posterization: runtime.params.posterization,
      opacity: runtime.params.opacity,
      sourceLightMix: runtime.sourceLightMix,
      materialId: runtime.material.materialId,
      ditherAlgorithm: runtime.dither.algorithm,
    },
    requiredGlslChunks: [
      "VERT_SRC (gl_VertexID fullscreen triangle)",
      "SAMPLE_GLSL (sampleBayer, sampleBlue, uPosterization)",
      "ANIM_GLSL",
      "INTERACTION_GLSL",
      "LIGHT_GLSL",
      "MATERIAL_GLSL",
      "DITHER_GLSL",
      "COLOR_GLSL",
    ],
    notes:
      "Do not export orphan fragment shaders. Use the shared SurfaceRenderer program in engine/pipeline/stages.ts. Uniform snapshot is for documentation / advanced tooling — not a standalone GLSL program.",
  };
}

export function generateShaderSnapshotCode(
  runtime: MaserDitherRuntimeConfig,
  format: CodeFormat = "json",
): string {
  const snap = buildShaderSnapshot(runtime);
  const json = pretty(snap);
  if (format === "json") return json;
  return `// Advanced shader configuration — ${ENGINE_NAME} v${ENGINE_VERSION}
export const shaderSnapshot = ${json} as const;
`;
}

export function generateCssTokensCode(
  runtime: MaserDitherRuntimeConfig,
  format: CodeFormat = "css",
): string {
  if (format === "json") {
    return pretty(buildDesignTokens(runtime));
  }
  if (format === "typescript") {
    const tokens = buildDesignTokens(runtime);
    return `export const mdeTokens = ${pretty(tokens)} as const;\n\nexport const mdeTailwindMap = ${pretty(buildTailwindMap())} as const;\n`;
  }
  const vars = buildCssVariables(runtime);
  const lines = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `/* ${ENGINE_NAME} CSS variables — only CSS-safe presentation tokens */
/* Shader uniforms (dither matrix, material pack, etc.) stay in TypeScript config */
:root {\n${lines}\n}\n`;
}

export function buildComponentPackage(
  doc: MaserDitherExport,
  options: Pick<
    ExportOptions,
    | "reactStrategy"
    | "completeness"
    | "includeDocumentation"
    | "fileName"
  > = {},
): PackageFileMap {
  const runtime = doc.runtime;
  const strategy = options.reactStrategy ?? "shared-runtime";
  const completeness = options.completeness ?? "minimal";
  const wrapper =
    COMPONENT_WRAPPER_NAMES[runtime.componentId] ?? "MaserDitherComponent";
  const slug = (options.fileName || wrapper)
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const configJson = pretty(runtimePayload(runtime, completeness));
  const componentCode = generateReactComponentCode(
    runtime,
    strategy,
    completeness,
  );
  const css = generateCssTokensCode(runtime, "css");
  const deps = buildDependencyManifest(strategy);
  const files: GeneratedFile[] = [
    {
      path: `components/${wrapper}.tsx`,
      content: componentCode,
      language: "tsx",
    },
    {
      path: "config/material-config.ts",
      content: generateRuntimeConfigCode(runtime, "typescript", completeness),
      language: "ts",
    },
    {
      path: "config/material-config.json",
      content: configJson,
      language: "json",
    },
    {
      path: "styles/maser-dither.css",
      content: css,
      language: "css",
    },
    {
      path: "types/index.ts",
      content: `export type { MaserDitherRuntimeConfig } from "../config/material-config";\n`,
      language: "ts",
    },
    {
      path: "package.json",
      content: pretty({
        name: slug || "maser-dither-component",
        version: "0.8.0",
        peerDependencies: {
          react: "^19",
          "react-dom": "^19",
        },
        dependencies:
          strategy === "shared-runtime"
            ? { "@maser/dither-engine": "^0.8.0" }
            : undefined,
        description: `${ENGINE_NAME} transferred component (${runtime.componentId})`,
        private: true,
      }),
      language: "json",
    },
  ];

  if (options.includeDocumentation !== false) {
    files.push({
      path: "TRANSFER.md",
      content: generateTransferMarkdown(doc, { strategy, completeness }),
      language: "md",
    });
    files.push({
      path: "README.md",
      content: `# ${wrapper}\n\nTransferred from ${ENGINE_NAME} v${ENGINE_VERSION}.\n\nSee TRANSFER.md for installation and usage.\n`,
      language: "md",
    });
  }

  if (strategy === "standalone") {
    files.push({
      path: "engine/README.md",
      content: `# Runtime modules to copy\n\nCopy from the lab package:\n\n- \`engine/\` (core, pipeline, animation, interaction, lighting, color, dither, material, fallback)\n- \`react/SurfaceCanvas.tsx\`\n- \`components/adapters/${ADAPTER_EXPORT_NAMES[runtime.componentId]}.tsx\`\n- \`content/types.ts\`\n- \`tokens.css\` (if using adapter styles)\n\nDo **not** copy \`shell/\`, \`projects/\`, or Lab demo chrome.\n`,
      language: "md",
    });
  }

  const estimatedBytes = files.reduce(
    (sum, f) => sum + f.content.length,
    0,
  );

  return {
    name: slug || "maser-dither-component",
    files,
    dependencies: deps,
    estimatedBytes,
  };
}

export function generateExportOutput(
  doc: MaserDitherExport,
  options: ExportOptions,
): { code: string; files?: PackageFileMap; filename: string; language: string } {
  const completeness = options.completeness ?? "minimal";
  const format = options.format ?? "typescript";
  const runtime = doc.runtime;
  const baseName =
    options.fileName ||
    (doc.project?.name || runtime.componentId)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  switch (options.mode) {
    case "project-file":
      return {
        code: generateProjectFile(doc),
        filename: `${baseName}.maser-dither.json`,
        language: "json",
      };
    case "preset-file":
      return {
        code: generatePresetFile(doc, Boolean(options.includeComponentSettings)),
        filename: `${baseName}.maser-preset.json`,
        language: "json",
      };
    case "runtime-config":
      return {
        code: generateRuntimeConfigCode(runtime, format, completeness),
        filename: `${baseName}.config.${format === "json" ? "json" : format === "javascript" ? "js" : "ts"}`,
        language: format === "json" ? "json" : format === "javascript" ? "js" : "ts",
      };
    case "react-component":
      return {
        code: generateReactComponentCode(
          runtime,
          options.reactStrategy ?? "shared-runtime",
          completeness,
        ),
        filename: `${COMPONENT_WRAPPER_NAMES[runtime.componentId] ?? "MaserDitherComponent"}.tsx`,
        language: "tsx",
      };
    case "component-package": {
      const pkg = buildComponentPackage(doc, options);
      return {
        code: pkg.files.map((f) => `// —— ${f.path} ——\n${f.content}`).join("\n\n"),
        files: pkg,
        filename: `${pkg.name}.package.json`,
        language: "txt",
      };
    }
    case "css-tokens":
      return {
        code: generateCssTokensCode(runtime, format === "json" ? "json" : format === "typescript" ? "typescript" : "css"),
        filename: `${baseName}.tokens.${format === "json" ? "json" : format === "typescript" ? "ts" : "css"}`,
        language: format === "json" ? "json" : format === "typescript" ? "ts" : "css",
      };
    case "shader-snapshot":
      return {
        code: generateShaderSnapshotCode(runtime, format === "typescript" ? "typescript" : "json"),
        filename: `${baseName}.shader.json`,
        language: "json",
      };
    case "shareable-scene":
      return {
        code: pretty({
          ...doc,
          kind: "scene",
          schemaVersion: "2.0.0",
          project: doc.project
            ? {
                name: doc.project.name,
                description: doc.project.description,
                notes: doc.project.notes,
              }
            : undefined,
        }),
        filename: `${baseName}.maser-scene.json`,
        language: "json",
      };
    case "transfer-docs":
      return {
        code: generateTransferMarkdown(doc, {
          strategy: options.reactStrategy ?? "shared-runtime",
          completeness,
        }),
        filename: "TRANSFER.md",
        language: "md",
      };
    default:
      return {
        code: generateRuntimeConfigCode(runtime, "typescript", completeness),
        filename: `${baseName}.config.ts`,
        language: "ts",
      };
  }
}

/** Back-compat for docs/content.ts callers — full multi-domain export. */
export function generateExportCode(
  componentLabel: string,
  runtime: MaserDitherRuntimeConfig,
): string {
  void componentLabel;
  return generateReactComponentCode(runtime, "shared-runtime", "minimal");
}

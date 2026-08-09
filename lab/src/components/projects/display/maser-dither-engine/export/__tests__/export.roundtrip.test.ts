import { describe, expect, it } from "vitest";
import { MONOCHROME_DEFAULTS } from "../../constants";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { DEFAULT_ANIMATION_CONFIG } from "../../engine/animation";
import { DEFAULT_COLOR_MATERIAL } from "../../engine/color";
import { DEFAULT_DITHER_CONFIG } from "../../engine/dither";
import { DEFAULT_INTERACTION_CONFIG } from "../../engine/interaction";
import { DEFAULT_LIGHT_SHAPE } from "../../engine/lighting";
import { DEFAULT_MATERIAL_CONFIG } from "../../engine/material";
import {
  buildCssVariables,
  buildRuntimeConfig,
  createExportDoc,
  generateExportOutput,
  generatePresetFile,
  generateProjectFile,
  generateReactComponentCode,
  migrateToExportDoc,
  parseAndMigrateImport,
  sanitizeContentAssets,
  sanitizeJsonObject,
  snapshotFromRuntime,
  validateExportDoc,
  validateGeneratedPackage,
  buildComponentPackage,
  EXPORT_SCHEMA_VERSION,
} from "../index";

function sampleRuntime() {
  return buildRuntimeConfig({
    componentId: "card",
    params: { ...MONOCHROME_DEFAULTS, contrast: 1.4 },
    animation: { ...DEFAULT_ANIMATION_CONFIG },
    interaction: { ...DEFAULT_INTERACTION_CONFIG },
    color: { ...DEFAULT_COLOR_MATERIAL },
    light: { ...DEFAULT_LIGHT_SHAPE },
    dither: { ...DEFAULT_DITHER_CONFIG },
    material: { ...DEFAULT_MATERIAL_CONFIG },
    content: {
      ...DEFAULT_COMPONENT_CONTENT,
      cardTitle: "Round trip",
      buttonLabel: "Go",
    },
    sourceUrl: "/images/demo.jpg",
    sourceLightMix: 0.4,
    basePresetId: "custom",
  });
}

describe("export schema", () => {
  it("stamps schema 2.0.0", () => {
    const doc = createExportDoc({ kind: "runtime", runtime: sampleRuntime() });
    expect(doc.schemaVersion).toBe(EXPORT_SCHEMA_VERSION);
    expect(doc.runtime.accessibility.reducedMotionPolicy).toBe("honor");
  });

  it("validates a healthy runtime as ready or warning", () => {
    const doc = createExportDoc({ kind: "runtime", runtime: sampleRuntime() });
    const result = validateExportDoc(doc);
    expect(result.status).not.toBe("blocked");
  });

  it("blocks blob source URLs", () => {
    const runtime = sampleRuntime();
    runtime.sourceUrl = "blob:http://localhost/abc";
    const result = validateExportDoc(
      createExportDoc({ kind: "runtime", runtime }),
    );
    expect(result.status).toBe("blocked");
    expect(result.issues.some((i) => i.code === "blob-source")).toBe(true);
  });

  it("blocks missing button labels", () => {
    const runtime = sampleRuntime();
    runtime.componentId = "button";
    runtime.content.buttonLabel = "";
    const result = validateExportDoc(
      createExportDoc({ kind: "runtime", runtime }),
    );
    expect(result.status).toBe("blocked");
  });
});

describe("migration", () => {
  it("migrates v1 snapshot envelope", () => {
    const runtime = sampleRuntime();
    const snapshot = snapshotFromRuntime(runtime);
    const { exportDoc, migrated, notes } = migrateToExportDoc({
      ...snapshot,
      schemaVersion: 1,
    });
    expect(exportDoc.schemaVersion).toBe("2.0.0");
    expect(exportDoc.runtime.componentId).toBe("card");
    expect(exportDoc.runtime.params.contrast).toBe(1.4);
    expect(migrated || notes.length >= 0).toBe(true);
  });

  it("migrates legacy ProjectRecord", () => {
    const runtime = sampleRuntime();
    const raw = JSON.stringify({
      id: "user-old",
      origin: "user",
      name: "Legacy Look",
      description: "desc",
      notes: "",
      tags: ["a"],
      colorLabel: "blue",
      favorite: false,
      materialId: "paper",
      thumbnailDataUrl: null,
      createdAt: 1,
      updatedAt: 2,
      snapshot: snapshotFromRuntime(runtime),
      readOnly: false,
    });
    const summary = parseAndMigrateImport(raw, "project");
    expect(summary.exportDoc.project?.name).toBe("Legacy Look");
    expect(summary.exportDoc.runtime.componentId).toBe("card");
    expect(summary.validation.status).not.toBe("blocked");
  });

  it("maps hero-background to section-background", () => {
    const { exportDoc, notes } = migrateToExportDoc({
      schemaVersion: 1,
      componentId: "hero-background",
      params: MONOCHROME_DEFAULTS,
      animation: DEFAULT_ANIMATION_CONFIG,
      interaction: DEFAULT_INTERACTION_CONFIG,
      color: DEFAULT_COLOR_MATERIAL,
      light: DEFAULT_LIGHT_SHAPE,
      dither: DEFAULT_DITHER_CONFIG,
      material: DEFAULT_MATERIAL_CONFIG,
      content: DEFAULT_COMPONENT_CONTENT,
      sourceUrl: null,
      sourceLightMix: 0.45,
      basePresetId: "custom",
    });
    expect(exportDoc.runtime.componentId).toBe("section-background");
    expect(notes.some((n) => n.includes("hero-background"))).toBe(true);
  });

  it("rejects prototype pollution keys", () => {
    const cleaned = sanitizeJsonObject({
      schemaVersion: "2.0.0",
      __proto__: { polluted: true },
      constructor: { evil: true },
      runtime: { componentId: "card" },
    }) as Record<string, unknown>;
    expect(cleaned.__proto__).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(cleaned, "__proto__")).toBe(
      false,
    );
  });

  it("rejects invalid JSON size via parse", () => {
    expect(() => parseAndMigrateImport("{not json")).toThrow(/Invalid JSON/);
  });
});

describe("round-trip", () => {
  it("project export → import preserves material and content", () => {
    const runtime = sampleRuntime();
    const doc = createExportDoc({
      kind: "project",
      runtime,
      project: {
        name: "Trip",
        description: "",
        notes: "",
        tags: [],
        colorLabel: "none",
        favorite: false,
        thumbnailDataUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    const json = generateProjectFile(doc);
    const summary = parseAndMigrateImport(json, "project");
    expect(summary.exportDoc.runtime.material.materialId).toBe(
      runtime.material.materialId,
    );
    expect(summary.exportDoc.runtime.content.cardTitle).toBe("Round trip");
    expect(summary.exportDoc.runtime.params.contrast).toBe(1.4);
  });

  it("preset export strips content unless toggled", () => {
    const runtime = sampleRuntime();
    const doc = createExportDoc({ kind: "preset", runtime });
    const withContent = JSON.parse(
      generatePresetFile(doc, true),
    ) as { runtime: { content: { cardTitle: string } } };
    const without = JSON.parse(
      generatePresetFile(doc, false),
    ) as { runtime: { content: { cardTitle: string }; sourceUrl: string | null } };
    expect(withContent.runtime.content.cardTitle).toBe("Round trip");
    expect(without.runtime.content.cardTitle).toBe(
      DEFAULT_COMPONENT_CONTENT.cardTitle,
    );
    expect(without.runtime.sourceUrl).toBeNull();
  });
});

describe("codegen", () => {
  it("generates typed React shared-runtime component without shell imports", () => {
    const code = generateReactComponentCode(sampleRuntime(), "shared-runtime");
    expect(code).toContain("MaserDitherCard");
    expect(code).not.toContain("DitherEngineApp");
    expect(code).not.toContain("/shell/");
    expect(code).toContain("reducedMotion");
  });

  it("builds CSS variables for safe tokens", () => {
    const vars = buildCssVariables(sampleRuntime());
    expect(vars["--mde-contrast"]).toBeDefined();
    expect(vars["--mde-background"]).toMatch(/^#/);
  });

  it("package has no editor imports", () => {
    const pkg = buildComponentPackage(
      createExportDoc({ kind: "runtime", runtime: sampleRuntime() }),
    );
    const validation = validateGeneratedPackage(pkg);
    expect(validation.status).not.toBe("blocked");
    for (const file of pkg.files) {
      if (file.path.endsWith(".md")) continue;
      expect(file.content).not.toMatch(/\bfrom\s+["'][^"']*\/shell/);
      expect(file.content).not.toMatch(/\bimport\s*\(\s*["'][^"']*shell/);
      expect(file.content).not.toMatch(/\bDitherEngineApp\b/);
    }
  });

  it("export output modes produce filenames", () => {
    const doc = createExportDoc({ kind: "runtime", runtime: sampleRuntime() });
    const modes = [
      "project-file",
      "preset-file",
      "runtime-config",
      "react-component",
      "css-tokens",
      "shader-snapshot",
      "shareable-scene",
      "transfer-docs",
    ] as const;
    for (const mode of modes) {
      const out = generateExportOutput(doc, { mode });
      expect(out.filename.length).toBeGreaterThan(3);
      expect(out.code.length).toBeGreaterThan(10);
    }
  });
});

describe("assets", () => {
  it("strips blob CTA urls from content", () => {
    const content = sanitizeContentAssets({
      ...DEFAULT_COMPONENT_CONTENT,
      cardCtaSourceUrl: "blob:http://localhost/x",
    });
    expect(content.cardCtaSourceUrl).toBeNull();
  });
});

describe("runtime/editor boundary", () => {
  it("export module source files do not import shell", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const root = path.resolve(
      __dirname,
      "..",
    );
    const files = fs
      .readdirSync(root)
      .filter((f) => f.endsWith(".ts") && !f.includes("__tests__"));
    for (const file of files) {
      const text = fs.readFileSync(path.join(root, file), "utf8");
      expect(text).not.toMatch(/\bfrom\s+["'][^"']*\/shell[/_"']/);
    }
  });
});

/**
 * Sprint 8 — Deterministic migration for older project / snapshot / export docs.
 */

import { ENGINE_VERSION } from "../constants";
import { DEFAULT_COMPONENT_CONTENT } from "../content/types";
import { DEFAULT_ANIMATION_CONFIG } from "../engine/animation";
import { DEFAULT_COLOR_MATERIAL } from "../engine/color";
import { DEFAULT_DITHER_CONFIG, migrateParamsBlob } from "../engine/dither";
import { DEFAULT_INTERACTION_CONFIG } from "../engine/interaction";
import { DEFAULT_LIGHT_SHAPE } from "../engine/lighting";
import { DEFAULT_MATERIAL_CONFIG } from "../engine/material";
import { MONOCHROME_DEFAULTS } from "../constants";
import type { ProjectRecord, ProjectSnapshot } from "../projects/types";
import {
  buildRuntimeConfig,
  createExportDoc,
  normalizeComponentId,
  projectMetaFromRecord,
  runtimeFromSnapshot,
} from "./schema";
import type {
  ImportSummary,
  MaserDitherExport,
  MaserDitherRuntimeConfig,
} from "./types";
import { EXPORT_SCHEMA_VERSION } from "./types";
import { validateExportDoc } from "./validate";
import { sanitizeContentAssets, sanitizeSourceUrl } from "./assets";

export type MigrationResult = {
  exportDoc: MaserDitherExport;
  migrated: boolean;
  notes: string[];
  unmigratable: string[];
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Strip prototype pollution keys. */
export function sanitizeJsonObject(
  input: unknown,
  depth = 0,
): unknown {
  if (depth > 32) return null;
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeJsonObject(item, depth + 1));
  }
  if (!isPlainObject(input)) return input;
  const out: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(input)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    out[key] = sanitizeJsonObject(value, depth + 1);
  }
  return out;
}

function coerceSnapshot(raw: Record<string, unknown>): ProjectSnapshot {
  const paramsRaw = isPlainObject(raw.params) ? raw.params : {};
  const migrated = migrateParamsBlob({
    ...MONOCHROME_DEFAULTS,
    ...paramsRaw,
  });

  const contentRaw = isPlainObject(raw.content) ? raw.content : {};
  const content = sanitizeContentAssets({
    ...DEFAULT_COMPONENT_CONTENT,
    ...(contentRaw as Partial<typeof DEFAULT_COMPONENT_CONTENT>),
    navItems: Array.isArray(contentRaw.navItems)
      ? (contentRaw.navItems as string[])
      : [...DEFAULT_COMPONENT_CONTENT.navItems],
  });

  return {
    schemaVersion: 1,
    componentId: normalizeComponentId(String(raw.componentId ?? "card")),
    params: {
      ...MONOCHROME_DEFAULTS,
      ...migrated.params,
    },
    animation: {
      ...DEFAULT_ANIMATION_CONFIG,
      ...(isPlainObject(raw.animation) ? raw.animation : {}),
    } as ProjectSnapshot["animation"],
    interaction: {
      ...DEFAULT_INTERACTION_CONFIG,
      ...(isPlainObject(raw.interaction) ? raw.interaction : {}),
      ...(migrated.interactionPatch ?? {}),
    } as ProjectSnapshot["interaction"],
    color: {
      ...DEFAULT_COLOR_MATERIAL,
      ...(isPlainObject(raw.color) ? raw.color : {}),
    } as ProjectSnapshot["color"],
    light: {
      ...DEFAULT_LIGHT_SHAPE,
      ...(isPlainObject(raw.light) ? raw.light : {}),
    } as ProjectSnapshot["light"],
    dither: {
      ...DEFAULT_DITHER_CONFIG,
      ...(isPlainObject(raw.dither) ? raw.dither : {}),
      ...migrated.dither,
    } as ProjectSnapshot["dither"],
    material: {
      ...DEFAULT_MATERIAL_CONFIG,
      ...(isPlainObject(raw.material) ? raw.material : {}),
    } as ProjectSnapshot["material"],
    content,
    sourceUrl: sanitizeSourceUrl(
      typeof raw.sourceUrl === "string" ? raw.sourceUrl : null,
    ),
    sourceLightMix:
      typeof raw.sourceLightMix === "number" ? raw.sourceLightMix : 0.45,
    basePresetId:
      typeof raw.basePresetId === "string" ? raw.basePresetId : "custom",
  };
}

export function migrateV1SnapshotToRuntime(
  snapshot: ProjectSnapshot | Record<string, unknown>,
): { runtime: MaserDitherRuntimeConfig; notes: string[]; unmigratable: string[] } {
  const notes: string[] = [];
  const unmigratable: string[] = [];
  const raw = snapshot as Record<string, unknown>;
  const coerced = coerceSnapshot(isPlainObject(raw) ? raw : {});

  if ((raw.componentId as string) === "hero-background") {
    notes.push("Mapped hero-background → section-background");
  }
  if (typeof raw.sourceUrl === "string" && raw.sourceUrl.startsWith("blob:")) {
    notes.push("Dropped non-portable blob: sourceUrl");
  }
  const content = raw.content as Record<string, unknown> | undefined;
  if (
    content &&
    typeof content.cardCtaSourceUrl === "string" &&
    content.cardCtaSourceUrl.startsWith("blob:")
  ) {
    notes.push("Dropped non-portable blob: cardCtaSourceUrl");
  }

  return {
    runtime: runtimeFromSnapshot(coerced),
    notes,
    unmigratable,
  };
}

export function migrateToExportDoc(
  input: unknown,
  preferredKind?: MaserDitherExport["kind"],
): MigrationResult {
  const notes: string[] = [];
  const unmigratable: string[] = [];
  const clean = sanitizeJsonObject(input);

  if (!isPlainObject(clean)) {
    throw new Error("Import must be a JSON object.");
  }

  // Already v2 export envelope
  if (
    clean.schemaVersion === EXPORT_SCHEMA_VERSION ||
    clean.schemaVersion === "2.0.0"
  ) {
    if (!isPlainObject(clean.runtime)) {
      throw new Error("Export document missing runtime.");
    }
    const { runtime, notes: n, unmigratable: u } = migrateV1SnapshotToRuntime(
      clean.runtime,
    );
    notes.push(...n);
    unmigratable.push(...u);
    const kind =
      (clean.kind as MaserDitherExport["kind"]) || preferredKind || "runtime";
    return {
      exportDoc: createExportDoc({
        kind,
        runtime,
        project: isPlainObject(clean.project)
          ? (clean.project as MaserDitherExport["project"])
          : undefined,
        engineVersion:
          typeof clean.engineVersion === "string"
            ? clean.engineVersion
            : ENGINE_VERSION,
      }),
      migrated: n.length > 0,
      notes: notes.length ? notes : ["Already on schema 2.0.0"],
      unmigratable,
    };
  }

  // Legacy ProjectRecord (.mde.json)
  if (isPlainObject(clean.snapshot) && typeof clean.name === "string") {
    const { runtime, notes: n, unmigratable: u } = migrateV1SnapshotToRuntime(
      clean.snapshot,
    );
    notes.push("Migrated legacy ProjectRecord → schema 2.0.0 project export");
    notes.push(...n);
    unmigratable.push(...u);
    const record = clean as unknown as ProjectRecord;
    return {
      exportDoc: createExportDoc({
        kind: preferredKind || "project",
        runtime,
        project: projectMetaFromRecord({
          ...record,
          id: typeof clean.id === "string" ? clean.id : "imported",
          origin: "user",
          readOnly: false,
          description: String(clean.description ?? ""),
          notes: String(clean.notes ?? ""),
          tags: Array.isArray(clean.tags) ? (clean.tags as string[]) : [],
          colorLabel: (clean.colorLabel as ProjectRecord["colorLabel"]) || "none",
          favorite: Boolean(clean.favorite),
          materialId: runtime.material.materialId,
          thumbnailDataUrl:
            typeof clean.thumbnailDataUrl === "string"
              ? clean.thumbnailDataUrl
              : null,
          createdAt:
            typeof clean.createdAt === "number" ? clean.createdAt : Date.now(),
          updatedAt:
            typeof clean.updatedAt === "number" ? clean.updatedAt : Date.now(),
          snapshot: runtime as unknown as ProjectSnapshot,
        }),
      }),
      migrated: true,
      notes,
      unmigratable,
    };
  }

  // Legacy ProjectSnapshot or clipboard mde-project bundle
  const snapshotSource = isPlainObject(clean.snapshot)
    ? clean.snapshot
    : clean;
  if (
    isPlainObject(snapshotSource) &&
    (snapshotSource.params || snapshotSource.componentId || snapshotSource.material)
  ) {
    const { runtime, notes: n, unmigratable: u } =
      migrateV1SnapshotToRuntime(snapshotSource);
    notes.push("Migrated schema v1 snapshot → 2.0.0");
    notes.push(...n);
    unmigratable.push(...u);
    return {
      exportDoc: createExportDoc({
        kind: preferredKind || "runtime",
        runtime,
      }),
      migrated: true,
      notes,
      unmigratable,
    };
  }

  // Partial runtime-ish object
  if (clean.params || clean.material || clean.color) {
    const runtime = buildRuntimeConfig({
      componentId: normalizeComponentId(String(clean.componentId ?? "card")),
      params: {
        ...MONOCHROME_DEFAULTS,
        ...(isPlainObject(clean.params) ? clean.params : {}),
      } as MaserDitherRuntimeConfig["params"],
      animation: {
        ...DEFAULT_ANIMATION_CONFIG,
        ...(isPlainObject(clean.animation) ? clean.animation : {}),
      } as MaserDitherRuntimeConfig["animation"],
      interaction: {
        ...DEFAULT_INTERACTION_CONFIG,
        ...(isPlainObject(clean.interaction) ? clean.interaction : {}),
      } as MaserDitherRuntimeConfig["interaction"],
      color: {
        ...DEFAULT_COLOR_MATERIAL,
        ...(isPlainObject(clean.color) ? clean.color : {}),
      } as MaserDitherRuntimeConfig["color"],
      light: {
        ...DEFAULT_LIGHT_SHAPE,
        ...(isPlainObject(clean.light) ? clean.light : {}),
      } as MaserDitherRuntimeConfig["light"],
      dither: {
        ...DEFAULT_DITHER_CONFIG,
        ...(isPlainObject(clean.dither) ? clean.dither : {}),
      } as MaserDitherRuntimeConfig["dither"],
      material: {
        ...DEFAULT_MATERIAL_CONFIG,
        ...(isPlainObject(clean.material) ? clean.material : {}),
      } as MaserDitherRuntimeConfig["material"],
      content: {
        ...DEFAULT_COMPONENT_CONTENT,
        ...(isPlainObject(clean.content) ? clean.content : {}),
      } as MaserDitherRuntimeConfig["content"],
      sourceUrl: sanitizeSourceUrl(
        typeof clean.sourceUrl === "string" ? clean.sourceUrl : null,
      ),
      sourceLightMix:
        typeof clean.sourceLightMix === "number" ? clean.sourceLightMix : 0.45,
      basePresetId:
        typeof clean.basePresetId === "string" ? clean.basePresetId : "custom",
    });
    notes.push("Coerced partial config → schema 2.0.0 runtime");
    return {
      exportDoc: createExportDoc({
        kind: preferredKind || "runtime",
        runtime,
      }),
      migrated: true,
      notes,
      unmigratable,
    };
  }

  throw new Error("Unrecognized Maser Dither export / project format.");
}

const MAX_IMPORT_BYTES = 8 * 1024 * 1024; // 8MB

export function parseAndMigrateImport(
  raw: string,
  preferredKind?: MaserDitherExport["kind"],
): ImportSummary {
  if (raw.length > MAX_IMPORT_BYTES) {
    throw new Error("Import file exceeds 8MB size limit.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON.");
  }

  const { exportDoc, migrated, notes } = migrateToExportDoc(
    parsed,
    preferredKind,
  );
  const validation = validateExportDoc(exportDoc);

  const kindLabel =
    exportDoc.kind === "project"
      ? migrated
        ? "legacy-project"
        : "project"
      : exportDoc.kind;

  return {
    kind: kindLabel as ImportSummary["kind"],
    schemaVersion: String(exportDoc.schemaVersion),
    engineVersion: exportDoc.engineVersion,
    componentId: exportDoc.runtime.componentId,
    name: exportDoc.project?.name ?? null,
    migrated,
    migrationNotes: notes,
    validation,
    exportDoc,
  };
}

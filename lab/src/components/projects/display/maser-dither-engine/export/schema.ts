/**
 * Sprint 8 — Schema builders, defaults, snapshot bridges.
 */

import { ENGINE_VERSION } from "../constants";
import { DEFAULT_COMPONENT_CONTENT } from "../content/types";
import type { ProjectRecord, ProjectSnapshot } from "../projects/types";
import { PROJECT_SCHEMA_VERSION } from "../projects/types";
import type { ComponentId } from "../types";
import { sanitizeContentAssets, buildAssetManifest } from "./assets";
import type {
  ExportKind,
  MaserDitherExport,
  MaserDitherRuntimeConfig,
  ProjectExportMeta,
  ReducedMotionPolicy,
} from "./types";
import { EXPORT_SCHEMA_VERSION } from "./types";

export { EXPORT_SCHEMA_VERSION };

export const EXPORTABLE_COMPONENT_IDS: ComponentId[] = [
  "card",
  "navigation",
  "button",
  "scrollbar",
  "badge",
  "avatar",
  "input",
  "section-background",
  "image-frame",
  "progress-bar",
  "loader",
];

export function isExportableComponent(id: string): id is ComponentId {
  return (EXPORTABLE_COMPONENT_IDS as string[]).includes(id);
}

export function normalizeComponentId(id: string): ComponentId {
  if (id === "hero-background") return "section-background";
  if (isExportableComponent(id)) return id;
  return "card";
}

export function defaultAccessibility(
  policy: ReducedMotionPolicy = "honor",
): MaserDitherRuntimeConfig["accessibility"] {
  return { reducedMotionPolicy: policy };
}

/** Build runtime config from live playground / snapshot fields. */
export function buildRuntimeConfig(input: {
  componentId: ComponentId | string;
  params: MaserDitherRuntimeConfig["params"];
  animation: MaserDitherRuntimeConfig["animation"];
  interaction: MaserDitherRuntimeConfig["interaction"];
  color: MaserDitherRuntimeConfig["color"];
  light: MaserDitherRuntimeConfig["light"];
  dither: MaserDitherRuntimeConfig["dither"];
  material: MaserDitherRuntimeConfig["material"];
  content: MaserDitherRuntimeConfig["content"];
  sourceUrl: string | null;
  sourceLightMix: number;
  basePresetId: string;
  accessibility?: MaserDitherRuntimeConfig["accessibility"];
  includeAssets?: boolean;
}): MaserDitherRuntimeConfig {
  const componentId = normalizeComponentId(String(input.componentId));
  const content = sanitizeContentAssets({
    ...DEFAULT_COMPONENT_CONTENT,
    ...input.content,
    navItems: [...(input.content.navItems ?? DEFAULT_COMPONENT_CONTENT.navItems)],
  });
  const sourceUrl =
    input.sourceUrl && !input.sourceUrl.startsWith("blob:")
      ? input.sourceUrl
      : null;

  const runtime: MaserDitherRuntimeConfig = {
    componentId,
    params: { ...input.params },
    animation: structuredClone(input.animation),
    interaction: structuredClone(input.interaction),
    color: structuredClone(input.color),
    light: structuredClone(input.light),
    dither: structuredClone(input.dither),
    material: structuredClone(input.material),
    content,
    sourceUrl,
    sourceLightMix: input.sourceLightMix,
    basePresetId: input.basePresetId || "custom",
    accessibility: input.accessibility ?? defaultAccessibility(),
  };

  if (input.includeAssets !== false) {
    runtime.assets = buildAssetManifest(runtime);
  }

  return runtime;
}

export function runtimeFromSnapshot(
  snapshot: ProjectSnapshot,
): MaserDitherRuntimeConfig {
  return buildRuntimeConfig({
    componentId: snapshot.componentId,
    params: snapshot.params,
    animation: snapshot.animation,
    interaction: snapshot.interaction,
    color: snapshot.color,
    light: snapshot.light,
    dither: snapshot.dither,
    material: snapshot.material,
    content: snapshot.content,
    sourceUrl: snapshot.sourceUrl,
    sourceLightMix: snapshot.sourceLightMix,
    basePresetId: snapshot.basePresetId,
  });
}

/** Convert runtime back to ProjectSnapshot (schema v1 stamp for library compat). */
export function snapshotFromRuntime(
  runtime: MaserDitherRuntimeConfig,
): ProjectSnapshot {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    componentId: runtime.componentId,
    params: { ...runtime.params },
    animation: structuredClone(runtime.animation),
    interaction: structuredClone(runtime.interaction),
    color: structuredClone(runtime.color),
    light: structuredClone(runtime.light),
    dither: structuredClone(runtime.dither),
    material: structuredClone(runtime.material),
    content: sanitizeContentAssets(structuredClone(runtime.content)),
    sourceUrl:
      runtime.sourceUrl && !runtime.sourceUrl.startsWith("blob:")
        ? runtime.sourceUrl
        : null,
    sourceLightMix: runtime.sourceLightMix,
    basePresetId: runtime.basePresetId,
  };
}

export function projectMetaFromRecord(
  project: ProjectRecord,
): ProjectExportMeta {
  return {
    name: project.name,
    description: project.description,
    notes: project.notes,
    tags: [...project.tags],
    colorLabel: project.colorLabel,
    favorite: project.favorite,
    thumbnailDataUrl: project.thumbnailDataUrl,
    createdAt: new Date(project.createdAt).toISOString(),
    updatedAt: new Date(project.updatedAt).toISOString(),
    sourceProjectId: project.id,
  };
}

export function createExportDoc(input: {
  kind: ExportKind;
  runtime: MaserDitherRuntimeConfig;
  project?: ProjectExportMeta;
  engineVersion?: string;
}): MaserDitherExport {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    engineVersion: input.engineVersion ?? ENGINE_VERSION,
    kind: input.kind,
    createdAt: new Date().toISOString(),
    runtime: input.runtime,
    ...(input.project ? { project: input.project } : {}),
  };
}

/** Preset export strips content unless includeComponentSettings. */
export function toPresetRuntime(
  runtime: MaserDitherRuntimeConfig,
  includeComponentSettings: boolean,
): MaserDitherRuntimeConfig {
  const next = structuredClone(runtime);
  if (!includeComponentSettings) {
    next.content = structuredClone(DEFAULT_COMPONENT_CONTENT);
    next.sourceUrl = null;
    next.assets = undefined;
  }
  return next;
}

export function omitDefaults<T extends object>(
  value: T,
  defaults: Partial<T>,
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(value) as (keyof T)[]) {
    const v = value[key];
    const d = defaults[key];
    if (JSON.stringify(v) === JSON.stringify(d)) continue;
    out[key] = v;
  }
  return out;
}

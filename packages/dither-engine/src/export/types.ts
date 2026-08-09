/**
 * Sprint 8 — Canonical export schema types.
 * Runtime configuration only; editor/debug metadata stays out.
 */

import type { ComponentContent } from "../content/types";
import type { AnimationEngineConfig } from "../engine/animation/types";
import type { ColorMaterialConfig } from "../engine/color/types";
import type { DitherConfig } from "../engine/dither/types";
import type { InteractionEngineConfig } from "../engine/interaction/types";
import type { LightShapeConfig } from "../engine/lighting/types";
import type { MaterialEngineConfig } from "../engine/material/types";
import type { ComponentId, MonochromeParams } from "../types";
import type { ColorLabel } from "../projects/types";

/** Canonical export schema version (string for migration clarity). */
export const EXPORT_SCHEMA_VERSION = "2.0.0" as const;
export type ExportSchemaVersion = typeof EXPORT_SCHEMA_VERSION;

export type ExportKind = "project" | "preset" | "runtime" | "scene";

export type ReducedMotionPolicy = "honor" | "force-reduce" | "ignore";

export type AccessibilityExportConfig = {
  reducedMotionPolicy: ReducedMotionPolicy;
  /** Surface aria-label override when set. */
  ariaLabel?: string;
};

export type AssetStrategy = "reference" | "include" | "placeholder" | "base64";

export type AssetManifestEntry = {
  id: string;
  role: "source" | "cta" | "avatar" | "frame";
  strategy: AssetStrategy;
  /** Public path or data URL when strategy allows. */
  src: string | null;
  alt: string;
  /** Original blob was dropped — consumer must replace. */
  requiresReplacement?: boolean;
};

export type AssetManifest = {
  entries: AssetManifestEntry[];
};

/** Production runtime configuration — enough to recreate a component look. */
export type MaserDitherRuntimeConfig = {
  componentId: ComponentId;
  params: MonochromeParams;
  animation: AnimationEngineConfig;
  interaction: InteractionEngineConfig;
  color: ColorMaterialConfig;
  light: LightShapeConfig;
  dither: DitherConfig;
  material: MaterialEngineConfig;
  content: ComponentContent;
  sourceUrl: string | null;
  sourceLightMix: number;
  basePresetId: string;
  accessibility: AccessibilityExportConfig;
  assets?: AssetManifest;
};

export type ProjectExportMeta = {
  name: string;
  description: string;
  notes: string;
  tags: string[];
  colorLabel: ColorLabel;
  favorite: boolean;
  thumbnailDataUrl: string | null;
  createdAt: string;
  updatedAt: string;
  /** Original project id when exported from library (informational). */
  sourceProjectId?: string;
};

/** Authoritative versioned export envelope. */
export type MaserDitherExport = {
  schemaVersion: ExportSchemaVersion | "1" | 1;
  engineVersion: string;
  kind: ExportKind;
  createdAt: string;
  runtime: MaserDitherRuntimeConfig;
  project?: ProjectExportMeta;
};

export type ExportValidationSeverity = "ready" | "warning" | "blocked";

export type ExportValidationIssue = {
  code: string;
  severity: "warning" | "error";
  message: string;
  fix: string;
  path?: string;
};

export type ExportValidationResult = {
  status: ExportValidationSeverity;
  issues: ExportValidationIssue[];
};

export type ExportModeId =
  | "project-file"
  | "preset-file"
  | "runtime-config"
  | "react-component"
  | "component-package"
  | "css-tokens"
  | "shader-snapshot"
  | "shareable-scene"
  | "transfer-docs";

export type CodeFormat = "typescript" | "javascript" | "json" | "css";
export type Completeness = "minimal" | "complete";

export type ReactExportStrategy = "shared-runtime" | "standalone";

export type ExportOptions = {
  mode: ExportModeId;
  format?: CodeFormat;
  completeness?: Completeness;
  reactStrategy?: ReactExportStrategy;
  includeComponentSettings?: boolean;
  includeDocumentation?: boolean;
  includeReducedMotion?: boolean;
  includeExampleUsage?: boolean;
  fileName?: string;
  assetStrategy?: AssetStrategy;
  /** Override public path for referenced assets. */
  assetPublicPath?: string;
};

export type DependencyClass =
  | "required-runtime"
  | "optional"
  | "development"
  | "maser-lab-only";

export type ExportDependency = {
  name: string;
  version?: string;
  classification: DependencyClass;
  reason: string;
};

export type ExportDependencyManifest = {
  dependencies: ExportDependency[];
};

export type GeneratedFile = {
  path: string;
  content: string;
  language: "ts" | "tsx" | "js" | "jsx" | "json" | "css" | "md" | "glsl";
};

export type PackageFileMap = {
  name: string;
  files: GeneratedFile[];
  dependencies: ExportDependencyManifest;
  estimatedBytes: number;
};

export type ExportHistoryEntry = {
  id: string;
  name: string;
  projectName: string | null;
  componentId: ComponentId;
  exportType: ExportModeId;
  createdAt: string;
  engineVersion: string;
  schemaVersion: string;
  /** Compact runtime fingerprint for re-export — not full packages. */
  runtimeFingerprint: string;
};

export type ImportSummary = {
  kind: ExportKind | "legacy-project" | "legacy-snapshot";
  schemaVersion: string;
  engineVersion: string | null;
  componentId: ComponentId | null;
  name: string | null;
  migrated: boolean;
  migrationNotes: string[];
  validation: ExportValidationResult;
  exportDoc: MaserDitherExport;
};

export type ShaderSnapshot = {
  advanced: true;
  materialId: string;
  ditherAlgorithm: string;
  matrixSize: number;
  animationMode: string;
  interactionMode: string;
  performanceTier: string;
  uniforms: Record<string, number | string | boolean | number[]>;
  requiredGlslChunks: string[];
  notes: string;
};

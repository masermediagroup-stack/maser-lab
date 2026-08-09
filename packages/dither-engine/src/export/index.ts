/**
 * Sprint 8 — Public export API (schema, migrate, validate, codegen).
 * Must not import shell/ editor modules.
 */

export { EXPORT_SCHEMA_VERSION } from "./types";
export type {
  AccessibilityExportConfig,
  AssetManifest,
  AssetManifestEntry,
  AssetStrategy,
  CodeFormat,
  Completeness,
  DependencyClass,
  ExportDependency,
  ExportDependencyManifest,
  ExportHistoryEntry,
  ExportKind,
  ExportModeId,
  ExportOptions,
  ExportSchemaVersion,
  ExportValidationIssue,
  ExportValidationResult,
  ExportValidationSeverity,
  GeneratedFile,
  ImportSummary,
  MaserDitherExport,
  MaserDitherRuntimeConfig,
  PackageFileMap,
  ProjectExportMeta,
  ReactExportStrategy,
  ReducedMotionPolicy,
  ShaderSnapshot,
} from "./types";

export {
  EXPORTABLE_COMPONENT_IDS,
  buildRuntimeConfig,
  createExportDoc,
  defaultAccessibility,
  isExportableComponent,
  normalizeComponentId,
  omitDefaults,
  projectMetaFromRecord,
  runtimeFromSnapshot,
  snapshotFromRuntime,
  toPresetRuntime,
} from "./schema";

export {
  applyAssetStrategy,
  buildAssetManifest,
  estimateDataUrlBytes,
  isBlobUrl,
  isDataUrl,
  sanitizeContentAssets,
  sanitizeSourceUrl,
} from "./assets";

export {
  migrateToExportDoc,
  migrateV1SnapshotToRuntime,
  parseAndMigrateImport,
  sanitizeJsonObject,
} from "./migrate";

export {
  validateExportDoc,
  validateGeneratedPackage,
  validateRuntimeConfig,
} from "./validate";

export {
  buildComponentPackage,
  buildShaderSnapshot,
  generateCssTokensCode,
  generateExportCode,
  generateExportOutput,
  generatePresetFile,
  generateProjectFile,
  generateReactComponentCode,
  generateRuntimeConfigCode,
  generateShaderSnapshotCode,
} from "./codegen";

export {
  buildCssVariables,
  buildDesignTokens,
  buildTailwindMap,
} from "./tokens";

export { buildDependencyManifest } from "./dependencies";
export { generateTransferMarkdown } from "./transfer-doc";

export {
  EXPORT_HISTORY_KEY,
  clearExportHistory,
  loadExportHistory,
  recordExport,
  removeExportHistoryEntry,
  saveExportHistory,
} from "./history";

export {
  buildSceneDoc,
  decodeSceneHash,
  encodeSceneHash,
  sceneShareUrl,
} from "./share";

export {
  copyToClipboard,
  downloadPackageZip,
  downloadTextFile,
  filesToPreview,
} from "./download";

/** Mode catalog for Export workspace UI. */
export const EXPORT_MODE_CATALOG = [
  {
    id: "project-file" as const,
    label: "Project File",
    extension: ".maser-dither.json",
    summary: "Full editable project — runtime + name, notes, tags, thumbnail.",
    when: "Continue editing inside Maser Dither Engine or archive a look.",
  },
  {
    id: "preset-file" as const,
    label: "Preset File",
    extension: ".maser-preset.json",
    summary: "Visual settings without project copy or uploads.",
    when: "Reuse a material look across components.",
  },
  {
    id: "runtime-config" as const,
    label: "Runtime Configuration",
    extension: ".ts / .js / .json",
    summary: "Clean typed config object for production apps.",
    when: "Wire SurfaceCanvas / adapters with a frozen look.",
  },
  {
    id: "react-component" as const,
    label: "React Component",
    extension: ".tsx",
    summary: "Typed wrapper component using the shared runtime.",
    when: "Drop a Card/Button/Nav into a host React app.",
  },
  {
    id: "component-package" as const,
    label: "Component Package",
    extension: ".zip",
    summary: "Transferable folder: component, config, styles, TRANSFER.md.",
    when: "Hand off to client / portfolio without Lab chrome.",
  },
  {
    id: "css-tokens" as const,
    label: "CSS Variables",
    extension: ".css / tokens",
    summary: "CSS-safe presentation tokens (not shader uniforms).",
    when: "Theme host layout around the dither surface.",
  },
  {
    id: "shader-snapshot" as const,
    label: "Shader Snapshot",
    extension: ".json",
    summary: "Advanced uniform + GLSL chunk documentation.",
    when: "Debug or document GPU configuration — not a raw orphan shader.",
  },
  {
    id: "shareable-scene" as const,
    label: "Shareable Scene",
    extension: ".maser-scene.json / URL",
    summary: "Presentation-focused portable scene (local-first).",
    when: "Client review or portfolio demo without the editor.",
  },
  {
    id: "transfer-docs" as const,
    label: "Transfer Documentation",
    extension: "TRANSFER.md",
    summary: "Component-specific install and usage notes.",
    when: "Document a handoff for another engineer.",
  },
] as const;

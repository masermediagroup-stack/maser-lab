export { SurfaceCanvas } from "./react/SurfaceCanvas";
export { SurfaceCard } from "./surfaces/SurfaceCard";
export { DitherEngineApp } from "./shell/DitherEngineApp";
export {
  createMonochromeMaterial,
  MonochromeMaterial,
} from "./engine/materials/MonochromeMaterial";
export { MaterialCatalog, MaterialRegistry } from "./materials/catalog";
export { ComponentCatalog } from "./components/registry";
export { PresetCatalog } from "./presets/catalog";
export {
  createEngineParams,
  splitConfig,
  mergeConfig,
} from "./engine/api";
export {
  MONOCHROME_DEFAULTS,
  ENGINE_NAME,
  ENGINE_SLUG,
  ENGINE_VERSION,
  DITHER_SIZES,
} from "./constants";
export { PIPELINE_STAGES } from "./engine/pipeline/stages";
export {
  ANIMATION_MODES,
  AnimationModeCatalog,
  ProceduralAnimationController,
  DEFAULT_ANIMATION_CONFIG,
  defaultModeParams,
} from "./engine/animation";
export type {
  AnimationModeId,
  AnimationEngineConfig,
  AnimationModeDefinition,
  AnimationUniformPayload,
  TimelineState,
} from "./engine/animation";
export {
  INTERACTION_MODES,
  InteractionModeCatalog,
  InteractionController,
  DEFAULT_INTERACTION_CONFIG,
  createDefaultLights,
  MAX_LIGHTS,
} from "./engine/interaction";
export type {
  InteractionModeId,
  InteractionEngineConfig,
  InteractionUniformPayload,
  PhysicsConfig,
  FalloffConfig,
  TrailConfig,
  RippleConfig,
  HoldConfig,
  ReleaseConfig,
  ProceduralLight,
  PointerStateId,
} from "./engine/interaction";
export {
  MATERIAL_PALETTES,
  MATERIAL_BEHAVIORS,
  ColorMaterialController,
  DEFAULT_COLOR_MATERIAL,
  applyPaletteToConfig,
  applyBehavior,
  hexToRgb,
  rgbToHex,
} from "./engine/color";
export type {
  ColorMaterialConfig,
  ColorUniformPayload,
  GradientModeId,
  GradientBehaviorId,
  BlendModeId,
  MaterialBehaviorId,
  MaterialColors,
  PaletteDefinition,
  BehaviorDefinition,
} from "./engine/color";
export {
  DEFAULT_LIGHT_SHAPE,
  LIGHTING_PRESETS,
  LightShapeController,
  getLightingPreset,
} from "./engine/lighting";
export type {
  LightShapeId,
  FalloffCurveId,
  LightShapeConfig,
  LightUniformPayload,
  LightingPresetDefinition,
} from "./engine/lighting";
export {
  DEFAULT_DITHER_CONFIG,
  DITHER_ALGORITHMS,
  DitherController,
  migrateParamsBlob,
  migratePreset,
  DEPRECATED_KEYS,
} from "./engine/dither";
export type {
  DitherAlgorithmId,
  DitherConfig,
  DitherUniformPayload,
} from "./engine/dither";
export {
  DEFAULT_COMPONENT_CONTENT,
} from "./content/types";
export type { ComponentContent } from "./content/types";
export type {
  MonochromeParams,
  MonochromeUniformState,
  DitherSize,
  MaterialId,
  MaterialCatalogEntry,
  SurfaceCanvasProps,
  SurfaceCardProps,
  SurfaceRendererKind,
  ComponentId,
  ComponentDefinition,
  PresetDefinition,
  DitherEngineConfig,
  ControlDensityMode,
  AppRoute,
  DitherAdapterProps,
} from "./types";
export {
  MATERIAL_FAMILIES,
  PROCEDURAL_MATERIALS,
  MaterialController,
  DEFAULT_MATERIAL_CONFIG,
  DEFAULT_MATERIAL_PARAMS,
  getMaterialDefinition,
  listReadyMaterials,
  createDefaultLayers,
} from "./engine/material";
export type {
  EngineMaterialId,
  ProceduralMaterialId,
  MaterialFamilyId,
  MaterialEngineConfig,
  MaterialDefinition as ProceduralMaterialDefinition,
  MaterialLayer,
  PerformanceTier,
} from "./engine/material";

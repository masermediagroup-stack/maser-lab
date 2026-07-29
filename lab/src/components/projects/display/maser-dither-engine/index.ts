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
export type {
  MonochromeParams,
  MonochromeUniformState,
  DitherSize,
  MaterialId,
  MaterialDefinition,
  SurfaceCanvasProps,
  SurfaceCardProps,
  SurfaceRendererKind,
  ComponentId,
  ComponentDefinition,
  PresetDefinition,
  DitherEngineConfig,
  AppRoute,
} from "./types";

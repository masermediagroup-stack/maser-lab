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

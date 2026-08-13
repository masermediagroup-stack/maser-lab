/**
 * Color / gradient / palette / blend / behavior material system (Sprint 3).
 *
 * Layered beside animation + interaction — does not rewrite the WebGL renderer.
 *
 * Pipeline
 * - ColorMaterialController packs palette + gradient + blend + behavior uniforms
 * - COLOR_GLSL samples animated gradients and composes RGB from ink/dither/bloom
 * - SurfaceRenderer.uploadColor packs 14 material color slots into vec4s
 * - MaterialPanel exposes Palette Studio, gradients, blend modes, behaviors
 *
 * Extension points
 * - Add palettes in palettes.ts
 * - Add behaviors in behaviors.ts (properties + preferBlend)
 * - Add gradient modes / blend modes in types.ts + colorGlsl.ts branches
 */
export type {
  Rgb,
  GradientModeId,
  GradientBehaviorId,
  BlendModeId,
  MaterialBehaviorId,
  MaterialColors,
  MaterialProperties,
  ColorMaterialConfig,
  ColorUniformPayload,
} from "./types";
export {
  rgb,
  hexToRgb,
  rgbToHex,
  DEFAULT_COLORS,
  DEFAULT_MATERIAL_PROPERTIES,
  DEFAULT_COLOR_MATERIAL,
  COLOR_SLOT_ORDER,
  idleColorPayload,
} from "./types";
export {
  MATERIAL_PALETTES,
  getPalette,
  applyPaletteToConfig,
  colorsFromLegacyGray,
} from "./palettes";
export type { PaletteDefinition } from "./palettes";
export {
  MATERIAL_BEHAVIORS,
  getBehavior,
  applyBehavior,
} from "./behaviors";
export type { BehaviorDefinition } from "./behaviors";
export { ColorMaterialController } from "./ColorMaterialController";
export { COLOR_GLSL } from "./colorGlsl";

export type {
  Rgb,
  Hsl,
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
  rgbToHsl,
  hslToRgb,
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

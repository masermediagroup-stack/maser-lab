import type { MaterialId, StudioParams } from "./types";

export const PROJECT_TITLE = "Material Gallery";
export const PROJECT_SLUG = "logo-material-gallery";

export const MATERIAL_ORDER: MaterialId[] = [
  "wood",
  "glass",
  "gradient",
  "steel",
  "marble",
  "gold",
];

export const MATERIAL_LABEL: Record<MaterialId, string> = {
  wood: "Wood",
  glass: "Glass",
  gradient: "Gradient",
  steel: "Brushed steel",
  marble: "Marble",
  gold: "Gold",
};

export const DEFAULT_STUDIO_PARAMS: StudioParams = {
  spinSpeed: 0.22,
  paused: false,
  scale: 1,
  depth: 0.38,
  keyLight: 1.25,
  envIntensity: 1,
};

export const PARAM_RANGE = {
  spinSpeed: { min: 0, max: 1.2, step: 0.01 },
  scale: { min: 0.55, max: 1.65, step: 0.01 },
  depth: { min: 0.12, max: 0.85, step: 0.01 },
  keyLight: { min: 0.15, max: 2.4, step: 0.01 },
  envIntensity: { min: 0.15, max: 2.2, step: 0.01 },
} as const;

export const EXPORT_SIZE = 2048;

export const GALLERY_DPR_MAX = 1.5;
export const STUDIO_DPR_MAX = 2;

/** SVG source space for the stacked MM (Y down). */
export const MARK_SVG = {
  width: 200,
  height: 352,
  stroke: 56,
  stackDy: 124,
} as const;

/** Centerline of one M in SVG coordinates (Y down). */
export const MASER_M_CENTERLINE_SVG = [
  { x: 36, y: 176 },
  { x: 36, y: 48 },
  { x: 100, y: 128 },
  { x: 164, y: 48 },
  { x: 164, y: 176 },
] as const;

export const MARK_SKY = "#0096FF";
export const MARK_NAVY = "#004B70";

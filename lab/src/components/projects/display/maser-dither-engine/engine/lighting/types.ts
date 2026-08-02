/**
 * Procedural light-shape system — luminance only.
 * Color gradients live in engine/color; this module owns illumination geometry.
 */

export type LightShapeId =
  | "radial"
  | "ellipse"
  | "linear"
  | "cone"
  | "organic";

export type FalloffCurveId = "linear" | "smooth" | "power" | "gaussian";

export type LightShapeConfig = {
  shape: LightShapeId;
  centerX: number;
  centerY: number;
  radius: number;
  stretchX: number;
  stretchY: number;
  rotation: number;
  coreBrightness: number;
  edgeDarkness: number;
  falloff: number;
  falloffCurve: FalloffCurveId;
  lightContrast: number;
  ditherResponse: number;
  /** When true, color gradient samples along illumination (core→edge). */
  gradientFollowsLight: boolean;
  /** How much pointer pulls the light center (0–1). */
  pointerFollow: number;
};

export type LightUniformPayload = {
  shape: number;
  centerX: number;
  centerY: number;
  radius: number;
  stretchX: number;
  stretchY: number;
  rotation: number;
  coreBrightness: number;
  edgeDarkness: number;
  falloff: number;
  falloffCurve: number;
  lightContrast: number;
  ditherResponse: number;
  gradientFollowsLight: number;
  pointerFollow: number;
};

export const LIGHT_SHAPE_INDEX: Record<LightShapeId, number> = {
  radial: 0,
  ellipse: 1,
  linear: 2,
  cone: 3,
  organic: 4,
};

export const FALLOFF_CURVE_INDEX: Record<FalloffCurveId, number> = {
  linear: 0,
  smooth: 1,
  power: 2,
  gaussian: 3,
};

/** Default: clear centered radial bloom for Print Density. */
export const DEFAULT_LIGHT_SHAPE: LightShapeConfig = {
  shape: "radial",
  centerX: 0.5,
  centerY: 0.5,
  radius: 0.42,
  stretchX: 1,
  stretchY: 1,
  rotation: 0,
  coreBrightness: 0.96,
  edgeDarkness: 0.1,
  falloff: 0.62,
  falloffCurve: "smooth",
  lightContrast: 1.35,
  ditherResponse: 0.85,
  gradientFollowsLight: true,
  pointerFollow: 0.55,
};

export function idleLightPayload(): LightUniformPayload {
  const d = DEFAULT_LIGHT_SHAPE;
  return {
    shape: LIGHT_SHAPE_INDEX[d.shape],
    centerX: d.centerX,
    centerY: d.centerY,
    radius: d.radius,
    stretchX: d.stretchX,
    stretchY: d.stretchY,
    rotation: d.rotation,
    coreBrightness: d.coreBrightness,
    edgeDarkness: d.edgeDarkness,
    falloff: d.falloff,
    falloffCurve: FALLOFF_CURVE_INDEX[d.falloffCurve],
    lightContrast: d.lightContrast,
    ditherResponse: d.ditherResponse,
    gradientFollowsLight: d.gradientFollowsLight ? 1 : 0,
    pointerFollow: d.pointerFollow,
  };
}

export type LightingPresetDefinition = {
  id: string;
  label: string;
  description: string;
  config: LightShapeConfig;
};

export const LIGHTING_PRESETS: LightingPresetDefinition[] = [
  {
    id: "center-bloom",
    label: "Center Bloom",
    description: "Bright radial core with soft outer dither density.",
    config: {
      ...DEFAULT_LIGHT_SHAPE,
      shape: "radial",
      centerX: 0.5,
      centerY: 0.5,
      radius: 0.4,
      coreBrightness: 0.98,
      edgeDarkness: 0.08,
      falloff: 0.55,
      falloffCurve: "smooth",
      lightContrast: 1.4,
      ditherResponse: 0.9,
      gradientFollowsLight: true,
      pointerFollow: 0.45,
    },
  },
  {
    id: "offset-spotlight",
    label: "Offset Spotlight",
    description: "Tight elliptical spotlight with strong core contrast.",
    config: {
      ...DEFAULT_LIGHT_SHAPE,
      shape: "ellipse",
      centerX: 0.32,
      centerY: 0.62,
      radius: 0.28,
      stretchX: 0.75,
      stretchY: 1.25,
      rotation: 25,
      coreBrightness: 1,
      edgeDarkness: 0.05,
      falloff: 0.78,
      falloffCurve: "power",
      lightContrast: 1.55,
      ditherResponse: 0.95,
      gradientFollowsLight: true,
      pointerFollow: 0.35,
    },
  },
  {
    id: "wide-ambient",
    label: "Wide Ambient",
    description: "Broad soft illumination — gentle dither toward edges.",
    config: {
      ...DEFAULT_LIGHT_SHAPE,
      shape: "radial",
      centerX: 0.5,
      centerY: 0.48,
      radius: 0.72,
      stretchX: 1.15,
      stretchY: 0.9,
      coreBrightness: 0.88,
      edgeDarkness: 0.22,
      falloff: 0.35,
      falloffCurve: "gaussian",
      lightContrast: 1.1,
      ditherResponse: 0.55,
      gradientFollowsLight: true,
      pointerFollow: 0.25,
    },
  },
];

export function getLightingPreset(
  id: string,
): LightingPresetDefinition | undefined {
  return LIGHTING_PRESETS.find((p) => p.id === id);
}

/**
 * Procedural color & material system types (Sprint 3).
 * Extends the shared engine without rewriting the WebGL renderer.
 */

export type Rgb = { r: number; g: number; b: number };

export type GradientModeId =
  | "single"
  | "dual"
  | "triple"
  | "quad"
  | "radial"
  | "angular"
  | "linear"
  | "animated"
  | "noise";

export type GradientBehaviorId =
  | "none"
  | "rotate"
  | "expand"
  | "contract"
  | "flow"
  | "pulse"
  | "orbit"
  | "noise-drift"
  | "hue-cycle"
  | "blend"
  | "mirror";

export type BlendModeId =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "difference"
  | "exclusion"
  | "color-dodge"
  | "luminosity";

export type MaterialBehaviorId =
  | "none"
  | "paper"
  | "ink"
  | "plastic"
  | "velvet"
  | "metal"
  | "smoke"
  | "fog"
  | "cloud"
  | "glass";

export type MaterialColors = {
  background: Rgb;
  highlight: Rgb;
  shadow: Rgb;
  dither: Rgb;
  bloom: Rgb;
  ambient: Rgb;
  accent: Rgb;
  gradientStart: Rgb;
  gradientEnd: Rgb;
  gradientMid: Rgb;
  gradientFourth: Rgb;
  glow: Rgb;
  edgeTint: Rgb;
  noiseTint: Rgb;
};

export type MaterialProperties = {
  exposure: number;
  gamma: number;
  threshold: number;
  density: number;
  sharpness: number;
  smoothness: number;
  blur: number;
  materialWeight: number;
  lightScatter: number;
};

export type ColorMaterialConfig = {
  colors: MaterialColors;
  gradientMode: GradientModeId;
  gradientBehavior: GradientBehaviorId;
  gradientSpeed: number;
  gradientOffset: number;
  blendMode: BlendModeId;
  behavior: MaterialBehaviorId;
  properties: MaterialProperties;
  /** When false, output stays grayscale (Sprint 1/2 look). */
  colorEnabled: boolean;
  /** Active palette studio id (UI selection). */
  paletteId: string;
};

export type ColorUniformPayload = {
  colorEnabled: number;
  gradientMode: number;
  gradientBehavior: number;
  gradientSpeed: number;
  gradientOffset: number;
  blendMode: number;
  behavior: number;
  exposure: number;
  gamma: number;
  threshold: number;
  density: number;
  sharpness: number;
  smoothness: number;
  blur: number;
  materialWeight: number;
  lightScatter: number;
  /** Packed RGB triples as flat array (14 colors × 3). */
  colors: Float32Array;
};

export function rgb(r: number, g: number, b: number): Rgb {
  return { r, g, b };
}

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return rgb(1, 1, 1);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export const COLOR_SLOT_ORDER = [
  "background",
  "highlight",
  "shadow",
  "dither",
  "bloom",
  "ambient",
  "accent",
  "gradientStart",
  "gradientEnd",
  "gradientMid",
  "gradientFourth",
  "glow",
  "edgeTint",
  "noiseTint",
] as const satisfies readonly (keyof MaterialColors)[];

export const DEFAULT_COLORS: MaterialColors = {
  background: rgb(0.04, 0.04, 0.05),
  highlight: rgb(0.96, 0.96, 0.94),
  shadow: rgb(0.06, 0.06, 0.07),
  dither: rgb(0.92, 0.92, 0.9),
  bloom: rgb(1, 1, 0.98),
  ambient: rgb(0.55, 0.55, 0.58),
  accent: rgb(0.85, 0.85, 0.82),
  gradientStart: rgb(0.08, 0.08, 0.09),
  gradientEnd: rgb(0.92, 0.92, 0.9),
  gradientMid: rgb(0.45, 0.45, 0.48),
  gradientFourth: rgb(0.7, 0.7, 0.68),
  glow: rgb(1, 1, 0.97),
  edgeTint: rgb(0.75, 0.78, 0.82),
  noiseTint: rgb(0.5, 0.5, 0.5),
};

export const DEFAULT_MATERIAL_PROPERTIES: MaterialProperties = {
  exposure: 1,
  gamma: 1,
  threshold: 0,
  density: 0.5,
  sharpness: 0.5,
  smoothness: 0.45,
  blur: 0,
  materialWeight: 0.55,
  lightScatter: 0.35,
};

export const DEFAULT_COLOR_MATERIAL: ColorMaterialConfig = {
  colors: { ...DEFAULT_COLORS },
  gradientMode: "dual",
  gradientBehavior: "none",
  gradientSpeed: 0.35,
  gradientOffset: 0,
  blendMode: "normal",
  behavior: "none",
  properties: { ...DEFAULT_MATERIAL_PROPERTIES },
  colorEnabled: true,
  paletteId: "monochrome",
};

export const GRADIENT_MODE_INDEX: Record<GradientModeId, number> = {
  single: 0,
  dual: 1,
  triple: 2,
  quad: 3,
  radial: 4,
  angular: 5,
  linear: 6,
  animated: 7,
  noise: 8,
};

export const GRADIENT_BEHAVIOR_INDEX: Record<GradientBehaviorId, number> = {
  none: 0,
  rotate: 1,
  expand: 2,
  contract: 3,
  flow: 4,
  pulse: 5,
  orbit: 6,
  "noise-drift": 7,
  "hue-cycle": 8,
  blend: 9,
  mirror: 10,
};

export const BLEND_MODE_INDEX: Record<BlendModeId, number> = {
  normal: 0,
  multiply: 1,
  screen: 2,
  overlay: 3,
  "soft-light": 4,
  "hard-light": 5,
  difference: 6,
  exclusion: 7,
  "color-dodge": 8,
  luminosity: 9,
};

export const BEHAVIOR_INDEX: Record<MaterialBehaviorId, number> = {
  none: 0,
  paper: 1,
  ink: 2,
  plastic: 3,
  velvet: 4,
  metal: 5,
  smoke: 6,
  fog: 7,
  cloud: 8,
  glass: 9,
};

export function idleColorPayload(): ColorUniformPayload {
  return {
    colorEnabled: 1,
    gradientMode: 1,
    gradientBehavior: 0,
    gradientSpeed: 0.35,
    gradientOffset: 0,
    blendMode: 0,
    behavior: 0,
    exposure: 1,
    gamma: 1,
    threshold: 0,
    density: 0.5,
    sharpness: 0.5,
    smoothness: 0.45,
    blur: 0,
    materialWeight: 0.55,
    lightScatter: 0.35,
    colors: new Float32Array(COLOR_SLOT_ORDER.length * 3),
  };
}

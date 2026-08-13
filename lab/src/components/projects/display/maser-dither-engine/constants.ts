import type { DitherSize, MonochromeParams } from "./types";

export const ENGINE_NAME = "Maser Dither Engine";
export const ENGINE_SLUG = "maser-dither-engine";
export const ENGINE_VERSION = "0.8.0";
export const ENGINE_TAGLINE =
  "Procedural materials for interfaces — lighting, color, and engineered tonal density.";

/** Exponential damp rate (higher = snappier, still no overshoot). */
export const DAMP_LAMBDA = 10;

export const MONOCHROME_DEFAULTS: MonochromeParams = {
  ditherSize: 8,
  posterization: 0,
  noiseScale: 1.2,
  noiseSpeed: 0.35,
  contrast: 1.2,
  brightness: 0.02,
  gradientAngle: 135,
  gradientColorA: 0.08,
  gradientColorB: 0.92,
  bloom: 0.42,
  bloomRadius: 0.2,
  grainAmount: 0.08,
  pixelDensity: 1.0,
  shadowStrength: 0.28,
  highlightStrength: 0.45,
  softEdge: 0.55,
  randomSeed: 0.37,
  animationSpeed: 1,
  cursorInfluence: 0.55,
  scrollInfluence: 0.15,
  depth: 0.4,
  lightX: 0.5,
  lightY: 0.5,
  opacity: 1,
  blueNoiseAmount: 0.2,
};

export const PARAM_RANGES: Record<
  keyof Omit<MonochromeParams, "ditherSize">,
  { min: number; max: number; step: number }
> = {
  posterization: { min: 0, max: 16, step: 1 },
  noiseScale: { min: 0, max: 4, step: 0.01 },
  noiseSpeed: { min: 0, max: 2, step: 0.01 },
  contrast: { min: 0.2, max: 2.5, step: 0.01 },
  brightness: { min: -0.5, max: 0.5, step: 0.01 },
  gradientAngle: { min: 0, max: 360, step: 1 },
  gradientColorA: { min: 0, max: 1, step: 0.01 },
  gradientColorB: { min: 0, max: 1, step: 0.01 },
  bloom: { min: 0, max: 1, step: 0.01 },
  bloomRadius: { min: 0.02, max: 0.4, step: 0.01 },
  grainAmount: { min: 0, max: 0.5, step: 0.01 },
  pixelDensity: { min: 0.25, max: 3, step: 0.01 },
  shadowStrength: { min: 0, max: 1, step: 0.01 },
  highlightStrength: { min: 0, max: 1, step: 0.01 },
  softEdge: { min: 0, max: 1, step: 0.01 },
  randomSeed: { min: 0, max: 1, step: 0.01 },
  animationSpeed: { min: 0, max: 2, step: 0.01 },
  cursorInfluence: { min: 0, max: 1, step: 0.01 },
  scrollInfluence: { min: 0, max: 1, step: 0.01 },
  depth: { min: 0, max: 1, step: 0.01 },
  lightX: { min: 0, max: 1, step: 0.01 },
  lightY: { min: 0, max: 1, step: 0.01 },
  opacity: { min: 0, max: 1, step: 0.01 },
  blueNoiseAmount: { min: 0, max: 1, step: 0.01 },
};

export const PARAM_LABELS: Partial<Record<keyof MonochromeParams, string>> = {
  ditherSize: "Matrix Size",
  posterization: "Posterization Levels",
  noiseScale: "Grain Noise Scale",
  noiseSpeed: "Grain Evolution Speed",
  contrast: "Contrast",
  brightness: "Brightness",
  gradientAngle: "Legacy Gradient Angle",
  gradientColorA: "Legacy Gradient Dark",
  gradientColorB: "Legacy Gradient Light",
  bloom: "Bloom Amount",
  bloomRadius: "Bloom Spread",
  grainAmount: "Grain Opacity",
  pixelDensity: "Render Density",
  shadowStrength: "Shadow Strength",
  highlightStrength: "Highlight Strength",
  softEdge: "UV Soft Clamp",
  randomSeed: "Noise Seed",
  animationSpeed: "Master Time Scale",
  cursorInfluence: "Pointer Influence (legacy)",
  scrollInfluence: "Scroll Influence",
  depth: "Depth (unused)",
  lightX: "Light X (legacy)",
  lightY: "Light Y (legacy)",
  opacity: "Surface Opacity",
  blueNoiseAmount: "Bayer Blue-Noise Mix",
};

export const PARAM_TOOLTIPS: Partial<Record<keyof MonochromeParams, string>> = {
  animationSpeed:
    "Master multiplier on animation dt. Multiplies with Timeline Playback Speed in Advanced.",
  contrast:
    "Expands luminance separation before dither. Different from Threshold Bias (quantization edge).",
  brightness: "Offsets luminance after contrast. Not the same as Exposure or Light Core.",
  bloom: "Light spill amount on the bright core. Not global exposure.",
  bloomRadius: "How far bloom spreads from the light core.",
  grainAmount: "Filmic grain opacity after dither quantization.",
  blueNoiseAmount:
    "Optional blue-noise mix for Bayer-family algorithms only.",
  pixelDensity:
    "Internal sampling density (quality/perf). Does not change matrix complexity.",
  posterization: "Global tonal step count before dither. Also feeds Posterized algorithm.",
  softEdge: "How hard warped UVs clamp — edge treatment, not bloom or light falloff.",
  noiseScale: "Spatial scale of grain / blue-noise sampling.",
  noiseSpeed: "Temporal evolution of grain overlay.",
  shadowStrength: "Compresses the dark tonal range after contrast.",
  highlightStrength: "Lifts the bright tonal range after contrast.",
  scrollInfluence: "How much page scroll shifts noise / blue-noise phase.",
  opacity: "Final surface alpha.",
  randomSeed: "Seeds hash and blue-noise refresh.",
};

export const DITHER_SIZES: DitherSize[] = [2, 4, 8, 32, 64];

export const MAX_DPR = 2;

export const STORAGE_KEYS = {
  panels: "mde:panels:v3",
  favorites: "mde:favorites:v1",
  recent: "mde:recent:v1",
  density: "mde:density:v1",
  projects: "mde:projects:v1",
  materialFavorites: "mde:material-favorites:v1",
  controlFavorites: "mde:control-favorites:v1",
  exportHistory: "mde:export-history:v1",
  assetsDb: "mde-assets-v1",
} as const;

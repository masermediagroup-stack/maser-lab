import type { DitherSize, MonochromeParams } from "./types";

export const ENGINE_NAME = "Maser Dither Engine";
export const ENGINE_SLUG = "maser-dither-engine";
export const ENGINE_VERSION = "0.5.0";
export const ENGINE_TAGLINE =
  "Procedural materials for interfaces — lighting, color, and engineered tonal density.";

/** Exponential damp rate (higher = snappier, still no overshoot). */
export const DAMP_LAMBDA = 10;

export const MONOCHROME_DEFAULTS: MonochromeParams = {
  ditherSize: 8,
  posterization: 0,
  noiseScale: 1.2,
  noiseSpeed: 0.35,
  contrast: 1.15,
  brightness: 0.02,
  gradientAngle: 135,
  gradientColorA: 0.08,
  gradientColorB: 0.92,
  bloom: 0.35,
  bloomRadius: 0.18,
  grainAmount: 0.08,
  pixelDensity: 1.0,
  shadowStrength: 0.25,
  highlightStrength: 0.4,
  softEdge: 0.55,
  randomSeed: 0.37,
  animationSpeed: 0.6,
  cursorInfluence: 0.72,
  scrollInfluence: 0.2,
  depth: 0.45,
  lightX: 0.22,
  lightY: 0.18,
  opacity: 1,
  blueNoiseAmount: 0.22,
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
  ditherSize: "Dither Size",
  posterization: "Posterization",
  noiseScale: "Noise Scale",
  noiseSpeed: "Noise Speed",
  contrast: "Contrast",
  brightness: "Brightness",
  gradientAngle: "Gradient Angle",
  gradientColorA: "Gradient Dark",
  gradientColorB: "Gradient Light",
  bloom: "Bloom",
  bloomRadius: "Bloom Radius",
  grainAmount: "Grain Amount",
  pixelDensity: "Pixel Density",
  shadowStrength: "Shadow Strength",
  highlightStrength: "Highlight Strength",
  softEdge: "Soft Edge",
  randomSeed: "Random Seed",
  animationSpeed: "Animation Speed",
  cursorInfluence: "Cursor Influence",
  scrollInfluence: "Scroll Influence",
  depth: "Depth",
  lightX: "Light X",
  lightY: "Light Y",
  opacity: "Opacity",
  blueNoiseAmount: "Blue Noise",
};

export const DITHER_SIZES: DitherSize[] = [2, 4, 8, 32, 64];

export const MAX_DPR = 2;

export const STORAGE_KEYS = {
  panels: "mde:panels:v1",
  favorites: "mde:favorites:v1",
  recent: "mde:recent:v1",
} as const;

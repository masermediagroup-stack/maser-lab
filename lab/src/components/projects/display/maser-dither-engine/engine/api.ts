import { MONOCHROME_DEFAULTS } from "../constants";
import type { DitherEngineConfig, MonochromeParams } from "../types";

/**
 * Clean shared configuration API for the Dither Engine.
 * Components and playgrounds compose params through these groups —
 * the WebGL pipeline is never duplicated.
 */
export function splitConfig(params: MonochromeParams): DitherEngineConfig {
  return {
    material: {
      ditherSize: params.ditherSize,
      posterization: params.posterization,
      softEdge: params.softEdge,
      pixelDensity: params.pixelDensity,
      opacity: params.opacity,
      randomSeed: params.randomSeed,
    },
    animation: {
      animationSpeed: params.animationSpeed,
      noiseSpeed: params.noiseSpeed,
    },
    lighting: {
      lightX: params.lightX,
      lightY: params.lightY,
      bloom: params.bloom,
      bloomRadius: params.bloomRadius,
      depth: params.depth,
      shadowStrength: params.shadowStrength,
      highlightStrength: params.highlightStrength,
    },
    colors: {
      gradientAngle: params.gradientAngle,
      gradientColorA: params.gradientColorA,
      gradientColorB: params.gradientColorB,
      brightness: params.brightness,
      contrast: params.contrast,
    },
    interaction: {
      cursorInfluence: params.cursorInfluence,
      scrollInfluence: params.scrollInfluence,
    },
    noise: {
      noiseScale: params.noiseScale,
      blueNoiseAmount: params.blueNoiseAmount,
      grainAmount: params.grainAmount,
    },
    dither: {
      ditherSize: params.ditherSize,
      pixelDensity: params.pixelDensity,
    },
  };
}

export function mergeConfig(
  base: MonochromeParams,
  patch: Partial<DitherEngineConfig>,
): MonochromeParams {
  return {
    ...base,
    ...(patch.material ?? {}),
    ...(patch.animation ?? {}),
    ...(patch.lighting ?? {}),
    ...(patch.colors ?? {}),
    ...(patch.interaction ?? {}),
    ...(patch.noise ?? {}),
    ...(patch.dither ?? {}),
  };
}

export function createEngineParams(
  overrides?: Partial<MonochromeParams>,
): MonochromeParams {
  return { ...MONOCHROME_DEFAULTS, ...overrides };
}

export type { DitherEngineConfig };

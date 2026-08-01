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
      posterization: params.posterization,
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
      scrollInfluence: params.scrollInfluence,
    },
    finish: {
      grainAmount: params.grainAmount,
      blueNoiseAmount: params.blueNoiseAmount,
      softEdge: params.softEdge,
      noiseScale: params.noiseScale,
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
  const { dither: ditherPatch, ...rest } = patch;
  return {
    ...base,
    ...(rest.material ?? {}),
    ...(rest.animation ?? {}),
    ...(rest.lighting ?? {}),
    ...(rest.colors ?? {}),
    ...(rest.interaction ?? {}),
    ...(rest.finish ?? {}),
    ...(ditherPatch
      ? {
          ditherSize: ditherPatch.ditherSize ?? base.ditherSize,
          pixelDensity: ditherPatch.pixelDensity ?? base.pixelDensity,
        }
      : {}),
  };
}

export function createEngineParams(
  overrides?: Partial<MonochromeParams>,
): MonochromeParams {
  return { ...MONOCHROME_DEFAULTS, ...overrides };
}

export type { DitherEngineConfig };

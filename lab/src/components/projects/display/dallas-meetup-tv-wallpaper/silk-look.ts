/**
 * Live silk-ground knobs. Defaults match the locked GLSL look.
 * Demo writes this object every render; the rAF loop reads it — never remount GL.
 */

import { GRADIENT_MOTION } from "./moving-gradient-config";

export type SilkLook = {
  /** Time multiplier (was GRADIENT_MOTION). */
  speed: number;
  /** Uniform scale on fold frequency (1 = locked 0.58 × 0.46). */
  scale: number;
  /** Domain-warp crease amount. */
  warp: number;
  /** Mid grey of the silk. */
  grey: number;
  /** Highlight ridge value. */
  white: number;
  /** Mix of white into ridges. */
  ridge: number;
  /** Slow field rotation (radians per second at speed 1). */
  rotate: number;
  /** UV drift (units per second at speed 1). */
  drift: number;
  /** Film-grain mix on top of the silk (0 = none). */
  grain: number;
};

export type SilkLookRef = { current: SilkLook };

export const DEFAULT_SILK_LOOK: SilkLook = {
  speed: GRADIENT_MOTION,
  scale: 1,
  warp: 2.15,
  grey: 0.48,
  white: 0.82,
  ridge: 0.42,
  rotate: 0.045,
  drift: 0.09,
  grain: 0.22,
};

export const SILK_LOOK_RANGES = {
  speed: { min: 0.15, max: 2.8, step: 0.05 },
  scale: { min: 0.45, max: 2.2, step: 0.05 },
  warp: { min: 0.4, max: 4, step: 0.05 },
  grey: { min: 0.22, max: 0.72, step: 0.01 },
  white: { min: 0.55, max: 0.95, step: 0.01 },
  ridge: { min: 0.1, max: 0.85, step: 0.01 },
  rotate: { min: 0, max: 0.18, step: 0.005 },
  drift: { min: 0, max: 0.28, step: 0.005 },
  grain: { min: 0, max: 1, step: 0.01 },
} as const;

export function clampSilkLook(look: SilkLook): SilkLook {
  const c = (n: number, min: number, max: number) =>
    Math.min(max, Math.max(min, n));
  return {
    speed: c(look.speed, SILK_LOOK_RANGES.speed.min, SILK_LOOK_RANGES.speed.max),
    scale: c(look.scale, SILK_LOOK_RANGES.scale.min, SILK_LOOK_RANGES.scale.max),
    warp: c(look.warp, SILK_LOOK_RANGES.warp.min, SILK_LOOK_RANGES.warp.max),
    grey: c(look.grey, SILK_LOOK_RANGES.grey.min, SILK_LOOK_RANGES.grey.max),
    white: c(look.white, SILK_LOOK_RANGES.white.min, SILK_LOOK_RANGES.white.max),
    ridge: c(look.ridge, SILK_LOOK_RANGES.ridge.min, SILK_LOOK_RANGES.ridge.max),
    rotate: c(
      look.rotate,
      SILK_LOOK_RANGES.rotate.min,
      SILK_LOOK_RANGES.rotate.max,
    ),
    drift: c(look.drift, SILK_LOOK_RANGES.drift.min, SILK_LOOK_RANGES.drift.max),
    grain: c(
      look.grain ?? DEFAULT_SILK_LOOK.grain,
      SILK_LOOK_RANGES.grain.min,
      SILK_LOOK_RANGES.grain.max,
    ),
  };
}

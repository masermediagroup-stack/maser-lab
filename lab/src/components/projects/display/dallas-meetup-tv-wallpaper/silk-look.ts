/**
 * Live silk-ground knobs. Defaults match the 2026-09-11 TV tune.
 * Demo writes this object every render; the rAF loop reads it — never remount GL.
 */

export type SilkLook = {
  /** Time multiplier (×). */
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

/** Screenshot-locked idle look (2026-09-11). */
export const DEFAULT_SILK_LOOK: SilkLook = {
  speed: 0.15,
  scale: 0.5,
  warp: 0.55,
  grey: 0.45,
  white: 0.95,
  ridge: 0.8,
  rotate: 0.015,
  drift: 0.09,
  grain: 0.75,
};

/**
 * Ranges sit around the defaults. Point sliders step by 0.05 so values
 * like 0.71 never appear. Speed uses 0.05×. Rotate / drift stay on a
 * coarser grid of their own scale (0.005 / 0.01).
 */
export const SILK_LOOK_RANGES = {
  speed: { min: 0.05, max: 0.8, step: 0.05 },
  scale: { min: 0.2, max: 1.2, step: 0.05 },
  warp: { min: 0.15, max: 1.8, step: 0.05 },
  grey: { min: 0.2, max: 0.75, step: 0.05 },
  white: { min: 0.6, max: 1, step: 0.05 },
  ridge: { min: 0.3, max: 1, step: 0.05 },
  rotate: { min: 0, max: 0.06, step: 0.005 },
  drift: { min: 0, max: 0.2, step: 0.01 },
  grain: { min: 0, max: 1, step: 0.05 },
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

/** Liquid metal meatballs — locked chrome palette and sim caps. */

export const LMM_ALBEDO = "#10a4ff";
export const LMM_CREASE = "#0065a3";
export const LMM_SPEC = "#f3f7ff";

export const LMM_ALBEDO_RGB = [16 / 255, 164 / 255, 1] as const;
export const LMM_CREASE_RGB = [0, 101 / 255, 163 / 255] as const;
export const LMM_SPEC_RGB = [243 / 255, 247 / 255, 1] as const;

/** One fixed key light (upper-left, toward camera). */
export const LMM_LIGHT_DIR = [-0.42, 0.66, 0.62] as const;

/** IQ quadratic smin tension `k` in CSS pixels (neck thickness). */
export const LMM_MERGE_K = 24;

export const MAX_PRIMARIES = 8;
export const MAX_CHARGES = 16;

export const SPAWN_COOLDOWN_MIN = 0.48;
export const SPAWN_COOLDOWN_MAX = 1.15;
export const BURST_COUNT = 3;
export const BURST_STAGGER = 0.18;

export const RADIUS_MIN = 28;
export const RADIUS_MAX = 68;

/** Still cluster in normalized viewport space (reduced motion). */
export const STILL_CLUSTER: readonly { x: number; y: number; r: number }[] = [
  { x: 0.5, y: 0.42, r: 0.11 },
  { x: 0.58, y: 0.48, r: 0.08 },
  { x: 0.44, y: 0.5, r: 0.075 },
  { x: 0.53, y: 0.36, r: 0.06 },
  { x: 0.4, y: 0.4, r: 0.055 },
];

export const LIQUID_METAL_MEATBALLS_DEFAULTS = {
  mergeK: LMM_MERGE_K,
  maxPrimaries: MAX_PRIMARIES,
} as const;

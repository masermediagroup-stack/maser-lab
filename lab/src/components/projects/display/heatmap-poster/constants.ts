import type { HeatmapLook } from "./types";

export const HEATMAP_HEAT: HeatmapLook["heat"] = [1, 0.9569, 0.7608];
export const HEATMAP_MID: HeatmapLook["mid"] = [0.8863, 0.1059, 0.4392];
export const HEATMAP_GROUND: HeatmapLook["ground"] = [0.0706, 0.0314, 0.1804];

export const HEATMAP_DEFAULTS: HeatmapLook = {
  heat: HEATMAP_HEAT,
  mid: HEATMAP_MID,
  ground: HEATMAP_GROUND,
  grain: 0.35,
  wave: 0.55,
  speed: 0.45,
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const PACK_MAX = 512;
export const MASK_FADE_MS = 180;

/**
 * Mean-normalized population variance gate on the RAW depth field
 * (before min-max stretch or near/far invert).
 *
 * Depth Anything’s output scale moves per image, so we measure
 * Var(x / mean) — equivalent to CV² — not raw variance.
 *
 * Empirical set (see depth-confidence.test.ts):
 *   photo-like subject/bg split  → 0.0877
 *   planar logo + sensor noise   → 0.0000038
 *   line drawing (sparse strokes) → 0.000040
 *   low-contrast photo (gap≈0.8)  → 0.0035
 *   landscape photo               → 0.062
 * Threshold 0.001 sits in the gap: 25× above line drawings, 3.5×
 * below the weakest real depth field. A low-contrast photo where
 * the model resolves real near/far structure still passes; flat
 * inputs never do. At 0.02 the gate discarded genuine narrow-range
 * depth — case 5 in the verification matrix.
 */
export const DEPTH_VARIANCE_MIN = 0.001;

export const FORMAT_ASPECT: Record<"9-16" | "a4", number> = {
  "9-16": 9 / 16,
  a4: 1 / Math.SQRT2,
};

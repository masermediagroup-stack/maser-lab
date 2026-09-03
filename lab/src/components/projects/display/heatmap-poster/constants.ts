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

/** Inner silhouette size before Paper’s glow padding. */
export const FIELD_PACK_INNER = 512;
/** Storage capacity for the packed RGB field (inner + padding). */
export const FIELD_PACK_MAX = 1024;

/**
 * Paper field defaults. Not knobs. Wave and Speed already drive the wash.
 * Do not add CSS tokens or rail controls for these.
 */
export const FIELD_CONTOUR = 0.5;
export const FIELD_INNER_GLOW = 0.5;
export const FIELD_OUTER_GLOW = 0.5;

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

/**
 * Frame-contact drop: perimeter-on-image-edge / blob-perimeter.
 * 0.40 lets a one-side kiss (~0.25–0.30) survive; two-side
 * ceiling/window still dies. Not a "which edge" heuristic.
 */
export const FRAME_CONTACT_MAX = 0.4;

/**
 * REFUSAL. 0.25 drops a valid 9:16 body that fills the bottom
 * edge (shoulders kiss one side, they stay). Do not use as the gate.
 */
export const FRAME_CONTACT_REFUSAL = 0.25;

/** Top-two scores within this relative gap are "comparable"; centre is tiebreak only. */
export const CENTRE_TIEBREAK = 0.15;

/** First near-field band, as a fraction of the valid depth range. Not a hard floor. */
export const NEAR_FIELD_BAND_START = 0.3;

/** Widen the near band by this fraction until a compact mass appears. */
export const NEAR_BAND_STEP = 0.1;

/**
 * Widening test only: a near-band winner below this compactness is
 * "thin structure" (a strap), not a subject. Not a scoring cutoff.
 */
export const NEAR_BAND_THIN_COMPACTNESS = 0.15;

/**
 * Skip floor, not a compactness cutoff. Locked. Do not raise it.
 * Below: no mass, paint the ink. At or above: run the winner.
 * The strap still loses on area × compactness, not by getting skipped.
 *
 * Evidence: logo outline 0.012; a filled head 0.182. 0.05 catches
 * outlines and misses filled masses, including messy silhouettes.
 */
export const FLAT_MASS_COMPACTNESS = 0.05;

/** Evidence for FLAT_MASS_COMPACTNESS. Not a cutoff. */
export const FLAT_MASS_EVIDENCE = 0.012;

/**
 * Named so the skip floor is not raised. A person with an arm out
 * or hair breaking the silhouette lands closer to 0.08 than 0.18 —
 * still a photograph. Not a cutoff. Not a reason to move 0.05.
 */
export const FLAT_MASS_MESSY_SILHOUETTE = 0.08;

export const FORMAT_ASPECT: Record<"9-16" | "a4", number> = {
  "9-16": 9 / 16,
  a4: 1 / Math.SQRT2,
};

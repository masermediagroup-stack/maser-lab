import type { PixelInfoTuning } from "./types";

export const MASER_BLUE = "#10a4ff";

export const TRIGGER_SIZE = 64;
/** Matches `.pic-squircle` border-radius */
export const TRIGGER_RADIUS = 22;

export const DEFAULT_TITLE = "Info";

export const DEMO_BODY =
  "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static types, interfaces, and tooling-friendly checks so teams can catch errors before runtime while still shipping to any browser or Node environment.";

export const PIC_DEFAULTS: PixelInfoTuning = {
  pixelSize: 5,
  snakeDensity: 0.42,
  assembleMs: 1400,
  dissipateMs: 160,
  cardRadius: 20,
};

export const PIC_PARAM_RANGES = {
  pixelSize: { min: 3, max: 12, step: 1 },
  snakeDensity: { min: 0.2, max: 0.75, step: 0.05 },
  assembleMs: { min: 400, max: 2400, step: 20 },
  dissipateMs: { min: 60, max: 280, step: 5 },
  cardRadius: { min: 8, max: 36, step: 1 },
} as const;

/**
 * DOM card + GlideText start once the pixel plate is mostly solid —
 * do not wait for assemble to fully finish (avoids a long blank card).
 */
export const CARD_CONTENT_REVEAL_AT = 0.78;

/** Progress when canvas starts filling a solid rounded plate under pixels. */
export const PIXEL_PLATE_FILL_AT = 0.68;

/** Progress when the plate must be fully opaque. */
export const PIXEL_PLATE_SOLID_AT = 0.86;

/** Ease-out cubic retarget blend when interrupting mid-flight. */
export const RETARGET_BLEND_MS = 160;

export const CARD_MAX_WIDTH = 360;
export const CARD_MIN_HEIGHT = 200;

/**
 * Collapse: DOM trigger crossfades in during the final portion of squircle grow
 * (grow 0.72→1). Keeps icon/label continuous with the canvas plate.
 */
export const SQUIRCLE_DOM_REVEAL_GROW = 0.72;

/**
 * Collapse timeline (collapseT = 1 - progress):
 * 0→BLAST: explode into a filled disk (not a ring)
 * BLAST→MERGE: suck every pixel into one center point
 * MERGE→1: that point expands into the squircle
 */
export const COLLAPSE_BLAST_END = 0.36;
export const COLLAPSE_MERGE_END = 0.78;
export const COLLAPSE_EXPAND_START = 0.82;

/** GlideText in/out duration — keep snappy so the plate never sits blank. */
export const GLIDE_TEXT_MS = 240;

/** Glide travel (px) — short so copy lands quickly. */
export const GLIDE_DISTANCE_PX = 10;

/** Glide blur (px) — light so text reads sooner. */
export const GLIDE_BLUR_PX = 2;

/** Max CSS blur (px) on trigger dissipate — keep subtle. */
export const TRIGGER_BLUR_MAX = 4;

/**
 * Assemble footprint rules (seed may reshuffle paths, never the card silhouette):
 * 1. Target grid spans the full card width × height (no undersized floor grid).
 * 2. Perimeter / edge ring cells are always kept — density only thins the interior.
 * 3. Random seed affects burst midpoints, home mapping, and delays — not whether
 *    the settled outline reaches the card bounds.
 */
export const ASSEMBLE_FOOTPRINT_RULES = {
  /** Edge ring depth in cells that density may not skip. */
  perimeterCells: 1,
} as const;

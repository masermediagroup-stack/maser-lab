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
  pixelDensity: 0.42,
  assembleMs: 1400,
  dissipateMs: 160,
  cardRadius: 20,
};

export const PIC_PARAM_RANGES = {
  pixelSize: { min: 3, max: 12, step: 1 },
  pixelDensity: { min: 0.2, max: 0.75, step: 0.05 },
  assembleMs: { min: 400, max: 2400, step: 20 },
  dissipateMs: { min: 60, max: 280, step: 5 },
  cardRadius: { min: 8, max: 36, step: 1 },
} as const;

/**
 * DOM card + GlideText start once the pixel plate is mostly solid —
 * do not wait for assemble to fully finish (avoids a long blank card).
 */
export const CARD_CONTENT_REVEAL_AT = 0.82;

/** Progress when canvas starts filling a solid rounded plate under pixels. */
export const PIXEL_PLATE_FILL_AT = 0.78;

/** Progress when the plate must be fully opaque. */
export const PIXEL_PLATE_SOLID_AT = 0.92;

/** Ease-out cubic retarget blend when interrupting mid-flight. */
export const RETARGET_BLEND_MS = 160;

export const CARD_MAX_WIDTH = 360;
export const CARD_MIN_HEIGHT = 200;

/**
 * Collapse: DOM trigger crossfades in during the final portion of squircle grow
 * (grow 0.72→1). Keeps icon/label continuous with the canvas plate.
 */
/** DOM trigger fades in during the first half of squircle grow (not after). */
export const SQUIRCLE_DOM_REVEAL_GROW = 0.42;

/**
 * Collapse timeline (collapseT = 1 - progress):
 * 0→BLAST: explode into a filled disk (not a ring)
 * BLAST→MERGE: suck every pixel into one center point
 * MERGE→1: merged core expands into the squircle (no dead gap before grow)
 */
export const COLLAPSE_BLAST_END = 0.34;
export const COLLAPSE_MERGE_END = 0.76;
export const COLLAPSE_EXPAND_START = 0.68;

/** Squircle grow starts at this fraction of trigger size (matches merged swarm). */
export const COLLAPSE_EXPAND_MIN_SCALE = 0.14;

/** Fade flying pixels out over this collapseT span once squircle grow begins. */
export const COLLAPSE_SWARM_FADE_SPAN = 0.2;

/** GlideText in/out duration — keep snappy so the plate never sits blank. */
export const GLIDE_TEXT_MS = 240;

/** Glide travel (px) — short so copy lands quickly. */
export const GLIDE_DISTANCE_PX = 10;

/** Glide blur (px) — light so text reads sooner. */
export const GLIDE_BLUR_PX = 2;

/** Max CSS blur (px) on trigger dissipate — keep subtle. */
export const TRIGGER_BLUR_MAX = 4;

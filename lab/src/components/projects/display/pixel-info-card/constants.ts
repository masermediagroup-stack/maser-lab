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
 * Collapse timeline (collapseT = 1 - progress):
 * 0→BLAST: explode into a filled disk
 * BLAST→MERGE: suck every pixel into the origin while shrinking to nothing
 * MERGE→VANISH: mop-up fade (no packed blob / mini-squircle)
 * REST: empty beat at the origin
 * EXPAND: DOM squircle comes toward the viewer from that same point
 *
 * Wall-clock: `COLLAPSE_EXPAND_WALL` reserved for the squircle entrance.
 */
export const COLLAPSE_BLAST_END = 0.16;
export const COLLAPSE_MERGE_END = 0.38;
/** Pixels fully gone before the rest beat. */
export const COLLAPSE_VANISH_END = 0.4;
/** Squircle starts after a short empty beat (pixels already gone). */
export const COLLAPSE_EXPAND_START = 0.42;

/** Fraction of collapse duration spent on squircle coming into the page. */
export const COLLAPSE_EXPAND_WALL = 0.58;

/**
 * Near-zero so the plate is not a visible mini-squircle. Grows toward the
 * viewer from the vanished point with ease-out so it arrives a beat sooner.
 */
export const SQUIRCLE_ENTER_MIN_SCALE = 0.06;

/** Recede/approach depth in CSS px (paired with perspective on the plate). */
export const SQUIRCLE_ENTER_Z_PX = 56;

/** Icon + label fade in after the plate has started emerging. */
export const SQUIRCLE_CHROME_REVEAL_AT = 0.28;

/** GlideText in/out duration — keep snappy so the plate never sits blank. */
export const GLIDE_TEXT_MS = 240;

/** Glide travel (px) — short so copy lands quickly. */
export const GLIDE_DISTANCE_PX = 10;

/** Glide blur (px) — light so text reads sooner. */
export const GLIDE_BLUR_PX = 2;

/** Max CSS blur (px) on trigger dissipate — keep subtle. */
export const TRIGGER_BLUR_MAX = 4;

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
 * DOM card only mounts when assemble has finished (phase expanded).
 * Canvas keeps the solid plate until then — no mid-flight swap flash.
 */
export const CARD_DOM_REVEAL_AT = 1;

/** Progress when canvas starts filling a solid rounded plate under pixels. */
export const PIXEL_PLATE_FILL_AT = 0.72;

/** Progress when the plate must be fully opaque. */
export const PIXEL_PLATE_SOLID_AT = 0.9;

/** Ease-out cubic retarget blend when interrupting mid-flight. */
export const RETARGET_BLEND_MS = 160;

export const CARD_MAX_WIDTH = 360;
export const CARD_MIN_HEIGHT = 200;

/**
 * Collapse: DOM trigger (icon + label) only after pixels have fully
 * reconstituted the squircle. Keep very late to avoid early chrome.
 */
export const SQUIRCLE_DOM_REVEAL_AT = 0.025;

/** Collapse: solid squircle plate under converging pixels (no hollow center). */
export const SQUIRCLE_PLATE_FILL_AT = 0.28;

/** Collapse: squircle plate fully opaque. */
export const SQUIRCLE_PLATE_SOLID_AT = 0.06;

/** Max CSS blur (px) on trigger dissipate — keep subtle. */
export const TRIGGER_BLUR_MAX = 4;

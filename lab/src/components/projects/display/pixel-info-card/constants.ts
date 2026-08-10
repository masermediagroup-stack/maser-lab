import type { PixelInfoTuning } from "./types";

export const MASER_BLUE = "#10a4ff";

export const TRIGGER_SIZE = 64;

export const DEFAULT_TITLE = "Info";

export const DEMO_BODY =
  "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static types, interfaces, and tooling-friendly checks so teams can catch errors before runtime while still shipping to any browser or Node environment.";

export const PIC_DEFAULTS: PixelInfoTuning = {
  pixelSize: 6,
  snakeDensity: 0.55,
  assembleMs: 420,
  dissipateMs: 80,
  cardRadius: 20,
};

export const PIC_PARAM_RANGES = {
  pixelSize: { min: 3, max: 12, step: 1 },
  snakeDensity: { min: 0.25, max: 0.9, step: 0.05 },
  assembleMs: { min: 250, max: 700, step: 10 },
  dissipateMs: { min: 40, max: 160, step: 10 },
  cardRadius: { min: 8, max: 36, step: 1 },
} as const;

/** Card DOM fades in once assemble progress reaches this. */
export const CARD_DOM_REVEAL_AT = 0.8;

/** Ease-out cubic retarget blend when interrupting mid-flight. */
export const RETARGET_BLEND_MS = 200;

export const CARD_MAX_WIDTH = 360;
export const CARD_MIN_HEIGHT = 200;

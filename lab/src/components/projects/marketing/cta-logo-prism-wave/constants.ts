import type { PrismWaveLook } from "./types";

/** Locked Maser blue — body of the mark. SVG fill is #2cafff; we retint. */
export const CLPW_BLUE = "#10a4ff";
export const CLPW_BLUE_RGB = [16 / 255, 164 / 255, 1] as const;

/** Filament through glass. Light = deeper blue; dark = pale internal. */
export const CLPW_FILAMENT_LIGHT = "#0a5a9c";
export const CLPW_FILAMENT_DARK = "#e7f4ff";

export const CLPW_FRINGE = "#73e7ff";
export const CLPW_FRINGE_RGB = [115 / 255, 231 / 255, 1] as const;

export const CLPW_VAPOR = "#ffffff";

export const LOGO_SRC = "/assets/cta-logo-prism-wave/Blue-HD.svg";
export const LOGO_ASPECT = 3776.87 / 1915.83;
export const LOGO_RASTER_WIDTH = 2048;

/** Production CtaLogoTilt constants. */
export const MAX_TILT_X = 14;
export const MAX_TILT_Y = 16;
export const MAX_LIFT = 14;
export const TILT_LERP = 0.12;
export const TILT_PERSPECTIVE_PX = 920;

export const SPEED_MIN = 0.12;
export const SPEED_MAX = 1.4;
export const WIDTH_MIN = 0.008;
export const WIDTH_MAX = 0.028;
export const FRINGE_MIN = 0;
export const FRINGE_MAX = 1;

/** Hover multiplies travel so the band reads with the tilt, still 2D. */
export const HOVER_SPEED_BOOST = 1.45;

export const CTA_LOGO_PRISM_WAVE_DEFAULTS: PrismWaveLook = {
  speed: 0.28,
  bandWidth: 0.013,
  fringe: 0.52,
};

/** Cyan tip at the traveling head — same offset as the core, not a blink. */
export const FILAMENT_FRINGE_DASH = "0.12 0.88";

/**
 * Electric wander paths (viewBox 200×101). Full-glyph jumps from different
 * edges — not parallel side-to-side worms. Peaks are phase-offset so they
 * miss more without flattening into lanes.
 */
export const FILAMENT_PATHS = [
  "M -10 20 C 18 6 34 88 56 16 C 78 96 102 6 124 86 C 146 8 170 94 194 14 C 206 42 214 30 218 34",
  "M 214 76 C 196 96 176 8 154 86 C 130 6 108 94 86 12 C 64 98 42 8 18 82 C 4 48 -12 64 -14 58",
  "M 64 -8 C 42 72 20 8 8 88 C 30 4 60 98 90 10 C 120 94 150 6 180 82 C 198 18 214 50 218 46",
  "M 36 112 C 10 18 2 92 24 12 C 50 98 80 6 110 90 C 140 4 170 96 200 16 C 210 58 214 38 216 42",
  "M 214 98 C 188 6 160 94 134 12 C 108 98 84 4 56 92 C 30 6 8 88 -10 22 C -14 50 -8 54 -6 52",
] as const;

/** Near-same weight. Not one fat plus hairlines. */
export const FILAMENT_WEIGHTS = [0.94, 1, 1.06, 0.97, 1.04] as const;

/** Cycle-duration drift so the visible count wanders between 2 and 5. */
export const FILAMENT_DURATION_SCALE = [0.93, 1, 1.1, 0.97, 1.05] as const;

/** Negative-delay fractions of each path's own duration. */
export const FILAMENT_DELAY_FRAC = [0, 0.16, 0.33, 0.51, 0.72] as const;

/**
 * pathLength=1. Long traveling segment + short gap so the stroke eases
 * through the glyph. Not a full-path snap, not a dashed wedge.
 */
export const FILAMENT_DASH = "0.64 0.36";

/** One traveling-window cycle at default speed. */
export const CSS_WAVE_DURATION_S = 5.6;

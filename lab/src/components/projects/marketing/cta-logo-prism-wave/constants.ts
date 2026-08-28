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

/** Short on / long off — cyan lean at the draw front (pathLength=1). */
export const FILAMENT_FRINGE_DASH = "0.06 0.94";

/**
 * Overlapping wander paths (viewBox 200×101). Starts are spread around
 * the lockup — left, right, top, bottom, corner — not one left-middle
 * origin. CSS strokes these; WGSL hashes a perimeter spawn per trip.
 */
export const FILAMENT_PATHS = [
  "M -10 18 C 18 6 34 72 56 26 C 74 2 94 84 116 22 C 136 88 154 10 176 46 C 190 8 206 60 214 38",
  "M 214 34 C 192 6 174 90 154 28 C 136 2 116 92 96 34 C 76 96 56 8 36 50 C 20 12 6 70 -12 46",
  "M 78 -8 C 52 20 26 4 18 42 C 10 80 44 98 68 56 C 90 16 118 94 142 38 C 164 6 190 76 214 50",
  "M 42 112 C 16 78 4 96 14 56 C 26 14 52 90 74 30 C 96 2 122 88 146 26 C 168 92 194 16 214 48",
  "M 214 90 C 190 108 168 58 148 86 C 126 14 106 98 86 32 C 66 2 46 80 26 38 C 10 10 -8 62 -12 48",
] as const;

/** Near-same weight. Not one fat plus hairlines. */
export const FILAMENT_WEIGHTS = [0.94, 1, 1.06, 0.97, 1.04] as const;

/** Cycle-duration drift so the visible count wanders between 2 and 5. */
export const FILAMENT_DURATION_SCALE = [0.93, 1, 1.1, 0.97, 1.05] as const;

/** Negative-delay fractions of each path's own duration. */
export const FILAMENT_DELAY_FRAC = [0, 0.16, 0.33, 0.51, 0.72] as const;

/**
 * pathLength=1. Draw the full continuous stroke, then clear, then rest.
 * Rest is short enough that trips overlap.
 */
export const FILAMENT_DASH = "1 1";

/** One draw+clear+rest cycle at default speed. */
export const CSS_WAVE_DURATION_S = 5.6;

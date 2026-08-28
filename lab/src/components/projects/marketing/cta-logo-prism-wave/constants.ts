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
 * Lane paths (viewBox 200×101). Parallel-ish bands that miss each other,
 * with entries on different edges — not one shared S-curve through the
 * middle. CSS strokes these; WGSL hashes lat on each line's home edge.
 */
export const FILAMENT_PATHS = [
  "M -12 22 C 36 18 78 28 118 20 C 152 14 182 24 214 22",
  "M 214 74 C 176 70 138 80 96 72 C 58 66 24 76 -12 74",
  "M 28 -8 C 22 22 34 52 26 78 C 20 94 32 108 30 114",
  "M 172 114 C 180 86 166 54 176 28 C 182 12 170 -4 174 -8",
  "M -12 48 C 40 44 88 54 132 46 C 166 40 194 50 214 48",
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

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
  fringe: 0.22,
};

/**
 * Sequential wander paths (viewBox 200×101). One finishes the trip before
 * the next enters. CSS strokes these; WGSL matches the same snakes.
 */
export const FILAMENT_PATHS = [
  "M -12 54 C 14 12 28 90 48 34 C 64 4 78 94 98 30 C 116 2 132 88 152 38 C 168 10 184 76 212 46",
  "M -12 42 C 18 88 36 8 58 62 C 76 98 94 12 116 70 C 134 4 154 92 174 36 C 188 8 200 64 212 52",
  "M -12 66 C 16 18 34 96 56 40 C 74 6 96 88 118 28 C 138 96 156 14 176 72 C 190 18 202 80 212 40",
] as const;

/**
 * pathLength=1. Draw the full continuous stroke, then clear, then wait
 * two trips so the next path does not overlap.
 */
export const FILAMENT_DASH = "1 1";

/** Full sequential loop (3 trips: draw + clear each) at default speed. */
export const CSS_WAVE_DURATION_S = 7.2;

import type { PrismWaveLook } from "./types";

/** Locked Maser blue — body of the mark. SVG fill is #2cafff; we retint. */
export const CLPW_BLUE = "#10a4ff";
export const CLPW_BLUE_RGB = [16 / 255, 164 / 255, 1] as const;

/** Tiny cool leading-edge fringe. Not pink, not a hue sweep. */
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
export const WIDTH_MIN = 0.006;
export const WIDTH_MAX = 0.08;
export const FRINGE_MIN = 0;
export const FRINGE_MAX = 1;

/** Hover multiplies travel so the band reads with the tilt, still 2D. */
export const HOVER_SPEED_BOOST = 1.45;

export const CTA_LOGO_PRISM_WAVE_DEFAULTS: PrismWaveLook = {
  speed: 0.28,
  bandWidth: 0.016,
  fringe: 0.18,
};

/**
 * Shared wander path (viewBox 200×101, same aspect as Blue-HD).
 * CSS strokes this; WGSL approximates the same left-to-right snake.
 * The centerline must leave a straight cut — not grain on a bar.
 */
export const FILAMENT_PATH =
  "M -12 54 C 14 12 28 90 48 34 C 64 4 78 94 98 30 C 116 2 132 88 152 38 C 168 10 184 76 212 46";
export const FILAMENT_FORK_PATH =
  "M 48 34 C 62 2 88 6 118 36";
export const FILAMENT_SPUR_PATH =
  "M 98 30 C 108 78 128 82 148 44";

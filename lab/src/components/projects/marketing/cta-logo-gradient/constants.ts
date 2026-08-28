import type { CtaLogoGradientLook } from "./types";

export const LOGO_SRC = "/assets/cta-logo-gradient/Blue-HD.svg";

/** Production CtaLogoTilt throw. */
export const MAX_TILT_X = 14;
export const MAX_TILT_Y = 16;
export const MAX_LIFT = 14;
export const LERP = 0.12;
export const LOOP_SECONDS = 9;
export const PERSPECTIVE_PX = 920;

export const CTA_LOGO_GRADIENT_DEFAULTS: CtaLogoGradientLook = {
  speed: 1,
  highlight: 0.42,
  shade: 0.38,
  glow: 0.55,
  angle: 118,
};

export const LOOK_RANGES = {
  speed: { min: 0.25, max: 2.2, step: 0.01 },
  highlight: { min: 0, max: 1, step: 0.01 },
  shade: { min: 0, max: 1, step: 0.01 },
  glow: { min: 0, max: 1, step: 0.01 },
  angle: { min: 0, max: 180, step: 1 },
} as const;

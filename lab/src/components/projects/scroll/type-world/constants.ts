export const TYPE_WORLD_QUOTE = [
  "Build worlds",
  "break rules",
  "stay curious",
].join("\n");

export const TYPE_WORLD_DEFAULTS = {
  quote: TYPE_WORLD_QUOTE,
  textColor: "#1047C9",
  backgroundColor: "#FAFAF7",
  dragSensitivity: 0.0054,
  inertia: 0.55,
  pitchLimit: 20,
  hint: "drag to turn the world",
  gripScale: 1.015,
  minScale: 0.001,
  gradientColor1: "#1047C9",
  gradientColor2: "#6B42FF",
  gradientColor3: "#E052A0",
  gradientSpeed: 1,
  gradientAngle: 25,
  gradientSpread: 1,
  gradientReverse: false,
  scale: 1,
} as const;

/** Seconds for one noticeable pigment traversal at gradient speed = 1. */
export const GRADIENT_CYCLE_SECONDS = 11;

export const TYPE_WORLD_HINT = TYPE_WORLD_DEFAULTS.hint;

export const TEXTURE_SIZE = {
  desktop: { width: 2048, height: 1024 },
  mobile: { width: 2048, height: 1024 },
} as const;

export const SPHERE_SEGMENTS = {
  desktop: [1, 96, 64] as const,
  mobile: [1, 64, 48] as const,
};

/**
 * Sphere diameter vs the R3F viewport. Desktop stays an editorial object
 * (~40% of stage width) so the quote is not a billboard. Mobile still
 * fills most of the width. Height caps keep poles from dominating.
 */
export const SPHERE_FIT = {
  mobileWidth: 0.86,
  desktopWidth: 0.4,
  mobileHeight: 0.94,
  desktopHeight: 0.52,
} as const;

/** Stable R3F camera — new literals reconfigure the canvas. */
export const TYPE_WORLD_CAMERA = {
  fov: 24,
  near: 0.1,
  far: 24,
  position: [0, 0, 3.4] as [number, number, number],
};

export const TYPE_WORLD_GL = {
  antialias: true,
  alpha: true,
  powerPreference: "high-performance" as const,
};

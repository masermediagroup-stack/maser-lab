export const TYPE_WORLD_QUOTE = [
  "the world is designed.",
  "you get to design",
  "what comes next.",
].join("\n");

export const TYPE_WORLD_DEFAULTS = {
  quote: TYPE_WORLD_QUOTE,
  textColor: "#1047C9",
  backgroundColor: "#FAFAF7",
  revealEnd: 0.26,
  overshoot: 1.06,
  dragSensitivity: 0.0054,
  inertia: 0.55,
  pitchLimit: 20,
  hint: "drag to turn the world",
  gripScale: 1.015,
  minScale: 0.001,
} as const;

export const TYPE_WORLD_HINT = TYPE_WORLD_DEFAULTS.hint;

export const TEXTURE_SIZE = {
  desktop: { width: 2048, height: 1024 },
  mobile: { width: 1024, height: 512 },
} as const;

export const SPHERE_SEGMENTS = {
  desktop: [1, 96, 64] as const,
  mobile: [1, 64, 48] as const,
};

/** Stable R3F camera — new literals reconfigure the canvas. */
export const TYPE_WORLD_CAMERA = {
  fov: 28,
  near: 0.1,
  far: 24,
  position: [0, 0, 3.1] as [number, number, number],
};

export const TYPE_WORLD_GL = {
  antialias: true,
  alpha: true,
  powerPreference: "high-performance" as const,
};

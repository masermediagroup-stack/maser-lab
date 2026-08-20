export const SURFACE_EFFECT_IDS = [
  "none",
  "orbs",
  "metaballs",
  "waves",
  "voronoi",
  "perlin",
] as const;

export type SurfaceEffectId = (typeof SURFACE_EFFECT_IDS)[number];

export const SURFACE_EFFECT_LABELS: Record<SurfaceEffectId, string> = {
  none: "None",
  orbs: "Orbs",
  metaballs: "Metaballs",
  waves: "Waves",
  voronoi: "Voronoi",
  perlin: "Perlin",
};

export type SurfaceEffectDefaults = {
  speed: number;
  scale: number;
  softness: number;
  seed: number;
  threshold: number;
  density: number;
  amplitude: number;
  direction: number;
  distortion: number;
  edge: number;
  contrast: number;
  frequency: number;
  thickness: number;
};

export const SURFACE_EFFECT_DEFAULTS: Record<SurfaceEffectId, SurfaceEffectDefaults> = {
  none: {
    speed: 0,
    scale: 1,
    softness: 1,
    seed: 1,
    threshold: 0.5,
    density: 6,
    amplitude: 0.2,
    direction: 0.4,
    distortion: 0.35,
    edge: 0.04,
    contrast: 0.12,
    frequency: 1,
    thickness: 0.45,
  },
  orbs: {
    speed: 1,
    scale: 1,
    softness: 0.045,
    seed: 1047,
    threshold: 0.5,
    density: 6,
    amplitude: 0.2,
    direction: 0.4,
    distortion: 0.35,
    edge: 0.04,
    contrast: 0.12,
    frequency: 1,
    thickness: 0.45,
  },
  metaballs: {
    speed: 0.55,
    scale: 1,
    softness: 1,
    seed: 3,
    threshold: 0.4,
    density: 7,
    amplitude: 0.2,
    direction: 0.4,
    distortion: 0.35,
    edge: 0.04,
    contrast: 0.12,
    frequency: 1,
    thickness: 0.45,
  },
  waves: {
    speed: 0.4,
    scale: 1,
    softness: 0.18,
    seed: 1,
    threshold: 0.5,
    density: 6,
    amplitude: 0.22,
    direction: 0.55,
    distortion: 0.35,
    edge: 0.04,
    contrast: 0.12,
    frequency: 1.15,
    thickness: 0.55,
  },
  voronoi: {
    speed: 0.28,
    scale: 1,
    softness: 1,
    seed: 5,
    threshold: 0.48,
    density: 6,
    amplitude: 0.2,
    direction: 0.4,
    distortion: 0.32,
    edge: 1.1,
    contrast: 0.12,
    frequency: 1,
    thickness: 0.45,
  },
  perlin: {
    speed: 0.32,
    scale: 1.15,
    softness: 0.35,
    seed: 2,
    threshold: 0.5,
    density: 6,
    amplitude: 0.2,
    direction: 0.4,
    distortion: 0.35,
    edge: 0.04,
    contrast: 0.14,
    frequency: 1,
    thickness: 0.45,
  },
};

export function isSurfaceEffectId(value: unknown): value is SurfaceEffectId {
  return (
    typeof value === "string" &&
    (SURFACE_EFFECT_IDS as readonly string[]).includes(value)
  );
}

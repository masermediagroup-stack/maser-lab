import {
  SURFACE_EFFECT_DEFAULTS,
  type SurfaceEffectId,
} from "./shaders/registry";

export type TypeWorldSurface = {
  enabled: boolean;
  type: SurfaceEffectId;
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

export const TYPE_WORLD_SURFACE_DEFAULTS: TypeWorldSurface = {
  enabled: true,
  type: "orbs",
  ...SURFACE_EFFECT_DEFAULTS.orbs,
};

export function resolveSurface(
  partial?: Partial<TypeWorldSurface>,
): TypeWorldSurface {
  return {
    ...TYPE_WORLD_SURFACE_DEFAULTS,
    ...partial,
  };
}

export function activeSurfaceEffect(
  surface: TypeWorldSurface,
  orbsEnabled = true,
): SurfaceEffectId {
  if (!surface.enabled) return "none";
  if (surface.type === "orbs" && !orbsEnabled) return "none";
  return surface.type;
}

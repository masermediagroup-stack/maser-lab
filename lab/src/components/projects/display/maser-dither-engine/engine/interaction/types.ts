/**
 * Procedural interaction & lighting types.
 * Pointer lives in UV space (y=0 bottom) after DOM→UV conversion.
 */

export type InteractionModeId =
  | "follow"
  | "spring"
  | "magnetic"
  | "sticky"
  | "gravity"
  | "repel"
  | "orbit-pointer"
  | "elastic"
  | "pressure"
  | "ripple"
  | "none";

export type PointerStateId =
  | "idle"
  | "hover"
  | "down"
  | "hold"
  | "release"
  | "exit";

export type FalloffType =
  | "linear"
  | "smooth"
  | "gaussian"
  | "exponential"
  | "power";

export type HoldBehaviorId =
  | "none"
  | "charge"
  | "accumulate"
  | "grow-radius"
  | "contrast"
  | "bloom"
  | "ripples"
  | "density"
  | "pulse";

export type ReleaseBehaviorId =
  | "fade"
  | "ripple"
  | "shockwave"
  | "bloom"
  | "collapse"
  | "elastic";

export type TrailModeId =
  | "none"
  | "light"
  | "density"
  | "heat"
  | "gradient"
  | "ghost"
  | "motion-blur";

export type RippleStyleId =
  | "none"
  | "single"
  | "repeating"
  | "noise"
  | "directional"
  | "pressure";

export type LightBlendMode = "add" | "screen" | "soft";

export type LightRole =
  | "ambient"
  | "pointer"
  | "secondary"
  | "accent"
  | "animated";

export type PhysicsConfig = {
  interpolation: number;
  easing: number;
  springStrength: number;
  mass: number;
  friction: number;
  velocityInfluence: number;
  acceleration: number;
  maxSpeed: number;
  deadZone: number;
  smoothing: number;
};

export type FalloffConfig = {
  type: FalloffType;
  radius: number;
  softness: number;
  edgeWidth: number;
  power: number;
};

export type TrailConfig = {
  mode: TrailModeId;
  length: number;
  fade: number;
  intensity: number;
  width: number;
  smoothing: number;
  decay: number;
};

export type RippleConfig = {
  style: RippleStyleId;
  amplitude: number;
  frequency: number;
  decay: number;
  expansionSpeed: number;
  thickness: number;
  fade: number;
};

export type HoldConfig = {
  behavior: HoldBehaviorId;
  chargeRate: number;
  maxCharge: number;
};

export type ReleaseConfig = {
  behavior: ReleaseBehaviorId;
  strength: number;
  duration: number;
};

export type ProceduralLight = {
  id: string;
  enabled: boolean;
  role: LightRole;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  /** Grayscale 0–1 (monochrome material). */
  color: number;
  animation: number;
  phase: number;
  offset: number;
  blendMode: LightBlendMode;
  moveSpeed: number;
};

export type InteractionEngineConfig = {
  modeId: InteractionModeId;
  physics: PhysicsConfig;
  falloff: FalloffConfig;
  trail: TrailConfig;
  ripple: RippleConfig;
  hold: HoldConfig;
  release: ReleaseConfig;
  lights: ProceduralLight[];
  /** Global pointer influence on material (0–1). */
  influence: number;
  /** Scale interaction radius by viewport (responsive). */
  responsiveScale: boolean;
  debug: boolean;
  enabled: boolean;
};

/** GPU payload written each frame — no React involvement. */
export type InteractionUniformPayload = {
  pointerX: number;
  pointerY: number;
  velocityX: number;
  velocityY: number;
  state: number;
  mode: number;
  influence: number;
  holdCharge: number;
  falloffType: number;
  falloffRadius: number;
  falloffSoft: number;
  falloffPower: number;
  trailMode: number;
  trailIntensity: number;
  trailWidth: number;
  rippleStyle: number;
  rippleFreq: number;
  rippleThick: number;
  lightCount: number;
  /** Packed light pos xy + radius + intensity, 8 slots */
  lightPos: Float32Array;
  lightRad: Float32Array;
  lightInt: Float32Array;
  lightCol: Float32Array;
  lightFlags: Float32Array;
  /** Up to 4 ripples: xy, age, amp */
  ripples: Float32Array;
  /** Trail samples: 8 × xy */
  trailPts: Float32Array;
  trailCount: number;
  debug: number;
  releasePulse: number;
  stateBrightness: number;
  stateBloom: number;
  stateContrast: number;
  stateRadiusMul: number;
};

export const POINTER_STATE_INDEX: Record<PointerStateId, number> = {
  idle: 0,
  hover: 1,
  down: 2,
  hold: 3,
  release: 4,
  exit: 5,
};

export const MAX_LIGHTS = 8;
export const MAX_RIPPLES = 4;
export const MAX_TRAIL = 8;

export const DEFAULT_PHYSICS: PhysicsConfig = {
  interpolation: 0.22,
  easing: 0.65,
  springStrength: 18,
  mass: 1,
  friction: 8,
  velocityInfluence: 0.35,
  acceleration: 14,
  maxSpeed: 2.5,
  deadZone: 0.008,
  smoothing: 0.55,
};

export const DEFAULT_FALLOFF: FalloffConfig = {
  type: "gaussian",
  radius: 0.42,
  softness: 0.55,
  edgeWidth: 0.2,
  power: 2,
};

export const DEFAULT_TRAIL: TrailConfig = {
  mode: "none",
  length: 0.45,
  fade: 0.7,
  intensity: 0.35,
  width: 0.06,
  smoothing: 0.5,
  decay: 0.85,
};

export const DEFAULT_RIPPLE: RippleConfig = {
  style: "none",
  amplitude: 0.18,
  frequency: 10,
  decay: 1.4,
  expansionSpeed: 0.55,
  thickness: 0.04,
  fade: 0.8,
};

export const DEFAULT_HOLD: HoldConfig = {
  behavior: "charge",
  chargeRate: 0.55,
  maxCharge: 1,
};

export const DEFAULT_RELEASE: ReleaseConfig = {
  behavior: "ripple",
  strength: 0.65,
  duration: 0.55,
};

export function createDefaultLights(): ProceduralLight[] {
  return [
    {
      id: "ambient",
      enabled: true,
      role: "ambient",
      x: 0.35,
      y: 0.28,
      radius: 0.75,
      intensity: 0.45,
      color: 1,
      animation: 0,
      phase: 0,
      offset: 0,
      blendMode: "add",
      moveSpeed: 0,
    },
    {
      id: "pointer",
      enabled: true,
      role: "pointer",
      x: 0.5,
      y: 0.5,
      radius: 0.28,
      intensity: 0.85,
      color: 1,
      animation: 0,
      phase: 0,
      offset: 0,
      blendMode: "add",
      moveSpeed: 0,
    },
    {
      id: "secondary",
      enabled: false,
      role: "secondary",
      x: 0.72,
      y: 0.68,
      radius: 0.35,
      intensity: 0.4,
      color: 0.92,
      animation: 0.35,
      phase: 1.2,
      offset: 0.15,
      blendMode: "soft",
      moveSpeed: 0.25,
    },
    {
      id: "accent",
      enabled: false,
      role: "accent",
      x: 0.2,
      y: 0.75,
      radius: 0.22,
      intensity: 0.35,
      color: 1,
      animation: 0.5,
      phase: 2.4,
      offset: 0.2,
      blendMode: "screen",
      moveSpeed: 0.4,
    },
  ];
}

export const DEFAULT_INTERACTION_CONFIG: InteractionEngineConfig = {
  modeId: "follow",
  physics: { ...DEFAULT_PHYSICS },
  falloff: { ...DEFAULT_FALLOFF },
  trail: { ...DEFAULT_TRAIL },
  ripple: { ...DEFAULT_RIPPLE },
  hold: { ...DEFAULT_HOLD },
  release: { ...DEFAULT_RELEASE },
  lights: createDefaultLights(),
  influence: 0.85,
  responsiveScale: true,
  debug: false,
  enabled: true,
};

export function idleInteractionPayload(): InteractionUniformPayload {
  return {
    pointerX: 0.5,
    pointerY: 0.5,
    velocityX: 0,
    velocityY: 0,
    state: 0,
    mode: 0,
    influence: 0,
    holdCharge: 0,
    falloffType: 2,
    falloffRadius: 0.42,
    falloffSoft: 0.55,
    falloffPower: 2,
    trailMode: 0,
    trailIntensity: 0,
    trailWidth: 0.06,
    rippleStyle: 0,
    rippleFreq: 10,
    rippleThick: 0.04,
    lightCount: 2,
    lightPos: new Float32Array(MAX_LIGHTS * 2),
    lightRad: new Float32Array(MAX_LIGHTS),
    lightInt: new Float32Array(MAX_LIGHTS),
    lightCol: new Float32Array(MAX_LIGHTS),
    lightFlags: new Float32Array(MAX_LIGHTS),
    ripples: new Float32Array(MAX_RIPPLES * 4),
    trailPts: new Float32Array(MAX_TRAIL * 2),
    trailCount: 0,
    debug: 0,
    releasePulse: 0,
    stateBrightness: 0,
    stateBloom: 0,
    stateContrast: 0,
    stateRadiusMul: 1,
  };
}

import type { KineticBarsParams, MotionMode } from "../types/kinetic-bars";

export const PROJECT_SLUG = "kinetic-perspective-bars";
export const PROJECT_TITLE = "Kinetic Perspective Bars";
export const PROJECT_DESCRIPTION =
  "A premium dark kinetic sculpture — thin architectural slabs in perspective, driven by a seamless elevation wave.";

export const MODE_LABELS: Record<MotionMode, string> = {
  traveling: "Traveling Wave",
  reverse: "Reverse Wave",
  breathing: "Breathing",
  pulse: "Pulse Sweep",
};

export const MODE_ORDER: MotionMode[] = [
  "traveling",
  "reverse",
  "breathing",
  "pulse",
];

/** Crossfade duration when switching motion modes (seconds). */
export const MODE_BLEND_DURATION = 0.8;

/** Target seconds for a wave crest to travel across the full bar sequence. */
export const WAVE_TRAVEL_SECONDS = 6;

export const DEFAULT_PARAMS: KineticBarsParams = {
  barCount: 20,
  barWidth: 0.42,
  barThickness: 0.055,
  gap: 0.055,
  minHeight: 0.28,
  maxHeight: 2.85,
  cornerRadius: 0.035,
  liftAmplitude: 0.55,
  waveSpeed: 1.05,
  phaseOffset: 0.32,
  waveDirection: 1,
  hoverStrength: 0.28,
  hoverRadius: 2.4,
  rippleStrength: 0.42,
  rippleSpeed: 8.5,
  rippleDecay: 1.6,
  edgeBrightness: 0.42,
  fillOpacity: 0.92,
  backgroundColor: "#050506",
  cameraZoom: 1,
  cameraPosition: [4.8, 2.6, 5.4],
  groupRotation: [0, -0.52, 0],
  groupScale: 1,
  animationMode: "traveling",
  paused: false,
  reducedMotionPreview: false,
  cameraDrift: true,
  perspectiveAngle: -0.52,
};

export const PARAM_RANGES = {
  barCount: { min: 12, max: 28, step: 1 },
  barWidth: { min: 0.2, max: 0.8, step: 0.01 },
  barThickness: { min: 0.02, max: 0.14, step: 0.005 },
  gap: { min: 0.02, max: 0.2, step: 0.005 },
  minHeight: { min: 0.1, max: 1.5, step: 0.01 },
  maxHeight: { min: 1, max: 4.5, step: 0.01 },
  cornerRadius: { min: 0, max: 0.12, step: 0.005 },
  liftAmplitude: { min: 0, max: 1.4, step: 0.01 },
  waveSpeed: { min: 0.2, max: 2.5, step: 0.01 },
  phaseOffset: { min: 0.05, max: 0.8, step: 0.01 },
  hoverStrength: { min: 0, max: 1, step: 0.01 },
  hoverRadius: { min: 0.5, max: 6, step: 0.1 },
  rippleStrength: { min: 0, max: 1.2, step: 0.01 },
  rippleSpeed: { min: 2, max: 16, step: 0.1 },
  rippleDecay: { min: 0.4, max: 4, step: 0.05 },
  edgeBrightness: { min: 0.1, max: 1, step: 0.01 },
  fillOpacity: { min: 0.4, max: 1, step: 0.01 },
  cameraZoom: { min: 0.5, max: 2, step: 0.01 },
  groupScale: { min: 0.4, max: 1.6, step: 0.01 },
} as const;

export const SR_DESCRIPTION =
  "A dark kinetic sculpture of about twenty thin vertical rectangular slabs arranged in a perspective row. The slabs rise and fall in a smooth traveling wave. Hovering near a slab lifts it slightly; clicking sends a ripple through the formation.";

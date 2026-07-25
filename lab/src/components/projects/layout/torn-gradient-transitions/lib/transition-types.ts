/**
 * Public type surface for the Torn Gradient Transitions system.
 *
 * `TornTransitionSettings` is intentionally flat: every field maps to either a
 * shader uniform or a timing value on the state machine, which keeps the
 * control panel, URL codec, and export generators schema-driven.
 */

export type TransitionDirection =
  | "left-right"
  | "right-left"
  | "top-bottom"
  | "bottom-top"
  | "diagonal"
  | "radial-expand"
  | "radial-collapse"
  | "pointer";

export type RevealMode = "sweep" | "reverse" | "iris";

export type EdgeProfile =
  | "soft"
  | "torn"
  | "bubbled"
  | "fibrous"
  | "folded"
  | "aggressive"
  | "clean";

export type EasingId =
  | "linear"
  | "quad"
  | "cubic"
  | "quart"
  | "quint"
  | "expo"
  | "circ"
  | "back";

export type PaletteMode = "stops" | "cosine" | "spectral" | "mono";

export type CosinePaletteId =
  | "aurora"
  | "ember"
  | "ice"
  | "ultraviolet"
  | "sand"
  | "graphite";

export type QualityMode = "high" | "balanced" | "mobile";

/** Every tunable value. Numbers feed uniforms or timings; strings are enums/hex. */
export type TornTransitionSettings = {
  // ── Motion ───────────────────────────────────────────────────────────────
  direction: TransitionDirection;
  duration: number;
  outroDuration: number;
  easing: EasingId;
  swapMidpoint: number;
  startDelay: number;
  revealMode: RevealMode;
  edgeVelocity: number;
  overshoot: number;
  settleDuration: number;
  coveredHold: number;

  // ── Shape ────────────────────────────────────────────────────────────────
  edgeProfile: EdgeProfile;
  bandWidth: number;
  tearAmplitude: number;
  tearFrequency: number;
  edgeRoughness: number;
  edgeSharpness: number;
  edgeThickness: number;
  secondaryEdgeOffset: number;
  fragmentAmount: number;
  holeAmount: number;
  directionalStretch: number;
  foldAmount: number;

  // ── Bubbles ──────────────────────────────────────────────────────────────
  bubbleAmount: number;
  bubbleScale: number;
  bubbleVariation: number;
  bubbleInflation: number;
  bubbleMerge: number;
  bubbleSpeed: number;
  bubbleEdgeConcentration: number;
  pointerInfluence: number;

  // ── Paper ────────────────────────────────────────────────────────────────
  fiberAmount: number;
  fiberLength: number;
  fiberDirection: number;
  pulpGrain: number;
  speckleAmount: number;
  wrinkleAmount: number;
  wrinkleScale: number;
  paperDensity: number;
  deckleStrength: number;

  // ── Depth & lighting ─────────────────────────────────────────────────────
  surfaceDepth: number;
  displacementStrength: number;
  lightX: number;
  lightY: number;
  lightHeight: number;
  diffuseStrength: number;
  rimStrength: number;
  specularStrength: number;
  roughness: number;
  cavityShadow: number;
  castShadowStrength: number;
  edgeHighlight: number;
  undersideDarkness: number;

  // ── Gradient ─────────────────────────────────────────────────────────────
  paletteMode: PaletteMode;
  cosinePalette: CosinePaletteId;
  stopCount: number;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  gradientAngle: number;
  gradientScale: number;
  gradientMotion: number;
  hueTravel: number;
  saturation: number;
  brightness: number;
  contrast: number;
  colorDistortion: number;
  iridescence: number;

  // ── Texture & finishing ──────────────────────────────────────────────────
  grain: number;
  dither: number;
  blur: number;
  edgeGlow: number;
  chromaticSeparation: number;
  vignette: number;
  alpha: number;
  textureScale: number;
  animationSpeed: number;
};

export type SettingKey = keyof TornTransitionSettings;

export type NumericSettingKey = {
  [K in SettingKey]: TornTransitionSettings[K] extends number ? K : never;
}[SettingKey];

export type ControlGroupId =
  | "motion"
  | "shape"
  | "bubbles"
  | "paper"
  | "depth"
  | "gradient"
  | "finishing";

export type ControlDefinition =
  | {
      kind: "slider";
      key: NumericSettingKey;
      label: string;
      group: ControlGroupId;
      min: number;
      max: number;
      step: number;
      unit?: string;
      hint?: string;
    }
  | {
      kind: "select";
      key: SettingKey;
      label: string;
      group: ControlGroupId;
      options: { value: string; label: string }[];
      hint?: string;
    }
  | {
      kind: "color";
      key: "color1" | "color2" | "color3" | "color4";
      label: string;
      group: ControlGroupId;
      hint?: string;
    };

export type TornTransitionPreset = {
  id: string;
  name: string;
  description: string;
  /** Two swatches used by the preset rail; purely presentational. */
  swatch: [string, string];
  settings: TornTransitionSettings;
};

/** Lifecycle phases. Ordered as they occur; `idle` is both start and end. */
export type TransitionPhase =
  | "idle"
  | "entering"
  | "covered"
  | "content-swapping"
  | "revealing"
  | "settling"
  | "complete";

export type TransitionOrigin = { x: number; y: number };

export type StartTransitionOptions = {
  /**
   * Invoked exactly once, when the sheet covers enough of the viewport that a
   * content change cannot be seen. Navigate or swap state here.
   */
  onCovered?: () => void;
  /** Invoked once the overlay has fully left the viewport. */
  onComplete?: () => void;
  /** Overrides the provider direction for this run. */
  direction?: TransitionDirection;
  /** Normalised (0–1) origin for radial and pointer modes. */
  origin?: TransitionOrigin;
  /** Per-run settings overrides merged over the provider settings. */
  overrides?: Partial<TornTransitionSettings>;
};

export type TornTransitionContextValue = {
  /** Begins a transition. Safe to call while one is running. */
  startTransition: (options?: StartTransitionOptions) => void;
  /** Forces the overlay off-screen immediately. Used by the watchdog and unmount. */
  cancelTransition: () => void;
  /** Current lifecycle phase. Re-renders consumers on change. */
  phase: TransitionPhase;
  /** True for every phase except `idle`. */
  isTransitioning: boolean;
  /** Coverage progress 0→1 at the last phase change (not per frame). */
  settings: TornTransitionSettings;
  reducedMotion: boolean;
  webglSupported: boolean;
};

export type PerformanceSample = {
  fps: number;
  dpr: number;
  renderWidth: number;
  renderHeight: number;
  quality: QualityMode;
  phase: TransitionPhase;
  looping: boolean;
};

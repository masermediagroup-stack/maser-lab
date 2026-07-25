/**
 * Product barrel — the reusable transition system only.
 *
 * The lab shell (`TornGradientTransitionsApp`), the demo pages, and the control
 * / export panels are lab chrome and are deliberately absent. The demo is
 * registered directly from `torn-gradient-transitions-demo.tsx` in
 * `lab/src/components/projects/registry.ts`.
 */

export { TornTransitionProvider } from "./components/torn-transition-provider";
export type { TornTransitionProviderProps } from "./components/torn-transition-provider";
export { TornTransitionOverlay } from "./components/torn-transition-overlay";
export type { TornTransitionOverlayProps } from "./components/torn-transition-overlay";
export { TornTransitionLink } from "./components/torn-transition-link";
export type { TornTransitionLinkProps } from "./components/torn-transition-link";
export { useTornTransition } from "./hooks/use-torn-transition";
export { usePrefersReducedMotion } from "./hooks/use-reduced-motion";

export { TornRenderer } from "./lib/torn-renderer";
export type { RenderFrame } from "./lib/torn-renderer";
export {
  DEFAULT_PRESET_ID,
  DEFAULT_SETTINGS,
  TRANSITION_PRESETS,
  findPreset,
  presetSettings,
  randomizeSettings,
} from "./lib/transition-presets";
export {
  EASING_OPTIONS,
  applyEasing,
  applyOvershoot,
  shapeVelocity,
} from "./lib/transition-easing";
export {
  COSINE_PALETTES,
  EDGE_PROFILES,
  QUALITY_PROFILES,
  detectQuality,
} from "./lib/transition-utils";
export {
  TORN_FRAGMENT_SHADER,
  TORN_VERTEX_SHADER,
} from "./shaders/torn-transition.glsl";

export type {
  CosinePaletteId,
  EasingId,
  EdgeProfile,
  PaletteMode,
  PerformanceSample,
  QualityMode,
  RevealMode,
  StartTransitionOptions,
  TornTransitionContextValue,
  TornTransitionPreset,
  TornTransitionSettings,
  TransitionDirection,
  TransitionOrigin,
  TransitionPhase,
} from "./lib/transition-types";

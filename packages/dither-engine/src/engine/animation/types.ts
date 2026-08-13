/**
 * Procedural animation engine types.
 * Modes pack named controls into fixed uniform slots (p0–p7) for the shared shader.
 */

export type AnimationModeId =
  | "linear-horizontal"
  | "linear-vertical"
  | "diagonal"
  | "radial-pulse"
  | "ripple"
  | "wave"
  | "spiral"
  | "orbit"
  | "breathing"
  | "bloom"
  | "noise-drift"
  | "flow-field"
  | "magnetic"
  | "aurora"
  | "turbulence"
  | "lava-lamp";

export type TimelineLoopMode = "loop" | "once" | "pingpong";

export type TimelineState = {
  playing: boolean;
  /** +1 forward, -1 reverse */
  direction: 1 | -1;
  loopMode: TimelineLoopMode;
  /** Multiplier on dt (playback speed). */
  playbackSpeed: number;
  /** Global time scale (engine timeline). */
  timeScale: number;
};

export type AnimationControlDef = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type AnimationModeDefinition = {
  id: AnimationModeId;
  label: string;
  /** Stable shader branch index 0…N */
  index: number;
  purpose: string;
  approach: string;
  performance: string;
  extension: string;
  controls: AnimationControlDef[];
};

/** Named control values for the active mode. */
export type AnimationModeParams = Record<string, number>;

export type AnimationEngineConfig = {
  modeId: AnimationModeId;
  modeParams: AnimationModeParams;
  /** Seconds to blend when switching modes. */
  blendDuration: number;
  timeline: TimelineState;
  /** Increment to restart the playhead (UI transport). */
  restartToken?: number;
};

/** GPU-facing packed animation uniforms (written each frame by the controller). */
export type AnimationUniformPayload = {
  modeA: number;
  modeB: number;
  blend: number;
  /** p0–p3 for mode A */
  paramsA0: [number, number, number, number];
  /** p4–p7 for mode A */
  paramsA1: [number, number, number, number];
  paramsB0: [number, number, number, number];
  paramsB1: [number, number, number, number];
  time: number;
};

export const DEFAULT_TIMELINE: TimelineState = {
  playing: true,
  direction: 1,
  loopMode: "loop",
  playbackSpeed: 1,
  timeScale: 1,
};

export const DEFAULT_ANIMATION_CONFIG: AnimationEngineConfig = {
  modeId: "wave",
  modeParams: {},
  blendDuration: 0.65,
  timeline: { ...DEFAULT_TIMELINE },
};

/** Neutral payload when animation controller is absent. */
export const IDLE_ANIMATION_PAYLOAD: AnimationUniformPayload = {
  modeA: 5,
  modeB: 5,
  blend: 1,
  paramsA0: [0.75, 0.18, 2.2, 0.4],
  paramsA1: [0.35, 0, 0, 0],
  paramsB0: [0.75, 0.18, 2.2, 0.4],
  paramsB1: [0.35, 0, 0, 0],
  time: 0,
};

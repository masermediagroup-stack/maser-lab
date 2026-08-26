import type { RefObject } from "react";

export type LiquidMetalLook = {
  /** Degrees offset around locked Maser-blue hue. */
  hue: number;
  /** Saturation multiplier. 1 = locked family. */
  sat: number;
  /** IQ smin k in CSS pixels. */
  mergeK: number;
  /** Material 0 satin … 1 wet. Not a light. */
  wetness: number;
};

export type LiquidMetalMeatballsProps = {
  /** Element whose intersection starts/stops spawning. */
  triggerRef: RefObject<Element | null>;
  /** Demo override; also honors OS `prefers-reduced-motion`. */
  forceReducedMotion?: boolean;
  /** Increment to clear in-flight balls and burst if the trigger is active. */
  replayKey?: number;
  className?: string;
  /** Lab/demo status readout. */
  onPhaseChange?: (phase: SequencePhase) => void;
  /**
   * Demo chrome writes this each slider frame. Product defaults stay locked
   * when omitted. Must not remount the canvas (read from rAF, not effect deps).
   */
  lookRef?: RefObject<LiquidMetalLook | null>;
};

export type SequencePhase = "idle" | "sequence" | "finishing" | "still";

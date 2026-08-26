import type { RefObject } from "react";

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
};

export type SequencePhase = "idle" | "sequence" | "finishing" | "still";

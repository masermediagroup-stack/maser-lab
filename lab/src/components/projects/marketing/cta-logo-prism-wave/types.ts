import type { RefObject } from "react";

export type PrismWaveLook = {
  /** UV units per second along the travel axis. */
  speed: number;
  bandWidth: number;
  /** Leading-edge cool fringe amount (0–1). Tiny at the default. */
  fringe: number;
};

export type PrismWaveMode = "vgpu" | "css";

export type CtaLogoPrismWaveProps = {
  /** Demo override; also honors OS `prefers-reduced-motion`. Wave always runs. */
  forceReducedMotion?: boolean;
  className?: string;
  /**
   * Demo chrome writes this each slider frame. Product defaults stay locked
   * when omitted. Must not remount the canvas (read from rAF, not effect deps).
   */
  lookRef?: RefObject<PrismWaveLook | null>;
  /** Called when the renderer chooses WebGPU or the CSS mask fallback. */
  onModeChange?: (mode: PrismWaveMode) => void;
};

export type WaveRuntimeParams = PrismWaveLook & {
  /** 1 while a mouse/pen hover is on the lockup pad; 0 otherwise. */
  hover: number;
};
